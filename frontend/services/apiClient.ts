import axios from 'axios';
import type {
  DashboardResponse,
  CommunityPick,
  ChatMessagePayload,
  ChatReplyResponse,
  ChatSession,
  TeacherQuestionsResponse,
  AIQuestionsResponse,
  QuizSubmitPayload,
  QuizHistory,
  ClassAnalyticsResponse,
  TeacherDashboardSummary,
  StudentDetailResponse,
  User,
  AuthResponse,
} from '@/types/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Hết thời gian chờ, vui lòng thử lại.'));
    }
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : `Lỗi API: ${error.response?.status ?? 'Network Error'}`;
    return Promise.reject(new Error(message));
  },
);

// -----------------------------------------------------------------------------
// In-memory cache — tránh refetch khi chuyển trang
// -----------------------------------------------------------------------------
type CacheEntry<T> = { at: number; data: T };
const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 45_000;

async function cachedGet<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.at < ttl) return hit.data;
  const data = await fetcher();
  cache.set(key, { at: Date.now(), data });
  return data;
}

export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// =============================================================================
// AUTH
// =============================================================================

export const loginUser = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export const registerUser = (payload: {
  username: string;
  password: string;
  full_name: string;
  role: 'student' | 'teacher';
  grade?: string;
}) => api.post<AuthResponse>('/auth/register', payload).then((r) => r.data);

// =============================================================================
// STUDENT
// =============================================================================

export const getStudentDashboard = (studentId: string) =>
  cachedGet(`dash:${studentId}`, () =>
    api.get<DashboardResponse>(`/student/${studentId}/dashboard`).then((r) => r.data),
  );

export const getStudentQuizHistory = (studentId: string) =>
  cachedGet(`quizhist:${studentId}`, () =>
    api.get<QuizHistory[]>(`/student/${studentId}/quiz-history`).then((r) => r.data),
  );

export const getStudentRecoveryPlan = (studentId: string) =>
  api.get(`/student/${studentId}/recovery-plan`).then((r) => r.data);

export const getCommunityPicks = () =>
  cachedGet('community:picks', () =>
    api.get<CommunityPick[]>(`/student/community/curated-picks`).then((r) => r.data),
  );

export const getTeacherQuestions = (topic: string) =>
  api.get<TeacherQuestionsResponse>(`/student/quiz/${encodeURIComponent(topic)}/teacher-questions`).then((r) => r.data);

export const getAIQuestions = (studentId: string, topic: string, num = 3) =>
  api.get<AIQuestionsResponse>(`/student/${studentId}/quiz/${encodeURIComponent(topic)}/ai-questions`, {
    params: { num },
  }).then((r) => r.data);

export const submitQuiz = (data: QuizSubmitPayload) =>
  api.post(`/student/quiz/submit`, data).then((r) => {
    invalidateApiCache(`dash:${data.student_id}`);
    invalidateApiCache(`quizhist:${data.student_id}`);
    return r.data;
  });

export const getAssignedQuizzes = (grade?: string) =>
  cachedGet(`assigned:${grade || 'all'}`, () =>
    api.get<any[]>(`/student/assigned-quizzes`, { params: { grade } }).then((r) => r.data),
  );

// =============================================================================
// CHAT
// =============================================================================

export const postSocraticChat = (data: ChatMessagePayload) =>
  api.post<ChatReplyResponse>(`/student/chat`, data).then((r) => {
    invalidateApiCache(`chats:${data.student_id}`);
    return r.data;
  });

export const getChatSessions = (studentId: string) =>
  cachedGet(
    `chats:${studentId}`,
    () => api.get<ChatSession[]>(`/student/${studentId}/chat-sessions`).then((r) => r.data),
    15_000,
  );

// =============================================================================
// TEACHER
// =============================================================================

export const searchStudents = (name: string) =>
  api.get<User[]>(`/teacher/search-students`, { params: { name } }).then((r) => r.data);

export const getClassAnalytics = () =>
  cachedGet('teacher:analytics', () =>
    api.get<ClassAnalyticsResponse>(`/teacher/class-analytics`).then((r) => r.data),
  );

export const getTeacherDashboardSummary = () =>
  cachedGet('teacher:summary', () =>
    api.get<TeacherDashboardSummary>(`/teacher/dashboard-summary`).then((r) => r.data),
  );

export const getStudentDetailForTeacher = (studentId: string) =>
  api.get<StudentDetailResponse>(`/teacher/student/${studentId}/detail`).then((r) => r.data);

export const postTeacherChat = (message: string) =>
  api.post<{ reply: string }>(`/teacher/chat`, { message }).then((r) => r.data);

export const generateTeacherQuiz = (topic: string, difficulty: string, num: number = 3) =>
  api.get<{ topic: string, difficulty: string, questions: any[] }>(`/teacher/quiz/generate`, {
    params: { topic, difficulty, num }
  }).then((r) => r.data);

export const saveTeacherQuiz = (data: any) =>
  api.post<{ message: string, quiz_id: string }>(`/teacher/quiz/save`, data).then((r) => {
    invalidateApiCache('assigned:');
    return r.data;
  });

// =============================================================================
// SKILL TREE
// =============================================================================

export const getSkillGraph = (studentId: string, courseName: string) =>
  cachedGet(`graph:${studentId}:${courseName}`, () =>
    api.get<any>(`/skill-tree/${studentId}/graph`, { params: { course_name: courseName } }).then((r) => r.data),
  );

export const generateSkillGraph = (studentId: string, courseName: string, targetLevel?: string, hoursPerDay?: number) =>
  api.post<any>(`/skill-tree/${studentId}/generate`, {
    course_name: courseName,
    target_level: targetLevel,
    hours_per_day: hoursPerDay
  }).then((r) => {
    invalidateApiCache(`graph:${studentId}:${courseName}`);
    return r.data;
  });

export default api;

'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { searchStudents } from '@/services/apiClient';
import type { User } from '@/types/api';
import { Brain, Loader2, AlertTriangle, GraduationCap, BookOpen, Sparkles } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedUsers, setMatchedUsers] = useState<User[] | null>(null);
  const [mode, setMode] = useState<'student' | 'teacher'>('student');

  const handleSearch = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setMatchedUsers(null);

    try {
      const results = await searchStudents(name.trim());
      if (results.length === 0) {
        setError('Không tìm thấy tài khoản. Vui lòng kiểm tra lại tên.');
      } else if (results.length === 1) {
        // Đăng nhập luôn nếu chỉ có 1 kết quả
        login(results[0]);
      } else {
        // Hiện danh sách để chọn
        setMatchedUsers(results);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến server.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherLogin = () => {
    // Teacher mode: tạo user giả với role teacher
    const teacherUser: User = {
      id: 'teacher-demo',
      role: 'teacher',
      full_name: name.trim() || 'Giáo viên',
      grade: '',
      avatar_url: null,
      total_points: 0,
      current_streak: 0,
      study_hours_this_week: 0,
      created_at: new Date().toISOString(),
    };
    login(teacherUser);
  };

  return (
    <div className="min-h-screen bg-[#F6FAFE] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            AntiRot<span className="text-blue-400">.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Digital Curator — Nền tảng học tập thông minh</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-4xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8">
          
          {/* Mode Toggle */}
          <div className="bg-slate-50 rounded-full p-1 flex mb-8">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Học sinh
            </button>
            <button
              onClick={() => setMode('teacher')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'teacher' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Giáo viên
            </button>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {mode === 'student' ? 'Tên học sinh' : 'Tên giáo viên'}
            </label>
            <input
              type="text"
              placeholder={mode === 'student' ? 'Nhập tên để đăng nhập...' : 'Nhập tên giáo viên...'}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); setMatchedUsers(null); }}
              onKeyDown={(e) => e.key === 'Enter' && (mode === 'student' ? handleSearch() : handleTeacherLogin())}
              className="w-full rounded-2xl px-5 py-4 text-sm bg-[#F6FAFE] border border-slate-200 outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition font-medium"
              autoFocus
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Matched Users List */}
          {matchedUsers && matchedUsers.length > 1 && (
            <div className="mb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Chọn tài khoản của bạn:</p>
              {matchedUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => login(u)}
                  className="w-full flex items-center gap-4 p-4 bg-[#F6FAFE] border border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-blue-600 text-sm">{u.full_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{u.full_name}</p>
                    <p className="text-xs text-slate-500 font-medium">{u.grade} • {u.total_points} pts • 🔥 {u.current_streak} days</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={mode === 'student' ? handleSearch : handleTeacherLogin}
            disabled={!name.trim() || loading}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 ${
              mode === 'student'
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tìm kiếm...
              </>
            ) : (
              mode === 'student' ? 'Đăng nhập' : 'Vào chế độ Giáo viên'
            )}
          </button>

          {/* Help text */}
          <p className="text-center text-xs text-slate-400 font-medium mt-6">
            {mode === 'student' 
              ? 'Nhập đúng tên đã đăng ký trong hệ thống để đăng nhập.' 
              : 'Giáo viên có thể truy cập chế độ xem Analytics và quản lý lớp.'}
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          AntiRot LMS — HCMUT Snake × KMS Hackathon 2026
        </p>
      </div>
    </div>
  );
}

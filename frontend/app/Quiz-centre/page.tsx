'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTeacherQuestions, getAIQuestions, submitQuiz, getStudentDashboard } from '@/services/apiClient';
import type { QuizQuestion } from '@/types/api';
import { Bot, ChevronRight, Flame, Activity, AlertTriangle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const TOPICS = [
  { key: 'dsa', label: 'DSA' },
  { key: 'ltnc', label: 'LTNC (C++)' },
  { key: 'hdh', label: 'Hệ Điều Hành' },
];

export default function QuizCentrePage() {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const isTeacher = user?.role === 'teacher';

  // Quiz state
  const [selectedTopic, setSelectedTopic] = useState('dsa');
  const [quizType, setQuizType] = useState<'teacher' | 'ai'>('teacher');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Data state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  // Load profile data
  useEffect(() => {
    if (isTeacher || !studentId) return;
    getStudentDashboard(studentId)
      .then((d) => {
        setStreak(d.profile.current_streak);
        setTotalPoints(d.profile.total_points);
      })
      .catch(() => {});
  }, [isTeacher, studentId]);

  // Fetch questions when topic or type changes
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setHintsUsed(0);
    setCorrectCount(0);
    setIncorrectCount(0);

    try {
      if (quizType === 'teacher') {
        const data = await getTeacherQuestions(selectedTopic);
        setQuestions(data.questions);
      } else {
        const data = await getAIQuestions(selectedTopic, 'medium', 5);
        setQuestions(data.questions);
      }
    } catch (err: any) {
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTeacher) {
      fetchQuestions();
    }
  }, [selectedTopic, quizType, isTeacher]);

  const currentQ = questions[currentIdx];

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQ) return;
    setIsSubmitted(true);
    // Đáp án đúng là option đầu tiên (index 0) theo cách backend cấu trúc
    const correct = selectedAnswer === currentQ.options[0];
    setIsCorrect(correct);
    if (correct) setCorrectCount((c) => c + 1);
    else setIncorrectCount((c) => c + 1);
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const handleFinishQuiz = async () => {
    try {
      await submitQuiz({
        student_id: studentId,
        topic_name: selectedTopic,
        difficulty_level: 'intermediate',
        score: correctCount,
        hints_used: hintsUsed,
        quiz_details: { total: questions.length, correct: correctCount, incorrect: incorrectCount },
      });
      alert(`Nộp bài thành công! Đúng: ${correctCount}/${questions.length}. Hints dùng: ${hintsUsed}`);
    } catch (err: any) {
      alert(`Lỗi nộp bài: ${err.message}`);
    }
  };

  const handleUseHint = () => {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  };

  if (isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Teacher: Manage Quizzes</h2>
        <p>This view will show quiz generation via AI and class assignment tools.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Bot className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-bold text-slate-800">Quiz Centre</h1>
          </div>
          <p className="text-slate-500 font-semibold ml-12">Your adaptive learning path, curated by AI.</p>
        </div>

        <div className="flex gap-4">
           <div className="bg-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> STREAK</p>
             <p className="font-bold text-slate-800 text-lg">{streak} Days</p>
           </div>
           <div className="bg-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL POINTS</p>
             <p className="font-bold text-blue-600 text-lg">{totalPoints.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 h-[600px]">
         
         {/* LEFT LIST: Topic & Quiz Type Selector */}
         <div className="w-80 bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col overflow-hidden">
            <div className="p-6 border-b">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-blue-600" /> Quiz Topics
               </h3>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
               {/* Quiz type toggle */}
               <div className="flex gap-2 mb-4">
                 <button 
                   onClick={() => setQuizType('teacher')}
                   className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${quizType === 'teacher' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                 >
                   Teacher Quiz
                 </button>
                 <button 
                   onClick={() => setQuizType('ai')}
                   className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${quizType === 'ai' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                 >
                   AI Quiz
                 </button>
               </div>

               {TOPICS.map((t) => (
                 <div 
                   key={t.key}
                   onClick={() => setSelectedTopic(t.key)}
                   className={`rounded-2xl p-4 cursor-pointer transition ${
                     selectedTopic === t.key 
                       ? 'border-2 border-blue-600 bg-blue-50/30' 
                       : 'border border-slate-200 bg-white hover:border-slate-300'
                   }`}
                 >
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                      {t.label}
                      {selectedTopic === t.key && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      {quizType === 'teacher' ? 'Ngân hàng đề giáo viên' : 'AI tạo câu hỏi thích ứng'}
                    </p>
                 </div>
               ))}
            </div>

            <div className="p-4 border-t bg-slate-50 text-center">
               <button onClick={fetchQuestions} className="text-sm font-bold text-blue-600 hover:text-blue-700">Reload Questions</button>
            </div>
         </div>

         {/* RIGHT MAIN: Quiz Interactor */}
         <div className="flex-1 flex gap-6">
            
            {/* QA Board */}
            <div className="flex-1 bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-10 flex flex-col relative overflow-hidden">

               {loading && (
                 <div className="flex flex-col items-center justify-center flex-1 gap-4">
                   <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                   <p className="text-slate-500 font-semibold">Đang tải câu hỏi...</p>
                 </div>
               )}

               {error && (
                 <div className="flex flex-col items-center justify-center flex-1 gap-4">
                   <AlertTriangle className="w-12 h-12 text-red-400" />
                   <p className="text-red-600 font-bold">{error}</p>
                   <button onClick={fetchQuestions} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm">Thử lại</button>
                 </div>
               )}

               {!loading && !error && currentQ && (
                 <>
                   {/* Header QA */}
                   <div className="flex justify-between items-center mb-12">
                      <p className="font-bold text-slate-500">Question {currentIdx + 1} of {questions.length}</p>
                      <div className="flex gap-4 text-xs font-bold">
                         <span className="text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"></span> {correctCount} Correct</span>
                         <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {incorrectCount} Incorrect</span>
                      </div>
                   </div>

                   {/* Question */}
                   <div className="text-center mb-12">
                       <div className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-full uppercase font-bold mb-4">{currentQ.difficulty}</div>
                       <h2 className="text-xl font-bold text-slate-800 leading-relaxed">{currentQ.q}</h2>
                   </div>

                   {/* Options */}
                   <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full mb-auto">
                      {currentQ.options.map((option, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, D
                        return (
                          <button 
                            key={i}
                            onClick={() => !isSubmitted && setSelectedAnswer(option)}
                            className={`border-2 py-4 rounded-2xl font-bold text-sm transition flex items-center justify-between px-6 text-left ${
                              selectedAnswer === option 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                              <span className="flex-1">{option}</span>
                              <span className={`${selectedAnswer === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'} text-xs px-2 py-1 rounded-md ml-2 shrink-0`}>{letter}</span>
                          </button>
                        );
                      })}
                   </div>

                   {/* Hint */}
                   {showHint && (
                     <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-in slide-in-from-bottom-4 duration-300">
                       <p className="text-sm text-amber-800 font-medium"><strong>💡 Gợi ý:</strong> {currentQ.hint}</p>
                     </div>
                   )}
                   
                   {/* AI Feedback */}
                   {isSubmitted && (
                      <div className={`mt-6 p-6 rounded-2xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'} animate-in slide-in-from-bottom-4 duration-500`}>
                         <div className="flex gap-4 items-start">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                               {isCorrect ? <CheckCircle className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                            </div>
                            <div>
                               <h4 className={`font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-purple-900'}`}>
                                 {isCorrect ? 'Excellent! That is correct.' : 'Not quite right.'}
                               </h4>
                               <p className={`text-sm leading-relaxed ${isCorrect ? 'text-green-700' : 'text-purple-800'}`}>
                                 {isCorrect 
                                   ? 'Great job! Progress updated. Keep pushing!' 
                                   : `The correct answer is: "${currentQ.options[0]}". ${currentQ.hint}`}
                               </p>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex gap-4 justify-between mt-8 border-t pt-8">
                      {!isSubmitted && (
                        <button 
                          onClick={handleSubmitAnswer}
                          disabled={!selectedAnswer}
                          className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                        >
                           Submit Answer <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                      {isSubmitted && currentIdx < questions.length - 1 && (
                        <button 
                          onClick={handleNextQuestion}
                          className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-sm hover:bg-green-700 transition flex items-center gap-2"
                        >
                           Next Question <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                      {isSubmitted && currentIdx === questions.length - 1 && (
                        <button 
                          onClick={handleFinishQuiz}
                          className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-sm hover:bg-green-700 transition flex items-center gap-2"
                        >
                           Nộp bài <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {!showHint && !isSubmitted && (
                        <button 
                          onClick={handleUseHint}
                          className="bg-purple-100 text-purple-700 px-6 py-4 rounded-full font-bold shadow-sm hover:bg-purple-200 transition flex items-center gap-2"
                        >
                           <Bot className="w-5 h-5" /> Dùng Hint
                        </button>
                      )}
                   </div>
                 </>
               )}

               {!loading && !error && questions.length === 0 && (
                 <div className="flex flex-col items-center justify-center flex-1 gap-3 text-slate-400">
                   <Bot className="w-12 h-12 text-blue-200" />
                   <p className="font-semibold">Chưa có câu hỏi cho topic này.</p>
                 </div>
               )}

            </div>

            {/* Right Mini Panel */}
            <div className="w-64 flex flex-col gap-6">
                
                {/* Mastery Points */}
                <div className="bg-blue-600 text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
                   <div className="absolute right-0 top-0 opacity-20">
                      <ActivityBg />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">QUIZ SCORE</p>
                   <h3 className="text-4xl font-black mb-1">{correctCount}/{questions.length}</h3>
                   <p className="text-sm font-semibold opacity-90">this session</p>
                   <p className="text-xs text-blue-200 mt-4 leading-relaxed">
                      Hints used: {hintsUsed}
                   </p>
                </div>

                {/* Knowledge Decay Alert */}
                <div className="bg-white rounded-3xl border border-red-50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                   <div className="flex items-center gap-2 mb-3">
                       <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                           <AlertTriangle className="w-4 h-4 text-red-500" />
                       </div>
                       <h4 className="font-bold text-red-600 text-sm">Anti-Rot Monitor</h4>
                   </div>
                   <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                      {hintsUsed > 2 
                        ? <><strong className="text-red-600">Cảnh báo:</strong> Bạn đang sử dụng quá nhiều Hint. Hãy thử tự giải!</>
                        : 'Bạn đang có chỉ số độc lập tốt. Tiếp tục phát huy!'}
                   </p>
                   <div className={`w-full h-2 rounded-full ${hintsUsed > 2 ? 'bg-red-200' : 'bg-green-200'}`}>
                     <div className={`h-full rounded-full transition-all ${hintsUsed > 2 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, hintsUsed * 20)}%` }}></div>
                   </div>
                </div>

            </div>

         </div>
      </div>
      
    </div>
  );
}

function ActivityBg() {
  return (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

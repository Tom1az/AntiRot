'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loginUser, registerUser } from '@/services/apiClient';
import { Brain, Loader2, AlertTriangle, GraduationCap, BookOpen, LogIn, Lock, User as UserIcon } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const result = await registerUser({
          username: name.trim(),
          password,
          full_name: fullName.trim(),
          role,
          grade: role === 'student' ? (grade.trim() || undefined) : undefined,
        });
        login(result.user);
        return;
      }

      const result = await loginUser(name.trim(), password);
      if (result.user.role !== role) {
        setError(
          role === 'student'
            ? 'Tài khoản này là Giáo viên. Vui lòng chuyển sang tab Giáo viên.'
            : 'Tài khoản này là Học sinh. Vui lòng chuyển sang tab Học sinh.',
        );
        return;
      }
      login(result.user);
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-600 flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 -left-20 w-[30rem] h-[30rem] bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl mb-8">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Nâng tầm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-100">
              Trí tuệ Nhân tạo
            </span>
          </h1>
          <p className="text-lg text-blue-100 max-w-md font-medium leading-relaxed">
            Hệ thống học tập thích ứng sử dụng công nghệ Socratic AI.
          </p>
        </div>
        <p className="relative z-10 text-sm font-semibold text-blue-100">AntiRot LMS · HCMUT</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {mode === 'login' ? 'Vui lòng đăng nhập để tiếp tục.' : 'Đăng ký để bắt đầu lộ trình học.'}
            </p>
          </div>

          <div className="bg-slate-200/50 p-1.5 rounded-2xl flex mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'student' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Học sinh
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'teacher' ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-500'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Giáo viên
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(null); }}
                  className="w-full rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tên tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập..."
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  className="w-full rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="w-full rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                />
              </div>
            </div>

            {mode === 'register' && role === 'student' && (
              <div>
                <label htmlFor="grade" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Lớp / Khóa (tuỳ chọn)
                </label>
                <input
                  id="grade"
                  type="text"
                  placeholder="VD: K22 - CSE"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !password.trim()}
              className={`w-full py-4 mt-2 rounded-2xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                role === 'student'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Xác nhận Đăng nhập' : 'Tạo tài khoản'} <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium mt-6">
            {mode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(null); }} className="text-blue-600 font-bold hover:underline">
                  Đăng ký
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-blue-600 font-bold hover:underline">
                  Đăng nhập
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

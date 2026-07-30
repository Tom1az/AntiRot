'use client';
import { useAuth } from '@/context/AuthContext';
import { Bell, LogOut, Menu } from 'lucide-react';

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <header className="w-full bg-[#F6FAFE] py-4 lg:py-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Mở menu"
            className={`lg:hidden w-10 h-10 shrink-0 rounded-full bg-white border shadow-sm flex items-center justify-center ${
              isTeacher ? 'text-purple-600' : 'text-blue-600'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className={`text-sm font-bold ${isTeacher ? 'text-purple-600' : 'text-blue-600'}`}>
            {user?.full_name?.charAt(0) || 'U'}
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-600 truncate">
          Xin chào, <span className="text-slate-800 font-bold">{user?.full_name || 'User'}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white px-3 py-2 flex items-center">
          <span className={`text-xs font-bold uppercase tracking-wider ${isTeacher ? 'text-purple-600' : 'text-blue-600'}`}>
            {isTeacher ? 'Teacher Mode' : 'Student Mode'}
          </span>
        </div>
        <button
          type="button"
          className="w-10 h-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white rounded-full flex items-center justify-center text-slate-600 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={logout}
          title="Đăng xuất"
          aria-label="Đăng xuất"
          className="w-10 h-10 bg-red-50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

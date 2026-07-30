'use client';
import { useAuth } from '@/context/AuthContext';
import { User, Bell, Shield, Paintbrush } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Thông tin tài khoản hiện tại (chỉ xem).</p>
      </div>

      <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-64 shrink-0 space-y-1">
          <div className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl text-sm ${isTeacher ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
            <User className="w-4 h-4" /> Account Profile
          </div>
          <div className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-semibold rounded-2xl text-sm cursor-not-allowed" title="Sắp có">
            <Bell className="w-4 h-4" /> Notifications
          </div>
          <div className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-semibold rounded-2xl text-sm cursor-not-allowed" title="Sắp có">
            <Shield className="w-4 h-4" /> Privacy & Security
          </div>
          <div className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-semibold rounded-2xl text-sm cursor-not-allowed" title="Sắp có">
            <Paintbrush className="w-4 h-4" /> Appearance
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b pb-2">Profile Information</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label htmlFor="settings-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  readOnly
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={user?.full_name || 'N/A'}
                />
              </div>
              <div>
                <label htmlFor="settings-username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  id="settings-username"
                  type="text"
                  readOnly
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={user?.username || 'N/A'}
                />
              </div>
              <div>
                <label htmlFor="settings-role" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                <input
                  id="settings-role"
                  type="text"
                  readOnly
                  className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed"
                  value={isTeacher ? 'Teacher' : 'Student'}
                />
              </div>
              {user?.grade && (
                <div>
                  <label htmlFor="settings-grade" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grade</label>
                  <input
                    id="settings-grade"
                    type="text"
                    readOnly
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 cursor-default"
                    value={user.grade}
                  />
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Cập nhật hồ sơ qua API sẽ được bổ sung sau. Hiện tại trang Settings chỉ hiển thị thông tin đã đăng nhập.
          </p>
        </div>
      </div>
    </div>
  );
}

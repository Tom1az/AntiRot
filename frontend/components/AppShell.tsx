'use client';
import { ReactNode, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Loader2 } from 'lucide-react';

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F6FAFE]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-[#F6FAFE]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-4 lg:px-8">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto px-4 pb-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

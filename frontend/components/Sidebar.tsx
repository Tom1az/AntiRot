'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquareText, FileQuestion, LineChart, Settings, Network } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const activeCls = isTeacher ? 'bg-purple-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md';
  const hoverCls = isTeacher ? 'hover:bg-purple-50 hover:text-purple-600' : 'hover:bg-slate-50 hover:text-blue-600';
  const brandCls = isTeacher ? 'text-purple-700' : 'text-blue-700';
  const brandDot = isTeacher ? 'text-purple-400' : 'text-blue-400';

  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat Tutor', path: '/chat-tutor', icon: MessageSquareText },
    { name: 'Quiz Centre', path: '/Quiz-centre', icon: FileQuestion },
    { name: 'Skill Tree', path: '/knowledge-graph', icon: Network },
    { name: 'Analytics', path: '/Analytics', icon: LineChart },
    { name: 'Settings', path: '/Settings', icon: Settings },
  ].filter(item => !(isTeacher && item.name === 'Skill Tree'));

  return (
    <aside className="w-64 bg-slate-50 flex flex-col h-full sticky top-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.04)] border-r border-slate-100">
      <div className="px-8 py-8">
        <h1 className={`font-bold text-2xl tracking-tight ${brandCls}`}>
          AntiRot<span className={brandDot}>.</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">
          {isTeacher ? 'Teacher Console' : 'Digital Curator'}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                isActive ? activeCls : `text-slate-500 ${hoverCls}`
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} /> {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

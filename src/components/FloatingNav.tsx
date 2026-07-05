// src/components/FloatingNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/', icon: 'person', label: 'Portfolio' },
  { href: '/overview', icon: 'bar_chart', label: 'Overview' },
  { href: '/tools/chat-bot', icon: 'smart_toy', label: 'AI Chat' },
  { href: '/tools', icon: 'construction', label: 'Tools' },
];

const adminNav = [
  { href: '/admin/admin-log', icon: 'dns', label: 'Admin Log' },
  { href: '/admin/resume', icon: 'description', label: 'Resume' },
  { href: '/admin/release-notes', icon: 'update', label: 'Release Notes' },
];

export default function FloatingNav() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md border border-slate-300 rounded-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/tools');
        // Strict match for tools so it doesn't highlight when in chat-bot
        const isStrictActive = item.href === '/tools' ? pathname === '/tools' : isActive;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-sm transition-colors ${
              isStrictActive 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] md:text-[20px]">{item.icon}</span>
          </Link>
        );
      })}

      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      {isAuthenticated && adminNav.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-sm transition-colors ${
              isActive 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] md:text-[20px]">{item.icon}</span>
          </Link>
        );
      })}

      {isAuthenticated && <div className="w-px h-6 bg-slate-300 mx-1"></div>}

      {isAuthenticated ? (
        <button
          onClick={() => logout()}
          title="Logout Admin"
          className="flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-sm text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px] md:text-[20px]">logout</span>
        </button>
      ) : (
        <Link
          href="/login"
          title="Admin Login"
          className="flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px] md:text-[20px]">lock</span>
        </Link>
      )}
    </div>
  );
}

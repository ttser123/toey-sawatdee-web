// src/components/Sidebar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { FaGithub, FaLinkedin, FaEnvelope, FaYoutube } from 'react-icons/fa';
import { useChatStore } from '@/store/chatStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// ── Navigation Data ──────────────────────────────────────────────────

const topNav = [
  { href: '/', icon: 'person', label: 'Portfolio' },
  { href: '/overview', icon: 'bar_chart', label: 'Website Overview' },
];



const bottomNav = [
  { href: '/tools/chat-bot', icon: 'smart_toy', label: 'AI Assistant' },
  { href: '/tools', icon: 'construction', label: 'My Tools' },
];

const adminNav = [
  { href: '/admin/admin-log', icon: 'dns', label: 'Admin Log' },
  { href: '/admin/resume', icon: 'description', label: 'Resume' },
  { href: '/admin/release-notes', icon: 'update', label: 'Release Notes' },
];



// ── Sub-Components (Declared outside of render to prevent state resets) ──

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  pathname: string;
  isOpen: boolean;
}

const NavItem = ({ href, icon, label, pathname, isOpen }: NavItemProps) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      title={!isOpen ? label : undefined}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${isActive
        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
        }`}
    >
      <span className="material-symbols-outlined text-lg shrink-0">{icon}</span>
      <span className={`whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>{label}</span>
    </Link>
  );
};



// ── Main Component ───────────────────────────────────────────────────

export default function Sidebar() {
  const isOpen = true;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | string>('...');
  const [showConfirmNewChat, setShowConfirmNewChat] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { triggerClear, savedMessages } = useChatStore();
  const hasMessages = savedMessages.length > 0;



  useEffect(() => {
    const controller = new AbortController();
    const fetchCounter = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setVisitorCount('N/A');
          return;
        }
        const cachedCount = sessionStorage.getItem('visitor_count');
        if (cachedCount) {
          setVisitorCount(Number(cachedCount));
        } else {
          const res = await fetch(`${apiUrl}/visitor`, {
            method: 'POST',
            signal: controller.signal,
          });
          if (res.ok) {
            const json = await res.json();
            const count = json.views ?? json.count ?? 'N/A';
            setVisitorCount(count);
            sessionStorage.setItem('visitor_count', String(count));
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setVisitorCount('Error');
      }
    };
    fetchCounter();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    if (pathname === '/tools/chat-bot') {
      setIsChatMenuOpen(true);
    } else {
      setIsChatMenuOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/');
  }, [logout, router]);

  return (
    <>
      <header className="md:hidden flex items-center justify-between bg-slate-100/90 backdrop-blur-sm border-b border-slate-200 h-14 px-4 shrink-0">
        <span className="font-semibold text-slate-800 text-sm">Portfolio Website</span>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-sm"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-100/95 backdrop-blur-sm border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 overflow-x-hidden
          md:relative md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 md:w-60
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200">
          <span className="font-semibold text-slate-800 text-sm whitespace-nowrap block">Portfolio Website</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-sm text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto" aria-label="Site pages">
          {topNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} isOpen={isOpen} />
          ))}
          {bottomNav.map((item) => (
            <div key={item.href}>
              {item.href === '/tools/chat-bot' ? (
                <div 
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-medium transition-colors cursor-pointer select-none ${
                    pathname === '/tools/chat-bot'
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                  onClick={() => {
                    if (pathname === '/tools/chat-bot') {
                      setIsChatMenuOpen(!isChatMenuOpen);
                    } else {
                      router.push('/tools/chat-bot');
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg shrink-0">{item.icon}</span>
                    <span className={`whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>{item.label}</span>
                  </div>
                  {pathname === '/tools/chat-bot' && (
                    <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isChatMenuOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  )}
                </div>
              ) : (
                <NavItem {...item} pathname={pathname} isOpen={isOpen} />
              )}
              
              {item.href === '/tools/chat-bot' && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isChatMenuOpen ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}>
                  <div className="relative ml-[22px] pl-4 border-l-2 border-slate-200">
                    <div className="absolute top-1/2 left-0 w-3 h-[2px] bg-slate-200 -translate-y-1/2"></div>
                    <button 
                      onClick={() => hasMessages && setShowConfirmNewChat(true)} 
                      disabled={!hasMessages}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-mono transition-colors ${
                        hasMessages 
                          ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 cursor-pointer' 
                          : 'text-slate-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      New Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isAuthenticated && (
            <>
              <div className="border-t border-slate-200 my-3" />
              <p className={`text-[11px] text-slate-400 uppercase tracking-wider px-3 mb-1 font-medium font-mono whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>
                Admin
              </p>
              {adminNav.map((item) => (
                <NavItem key={item.href} {...item} pathname={pathname} isOpen={isOpen} />
              ))}

            </>
          )}
        </nav>

        <footer className="p-2 border-t border-slate-200">
          <div className={`flex flex-col px-3 py-2 mb-1 ${isOpen ? 'md:flex' : 'md:hidden'}`}>
            <h3 className="text-[11px] text-slate-400 uppercase tracking-wider font-medium font-mono mb-3">My Contact</h3>
            <div className="flex items-center gap-4 mb-3">
              <a href="https://github.com/ttser123" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-slate-600 transition-colors" title="GitHub">
                <FaGithub className="text-[20px]" />
              </a>
              <a href="https://www.linkedin.com/in/parinya-sawatdee" target="_blank" rel="noopener noreferrer" className="text-[#0a66c2] hover:text-[#0a66c2]/80 transition-colors" title="LinkedIn">
                <FaLinkedin className="text-[20px]" />
              </a>
              <a href="https://www.youtube.com/@toeysawatdee" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-500 transition-colors" title="YouTube">
                <FaYoutube className="text-[20px]" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <FaEnvelope className="text-[13px] shrink-0" />
              <span className="text-[11px] font-medium font-mono select-all hover:text-slate-800 transition-colors cursor-text">
                parinya.zawatdee@gmail.com
              </span>
            </div>
          </div>
          <div className="group relative flex items-center gap-3 px-3 py-2.5 mb-1 text-slate-500 cursor-default hover:bg-slate-50 rounded-sm transition-colors" title={!isOpen ? `Profile Views: ${visitorCount}` : undefined}>
            <span className="material-symbols-outlined text-lg shrink-0">visibility</span>
            <span className={`text-xs font-medium font-mono whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>Profile Views: {visitorCount}</span>
          </div>
          {!isAuthenticated ? (
            <NavItem href="/login" icon="lock" label="Admin Login" pathname={pathname} isOpen={isOpen} />
          ) : (
            <button onClick={handleLogout} title={!isOpen ? "Logout" : undefined} className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-rose-600 hover:bg-rose-50 transition-colors">
              <span className="material-symbols-outlined text-lg shrink-0">logout</span>
              <span className={`whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>Logout</span>
            </button>
          )}
        </footer>
      </aside>

      {/* ── New Chat Confirmation Dialog ── */}
      <Dialog open={showConfirmNewChat} onOpenChange={setShowConfirmNewChat}>
        <DialogContent className="w-[90vw] sm:max-w-[300px] p-5 bg-white border-slate-300 shadow-2xl rounded-sm">
          <DialogHeader className="mb-2 text-left">
            <DialogTitle className="text-base font-bold text-slate-900 font-sans flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
              Start New Chat?
            </DialogTitle>
            <DialogDescription className="text-[13px] text-slate-500 mt-1 font-sans leading-relaxed">
              This will clear your current conversation history. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowConfirmNewChat(false)}
              className="px-3 py-1.5 rounded-sm border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-bold font-mono uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                triggerClear();
                setShowConfirmNewChat(false);
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              className="px-3 py-1.5 rounded-sm bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold font-mono uppercase tracking-wider transition-colors"
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

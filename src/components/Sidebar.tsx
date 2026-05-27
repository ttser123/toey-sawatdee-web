// src/components/Sidebar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { FaGithub, FaLinkedin, FaEnvelope, FaYoutube } from 'react-icons/fa';

// ── Navigation Data ──────────────────────────────────────────────────

const topNav = [
  { href: '/', icon: 'person', label: 'Portfolio' },
  { href: '/overview', icon: 'bar_chart', label: 'Overview' },
];

interface GameZone {
  href: string;
  icon?: string;
  label: string;
  zone?: string;
}

const gameServerItems: GameZone[] = [];

const bottomNav = [
  { href: '/tools', icon: 'construction', label: 'Tools' },
  { href: '/status', icon: 'monitor_heart', label: 'Status' },
  { href: '/release-notes', icon: 'update', label: 'Release Notes' },
];

const adminNav = [
  { href: '/admin/admin-log', icon: 'dns', label: 'Admin Log' },
  { href: '/admin/resume', icon: 'description', label: 'Resume' },
];

const GAMES_DROPDOWN_ID = 'games-server-dropdown';

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
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
    >
      <span className="material-symbols-outlined text-lg shrink-0">{icon}</span>
      <span className={`whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>{label}</span>
    </Link>
  );
};

interface GameNavItemProps extends GameZone {
  pathname: string;
  isOpen: boolean;
}

const GameNavItem = ({ href, icon, label, zone, pathname, isOpen }: GameNavItemProps) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      title={!isOpen ? label : undefined}
      className={`group relative flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-sm text-[13px] font-medium transition-all duration-200 ${isActive
        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
    >
      {icon && (
        <span className={`material-symbols-outlined text-[16px] shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
          {icon}
        </span>
      )}
      <span className={`whitespace-nowrap flex-1 truncate block ${isOpen ? 'md:block' : 'md:hidden'}`}>
        {label}
      </span>
      {zone && (
        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm tracking-wider shrink-0 ${isOpen ? 'md:inline-flex' : 'md:hidden'} ${isActive
          ? 'bg-indigo-100 text-indigo-500 border border-indigo-200'
          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500 border border-slate-200'
          }`}>
          {zone}
        </span>
      )}
    </Link>
  );
};

// ── Main Component ───────────────────────────────────────────────────

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | string>('...');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const isGameRouteActive = gameServerItems.some((item) => pathname === item.href);
  const [gamesOpen, setGamesOpen] = useState(isGameRouteActive);

  // Sync dropdown open state when navigating to a game route
  useEffect(() => {
    if (isGameRouteActive) {
      setGamesOpen(true);
    }
  }, [isGameRouteActive]);

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
      <header className="md:hidden flex items-center justify-between bg-white/90 backdrop-blur-sm border-b border-slate-200 h-14 px-4 shrink-0">
        <span className="font-semibold text-slate-800 text-sm">Portfolio</span>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-sm"
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
          fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 overflow-x-hidden
          md:relative md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 ${isOpen ? 'md:w-60' : 'md:w-[60px]'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200">
          <span className={`font-semibold text-slate-800 text-sm whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>Portfolio</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <button
            onClick={() => {
              if (isOpen && gamesOpen) {
                setGamesOpen(false);
                setTimeout(() => setIsOpen(false), 300);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className="hidden md:block p-1.5 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Toggle sidebar"
            aria-expanded={isOpen}
          >
            <span className="material-symbols-outlined text-[20px]">{isOpen ? 'menu_open' : 'menu'}</span>
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto" aria-label="Site pages">
          {topNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} isOpen={isOpen} />
          ))}
          {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} isOpen={isOpen} />
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
              <div className="mt-1">
                <button
                  onClick={() => {
                    if (!isOpen) {
                      setIsOpen(true);
                      setTimeout(() => setGamesOpen(true), 300);
                    } else {
                      setGamesOpen(!gamesOpen);
                    }
                  }}
                  title={!isOpen ? 'Games Server' : undefined}
                  aria-expanded={gamesOpen}
                  aria-controls={GAMES_DROPDOWN_ID}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${isGameRouteActive
                    ? 'bg-indigo-50/60 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <span className={`material-symbols-outlined text-lg shrink-0 ${isGameRouteActive ? 'text-indigo-500' : ''}`}>
                    sports_esports
                  </span>
                  <span className={`whitespace-nowrap flex-1 text-left block ${isOpen ? 'md:block' : 'md:hidden'}`}>
                    Games Server
                  </span>
                  {isOpen && (
                    <span className={`material-symbols-outlined text-[16px] shrink-0 transition-transform duration-300 ${gamesOpen ? 'rotate-180' : 'rotate-0'} ${isGameRouteActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                      expand_more
                    </span>
                  )}
                  {isGameRouteActive && (
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 ${isOpen ? 'md:hidden' : 'md:block'} hidden`} />
                  )}
                </button>
                <div
                  id={GAMES_DROPDOWN_ID}
                  role="region"
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: gamesOpen ? '1fr' : '0fr', opacity: gamesOpen ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <div className="pt-1 pb-1 space-y-0.5">
                      {gameServerItems.map((item) => (
                        <GameNavItem key={item.href} {...item} pathname={pathname} isOpen={isOpen} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </nav>

        <footer className="p-2 border-t border-slate-200">
          <div className={`flex flex-col px-3 py-2 mb-1 ${isOpen ? 'md:flex' : 'md:hidden'}`}>
            <h3 className="text-[11px] text-slate-400 uppercase tracking-wider font-medium font-mono mb-3">My Contact</h3>
            <div className="flex items-center gap-4 mb-3">
              <a href="https://github.com/ttser123" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="GitHub">
                <FaGithub className="text-[20px]" />
              </a>
              <a href="https://www.linkedin.com/in/parinya-sawatdee" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors" title="LinkedIn">
                <FaLinkedin className="text-[20px]" />
              </a>
              <a href="https://www.youtube.com/@toeysawatdee" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-rose-600 transition-colors" title="YouTube">
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
    </>
  );
}

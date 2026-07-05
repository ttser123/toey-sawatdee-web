'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import FloatingNav from '@/components/FloatingNav';
import HudHeader from '@/components/HudHeader';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import SmoothScroll from '@/components/SmoothScroll';

const getPageTitle = (pathname: string) => {
    if (pathname === '/') return <TypingAnimation duration={60} as="span">Hi, I'm Parinya👋</TypingAnimation>;
    if (pathname === '/overview') return 'Overview';
    if (pathname === '/tools') return 'Tools & Utilities';
    if (pathname === '/tools/my-savings') return 'My Savings';
    if (pathname === '/tools/env-tracker') return 'ENV Tracker';
    if (pathname === '/tools/subnet-solver') return 'Subnet Solver';
    if (pathname === '/tools/chat-bot') return 'AI assistant';
    if (pathname === '/admin/finance') return 'Finance';
    if (pathname === '/admin/release-notes') return 'Release Notes';
    if (pathname.includes('/admin/admin-log')) return 'Admin Log';

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'OVERVIEW';
    return `${segments[segments.length - 1].toUpperCase()}`;
};

const getPageSubtitle = (pathname: string) => {
    if (pathname === '/') return 'Project Showcase & Professional Profile';
    if (pathname === '/overview') return 'Infrastructure Architecture & System Flow';
    if (pathname === '/tools') return 'Diagnostic & Utility Modules';
    if (pathname === '/tools/my-savings') return 'Tactical Financial Tracking Engine';
    if (pathname === '/tools/env-tracker') return 'Blast Radius Simulator & AST Analysis';
    if (pathname === '/tools/subnet-solver') return 'Network Collision Resolution Tool';
    if (pathname === '/tools/chat-bot') return 'Tactical LLM Operation Center';
    if (pathname === '/admin/finance') return 'Financial Administration Console';
    if (pathname === '/admin/release-notes') return 'System Changelog & Deployment History';
    if (pathname.includes('/admin/admin-log')) return 'Security & Authentication Audit Trail';

    return 'Module Active';
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Isolated Layout for Login
    if (pathname === '/login') {
        return <AuthProvider>{children}</AuthProvider>;
    }

    const title = getPageTitle(pathname);
    const subtitle = getPageSubtitle(pathname);

    return (
        <AuthProvider>
            <SmoothScroll>
                <ScrollProgress />
                <div className="flex flex-col min-h-screen relative">
                    <FloatingNav />
                    
                    <main className="flex-1">
                        {/* Keep the wide workspace for all pages. */}
                        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 space-y-8 pb-32 animate-fade-in-composited pt-24 md:pt-32">
                            {/* Restore HudHeader on the Home page per user request */}
                            {pathname !== '/tools/chat-bot' && (
                                <HudHeader title={title} subtitle={subtitle} />
                            )}
                            {children}
                        </div>
                    </main>
                </div>
            </SmoothScroll>
        </AuthProvider>
    );
}

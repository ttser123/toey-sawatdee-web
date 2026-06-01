'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import HudHeader from '@/components/HudHeader';

const getPageTitle = (pathname: string) => {
    if (pathname === '/') return 'PORTFOLIO';
    if (pathname === '/overview') return 'OVERVIEW';
    if (pathname === '/tools') return 'TOOLS DIRECTORY';
    if (pathname === '/tools/my-savings') return 'MYSAVINGS';
    if (pathname === '/tools/env-tracker') return 'ENV TRACKER';
    if (pathname === '/tools/subnet-solver') return 'SUBNET SOLVER';
    if (pathname === '/admin/finance') return 'FINANCE';
    if (pathname === '/status') return 'SYSTEM STATUS';
    if (pathname === '/release-notes') return 'UPDATE LOGS';
    if (pathname.includes('/admin/admin-log')) return 'ADMIN LOG';

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
    if (pathname === '/admin/finance') return 'Financial Administration Console';
    if (pathname === '/status') return 'Real-time Metrics & Health Monitoring';
    if (pathname === '/release-notes') return 'System Changelog & Deployment History';
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
            <div className="flex flex-col md:flex-row h-screen overflow-hidden relative">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 space-y-8 pb-24 animate-fade-in-composited">
                        <HudHeader title={title} subtitle={subtitle} />
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}

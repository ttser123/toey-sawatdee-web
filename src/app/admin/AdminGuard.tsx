// src/app/admin/AdminGuard.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm font-mono animate-pulse">Checking permissions...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm font-mono animate-pulse">Redirecting to login...</p>
            </div>
        );
    }

    return <>{children}</>;
}

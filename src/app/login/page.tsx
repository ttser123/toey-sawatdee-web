// src/app/login/page.tsx
'use client';
import '@/lib/amplify-config';
import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading, refreshAuth } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const callbackUrl = searchParams.get('callbackUrl') || '/admin/admin-log';

    // If already logged in, redirect directly to the callback or dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(callbackUrl);
        }
    }, [isLoading, isAuthenticated, router, callbackUrl]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        setErrorMsg('');

        try {
            const response = await signIn({ username: email, password });
            console.log("AUTH RESPONSE:", response);

            if (response.isSignedIn) {
                await refreshAuth();
                router.replace(callbackUrl);
            }
        } catch (error: unknown) {
            console.error('Login failed:', error);

            // Handle specific Cognito error types
            const err = error as { name?: string; __type?: string; message?: string };
            const errorName = err.name || err.__type || '';

            if (errorName === 'UserNotFoundException' || errorName === 'NotAuthorizedException') {
                setErrorMsg('Invalid email or password. Please try again.');
            } else if (errorName === 'UserNotConfirmedException') {
                setErrorMsg('Your account is not confirmed. Please check your email.');
            } else if (errorName === 'PasswordResetRequiredException') {
                setErrorMsg('Password reset required. Please contact your administrator.');
            } else if (errorName === 'LimitExceededException') {
                setErrorMsg('Too many login attempts. Please try again later.');
            } else {
                setErrorMsg(err.message || 'An unexpected error occurred during login.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading || isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-blueprint">
                <span className="material-symbols-outlined animate-spin text-4xl text-indigo-600 mb-4">progress_activity</span>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">Authenticating...</p>
            </div>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-blueprint p-4">
            <div className="card-blueprint w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-sm font-mono text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-rose-500 shrink-0">error</span>
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold font-mono text-slate-800 mb-1.5 uppercase tracking-wide">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-sm text-slate-800 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-none"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold font-mono text-slate-800 mb-1.5 uppercase tracking-wide">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-sm text-slate-800 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 mt-4 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-sm font-mono font-bold uppercase tracking-wide rounded-sm transition-colors disabled:opacity-50 shadow-none flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            'Sign In to Admin Panel'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-200 pt-6">
                    <Link href="/" className="text-sm font-mono text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-blueprint">
                <span className="material-symbols-outlined animate-spin text-4xl text-indigo-600">progress_activity</span>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

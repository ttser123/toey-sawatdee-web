'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function ToolsDirectory() {
    return (
        <div className="flex flex-col gap-12 pb-20">
            {/* PRODUCTION SECTOR */}
            <div className="space-y-6">
                <ScrollReveal variant="fade-left">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
                            Sector 01: Production Deployments
                        </h3>
                        <div className="h-px flex-1 bg-slate-200 opacity-50" />
                    </div>
                </ScrollReveal>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ScrollReveal variant="fade-up" delay={0}>
                        <Link 
                            href="/tools/subnet-solver"
                            className="group card-blueprint p-6 hover:border-indigo-300 transition-all flex flex-col gap-4"
                        >
                            <div className="w-10 h-10 bg-slate-50/50 rounded-sm flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500">router</span>
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-black font-mono uppercase tracking-tight text-sm mb-1 group-hover:text-indigo-600 transition-colors">Subnet Solver</h3>
                                <p className="text-slate-400 text-[10px] leading-relaxed font-medium uppercase tracking-wider">Resolve IP collisions between Docker/WSL and Corporate LAN/VPN.</p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Ready</span>
                                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    </ScrollReveal>

                    <ScrollReveal variant="fade-up" delay={1}>
                        <Link 
                            href="/tools/env-tracker"
                            className="group card-blueprint p-6 hover:border-indigo-300 transition-all flex flex-col gap-4"
                        >
                            <div className="w-10 h-10 bg-slate-50/50 rounded-sm flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500">hub</span>
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-black font-mono uppercase tracking-tight text-sm mb-1 group-hover:text-indigo-600 transition-colors">Env Tracker</h3>
                                <p className="text-slate-400 text-[10px] leading-relaxed font-medium uppercase tracking-wider">Blast radius simulator. Uses AST parsing to map environment variable dependencies across the codebase.</p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Ready</span>
                                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    </ScrollReveal>
                </div>
            </div>

            {/* LAB / Work In Progress */}
            <div className="space-y-6">
                <ScrollReveal variant="fade-left">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[11px] font-black text-amber-500/60 uppercase tracking-[0.3em] font-mono">
                            Sector 02: [ LAB / Work In Progress ]
                        </h3>
                        <div className="h-px flex-1 bg-amber-200/30" />
                    </div>
                </ScrollReveal>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ScrollReveal variant="fade-up" delay={0}>
                        <Link 
                            href="/tools/my-savings"
                            className="group card-blueprint bg-white/60 opacity-60 grayscale-[0.5] p-6 hover:opacity-100 hover:grayscale-0 hover:border-amber-300 transition-all flex flex-col gap-4"
                        >
                            <div className="w-10 h-10 bg-slate-50/50 rounded-sm flex items-center justify-center border border-slate-200 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-600">account_balance</span>
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-black font-mono uppercase tracking-tight text-sm mb-1 group-hover:text-amber-700 transition-colors">My Savings</h3>
                                <p className="text-slate-400 text-[10px] leading-relaxed font-medium uppercase tracking-wider">Tactical finance engine with 50/30/20 rule validation and goal tracking.</p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Work In Progress</span>
                                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:rotate-12 transition-transform">construction</span>
                            </div>
                        </Link>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}

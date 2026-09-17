import React from 'react';
import { GraduationCap } from 'lucide-react';

const LoadingScreen = ({ message = "Cargando plataforma..." }) => {
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z- overflow-hidden transition-colors duration-500">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-12 px-4">
                <div className="relative flex items-center justify-center w-40 h-40">
                    <div className="absolute inset-0 border-[3px] border-slate-200/50 dark:border-slate-800/50 rounded-full" />

                    <div className="absolute inset-0 border-[3px] border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"
                        style={{ animationDuration: '1s' }} />

                    <div className="absolute inset-4 border-[3px] border-transparent border-b-emerald-300/40 dark:border-b-emerald-500/20 rounded-full animate-spin"
                        style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />

                    <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-700 p-5 rounded-[2rem] shadow-2xl shadow-emerald-500/30 border border-white/20 transform group-hover:scale-110 transition-transform">
                        <GraduationCap size={42} className="text-white" strokeWidth={2.5} />
                    </div>
                </div>

                <div className="text-center space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase italic">
                            Universidad <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">Confía</span>
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full opacity-50" />
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black tracking-[0.3em] uppercase">
                            {message || "Cargando experiencia"}
                        </p>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                Sistema de Aprendizaje Continuo v3.0
            </div>
        </div>
    );
};

export default LoadingScreen;
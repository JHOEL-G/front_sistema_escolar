import React from 'react';
import { Eye, ArrowLeft, Shield } from 'lucide-react';
import { useImpersonation } from './ImpersonationProviderr';
import { useNavigate } from 'react-router-dom';

const ImpersonationBanner = () => {
    const { impersonatedUser, stopImpersonation } = useImpersonation();
    const navigate = useNavigate();
    if (!impersonatedUser) return null;

    const nombre = `${impersonatedUser.nombre ?? ''} ${impersonatedUser.apeLLido ?? ''}`.trim();
    const permiso = impersonatedUser.permisoNombre ?? impersonatedUser.nivelPermiso ?? '';
    const inicial = nombre.charAt(0).toUpperCase();

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>

                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white" />
                    <div className="absolute -bottom-6 -left-4 w-16 h-16 rounded-full bg-white" />
                </div>

                <div className="relative shrink-0 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
                    <span className="text-white font-black text-sm">{inicial}</span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-400 shadow-sm" />
                </div>

                <div className="relative flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Eye size={10} className="text-white/70 shrink-0" />
                        <span className="text-white/70 text-[9px] font-black uppercase tracking-[0.15em]">
                            Vista simulada
                        </span>
                    </div>
                    <span className="text-white font-black text-sm leading-tight truncate max-w-[140px]">
                        {nombre}
                    </span>
                    {permiso && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <Shield size={9} className="text-white/60" />
                            <span className="text-white/60 text-[9px] font-bold uppercase tracking-wider">
                                {permiso}
                            </span>
                        </div>
                    )}
                </div>

                <div className="relative w-px h-8 bg-white/20 mx-1 shrink-0" />

                <button
                    onClick={() => { stopImpersonation(); navigate('/'); }}
                    className="relative flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 active:bg-white/10 text-white rounded-xl text-[11px] font-black transition-all duration-200 shrink-0 border border-white/20 hover:border-white/40 hover:scale-105 active:scale-95"
                >
                    <ArrowLeft size={12} />
                    Salir
                </button>
            </div>
        </div>
    );
};

export default ImpersonationBanner;
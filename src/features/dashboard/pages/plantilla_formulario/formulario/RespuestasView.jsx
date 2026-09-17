import React, { useState } from 'react';
import {
    ChevronLeft, ChevronDown, ChevronUp,
    Calendar, MessageSquare, BarChart2, Hash,
    ArrowUpRight, Users, UserX
} from 'lucide-react';

const RespuestasView = ({ formulario, respuestas, setView }) => {
    const [expandedEnvio, setExpandedEnvio] = useState(null);
    const envios = respuestas?.envios || [];

    const formatFecha = (fecha) => {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-5">
            <div className="max-w-[80%] mx-auto px-6 pt-5">

                <button
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Panel de control</span>
                </button>

                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {formulario?.title || 'Respuestas'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {envios.length} registros recolectados
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                <BarChart2 size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                        <p className="text-5xl font-black text-slate-950 tracking-tighter">{envios.length}</p>
                        <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold mt-4 uppercase">
                            <ArrowUpRight size={14} /> <span>Actividad total</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                <Users size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuarios</span>
                        </div>
                        <p className="text-5xl font-black text-slate-950 tracking-tighter">
                            {envios.filter(e => e.usuarioId).length}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase">Registrados</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                <UserX size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anónimos</span>
                        </div>
                        <p className="text-5xl font-black text-slate-950 tracking-tighter">
                            {envios.filter(e => !e.usuarioId).length}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase">Públicos</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-8 px-2">
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Registro</h2>
                        <div className="h-[1px] flex-1 bg-slate-200" />
                    </div>

                    {envios.length === 0 ? (
                        <div className="py-24 text-center bg-white rounded-[3rem] shadow-sm border border-slate-50">
                            <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Esperando respuestas...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {envios.map((envio, idx) => (
                                <div
                                    key={envio.envioId}
                                    className={`bg-white rounded-[2rem] transition-all duration-300 ${expandedEnvio === envio.envioId
                                        ? 'shadow-xl ring-1 ring-slate-100'
                                        : 'shadow-sm hover:shadow-md'
                                        } overflow-hidden`}
                                >
                                    <button
                                        onClick={() => setExpandedEnvio(expandedEnvio === envio.envioId ? null : envio.envioId)}
                                        className="w-full flex items-center justify-between px-10 py-8 outline-none"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${expandedEnvio === envio.envioId ? 'bg-slate-900 text-white scale-110' : 'bg-slate-50 text-slate-300'
                                                }`}>
                                                <Hash size={20} strokeWidth={3} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-lg font-black text-slate-900 tracking-tight">
                                                    {envio.usuarioId ? `User ID ${envio.usuarioId}` : 'Anónimo'}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                                    <Calendar size={12} className="text-indigo-400" />
                                                    {formatFecha(envio.fechaEnvio)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className={`hidden sm:block text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${expandedEnvio === envio.envioId ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 bg-slate-50'
                                                }`}>
                                                {(envio.respuestas || []).length} Respuestas
                                            </span>
                                            <div className={expandedEnvio === envio.envioId ? 'text-indigo-600' : 'text-slate-300'}>
                                                {expandedEnvio === envio.envioId ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                            </div>
                                        </div>
                                    </button>

                                    {expandedEnvio === envio.envioId && (
                                        <div className="px-10 pb-10 pt-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-3">
                                                {(envio.respuestas || []).map((r, rIdx) => (
                                                    <div key={r.respuestaId} className="flex flex-col md:flex-row gap-2 md:gap-10 py-6 border-t border-slate-50">
                                                        <div className="md:w-1/3">
                                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1">Pregunta {rIdx + 1}</p>
                                                            <p className="text-sm font-bold text-slate-500 leading-tight">{r.pregunta}</p>
                                                        </div>
                                                        <div className="md:flex-1 bg-slate-50/50 p-4 rounded-2xl">
                                                            <p className="text-base text-slate-900 font-bold">
                                                                {r.opcionSeleccionada || r.textoRespuesta || <span className="text-slate-300 font-medium italic">Sin datos</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RespuestasView;
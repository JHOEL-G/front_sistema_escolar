import React from "react";
import {
    MessageSquare, Loader2, Plus, FileText,
    Copy, CheckCircle2, Rocket, Globe,
    LayoutGrid, ArrowUpRight
} from "lucide-react";

const Dashboard = ({
    templates, copiedUUID, createNewForm, copyURL,
    setCurrentForm, setView, loadingDetalle,
    verRespuestas, loadingRespuestas, publishFromDashboard
}) => (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 selection:bg-indigo-100">
        <div className="fixed inset-0 bg-[radial-gradient(at_top_right,#e2e8f0_0%,transparent_25%)] pointer-events-none" />

        <div className="relative max-w-[90%] mx-auto px-6 py-3 lg:px-3">

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-2 border border-indigo-100">
                        Workspace personal
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
                        Mis <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Formularios</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-md">
                        Gestiona tus experiencias de recolección de datos en un solo lugar.
                    </p>
                </div>
                <button
                    onClick={() => createNewForm()}
                    className="group flex items-center gap-2 px-6 py-3.5 bg-slate-950 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Crear nueva plantilla
                </button>
            </header>

            {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-indigo-200 blur-2xl opacity-30 rounded-full" />
                        <div className="relative p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-indigo-500">
                            <LayoutGrid size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Lienzo en blanco</h3>
                    <p className="text-slate-400 mb-8 max-w-xs text-center">
                        Aún no has creado formularios. Comienza con una plantilla o desde cero.
                    </p>
                    <button
                        onClick={() => createNewForm()}
                        className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Empezar ahora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="group relative bg-white border border-slate-200/60 rounded-[2rem] p-7 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-indigo-100 transition-all duration-500 flex flex-col overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${t.publicado
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${t.publicado ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                    {t.publicado ? 'En vivo' : 'Borrador'}
                                </div>

                                <div className="text-slate-300 group-hover:text-indigo-200 transition-colors">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {t.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 h-10">
                                    {t.descripcion || 'Sin descripción asignada para este formulario.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                    <MessageSquare size={14} />
                                    {t.questions?.length || 0} campos
                                </div>
                                {t.publicado && (
                                    <div className="h-1 w-1 bg-slate-300 rounded-full" />
                                )}
                                {t.publicado && t.publicId && (
                                    <button
                                        onClick={() => copyURL(t.publicId)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                                    >
                                        <Globe size={14} />
                                        {copiedUUID ? '¡Copiado!' : 'URL Pública'}
                                    </button>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2">
                                <button
                                    onClick={() => createNewForm(t)}
                                    disabled={loadingDetalle}
                                    className="flex-1 py-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all duration-300 disabled:opacity-50"
                                >
                                    {loadingDetalle ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Editar Diseño'}
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => publishFromDashboard(t)}
                                        title={t.publicado ? 'Despublicar' : 'Publicar'}
                                        className={`p-3 bg-white border rounded-xl transition-all shadow-sm ${t.publicado
                                            ? 'border-emerald-200 text-emerald-600 hover:border-red-300 hover:text-red-500'
                                            : 'border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500'
                                            }`}
                                    >
                                        <Rocket size={18} />
                                    </button>
                                    <button
                                        onClick={() => verRespuestas(t)}
                                        disabled={loadingRespuestas}
                                        className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {loadingRespuestas
                                            ? <Loader2 size={18} className="animate-spin" />
                                            : <MessageSquare size={18} />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default Dashboard;
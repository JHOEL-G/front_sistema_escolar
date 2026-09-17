import React, { useState } from 'react';
import {
    BarChart3,
    Users,
    Activity,
    Calendar,
    Search,
    Columns,
    Download,
    ChevronDown,
    Frown,
    ArrowUpRight,
    Filter
} from 'lucide-react';

const Card = ({ title, subtitle, children, className = "" }) => (
    <div className={`bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm ${className}`}>
        <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const ActivityReport = () => {
    const [period, setPeriod] = useState('Ayer');

    return (
        <div className="min-h-full p-6 lg:p-12 font-sans selection:bg-indigo-100 text-slate-900">
            <div className="max-w-8xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reporte de actividad</h1>
                        <p className="text-base text-slate-400 font-medium mt-1">Monitorea el compromiso y uso de la plataforma en tiempo real.</p>
                    </div>

                    <div className="relative group">
                        <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10">Periodo</label>
                        <button className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm hover:border-indigo-300 transition-all min-w-[180px] justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-indigo-500" />
                                <span className="font-bold text-slate-700">{period}</span>
                            </div>
                            <ChevronDown size={16} className="text-slate-400" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <Card
                        title="Usuarios registrados en el periodo"
                        subtitle="Número total de usuarios registrados en plataforma durante el periodo seleccionado."
                    >
                        <div className="bg-slate-50 rounded-[2rem] h-48 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Users size={80} className="text-indigo-600" />
                            </div>
                            <div className="text-center relative z-10">
                                <span className="text-6xl font-black text-slate-800 tracking-tighter">0</span>
                                <div className="flex items-center justify-center gap-2 text-indigo-500 mt-2 font-black text-[10px] uppercase tracking-widest">
                                    <Activity size={14} />
                                    Plataforma General
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Usuarios activos en el periodo"
                        subtitle="Proporción de usuarios activos con respecto al total de usuarios."
                    >
                        <div className="flex flex-col items-center justify-center py-2">
                            <div className="relative w-40 h-40 mb-8">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * 3.04) / 100} strokeLinecap="round" className="text-indigo-600" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800 tracking-tighter">22</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuarios</span>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full">
                                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Activos</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-sm">3.04%</span>
                                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                    </div>
                                </div>
                                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Inactivos</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-sm">96.96%</span>
                                        <div className="w-2 h-2 rounded-full bg-orange-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Actividad semanal"
                        subtitle="Muestra los días con mayor actividad en la semana de acuerdo al periodo."
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-end justify-between h-60 gap-10 px-2">
                                {[
                                    { d: 'D', h: '20%' }, { d: 'L', h: '30%' },
                                    { d: 'M', h: '60%', active: true }, { d: 'M', h: '100%', active: true },
                                    { d: 'J', h: '40%' }, { d: 'V', h: '25%' }, { d: 'S', h: '15%' }
                                ].map((bar, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="w-full bg-slate-100 rounded-full relative overflow-hidden h-50">
                                            <div
                                                className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${bar.active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                                style={{ height: bar.h }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">{bar.d}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                <Card
                    title="Tendencia de actividad general"
                    className="mb-8"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl">
                            <ArrowUpRight size={16} />
                            <span>Pico detectado el Miércoles</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agrupar por:</span>
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                                Días <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="relative h-64 w-full">
                        {[0, 5, 10, 15, 20].reverse().map(val => (
                            <div key={val} className="flex items-center gap-4 mb-[42px] last:mb-0">
                                <span className="text-[10px] font-bold text-slate-300 w-4">{val}</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                        ))}

                        <svg className="absolute top-0 left-8 w-[calc(100%-32px)] h-[210px] overflow-visible">
                            <path
                                d="M 0 210 L 200 210 L 400 210 L 600 0 L 800 210 L 1000 210 L 1200 210"
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {[0, 200, 400, 600, 800, 1000, 1200].map((x, i) => (
                                <circle key={i} cx={x} cy={i === 3 ? 0 : 210} r="5" fill="white" stroke="#4f46e5" strokeWidth="2" />
                            ))}
                        </svg>

                        <div className="absolute -bottom-6 left-8 w-[calc(100%-32px)] flex justify-between">
                            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                                <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Comienza a escribir..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                <Columns size={16} /> Administrar columnas
                            </button>
                            <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                <Download size={16} /> Exportar
                            </button>
                        </div>
                    </div>

                    <div className="py-32 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 animate-pulse">
                            <Frown size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Aún no hay actividad registrada en este período</h4>
                        <p className="max-w-md text-sm text-slate-400 font-medium leading-relaxed">
                            Selecciona un rango de fechas en el filtro superior o asegúrate de que haya usuarios activos en la plataforma durante ese tiempo.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActivityReport;
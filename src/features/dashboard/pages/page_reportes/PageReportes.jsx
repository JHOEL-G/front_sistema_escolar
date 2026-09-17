import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    GraduationCap,
    Plus,
    BarChart3,
    PieChart,
    TrendingUp,
    X,
    Search,
    Bell,
    Calendar,
    Settings,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download
} from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

const WIDGET_TEMPLATES = {
    matriculas: {
        id: 'matriculas',
        name: 'Matrículas',
        icon: <BarChart3 />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Flujo de ingresos mensual'
    },
    genero: {
        id: 'genero',
        name: 'Diversidad',
        icon: <PieChart />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'Distribución por género'
    },
    rendimiento: {
        id: 'rendimiento',
        name: 'Academia',
        icon: <TrendingUp />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        description: 'Promedio de calificaciones'
    },
    asistencia: {
        id: 'asistencia',
        name: 'Asistencia',
        icon: <Users />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        description: 'Presencialidad total'
    },
};

const AdvancedWidget = ({ widget, onRemove }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-48">
                <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                </div>
                <div className="h-20 bg-slate-50 rounded-xl w-full" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className={`w-12 h-12 ${widget.bgColor} ${widget.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                        {React.cloneElement(widget.icon, { size: 24 })}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{widget.title}</h4>
                        <p className="text-xs text-slate-400 font-medium">{widget.category}</p>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><Settings size={14} /></button>
                    <button onClick={() => onRemove(widget.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><X size={14} /></button>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{widget.value}</span>
                    <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${widget.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {widget.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {widget.trend}
                    </div>
                </div>
                <div className="flex items-end gap-1 h-12 w-24">
                    {widget.data.map((h, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-700 ${widget.color.replace('text', 'bg')} opacity-20 group-hover:opacity-60`}
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function PageReportes() {
    const [widgets, setWidgets] = useState([
        { id: '1', type: 'matriculas', title: 'Ingresos 2025', category: 'Finanzas', value: '$1.2M', trend: '+14.2%', isPositive: true, data: [40, 70, 45, 90, 65, 80, 50], ...WIDGET_TEMPLATES.matriculas },
        { id: '2', type: 'rendimiento', title: 'GPA Promedio', category: 'Académico', value: '3.8', trend: '+0.4', isPositive: true, data: [60, 50, 80, 70, 90, 85, 95], ...WIDGET_TEMPLATES.rendimiento }
    ]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalCursos: 0,
        loading: true
    });
    const [facultadData, setFacultadData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(true);

    const addWidget = (typeId) => {
        const template = WIDGET_TEMPLATES[typeId];
        const newWidget = {
            id: Math.random().toString(36).substr(2, 9),
            title: `${template.name} Q${Math.floor(Math.random() * 4) + 1}`,
            category: 'Métrica en tiempo real',
            value: (Math.random() * 100).toFixed(1) + '%',
            trend: (Math.random() * 5).toFixed(1) + '%',
            isPositive: Math.random() > 0.3,
            data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 20),
            ...template
        };
        setWidgets([newWidget, ...widgets]);
    };

    const removeWidget = (id) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoadingChart(true);
                const [resOus, resUsers] = await Promise.all([
                    serviceApiNet.Ous.list(),
                    serviceApiNet.Usuario.list()
                ]);

                const facultades = resOus.data?.data || [];
                const usuarios = resUsers.data || [];

                const processedData = facultades.slice(0, 10).map(ou => {
                    const count = usuarios.filter(u => u.organizacionalesId === ou.organizacionalesId).length;

                    return {
                        label: ou.nombre.substring(0, 5).toUpperCase(),
                        fullName: ou.nombre,
                        realCount: count,
                    };
                });

                const maxCount = Math.max(...processedData.map(d => d.realCount), 1);

                const finalData = processedData.map(d => ({
                    ...d,
                    value: (d.realCount / maxCount) * 100
                }));

                setFacultadData(finalData);
            } catch (error) {
                console.error("Error al cargar datos del gráfico:", error);
            } finally {
                setLoadingChart(false);
            }
        };

        fetchChartData();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resUsers, resCursos] = await Promise.all([
                    serviceApiNet.Usuario.list(),
                    serviceApiNet.Cursos.list()
                ]);

                const totalU = resUsers.data?.length || 0;
                const totalC = resCursos.data?.length || 0;

                setStats({
                    totalUsuarios: totalU,
                    totalCursos: totalC,
                    loading: false
                });

                setWidgets([
                    {
                        id: 'w-users',
                        type: 'asistencia',
                        title: 'Total Usuarios',
                        category: 'Gestión Humana',
                        value: totalU.toLocaleString(),
                        trend: '+12',
                        isPositive: true,
                        data: [30, 40, 35, 50, 49, 60, 70],
                        ...WIDGET_TEMPLATES.asistencia
                    },
                    {
                        id: 'w-cursos',
                        type: 'matriculas',
                        title: 'Cursos Activos',
                        category: 'Académico',
                        value: totalC.toString(),
                        trend: '+2',
                        isPositive: true,
                        data: [20, 25, 22, 30, 28, 35, 40],
                        ...WIDGET_TEMPLATES.matriculas
                    }
                ]);
            } catch (error) {
                console.error("Error cargando datos de la API:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        loadData();
    }, []);

    return (
        <div className="h-full w-full flex font-sans text-slate-900 overflow-hidden">

            <main className="flex-1 flex flex-col relative overflow-hidden">

                <div className="fixed top-3 left-0 right-0 z-50 flex justify-center items-center gap-6 pointer-events-none">

                    <div className="relative pointer-events-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-white/80 backdrop-blur-md shadow-xl shadow-slate-200/50 rounded-full py-3 pl-12 pr-6 text-sm w-64 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border border-slate-100"
                        />
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        {['Overview', 'Campus', 'Research', 'Analytics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? 'bg-slate-900 text-white shadow-lg transform scale-105'
                                    : 'bg-white/80 backdrop-blur-md text-slate-600 hover:bg-white shadow-md border border-slate-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-8">
                    <div className="max-w-8xl mx-auto">

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Panel Administrativo</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs font-medium text-slate-400">Actualizado hace 2 minutos</span>
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Estadísticas de la Institución</h1>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                    <Filter size={18} /> Filtrar
                                </button>
                                <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    <Download size={18} /> Exportar Datos
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                            <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.loading ? (
                                    [1, 2].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-3xl h-48" />)
                                ) : (
                                    widgets.map(widget => (
                                        <AdvancedWidget key={widget.id} widget={widget} onRemove={removeWidget} />
                                    ))
                                )}

                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="bg-dashed-border bg-white rounded-3xl p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group flex flex-col items-center justify-center min-h-[192px]"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all flex items-center justify-center mb-4">
                                        <Plus size={24} />
                                    </div>
                                    <p className="font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Nuevo Componente</p>
                                    <p className="text-xs text-slate-400 mt-1">Personaliza tu vista</p>
                                </button>
                            </div>

                            <div className="xl:col-span-3 space-y-8">
                                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900">Actividad Estudiantil</h3>
                                                <p className="text-slate-400 text-sm">Distribución de usuarios por Facultad</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {['7D', '1M', '1Y'].map(t => (
                                                    <button key={t} className={`px-4 py-1.5 rounded-xl text-xs font-bold ${t === '1M' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-6 h-64 px-4">
                                            {loadingChart ? (
                                                <div className="w-full flex items-end justify-around h-full">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className="w-12 bg-slate-100 animate-pulse rounded-2xl" style={{ height: '40%' }} />
                                                    ))}
                                                </div>
                                            ) : (
                                                facultadData.map((item, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                        <div className="w-full relative">
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                                {item.fullName}: {item.realCount} usuarios
                                                            </div>

                                                            <div
                                                                className="w-full bg-slate-50 rounded-2xl overflow-hidden relative"
                                                                style={{ height: '240px' }}
                                                            >
                                                                <div
                                                                    className="absolute bottom-0 w-full bg-indigo-600 rounded-2xl transition-all duration-1000 ease-out shadow-lg shadow-indigo-100 group-hover:bg-indigo-400"
                                                                    style={{ height: `${item.value}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 text-center leading-tight h-8 flex items-center">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-0"></div>
                                </div>
                            </div>

                            <div className="xl:col-span-1 space-y-6">
                                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-200">
                                    <h4 className="font-bold mb-6 text-indigo-400 uppercase tracking-widest text-[10px]">Estatus del Servidor</h4>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-black text-xl">94%</div>
                                            <svg className="absolute top-0 left-0 w-16 h-16 -rotate-90">
                                                <circle cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="175" strokeDashoffset="10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Saludable</p>
                                            <p className="text-xs text-slate-400">Latencia: 24ms</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                                            <span className="text-xs font-medium">Uptime Estudiantes</span>
                                            <span className="text-xs font-bold text-emerald-400">99.9%</span>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                                            <span className="text-xs font-medium">Uptime Facultad</span>
                                            <span className="text-xs font-bold text-emerald-400">99.8%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                                    <h4 className="font-bold mb-6 text-slate-800">Calendario Crítico</h4>
                                    <div className="space-y-6">
                                        {[
                                            { title: 'Auditoría Externa', time: 'En 2 días', color: 'bg-rose-500' },
                                            { title: 'Cierre de Semestre', time: '15 de Dic', color: 'bg-amber-500' },
                                            { title: 'Entrega de Becas', time: 'Mañana', color: 'bg-indigo-500' },
                                        ].map((ev, i) => (
                                            <div key={i} className="flex gap-4 group cursor-pointer">
                                                <div className={`w-1 h-10 ${ev.color} rounded-full transition-all group-hover:w-2`} />
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{ev.title}</p>
                                                    <p className="text-xs text-slate-400">{ev.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <aside className={`transition-all duration-500 flex flex-col shrink-0 relative z-20 ${isSidebarOpen ? 'w-96 shadow-2xl' : 'w-0 overflow-hidden'}`}>
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="font-black text-xl text-slate-900 tracking-tight">Componentes</h2>
                        <p className="text-xs text-slate-400 font-medium">Librería de Widgets Estadísticos</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Académico</h3>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">2 DISPONIBLES</span>
                        </div>
                        <div className="grid gap-4">
                            <AddButton
                                onClick={() => addWidget('rendimiento')}
                                title="Promedio General"
                                desc="Score académico global"
                                icon={<TrendingUp size={20} />}
                                color="bg-emerald-50 text-emerald-600"
                            />
                            <AddButton
                                onClick={() => addWidget('asistencia')}
                                title="Tasa Asistencia"
                                desc="Logs de acceso biométrico"
                                icon={<Users size={20} />}
                                color="bg-orange-50 text-orange-600"
                            />
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Administración</h3>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">2 DISPONIBLES</span>
                        </div>
                        <div className="grid gap-4">
                            <AddButton
                                onClick={() => addWidget('matriculas')}
                                title="Análisis Matrículas"
                                desc="Proyección de inscripciones"
                                icon={<BarChart3 size={20} />}
                                color="bg-blue-50 text-blue-600"
                            />
                            <AddButton
                                onClick={() => addWidget('genero')}
                                title="Diversidad"
                                desc="KPI de inclusión social"
                                icon={<PieChart size={20} />}
                                color="bg-purple-50 text-purple-600"
                            />
                        </div>
                    </section>

                    <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold text-sm mb-2">Tip de Usuario</h4>
                            <p className="text-xs text-indigo-100 leading-relaxed">Puedes arrastrar los componentes del grid para reorganizar tu flujo de trabajo diario.</p>
                        </div>
                        <div className="absolute bottom-[-20px] right-[-20px] opacity-10">
                            <Settings size={80} />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50">
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">U-Dash v2.4.0 Experimental</p>
                </div>
            </aside>

            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed bottom-10 right-10 w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl hover:scale-110 hover:rotate-90 transition-all z-50 flex items-center justify-center border-4 border-white"
                >
                    <Plus size={32} />
                </button>
            )}
        </div>
    );
}

function AddButton({ title, desc, icon, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-md transition-all text-left w-full group"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm">{title}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">{desc}</p>
            </div>
        </button>
    );
}
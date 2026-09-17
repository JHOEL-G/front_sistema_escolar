import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    ChevronDown,
    PlayCircle,
    CheckCircle2,
    Clock,
    Trophy,
    BookOpen,
    Layout,
    ChevronLeft,
    ArrowRight,
    FileText,
    Video,
    File
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import keycloak from '../../../../auth/services/keycloakConfig';
import { Loader2 } from 'lucide-react';

const CursoIniciado = () => {
    const [activeTab, setActiveTab] = useState('General');
    const [expandedModule, setExpandedModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const [curso, setCurso] = useState(null);
    const [inscripcion, setInscripcion] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const location = useLocation();
    const modoAdmin = location.state?.modoAdmin ?? false;

    const PantallaInicioCurso = () => {
        navigate(`/inicio_curso/${id}`);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const resCurso = await serviceApiNet.Cursos.getById(id);
                if (resCurso.data?.success) {
                    setCurso(resCurso.data.data);
                } else {
                    setError('No se pudo cargar el curso');
                    return;
                }

                try {
                    const keycloakId = keycloak.subject;
                    if (keycloakId) {
                        const resInscripciones = await serviceApiNet.Inscripcion.getById(keycloakId);
                        if (resInscripciones?.success) {
                            const found = resInscripciones.data?.find(
                                i => i.cursoId === Number(id)
                            );
                            setInscripcion(found || null);
                        }
                    }
                } catch (errInscripcion) {
                    console.warn('No se pudieron cargar inscripciones:', errInscripcion);
                }

            } catch (err) {
                console.error('Error al cargar curso:', err);
                setError('Error al cargar el curso');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchData();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);

    }, [id]);

    const getRecursoIcon = (recursoId) => {
        const icons = {
            1: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            2: { icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50' },
            3: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
            4: { icon: Video, color: 'text-red-600', bg: 'bg-red-50' },
            5: { icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            6: { icon: PlayCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
            7: { icon: Layout, color: 'text-pink-600', bg: 'bg-pink-50' },
            8: { icon: File, color: 'text-orange-600', bg: 'bg-orange-50' },
            9: { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
            10: { icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            11: { icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
        };
        return icons[recursoId] || { icon: File, color: 'text-slate-600', bg: 'bg-slate-50' };
    };

    if (loading) return (
        <div className="flex inset-0 h-screen flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-700">
            <div className="relative flex items-center justify-center mb-9">
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-500/10 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full border-t-4 border-b-4 border-indigo-600 animate-[spin_2s_linear_infinite]" />
                <div className="relative p-4 bg-white rounded-full shadow-xl">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Curso</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Sincronizando con el servidor...</p>
            </div>
        </div>
    );
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    const palabras = curso?.nombreCurso?.split(' ') ?? [];
    const progreso = Math.round(inscripcion?.progreso ?? 0);

    const circumference = 364.4;
    const offset = circumference - (progreso / 100) * circumference;

    const caracteristicas = curso?.caracteristicasQueAprendere?.split(',').map(c => c.trim()) || [];

    const calificacion = inscripcion?.calificacionFinal ?? 0;
    const esCompletado = inscripcion?.esCompletado ?? false;
    const fechaFinalizacion = inscripcion?.fechaFinalizacion
        ? new Date(inscripcion.fechaFinalizacion).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric'
        })
        : null;
    const fechaInscripcion = inscripcion?.fechaInscripcion
        ? new Date(inscripcion.fechaInscripcion).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric'
        })
        : null;

    return (
        <div className="min-h-screen text-slate-900 pb-20">
            <main className="max-w-full mx-auto px-4 md:px-6 py-6">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-6">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/10 to-transparent"></div>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 p-6 md:p-8 flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wide mb-3">
                                {curso?.nombreDificultad || 'Curso Recomendado'}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                                {palabras.slice(0, 4).join(' ')}{' '}
                                <span className="text-violet-400">{palabras.slice(4).join(' ')}</span>
                            </h1>
                            <p className="text-slate-400 text-sm mb-5 leading-relaxed max-w-2xl">
                                {curso?.descripcionCurso}
                            </p>
                            {modoAdmin ? (
                                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-fit">
                                    <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-amber-300 text-sm font-bold">
                                        Estás en modo vista previa. El seguimiento del progreso está deshabilitado.
                                    </p>
                                </div>
                            ) : inscripcion ? (
                                <button
                                    className="group flex items-center gap-3 bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                                    onClick={PantallaInicioCurso}
                                >
                                    Comenzar ahora
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : !loading && (
                                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-500/10 border border-slate-500/30 max-w-fit">
                                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <p className="text-slate-400 text-sm font-bold">
                                        No estás inscrito en este curso.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:flex items-center justify-center w-50 h-50 relative">
                            <div className="absolute inset-0 animate-pulse bg-violet-500/10 rounded-full blur-2xl"></div>
                            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                                <path d="M40,100 Q100,20 160,100 T100,180 Z" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                                <circle cx="100" cy="100" r="30" fill="#8b5cf6" className="animate-bounce" />
                                <path d="M60,80 Q100,40 140,80" fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                    <div className="lg:col-span-8">
                        <div className="mb-6">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-violet-700 uppercase mb-4 tracking-wider">
                                <CheckCircle2 size={16} /> Requisitos de aprobación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                                        <Trophy size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Progreso Mínimo</p>
                                        <p className="text-xs text-slate-500">100% de lecciones vistas</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Habilidades
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {curso?.caracteristicasHabilidades ? (
                                                curso.caracteristicasHabilidades.split(',').map((habilidad, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-semibold uppercase shadow-sm"
                                                    >
                                                        {habilidad.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-semibold uppercase">
                                                    Evaluación Final
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-10 border-b border-slate-200 text-sm font-bold">
                            {['General', 'Tareas', 'Calificaciones', 'Recursos'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 transition-all relative ${activeTab === tab ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-t-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col md:flex-row lg:flex-col gap-5">
                        <div className="bg-[#1e293b] text-white p-10 rounded-3xl flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
                            <span className="text-[10px] font-bold uppercase mb-4 text-slate-400 tracking-widest">Progreso General</span>

                            <button
                                onClick={async () => {
                                    setRefreshing(true);
                                    const keycloakId = keycloak.subject;
                                    if (keycloakId) {
                                        const res = await serviceApiNet.Inscripcion.getById(keycloakId);
                                        if (res?.success) {
                                            const found = res.data?.find(i => i.cursoId === Number(id));
                                            setInscripcion(found || null);
                                        }
                                    }
                                    setRefreshing(false);
                                }}
                                className="text-[10px] text-slate-500 hover:text-violet-400 transition-colors mb-2 flex items-center gap-1"
                            >
                                <svg className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Actualizar
                            </button>

                            <div className="relative mb-4">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="#334155" strokeWidth="8" fill="transparent" />
                                    <circle cx="64" cy="64" r="58"
                                        stroke={esCompletado ? "#10b981" : "#8b5cf6"}
                                        strokeWidth="8" fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black">{progreso}%</span>
                                </div>
                            </div>

                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase mb-4 ${esCompletado ? 'bg-emerald-500/20 text-emerald-400' :
                                progreso > 0 ? 'bg-violet-500/20 text-violet-300' :
                                    'bg-slate-800 text-slate-300'
                                }`}>
                                {esCompletado ? '✓ Completado' : progreso > 0 ? 'En curso' : 'Sin iniciar'}
                            </span>

                            <div className="w-full border-t border-slate-700 pt-4 mt-2 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Calificación</span>
                                    <span className={`text-sm font-black ${calificacion >= 6 ? 'text-emerald-400' : calificacion > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                                        {esCompletado && calificacion === 0 ? '0.0' : calificacion > 0 ? calificacion.toFixed(1) : '—'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Inscrito</span>
                                    <span className="text-[11px] text-slate-400 font-medium">{fechaInscripcion || '—'}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Finalización</span>
                                    <span className={`text-[11px] font-medium ${fechaFinalizacion ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {fechaFinalizacion || 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3">Contenido del curso</h2>
                            <div className="flex flex-wrap gap-2">
                                {caracteristicas.map((carac, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors"
                                    >
                                        #{carac}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {curso?.modulos?.map((modulo, idx) => {
                            const recursosDelModulo = curso.recursos?.filter(r => r.moduloId === modulo.moduloId) || [];
                            return (
                                <div
                                    key={idx}
                                    className={`border rounded-3xl transition-all duration-300 overflow-hidden ${expandedModule === idx
                                        ? 'bg-white border-violet-100 shadow-xl shadow-slate-200/50'
                                        : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div
                                        className="p-6 cursor-pointer flex items-center justify-between"
                                        onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${expandedModule === idx
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <Layout size={24} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold transition-colors ${expandedModule === idx
                                                    ? 'text-slate-900'
                                                    : 'text-slate-600'
                                                    }`}>
                                                    {modulo.moduloTitulo}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-violet-500 uppercase">
                                                        Módulo {modulo.orden + 1}
                                                    </span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {recursosDelModulo.length} recursos
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-full transition-transform duration-300 ${expandedModule === idx
                                            ? 'rotate-180 bg-violet-50 text-violet-600'
                                            : 'bg-slate-50 text-slate-400'
                                            }`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>

                                    <div className={`transition-all duration-300 ease-in-out ${expandedModule === idx
                                        ? 'max-h-[600px] opacity-100'
                                        : 'max-h-0 opacity-0 overflow-hidden'
                                        }`}>
                                        <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                                            <p className="text-sm text-slate-600 p-4 mb-4 bg-slate-50 rounded-2xl">
                                                {modulo.descripcion}
                                            </p>

                                            {recursosDelModulo.length > 0 ? (
                                                <div className="space-y-2">
                                                    {recursosDelModulo.map((recurso, rIdx) => {
                                                        const iconConfig = getRecursoIcon(recurso.recursoId);
                                                        const IconComponent = iconConfig.icon;

                                                        return (
                                                            <div
                                                                key={rIdx}
                                                                className="group flex items-center justify-between p-4 rounded-2xl hover:bg-violet-50 transition-all cursor-pointer border border-transparent hover:border-violet-100"
                                                            >
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className={`w-10 h-10 rounded-xl ${iconConfig.bg} ${iconConfig.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                                        <IconComponent size={20} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-slate-700 group-hover:text-violet-700 transition-colors truncate">
                                                                            {recurso.titulo}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                                            {recurso.nombreTipo}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-bold text-slate-300 group-hover:text-violet-400 transition-colors">
                                                                        #{recurso.ordenRecurso}
                                                                    </span>
                                                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-slate-400">
                                                    <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm font-medium">No hay recursos disponibles</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CursoIniciado;
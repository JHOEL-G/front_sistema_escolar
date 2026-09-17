import React, { useState, useEffect, useRef } from "react";
import {
    ChevronDown, ChevronRight, ChevronLeft,
    ShieldCheck, Percent, Check, Scale
} from "lucide-react";
import Stepper from "./Stepper";
import { RETROALIMENTACIONES } from "./select_formulario/ComboBox";
import { MessageSquare } from "lucide-react";
import { Cog } from "lucide-react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurso } from "../useCurso";

const WeightingScreen = () => {
    const { courseData, updateCourseData, isEditing, id } = useCurso();
    const navigate = useNavigate();
    const [avance, setAvance] = useState(courseData?.RequisitoAvance || 80);
    const [retro, setRetro] = useState(courseData?.TipoRetroalimentacion || "Mostrar siempre");
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [isMainOpen, setIsMainOpen] = useState(false);
    const [openModules, setOpenModules] = useState({});
    const [notaAprobacion, setNotaAprobacion] = useState(courseData?.Calificacion || 70);
    const modulosInicializados = useRef(false);
    const [modoAutomatico, setModoAutomatico] = useState(() => {
        const tienePonderaciones = courseData?.Modulos?.some(m =>
            m.sesiones?.some(s => (s.ponderacion ?? 0) > 0)
        );
        return !tienePonderaciones;
    });

    const modoAutomaticoAplicado = useRef(
        courseData?.Modulos?.some(m =>
            m.sesiones?.some(s => (s.ponderacion ?? 0) > 0)
        ) ?? false
    );

    useEffect(() => {
        if (courseData?.Modulos?.length > 0) {
            const tienePonderaciones = courseData.Modulos.some(m =>
                m.sesiones?.some(s => (s.ponderacion ?? 0) > 0)
            );
            if (tienePonderaciones) {
                setModoAutomatico(false);
                modoAutomaticoAplicado.current = true;
            }
        }
    }, [courseData?.Modulos]);

    const toggleModule = (id) => {
        setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const [modulos, setModulos] = useState(() =>
        courseData?.Modulos?.map(m => ({
            ...m,
            sesiones: m.sesiones?.map(s => ({
                ...s,
                id: s.id || crypto.randomUUID(),  // ← asegurar ID único
                configuracion: s.configuracion ? { ...s.configuracion } : {},
                ponderacion: s.ponderacion || 0
            })) || []
        })) || []
    );

    useEffect(() => {
        if (modulos.length === 0 && courseData?.Modulos?.length > 0) {
            setModulos(courseData.Modulos.map(m => ({
                ...m,
                sesiones: m.sesiones?.map(s => ({
                    ...s,
                    id: s.id || crypto.randomUUID(),  // ← también aquí
                    configuracion: s.configuracion ? { ...s.configuracion } : {},
                    ponderacion: s.ponderacion || 0
                })) || []
            })));
        }
    }, [courseData?.Modulos]);

    const selectRef = useRef(null);

    const totalPuntos = modulos.reduce((acc, mod) => {
        const sumaSesiones = mod.sesiones
            .filter(s => s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion)
            .reduce((sum, s) => sum + (Number(s.ponderacion) || 0), 0);
        return acc + sumaSesiones;
    }, 0);

    useEffect(() => {
        if (courseData?.RequisitoAvance) setAvance(courseData.RequisitoAvance);
        if (courseData?.TipoRetroalimentacion) setRetro(courseData.TipoRetroalimentacion);
        if (courseData?.Calificacion) setNotaAprobacion(courseData.Calificacion);
    }, [courseData?.RequisitoAvance, courseData?.TipoRetroalimentacion, courseData?.Calificacion]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsSelectOpen(false);
            }
        };
        if (isSelectOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSelectOpen]);

    useEffect(() => {
        if (!modoAutomatico) {
            modoAutomaticoAplicado.current = false; // reset al desactivar
            return;
        }
        if (modulos.length === 0) return;
        if (modoAutomaticoAplicado.current) return; // ← ya se aplicó, no repetir

        modoAutomaticoAplicado.current = true;

        const totalPonderables = modulos.reduce((acc, m) => {
            return acc + m.sesiones.filter(s =>
                s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion
            ).length;
        }, 0);

        if (totalPonderables === 0) return;

        const valorPorCada = Math.floor(100 / totalPonderables);
        const sobrante = 100 - (valorPorCada * totalPonderables);
        let contadorGlobal = 0;

        setModulos(prev => prev.map(m => ({
            ...m,
            sesiones: m.sesiones.map(s => {
                const esPonderable = s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion;
                if (!esPonderable) return s;
                const valor = contadorGlobal === 0 ? valorPorCada + sobrante : valorPorCada;
                contadorGlobal++;
                return { ...s, ponderacion: valor };
            })
        })));
    }, [modoAutomatico, modulos.length]);

    const handleSesionWeightingChange = (moduloId, sesionId, value) => {
        if (value !== "" && !/^\d+$/.test(value)) return;
        const valorFinal = value === "" ? "" : Math.min(100, Number(value));

        setModulos(prev => prev.map(m => {
            if (m.id !== moduloId) return m;  // ← retorna el mismo objeto si no es el módulo
            return {
                ...m,
                sesiones: m.sesiones.map(s => {
                    if (s.id !== sesionId) return s;  // ← retorna la misma sesión si no es la correcta
                    return { ...s, ponderacion: valorFinal };
                })
            };
        }));
    };

    const handleNext = () => {
        updateCourseData({
            RequisitoAvance: Number(avance),
            TipoRetroalimentacion: retro,
            Calificacion: Number(notaAprobacion) || null,
            Modulos: modulos.map(m => ({
                ...m,
                sesiones: m.sesiones.map(s => ({
                    ...s,
                    ponderacion: Number(s.ponderacion) || 0
                }))
            }))
        });
        navigate(isEditing ? `/curso/editar/${id}/configuration` : '/curso/crear/configuration');
    };

    if (!courseData) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-full bg-[#F8FAFC]">
            <main className="max-w-8xl mx-auto py-10 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Configuración</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ponderación</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Ponderación y <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Evaluación</span>
                        </h2>
                    </div>
                </div>

                <div className="px-2">
                    <Stepper currentStep={4} type="completo" />
                </div>

                <div className="grid gap-8 mx-2">

                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 p-8 lg:p-12">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                    <ShieldCheck className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Criterios de Finalización</h3>
                                    <p className="text-sm text-slate-500 font-medium">Configura el progreso, feedback y aprobación.</p>
                                </div>
                            </div>

                            {modulos.some(m => m.sesiones.some(s => s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion)) && (
                                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Evaluación Activa</span>
                                </div>
                            )}
                        </div>

                        <div className={`grid gap-8 items-start ${modulos.some(m => m.sesiones.some(s => s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion))
                            ? "lg:grid-cols-3 md:grid-cols-2"
                            : "md:grid-cols-2"
                            }`}>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    Requisito de Avance
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={avance}
                                        onChange={(e) => setAvance(Math.min(100, Math.max(0, e.target.value)))}
                                        className="w-full bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200 focus:border-indigo-500 focus:bg-white transition-all text-xl font-black text-slate-800 outline-none h-[80px]"
                                    />
                                    <Percent className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-tight">
                                    Contenido visto necesario.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Retroalimentación
                                </label>
                                <div className="relative" ref={selectRef}>
                                    <button
                                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                                        className="w-full flex items-center justify-between px-6 rounded-[2rem] border border-slate-200 bg-slate-50/50 hover:bg-white transition-all h-[80px] group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{RETROALIMENTACIONES.find(o => o.nombre === retro)?.icon}</span>
                                            <div className="font-bold text-slate-800 text-sm">{retro}</div>
                                        </div>
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </button>
                                    {isSelectOpen && (
                                        <div className="absolute top-full w-full mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden py-2">
                                            {RETROALIMENTACIONES.map(op => (
                                                <button
                                                    key={op.id}
                                                    onClick={() => { setRetro(op.nombre); setIsSelectOpen(false); }}
                                                    className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center gap-3"
                                                >
                                                    <span>{op.icon}</span>
                                                    <span className="font-bold text-xs text-slate-700">{op.nombre}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-tight">Visibilidad de resultados.</p>
                            </div>

                            {modulos.some(m => m.sesiones.some(s => s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion)) && (
                                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                    <label className="block text-sm font-bold text-indigo-500 uppercase tracking-widest">
                                        Nota de Aprobación
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-indigo-500/5 rounded-[2rem] blur-xl group-hover:bg-indigo-500/10 transition-all" />
                                        <div className="relative h-[80px] flex items-center">
                                            <input
                                                type="text"
                                                value={notaAprobacion === null || notaAprobacion === undefined ? "" : notaAprobacion}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "" || raw === null) {
                                                        setNotaAprobacion("");
                                                        return;
                                                    }
                                                    const val = Math.min(100, Math.max(0, Number(raw) || 0));
                                                    setNotaAprobacion(val);
                                                }}
                                                className="w-full bg-indigo-50/50 p-6 rounded-[2rem] border-2 border-indigo-100 focus:border-indigo-500 focus:bg-white transition-all text-xl font-black text-indigo-600 outline-none h-full pr-16"
                                            />
                                            <div className="absolute right-6 flex flex-col items-center">
                                                <Star size={20} className="text-indigo-400 fill-indigo-400" />
                                                <span className="text-[8px] font-black text-indigo-400 uppercase">Min</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-indigo-400 font-bold px-2 uppercase tracking-tight">
                                        Calificación mínima para aprobar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div
                            className="flex items-center justify-between p-8 cursor-pointer hover:bg-slate-50/50 transition-colors"
                            onClick={() => setIsMainOpen(!isMainOpen)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <Cog size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                    Configura la ponderación del curso
                                </h3>
                            </div>
                            <ChevronDown
                                className={`text-slate-400 transition-transform duration-300 ${isMainOpen ? 'rotate-180' : ''}`}
                            />
                        </div>

                        {isMainOpen && (
                            <div className="p-8 pt-0 space-y-6">
                                <div className="h-[1px] bg-slate-100 w-full mb-6" />

                                {modulos.some(m => m.sesiones.some(s => s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion)) ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-end gap-3 mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {modoAutomatico ? "Automático" : "Manual"}
                                            </span>
                                            <button
                                                onClick={() => setModoAutomatico(prev => !prev)}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${modoAutomatico ? "bg-indigo-600" : "bg-slate-200"
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${modoAutomatico ? "translate-x-7" : "translate-x-1"
                                                    }`} />
                                            </button>
                                        </div>
                                        {modulos.map((modulo, idx) => {
                                            const sesionesPonderables = modulo.sesiones.filter(s =>
                                                s.incluirEnPonderacion || !!s.configuracion?.AgregarPonderacion
                                            );

                                            if (sesionesPonderables.length === 0) return null;
                                            const isOpen = openModules[modulo.id] !== false;

                                            return (
                                                <div key={modulo.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                                                    <div
                                                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/30"
                                                        onClick={() => toggleModule(modulo.id)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                                                {String(idx + 1).padStart(2, '0')}
                                                            </div>
                                                            <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest">
                                                                {modulo.tituloModulo}
                                                            </h4>
                                                        </div>
                                                        <ChevronDown
                                                            size={18}
                                                            className={`text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>

                                                    {isOpen && (
                                                        <div className="p-6 pt-0 space-y-3">
                                                            {sesionesPonderables.map((sesion) => (
                                                                <div key={sesion.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 border border-slate-100">
                                                                            <MessageSquare size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-slate-700">{sesion.tituloSesion}</p>
                                                                            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Elemento Evaluativo</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex flex-col items-center min-w-[70px]">
                                                                        <span className="text-[8px] font-black text-indigo-400 uppercase leading-none mb-0.5">Valor</span>
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="text"
                                                                                value={sesion.ponderacion}
                                                                                onChange={(e) => !modoAutomatico && handleSesionWeightingChange(modulo.id, sesion.id, e.target.value)}
                                                                                readOnly={modoAutomatico}
                                                                                className={`w-6 bg-transparent text-center font-black text-slate-800 outline-none text-xs ${modoAutomatico ? 'cursor-not-allowed opacity-60' : ''
                                                                                    }`}
                                                                            />
                                                                            <span className="text-slate-400 text-[10px] font-bold">%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <div className={`relative overflow-hidden flex items-center justify-between px-6 py-4 rounded-3xl border-2 transition-all ${totalPuntos === 100
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : totalPuntos > 100
                                                ? 'bg-rose-50 border-rose-200'
                                                : 'bg-indigo-50 border-indigo-200'
                                            }`}>
                                            <div
                                                className={`absolute left-0 top-0 h-full transition-all duration-500 opacity-10 ${totalPuntos === 100 ? 'bg-emerald-500'
                                                    : totalPuntos > 100 ? 'bg-rose-500'
                                                        : 'bg-indigo-500'
                                                    }`}
                                                style={{ width: `${Math.min(totalPuntos, 100)}%` }}
                                            />

                                            <div className="relative flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${totalPuntos === 100 ? 'bg-emerald-100'
                                                    : totalPuntos > 100 ? 'bg-rose-100'
                                                        : 'bg-indigo-100'
                                                    }`}>
                                                    <Scale size={16} className={
                                                        totalPuntos === 100 ? 'text-emerald-600'
                                                            : totalPuntos > 100 ? 'text-rose-600'
                                                                : 'text-indigo-600'
                                                    } />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Ponderación</p>
                                                    <p className="text-xs font-black text-slate-600">
                                                        {totalPuntos === 100 ? 'Distribución completa'
                                                            : totalPuntos > 100 ? 'Excede el límite permitido'
                                                                : `Faltan ${100 - totalPuntos}% por asignar`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative flex items-center gap-2">
                                                <span className={`text-2xl font-black ${totalPuntos === 100 ? 'text-emerald-600'
                                                    : totalPuntos > 100 ? 'text-rose-600'
                                                        : 'text-indigo-600'
                                                    }`}>
                                                    {totalPuntos}%
                                                </span>
                                                {totalPuntos === 100 && (
                                                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                                                        <Check size={14} className="text-white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-32 h-32 bg-indigo-50 rounded-3xl rotate-6 flex items-center justify-center mb-6 relative">
                                            <div className="w-16 h-20 bg-indigo-500 rounded-lg -rotate-12 flex flex-col p-2 gap-2 shadow-xl shadow-indigo-200">
                                                <div className="w-full h-1.5 bg-indigo-300 rounded-full" />
                                                <div className="w-full h-1.5 bg-indigo-300 rounded-full" />
                                                <div className="w-2/3 h-1.5 bg-indigo-300 rounded-full" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800">No hay lecciones ponderables</h3>
                                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tight">Activa la ponderación en los módulos para verlos aquí</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={() => navigate(isEditing ? `/curso/editar/${id}/course-content` : '/curso/crear/course-content')}
                        className="text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft size={18} /> Atrás
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={totalPuntos > 100}
                        className={`
        group flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
        ${totalPuntos > 100
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5'
                            }
    `}
                    >
                        Finalizar Configuración
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default WeightingScreen;
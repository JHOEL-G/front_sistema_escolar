import React, { useState } from "react";
import { Trash2, GripVertical, Video, ChevronRight, Plus, X, MessageSquare, FileCheck, PenTool, BookOpen, Monitor, Sparkles } from "lucide-react";
import Stepper from "./Stepper";
import SelectorRecursos from "../recursos_curso/SelectorRecursos ";
import { Calendar } from "lucide-react";
import { Code } from "lucide-react";
import { Dices } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCurso } from "../useCurso";

const CourseContentScreen = () => {
    const { courseData, updateCourseData, isEditing, id } = useCurso();
    const navigate = useNavigate();
    const [mostrarSelectorRecursos, setMostrarSelectorRecursos] = useState(false);
    const [moduloActualId, setModuloActualId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [moduloDragId, setModuloDragId] = useState(null);
    const [sesionEditando, setSesionEditando] = useState(null);

    const [modulos, setModulos] = useState(() => {
        if (courseData?.Modulos?.length > 0) {
            return courseData.Modulos.map(m => ({
                ...m,
                id: m.id || crypto.randomUUID(),
                tituloModulo: m.tituloModulo || m.moduloTitulo || '',
                descripcionModulo: m.descripcionModulo || m.descripcion || '',
                sesiones: (m.sesiones || []).map(s => ({
                    ...s,
                    id: s.id || crypto.randomUUID(),
                }))
            }));
        }
        return [];
    });
    const handleDragStart = (e, moduloId, sesionId) => {
        e.dataTransfer.setData('sesionId', sesionId);
        e.dataTransfer.setData('moduloId', moduloId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, moduloId, targetSesionId) => {
        e.preventDefault();
        const sourceSesionId = e.dataTransfer.getData('sesionId');
        const sourceModuloId = e.dataTransfer.getData('moduloId');

        if (sourceSesionId === targetSesionId) return;
        if (sourceModuloId !== moduloId) return;

        setModulos(prev => prev.map(m => {
            if (m.id !== moduloId) return m;
            const sesiones = [...m.sesiones];
            const fromIdx = sesiones.findIndex(s => s.id === sourceSesionId);
            const toIdx = sesiones.findIndex(s => s.id === targetSesionId);
            const [moved] = sesiones.splice(fromIdx, 1);
            sesiones.splice(toIdx, 0, moved);
            return { ...m, sesiones };
        }));
    };

    useEffect(() => {
        if (modulos.length === 0 && courseData?.Modulos?.length > 0) {
            setModulos(courseData.Modulos.map(m => ({
                ...m,
                id: m.id || crypto.randomUUID(),
                tituloModulo: m.tituloModulo || m.moduloTitulo || '',
                descripcionModulo: m.descripcionModulo || m.descripcion || '',
                sesiones: (m.sesiones || []).map(s => ({
                    ...s,
                    id: s.id || crypto.randomUUID(),
                }))
            })));
        }
    }, [courseData?.Modulos]);

    const mostrarBienvenida = modulos.length === 0;

    const agregarModulo = () => {
        setModulos([...modulos, {
            id: crypto.randomUUID(),
            tituloModulo: "",
            descripcionModulo: "",
            sesiones: []
        }]);
    };

    const eliminarModulo = (id) => {
        setModulos(modulos.filter(m => m.id !== id));
    };

    const actualizarModulo = (id, campo, valor) => {
        setModulos(prev => {
            const updated = prev.map(m => m.id === id ? { ...m, [campo]: valor } : m);
            return updated;
        });
    };

    const eliminarSesion = (moduloId, sesionId) => {
        setModulos(modulos.map(m => {
            if (m.id === moduloId) {
                return { ...m, sesiones: m.sesiones.filter(s => s.id !== sesionId) };
            }
            return m;
        }));
    };

    const abrirEditorSesion = (moduloId, sesion, e) => {
        e.stopPropagation();
        setSesionEditando({ moduloId, sesionId: sesion.id, datos: sesion });
        setModuloActualId(moduloId);
        setMostrarSelectorRecursos(true);
    };

    const handleNext = () => {
        if (modulos.length === 0) return alert("Debes agregar al menos un módulo.");

        const modulosSinTitulo = modulos.filter(m => {
            const titulo = m.moduloTitulo || m.tituloModulo || "";
            return titulo.trim() === "";
        });
        if (modulosSinTitulo.length > 0) {
            alert("Por favor, asigna un título a todos los módulos.");
            return;
        }

        const modulosAGuardar = modulos.map(m => ({
            moduloIdReal: m.moduloIdReal ?? null,
            tituloModulo: m.tituloModulo || m.moduloTitulo || '',
            descripcionModulo: m.descripcionModulo || m.descripcion || '',
            sesiones: m.sesiones.map(s => ({
                id: s.id,
                tipoId: s.tipoId,
                tituloSesion: s.tituloSesion,
                configuracion: s.configuracion,
                duracion: s.duracion,
                moduloRecursoId: s.moduloRecursoId ?? 0,
                archivoReal: s.archivoReal,
                archivosImagenes: s.archivosImagenes || [],
                archivosReales: s.archivosReales || [],
                incluirEnPonderacion: s.incluirEnPonderacion ?? false,
                ponderacion: s.ponderacion ?? 0
            }))
        }));

        updateCourseData({ Modulos: modulosAGuardar });
        navigate(isEditing ? `/curso/editar/${id}/weighting` : '/curso/crear/weighting');
    };

    const abrirSelectorRecursos = (moduloId) => {
        setSesionEditando(null);
        setModuloActualId(moduloId);
        setMostrarSelectorRecursos(true);
    };

    const handleRecursoCreado = (recursoData) => {
        if (sesionEditando) {
            setModulos(prev => prev.map(m => {
                if (m.id === sesionEditando.moduloId) {
                    return {
                        ...m,
                        sesiones: m.sesiones.map(s =>
                            s.id === sesionEditando.sesionId
                                ? {
                                    ...s,
                                    tituloSesion: recursoData.titulo || s.tituloSesion,
                                    tipoId: recursoData.tipoId,
                                    configuracion: recursoData.configuracion,
                                    duracion: recursoData.duracion || s.duracion,
                                    incluirEnPonderacion: recursoData.incluirEnPonderacion,
                                    archivoReal: recursoData.archivoReal !== undefined ? recursoData.archivoReal : s.archivoReal,
                                    archivosImagenes: recursoData.archivosImagenes || s.archivosImagenes || [],
                                    archivosReales: recursoData.archivosReales || []
                                }
                                : s
                        )
                    };
                }
                return m;
            }));
        } else {
            setModulos(prev => prev.map(m => {
                if (m.id === moduloActualId) {
                    return {
                        ...m,
                        sesiones: [...m.sesiones, {
                            id: crypto.randomUUID(),
                            tituloSesion: recursoData.titulo || "Nueva Sesión",
                            tipoId: recursoData.tipoId,
                            configuracion: recursoData.configuracion,
                            duracion: recursoData.duracion || "00:00",
                            incluirEnPonderacion: recursoData.incluirEnPonderacion,
                            archivoReal: recursoData.archivoReal || null,
                            archivosImagenes: recursoData.archivosImagenes || [],
                            archivosReales: recursoData.archivosReales || []
                        }]
                    };
                }
                return m;
            }));
        }

        setMostrarSelectorRecursos(false);
        setModuloActualId(null);
        setSesionEditando(null);
    };

    const handleCerrarSelector = () => {
        setMostrarSelectorRecursos(false);
        setSesionEditando(null);
        setModuloActualId(null);
    };

    const handleDragStartModulo = (e, moduloId) => {
        e.dataTransfer.setData('moduloArrastradoId', moduloId);
    };

    const handleDropModulo = (e, targetModuloId) => {
        e.preventDefault();
        const sourceModuloId = e.dataTransfer.getData('moduloArrastradoId');
        if (!sourceModuloId || sourceModuloId === targetModuloId) return;

        setModulos(prev => {
            const updated = [...prev];
            const fromIdx = updated.findIndex(m => m.id === sourceModuloId);
            const toIdx = updated.findIndex(m => m.id === targetModuloId);
            const [moved] = updated.splice(fromIdx, 1);
            updated.splice(toIdx, 0, moved);
            return updated;
        });
    };

    const getIconoRecurso = (tipoId) => {
        switch (tipoId) {
            case 1: return <FileCheck size={20} />;
            case 2: return <MessageSquare size={20} />;
            case 3: return <PenTool size={20} />;
            case 4: return <Video size={20} />;
            case 5: return <BookOpen size={20} />;
            case 6: return <Monitor size={20} />;
            case 7: return <Dices size={20} />;
            case 8: return <Code size={20} />;
            case 9: return <ClipboardList size={20} />;
            case 10: return <MapPin size={20} />;
            case 11: return <Calendar size={20} />;
            case 12: return <Video size={20} />;
            default: return <Sparkles size={20} />;
        }
    };

    if (!courseData) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-full bg-[#F8FAFC]">
            <main className="max-w-8xl mx-auto py-10 px-6 space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Paso 3</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contenido Curricular</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        Curricular <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Builder</span>
                    </h2>
                </div>

                <SelectorRecursos
                    isOpen={mostrarSelectorRecursos}
                    onClose={handleCerrarSelector}
                    onRecursoCreado={handleRecursoCreado}
                    initialData={sesionEditando?.datos ?? null}
                    modoEdicion={!!sesionEditando}
                    tipoIdForzado={sesionEditando?.datos?.tipoId ?? null}
                />

                <Stepper currentStep={3} type="completo" />

                {mostrarBienvenida ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <div className="mb-8">
                            <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto drop-shadow-xl">
                                <path d="M40 140C40 140 30 140 30 130V30C30 20 40 20 40 20H140C140 20 150 20 150 30V130C150 140 140 140 140 140H40Z" fill="#A5B4FC" fillOpacity="0.3" />
                                <path d="M50 40H130M50 60H130M50 80H100" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
                                <rect x="80" y="50" width="80" height="90" rx="12" fill="#818CF8" />
                                <circle cx="110" cy="85" r="4" fill="white" />
                                <circle cx="130" cy="85" r="4" fill="white" />
                                <path d="M115 105C115 105 120 110 125 105" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">¡Bienvenido a tu panel de control de cursos!</h3>
                        <p className="text-slate-500 max-w-lg mb-10 leading-relaxed">
                            Estás a solo unos clics de crear tu propio contenido educativo. Comienza agregando una lección a tu curso. ¡Comencemos a construir tu curso hoy!
                        </p>
                        <button
                            onClick={() => agregarModulo()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={20} /> Agregar módulo
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10 pb-32 animate-in slide-in-from-bottom-4 duration-500">
                        {modulos.map((modulo, index) => (
                            <div
                                key={modulo.id}
                                draggable={moduloDragId === modulo.id}
                                onDragStart={(e) => handleDragStartModulo(e, modulo.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnd={() => setModuloDragId(null)}
                                onDrop={(e) => handleDropModulo(e, modulo.id)}
                                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
                            >
                                <div className="p-8 lg:p-10">
                                    <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-50">

                                        <div
                                            className="mt-3 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
                                            onMouseDown={() => setModuloDragId(modulo.id)}
                                            onMouseUp={() => setModuloDragId(null)}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <GripVertical size={20} />
                                        </div>

                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={modulo.tituloModulo}
                                                onChange={(e) => actualizarModulo(modulo.id, "tituloModulo", e.target.value)}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                placeholder="Título del Módulo"
                                                className="w-full text-2xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                                            />
                                            <textarea
                                                value={modulo.descripcionModulo}
                                                onChange={(e) => actualizarModulo(modulo.id, "descripcionModulo", e.target.value)}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                placeholder="¿Qué aprenderán?"
                                                className="w-full text-sm text-slate-500 outline-none bg-slate-50/50 p-3 rounded-xl resize-none"
                                                rows={2}
                                            />
                                        </div>
                                        <button onClick={() => eliminarModulo(modulo.id)} onMouseDown={(e) => e.stopPropagation()} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {modulo.sesiones.map((sesion) => (
                                            <div
                                                key={sesion.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.stopPropagation();
                                                    handleDragStart(e, modulo.id, sesion.id);
                                                }}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => {
                                                    e.stopPropagation();
                                                    handleDrop(e, modulo.id, sesion.id);
                                                }}
                                                onClick={(e) => abrirEditorSesion(modulo.id, sesion, e)}
                                                className="group flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-3xl transition-all cursor-pointer"
                                            >
                                                <div
                                                    className="p-1 cursor-grab text-slate-300 active:cursor-grabbing"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <GripVertical size={20} />
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {getIconoRecurso(sesion.tipoId)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-700 text-sm">{sesion.tituloSesion}</h4>
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                                        Recurso • {sesion.duracion}
                                                    </p>
                                                </div>
                                                <span className="hidden group-hover:flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mr-1 transition-all">
                                                    <PenTool size={11} /> Editar
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); eliminarSesion(modulo.id, sesion.id); }}
                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => abrirSelectorRecursos(modulo.id)}
                                            className="w-full py-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-bold text-xs uppercase hover:bg-indigo-50/50 hover:border-indigo-200 transition-all"
                                        >
                                            + Añadir actividad o contenido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                    <span className={`
        mb-3 mr-2 text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.3em] transition-opacity duration-300 items-center justify-center text-center
        ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-bounce'}
    `}>
                        Acciones
                    </span>
                    <div
                        className={`
            relative flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 right-3
            transition-all duration-500 ease-[cubic-bezier(0.2,1,0.2,1)]
            ${isOpen
                                ? 'w-[440px] bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-2'
                                : 'w-14 h-14 bg-indigo-600 rounded-full cursor-pointer hover:scale-110 active:scale-95 shadow-indigo-500/40'}
        `}
                        onClick={() => !isOpen && setIsOpen(true)}
                    >
                        <div className={`
            absolute inset-0 flex items-center justify-center text-white transition-all duration-300
            ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
        `}>
                            <Plus size={28} strokeWidth={2.5} />
                        </div>
                        <div className={`
            flex items-center justify-between w-full transition-all duration-300
            ${isOpen
                                ? 'opacity-100 translate-x-0 delay-200'
                                : 'opacity-0 translate-x-4 pointer-events-none delay-0'
                            }
        `}>
                            <div className="flex items-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); agregarModulo(); }}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 text-white rounded-xl transition-all group"
                                >
                                    <Plus size={18} className="text-indigo-400 group-hover:rotate-90 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Nuevo</span>
                                </button>
                                <div className="w-[1px] h-6 bg-white/10 mx-1" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(isEditing ? `/curso/editar/${id}/landing-page` : '/curso/crear/landing-page'); }}
                                    className="px-4 py-3 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Atrás
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group"
                                >
                                    Continuar
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default CourseContentScreen;
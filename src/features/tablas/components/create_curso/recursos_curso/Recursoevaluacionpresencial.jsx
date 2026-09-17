import React, { useState, useRef, useEffect } from "react";
import { X, Calendar, BarChart3, MessageSquare, Pencil, Check, Sparkles, Plus, Trash2, ClipboardList, ChevronDown } from "lucide-react";

const RecursoEvaluacionPresencial = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};

    const normalizarRubricas = (rubricas) => {
        if (!rubricas || !Array.isArray(rubricas)) return [];
        return rubricas.map(r => ({
            id: crypto.randomUUID(),
            nombre: r.rubricaNombre || r.Nombre || r.nombre || "",
            descripcion: r.rubricaDescripcion || r.Descripcion || r.descripcion || "",
            criterios: (r.Criterios || r.criterios || []).map(c => ({
                id: crypto.randomUUID(),
                titulo: c.TituloCriterio || c.titulo || "",
                descripcion: c.criterioDescripcion || c.Descripcion || c.descripcion || "",
                calificaciones: (c.Calificaciones || c.calificaciones || []).map(cal => ({
                    id: crypto.randomUUID(),
                    nombre: cal.calificacionNombre || cal.Nombre || cal.nombre || "",
                    valor: cal.Puntos || cal.puntos || 0
                }))
            }))
        }));
    };

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        tipoCalificacion: recursoData?.tipoCalificacion || cfg.TipoCalificacionId || 1,
        agregarPonderacion: recursoData?.agregarPonderacion ?? (cfg.AgregarPonderacion === 1 || cfg.AgregarPonderacion === true) ?? false,
        permitirSolicitudRevision: recursoData?.permitirSolicitudRevision
            ?? (cfg.colaboradorSolicitarRevision === true || cfg.ColaboradorSolicitarRevision === true)
            ?? false,
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || cfg.Instrucciones || "",
        rubricas: normalizarRubricas(recursoData?.rubricas || cfg.Rubricas || cfg.rubricas)
    });

    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const [mostrarCrearRubrica, setMostrarCrearRubrica] = useState(false);
    const [rubricaActual, setRubricaActual] = useState({
        nombre: "", descripcion: "",
        criterios: [{
            id: crypto.randomUUID(), titulo: "", descripcion: "",
            calificaciones: [{ id: crypto.randomUUID(), nombre: "", valor: 0 }]
        }]
    });
    const tituloInputRef = useRef(null);

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) { tituloInputRef.current.focus(); tituloInputRef.current.select(); }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleAgregarCriterio = () => setRubricaActual(prev => ({
        ...prev,
        criterios: [...prev.criterios, {
            id: crypto.randomUUID(), titulo: "", descripcion: "",
            calificaciones: [{ id: crypto.randomUUID(), nombre: "", valor: 0 }]
        }]
    }));

    const handleEliminarCriterio = (id) => setRubricaActual(prev => ({
        ...prev, criterios: prev.criterios.filter(c => c.id !== id)
    }));

    const handleCriterioChange = (id, field, value) => setRubricaActual(prev => ({
        ...prev, criterios: prev.criterios.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));

    const handleAgregarCalificacion = (criterioId) => setRubricaActual(prev => ({
        ...prev,
        criterios: prev.criterios.map(c => c.id === criterioId
            ? { ...c, calificaciones: [...c.calificaciones, { id: crypto.randomUUID(), nombre: "", valor: 0 }] }
            : c)
    }));

    const handleEliminarCalificacion = (criterioId, calId) => setRubricaActual(prev => ({
        ...prev,
        criterios: prev.criterios.map(c => c.id === criterioId
            ? { ...c, calificaciones: c.calificaciones.filter(cal => cal.id !== calId) }
            : c)
    }));

    const handleCalificacionChange = (criterioId, calId, field, value) => setRubricaActual(prev => ({
        ...prev,
        criterios: prev.criterios.map(c => c.id === criterioId
            ? { ...c, calificaciones: c.calificaciones.map(cal => cal.id === calId ? { ...cal, [field]: value } : cal) }
            : c)
    }));


    const handleGuardarRubrica = () => {
        if (!rubricaActual.nombre.trim()) { alert("El nombre de la rúbrica es obligatorio"); return; }
        setFormData(prev => ({ ...prev, rubricas: [...prev.rubricas, { ...rubricaActual, id: crypto.randomUUID() }] }));
        setMostrarCrearRubrica(false);
        setRubricaActual({
            nombre: "", descripcion: "",
            criterios: [{
                id: crypto.randomUUID(), titulo: "", descripcion: "",
                calificaciones: [{ id: crypto.randomUUID(), nombre: "", valor: 0 }]
            }]
        });
    };

    const handleEliminarRubrica = (id) => setFormData(prev => ({ ...prev, rubricas: prev.rubricas.filter(r => r.id !== id) }));

    const handleGuardar = () => {
        if (!formData.tituloSesion.trim()) { alert("El título es obligatorio"); return; }
        const rubricas = [];
        const criterios = [];
        const calificaciones = [];

        formData.rubricas.forEach((r, rubricaIdx) => {
            rubricas.push({ Nombre: r.nombre, Descripcion: r.descripcion || null });

            (r.criterios || []).forEach((c, criterioIdx) => {
                criterios.push({
                    RubricaOrden: rubricaIdx,
                    TituloCriterio: c.titulo,
                    Descripcion: c.descripcion || null,
                    OrdenCriterio: criterioIdx
                });

                (c.calificaciones || []).forEach((cal, calIdx) => {
                    calificaciones.push({
                        RubricaOrden: rubricaIdx,
                        CriterioOrden: criterioIdx,
                        Nombre: cal.nombre,
                        Puntos: Number(cal.valor) || 0,
                        OrdenCalificacion: calIdx
                    });
                });
            });
        });

        onSave({
            titulo: formData.tituloSesion,
            tipoId: 11,
            configuracion: {
                Descripcion: formData.descripcionSesion || null,
                AgregarPonderacion: formData.agregarPonderacion,
                ColaboradorSolicitarRevision: formData.permitirSolicitudRevision,
                TipoCalificacionId: Number(formData.tipoCalificacion) || 1,
                Rubricas: rubricas,
                Criterios: criterios,
                Calificaciones: calificaciones
            }
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-400 shadow-lg shadow-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            {editandoTitulo ? (
                                <div className="flex items-center gap-2">
                                    <input ref={tituloInputRef} type="text" value={formData.tituloSesion}
                                        onChange={(e) => handleInputChange("tituloSesion", e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditandoTitulo(false); }}
                                        onBlur={() => setEditandoTitulo(false)} placeholder="Nombre de la evaluación presencial..."
                                        className="text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-400 outline-none placeholder:text-slate-300 w-full min-w-[280px]" />
                                    <button onMouseDown={(e) => { e.preventDefault(); setEditandoTitulo(false); }} className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all flex-shrink-0"><Check size={16} strokeWidth={2.5} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/titulo">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {formData.tituloSesion ? <span className="text-indigo-600">{formData.tituloSesion}</span> : <><span className="text-slate-300">Configuracio Ev. </span><span className="text-orange-400">Presencial</span></>}
                                    </h2>
                                    <button onClick={() => setEditandoTitulo(true)} className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0"><Pencil size={14} strokeWidth={2.5} /></button>
                                </div>
                            )}
                            <p className="text-slate-500 font-medium text-sm mt-0.5">Configura todos los detalles del recurso</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0"><X size={20} /></button>
                </div>
            </div>

            <div className="px-10 py-8 space-y-10">
                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Información básica</h3>
                        <p className="text-xs text-slate-400">Datos generales de la evaluación presencial</p>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Descripción</label>
                        <textarea value={formData.descripcionSesion} onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                            placeholder="Describe brevemente el propósito de esta evaluación..."
                            className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300" rows={3} />
                    </div>
                </section>

                <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Tipo de Calificación</label>
                    <div className="relative">
                        <select value={formData.tipoCalificacion} onChange={(e) => handleInputChange("tipoCalificacion", parseInt(e.target.value))}
                            className="w-full appearance-none px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium cursor-pointer pr-10">
                            <option value={1}>⚡ Automático (Sistema)</option>
                            <option value={2}>✍️ Manual (Profesor)</option>
                            <option value={3}>📋 Manual con Rúbrica</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Configuración</h3>
                        <p className="text-xs text-slate-400">Parámetros de comportamiento de la evaluación</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button type="button" onClick={() => handleInputChange("agregarPonderacion", !formData.agregarPonderacion)}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left ${formData.agregarPonderacion ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${formData.agregarPonderacion ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                <BarChart3 size={20} className={formData.agregarPonderacion ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.agregarPonderacion ? 'text-indigo-700' : 'text-slate-800'}`}>Agregar a ponderación</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Incluir en la nota final</p>
                            </div>
                            {formData.agregarPonderacion && <div className="absolute top-4 right-4"><div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center"><Sparkles size={12} className="text-indigo-400" /></div></div>}
                        </button>

                        <button type="button" onClick={() => handleInputChange("permitirSolicitudRevision", !formData.permitirSolicitudRevision)}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left ${formData.permitirSolicitudRevision ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${formData.permitirSolicitudRevision ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                <MessageSquare size={20} className={formData.permitirSolicitudRevision ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.permitirSolicitudRevision ? 'text-indigo-700' : 'text-slate-800'}`}>Solicitud de revisión</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">El alumno puede solicitar revisión</p>
                            </div>
                            {formData.permitirSolicitudRevision && <div className="absolute top-4 right-4"><div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center"><Sparkles size={12} className="text-indigo-400" /></div></div>}
                        </button>
                    </div>
                </section>

                <section>
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                Rúbricas {formData.rubricas.length > 0 && <span className="ml-2 normal-case font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">{formData.rubricas.length}</span>}
                            </h3>
                            <p className="text-xs text-slate-400">Criterios de calificación manual</p>
                        </div>
                        {!mostrarCrearRubrica && (
                            <button onClick={() => setMostrarCrearRubrica(true)} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-2xl hover:bg-indigo-50 transition-all">
                                <Plus size={14} strokeWidth={2.5} /> Crear rúbrica
                            </button>
                        )}
                    </div>

                    {formData.rubricas.length > 0 && !mostrarCrearRubrica && (
                        <div className="space-y-3 mb-5">
                            {formData.rubricas.map((rubrica) => (
                                <div key={rubrica.id} className="group flex items-center justify-between p-5 border-2 border-slate-100 hover:border-indigo-200 bg-white rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0"><ClipboardList size={18} className="text-indigo-400" strokeWidth={2.5} /></div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{rubrica.nombre}</p>
                                            {rubrica.descripcion && <p className="text-xs text-slate-400 mt-0.5">{rubrica.descripcion}</p>}
                                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                                                {rubrica.criterios?.length || 0} criterio{(rubrica.criterios?.length || 0) !== 1 ? 's' : ''} · {rubrica.criterios?.reduce((sum, c) => sum + (c.calificaciones?.length || 0), 0) || 0} nivel{(rubrica.criterios?.reduce((sum, c) => sum + (c.calificaciones?.length || 0), 0) || 0) !== 1 ? 'es' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleEliminarRubrica(rubrica.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {mostrarCrearRubrica && (
                        <div className="border-2 border-indigo-100 bg-indigo-50/30 rounded-[1.5rem] p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Nueva rúbrica</span>
                                <button onClick={() => setMostrarCrearRubrica(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X size={15} /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" value={rubricaActual.nombre} onChange={(e) => setRubricaActual(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre de la rúbrica..." className="w-full px-4 py-3 border-2 border-slate-100 bg-white rounded-2xl focus:border-indigo-300 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300" />
                                <textarea value={rubricaActual.descripcion} onChange={(e) => setRubricaActual(prev => ({ ...prev, descripcion: e.target.value }))} placeholder="Descripción opcional..." className="w-full px-4 py-3 border-2 border-slate-100 bg-white rounded-2xl focus:border-indigo-300 outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300" rows={2} />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Criterios de evaluación</p>
                                    <button onClick={handleAgregarCriterio} className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all">
                                        <Plus size={12} /> Agregar
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {rubricaActual.criterios.map((criterio, index) => (
                                        <div key={criterio.id} className="bg-white border-2 border-slate-100 rounded-2xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Criterio {index + 1}</span>
                                                {rubricaActual.criterios.length > 1 &&
                                                    <button onClick={() => handleEliminarCriterio(criterio.id)}
                                                        className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                        <Trash2 size={13} />
                                                    </button>}
                                            </div>
                                            <input type="text" value={criterio.titulo}
                                                onChange={(e) => handleCriterioChange(criterio.id, "titulo", e.target.value)}
                                                placeholder="Título del criterio..."
                                                className="w-full px-3 py-2 border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-indigo-300 focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all" />
                                            <textarea value={criterio.descripcion}
                                                onChange={(e) => handleCriterioChange(criterio.id, "descripcion", e.target.value)}
                                                placeholder="Descripción del criterio..."
                                                className="w-full px-3 py-2 border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-indigo-300 focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 resize-none transition-all" rows={2} />

                                            <div className="pt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Niveles</p>
                                                    <button onClick={() => handleAgregarCalificacion(criterio.id)}
                                                        className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">
                                                        <Plus size={11} /> Agregar
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(criterio.calificaciones || []).map((cal) => (
                                                        <div key={cal.id} className="flex items-center gap-2">
                                                            <input type="text" value={cal.nombre}
                                                                onChange={(e) => handleCalificacionChange(criterio.id, cal.id, "nombre", e.target.value)}
                                                                placeholder="Ej: Excelente..."
                                                                className="flex-1 px-3 py-2 border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-indigo-300 focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all" />
                                                            <input type="number" value={cal.valor}
                                                                onChange={(e) => handleCalificacionChange(criterio.id, cal.id, "valor", parseInt(e.target.value) || 0)}
                                                                placeholder="0"
                                                                className="w-16 px-2 py-2 border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-indigo-300 focus:bg-white outline-none text-sm font-black text-slate-800 text-center transition-all" />
                                                            {(criterio.calificaciones || []).length > 1 &&
                                                                <button onClick={() => handleEliminarCalificacion(criterio.id, cal.id)}
                                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                                    <Trash2 size={13} />
                                                                </button>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2 border-t border-indigo-100">
                                <button onClick={() => setMostrarCrearRubrica(false)} className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">Cancelar</button>
                                <button onClick={handleGuardarRubrica} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)]"><Sparkles size={13} /> Guardar rúbrica</button>
                            </div>
                        </div>
                    )}

                    {formData.rubricas.length === 0 && !mostrarCrearRubrica && (
                        <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-10 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><ClipboardList size={22} className="text-slate-300" strokeWidth={2} /></div>
                            <p className="text-sm font-bold text-slate-400">Sin rúbricas aún</p>
                            <p className="text-xs text-slate-300 mt-1">Crea una rúbrica para calificar con criterios definidos</p>
                        </div>
                    )}
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                    <Sparkles size={14} /> Guardar evaluación presencial
                </button>
            </div>
        </div>
    );
};

export default RecursoEvaluacionPresencial;
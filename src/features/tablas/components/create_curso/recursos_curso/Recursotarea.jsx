import React, { useState, useRef, useEffect } from "react";
import { X, PenTool, BarChart3, Globe, Lock, Pencil, Check, Sparkles, ChevronDown, Upload, Paperclip } from "lucide-react";
import { getFileConfig } from "./diseño_evaluacion/items/Item";

export const RecursoTarea = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};
    const archivosExistentes = cfg.Archivos || cfg.archivos ||
        cfg.tareaArchivos || cfg.TareaArchivos ||
        (cfg.ArchivoPath || cfg.archivoPath
            ? [{ ArchivoPath: cfg.ArchivoPath || cfg.archivoPath, NombreArchivo: "Archivo existente", Orden: 1 }]
            : []);

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || cfg.descripcion || "",
        instrucciones: recursoData?.instrucciones || cfg.Instrucciones || cfg.instrucciones || "",
        tipoCalificacion: recursoData?.tipoCalificacion || cfg.TipoCalificacionId || cfg.tipoCalificacionId || 1,
        agregarPonderacion: recursoData?.agregarPonderacion ?? cfg.AgregarPonderacion ?? cfg.agregarPonderacion ?? false,
        privacidad: recursoData?.privacidad || cfg.Privacidad || cfg.privacidad || "Privado"
    });
    const [errores, setErrores] = useState({});
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const tituloInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const [archivosNuevos, setArchivosNuevos] = useState([]);
    const [archivosExistentesActivos, setArchivosExistentesActivos] = useState(archivosExistentes);

    const totalArchivos = archivosNuevos.length + archivosExistentesActivos.length;

    const handleArchivoChange = (e) => {
        const files = Array.from(e.target.files || []);
        const disponibles = 6 - totalArchivos;
        if (disponibles <= 0) return;
        setArchivosNuevos(prev => [...prev, ...files.slice(0, disponibles)]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEliminarNuevo = (index) => setArchivosNuevos(prev => prev.filter((_, i) => i !== index));
    const handleEliminarExistente = (index) => setArchivosExistentesActivos(prev => prev.filter((_, i) => i !== index));

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleGuardar = () => {
        const nuevosErrores = {};
        if (!formData.tituloSesion.trim()) nuevosErrores.tituloSesion = "El título es obligatorio";
        if (!formData.instrucciones.trim()) nuevosErrores.instrucciones = "Las instrucciones son obligatorias";
        if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
        setErrores({});

        const archivosConfig = [
            ...archivosExistentesActivos.map((a, i) => ({
                ArchivoPath: a.ArchivoPath,
                NombreArchivo: a.NombreArchivo || "Archivo existente",
                TipoArchivo: a.TipoArchivo || null,
                Orden: i + 1
            })),
            ...archivosNuevos.map((f, i) => ({
                ArchivoPath: null,
                NombreArchivo: f.name,
                TipoArchivo: f.name.split('.').pop(),
                Orden: archivosExistentesActivos.length + i + 1
            }))
        ];

        onSave({
            titulo: formData.tituloSesion,
            tipoId: 3,
            archivosReales: archivosNuevos.length > 0 ? archivosNuevos : null,
            configuracion: {
                Instrucciones: formData.instrucciones,
                TipoCalificacionId: formData.tipoCalificacion,
                AgregarPonderacion: !!formData.agregarPonderacion,
                Privacidad: formData.privacidad,
                Descripcion: formData.descripcionSesion || null,
                Archivos: archivosConfig.length > 0 ? archivosConfig : null
            }
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-400 shadow-lg shadow-emerald-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <PenTool className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            {editandoTitulo ? (
                                <div className="flex items-center gap-2">
                                    <input ref={tituloInputRef} type="text" value={formData.tituloSesion}
                                        onChange={(e) => { handleInputChange("tituloSesion", e.target.value); setErrores(p => ({ ...p, tituloSesion: '' })); }}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditandoTitulo(false); }}
                                        onBlur={() => setEditandoTitulo(false)}
                                        placeholder="Nombre de la tarea..."
                                        className={`text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 outline-none placeholder:text-slate-300 w-full min-w-[280px] ${errores.tituloSesion ? 'border-rose-400' : 'border-indigo-400'}`}
                                    />
                                    <button onMouseDown={(e) => { e.preventDefault(); setEditandoTitulo(false); }} className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all flex-shrink-0">
                                        <Check size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 group/titulo">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                            {formData.tituloSesion
                                                ? <span className="text-indigo-600">{formData.tituloSesion}</span>
                                                : <><span className="text-slate-300">Configuracion </span><span className="text-emerald-400">Tarea</span></>}
                                        </h2>
                                        <button onClick={() => setEditandoTitulo(true)} className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0">
                                            <Pencil size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    {errores.tituloSesion && (
                                        <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                                            <span>⚠</span> {errores.tituloSesion} — haz clic en el lápiz para editar
                                        </p>
                                    )}
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
                        <p className="text-xs text-slate-400">Datos generales de la tarea</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                                Descripción <span className="ml-1.5 text-slate-300 font-medium normal-case tracking-normal text-[11px]">(opcional)</span>
                            </label>
                            <textarea value={formData.descripcionSesion} onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                                placeholder="Describe brevemente el propósito de esta tarea..."
                                className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                                rows={3} />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                                Instrucciones <span className="text-rose-400">*</span>
                            </label>
                            <div className="border-2 border-slate-100 bg-slate-50 rounded-t-2xl px-4 py-2 flex items-center gap-1">
                                {[{ label: "B", style: "font-black" }, { label: "I", style: "italic" }, { label: "U", style: "underline" }].map(({ label, style }) => (
                                    <button key={label} className={`w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all ${style}`}>{label}</button>
                                ))}
                            </div>
                            <textarea value={formData.instrucciones}
                                onChange={(e) => { handleInputChange("instrucciones", e.target.value); setErrores(p => ({ ...p, instrucciones: '' })); }}
                                placeholder="Escribe las instrucciones para los estudiantes..."
                                className={`w-full px-4 py-3 border-2 border-t-0 rounded-b-2xl focus:border-indigo-300 outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300 ${errores.instrucciones ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-white'}`}
                                rows={5} />
                            {errores.instrucciones && <p className="text-xs text-rose-500 font-medium mt-1.5">{errores.instrucciones}</p>}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                            Archivos adjuntos{' '}
                            <span className="text-slate-300 font-medium normal-case tracking-normal text-[11px]">(opcional, máx. 6)</span>
                        </label>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalArchivos >= 6 ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                            {totalArchivos}/6
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {archivosExistentesActivos.map((a, i) => {
                            const cfg2 = getFileConfig(a.NombreArchivo);
                            return (
                                <div key={`ex-${i}`} className="relative group rounded-2xl border-2 border-slate-100 overflow-hidden">
                                    <div className={`${cfg2.bg} h-20 flex flex-col items-center justify-center gap-1`}>
                                        <span className="text-2xl">{cfg2.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{cfg2.label}</span>
                                    </div>
                                    <div className="px-2 py-1.5 bg-white">
                                        <p className="text-[11px] font-bold text-slate-700 truncate" title={a.NombreArchivo}>
                                            {a.NombreArchivo || 'Archivo'}
                                        </p>
                                        {a.ArchivoPath?.startsWith('http') ? (
                                            <a href={a.ArchivoPath} target="_blank" rel="noreferrer"
                                                className="text-[10px] text-emerald-500 underline">Ver archivo</a>
                                        ) : (
                                            <p className="text-[10px] text-slate-400">guardado</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleEliminarExistente(i)}
                                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            );
                        })}

                        {archivosNuevos.map((f, i) => {
                            const cfg2 = getFileConfig(f.name);
                            const previewUrl = f.type?.startsWith('image/') ? URL.createObjectURL(f) : null;
                            return (
                                <div key={`new-${i}`} className="relative group rounded-2xl border-2 border-dashed border-indigo-200 overflow-hidden">
                                    <div className={`${previewUrl ? '' : cfg2.bg} h-20 flex flex-col items-center justify-center gap-1 relative`}>
                                        {previewUrl
                                            ? <img src={previewUrl} alt={f.name} className="w-full h-full object-cover" />
                                            : <>
                                                <span className="text-2xl">{cfg2.icon}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{cfg2.label}</span>
                                            </>
                                        }
                                        <span className="absolute top-1.5 left-1.5 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">nuevo</span>
                                    </div>
                                    <div className="px-2 py-1.5 bg-white">
                                        <p className="text-[11px] font-bold text-slate-700 truncate" title={f.name}>{f.name}</p>
                                        <p className="text-[10px] text-slate-400">
                                            {f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleEliminarNuevo(i)}
                                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            );
                        })}

                        {totalArchivos < 6 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 h-[108px] flex flex-col items-center justify-center gap-1.5 transition-all group"
                            >
                                <div className="w-8 h-8 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-all">
                                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-all">Agregar</span>
                            </button>
                        )}
                    </div>

                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleArchivoChange} />
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
                        <p className="text-xs text-slate-400">Parámetros de comportamiento de la tarea</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button type="button" onClick={() => handleInputChange("agregarPonderacion", !formData.agregarPonderacion)}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left ${formData.agregarPonderacion ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'border-slate-100 bg-white hover:border-indigo-200 hover:-translate-y-0.5'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${formData.agregarPonderacion ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                <BarChart3 size={20} className={formData.agregarPonderacion ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.agregarPonderacion ? 'text-indigo-700' : 'text-slate-800'}`}>Agregar a ponderación</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Incluir en la nota final</p>
                            </div>
                            {formData.agregarPonderacion && <div className="absolute top-4 right-4"><div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center"><Sparkles size={12} className="text-indigo-400" /></div></div>}
                        </button>

                        <button type="button" onClick={() => handleInputChange("privacidad", formData.privacidad === "Público" ? "Privado" : "Público")}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left ${formData.privacidad === "Privado" ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'border-slate-100 bg-white hover:border-indigo-200 hover:-translate-y-0.5'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${formData.privacidad === "Privado" ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                {formData.privacidad === "Privado" ? <Lock size={20} className="text-white" strokeWidth={2.5} /> : <Globe size={20} className="text-slate-400" strokeWidth={2.5} />}
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.privacidad === "Privado" ? 'text-indigo-700' : 'text-slate-800'}`}>{formData.privacidad === "Privado" ? "Tarea Privada" : "Tarea Pública"}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">{formData.privacidad === "Privado" ? "Solo estudiantes inscritos" : "Visible para todos"}</p>
                            </div>
                            {formData.privacidad === "Privado" && <div className="absolute top-4 right-4"><div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center"><Sparkles size={12} className="text-indigo-400" /></div></div>}
                        </button>
                    </div>
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                    <Sparkles size={14} /> Guardar tarea
                </button>
            </div>
        </div>
    );
};

export default RecursoTarea;
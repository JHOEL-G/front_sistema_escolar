import React, { useState, useRef, useEffect } from "react";
import { X, Code, BarChart3, Monitor, Pencil, Check, Sparkles, Upload, FileArchive } from "lucide-react";
import { ChevronDown } from "lucide-react";

const RecursoSCORM = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};
    const nombreArchivoGuardado = cfg.NombreArchivo || cfg.ArchivoPath || null;
    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || cfg.descripcion || "",
        archivoSCORM: recursoData?.archivoReal || null,
        tipoCalificacion: cfg.TipoCalificacionId || recursoData?.tipoCalificacion || 1,
        agregarPonderacion: cfg.AgregarPonderacion ?? recursoData?.agregarPonderacion ?? false,
        permitirPantallaCompleta: cfg.PermitirModoPantallaCompleta ?? recursoData?.permitirPantallaCompleta ?? true
    });
    const [errores, setErrores] = useState({});
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const [dragging, setDragging] = useState(false);
    const tituloInputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const processFile = (file) => {
        if (!file) return;
        if (!file.name.endsWith('.zip')) {
            alert('Solo se permiten archivos .zip');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            alert('El archivo excede el tamaño máximo de 100mb');
            return;
        }
        setFormData(prev => ({ ...prev, archivoSCORM: file }));
        setErrores(p => ({ ...p, archivoSCORM: '' }));
    };

    const handleArchivoChange = (e) => processFile(e.target.files?.[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        processFile(e.dataTransfer.files?.[0]);
    };

    const handleGuardar = () => {
        const nuevosErrores = {};
        if (!formData.tituloSesion.trim()) nuevosErrores.tituloSesion = "El título es obligatorio";
        if (!formData.archivoSCORM && !nombreArchivoGuardado) nuevosErrores.archivoSCORM = "Debes seleccionar un archivo SCORM (.zip)";

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        setErrores({});

        onSave({
            titulo: formData.tituloSesion,
            descripcion: formData.descripcionSesion,
            tipoId: 8,
            configuracion: {
                NombreArchivo: formData.archivoSCORM?.name || cfg.NombreArchivo,
                ArchivoPath: formData.archivoSCORM ? formData.archivoSCORM.name : cfg.ArchivoPath,
                TamañoMB: formData.archivoSCORM
                    ? parseFloat((formData.archivoSCORM.size / (1024 * 1024)).toFixed(2))
                    : cfg.TamañoMB || 0,
                TipoCalificacionId: Number(formData.tipoCalificacion) || 1,
                AgregarPonderacion: !!formData.agregarPonderacion,
                PermitirModoPantallaCompleta: !!formData.permitirPantallaCompleta,
                Descripcion: formData.descripcionSesion || null,
            },
            duracion: "00:00",
            archivoReal: formData.archivoSCORM || null,
        });
    };
    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">

            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-400 shadow-lg shadow-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Code className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>

                        <div>
                            {editandoTitulo ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={tituloInputRef}
                                        type="text"
                                        value={formData.tituloSesion}
                                        onChange={(e) => { handleInputChange("tituloSesion", e.target.value); setErrores(p => ({ ...p, tituloSesion: '' })); }}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditandoTitulo(false); }}
                                        onBlur={() => setEditandoTitulo(false)}
                                        placeholder="Nombre del recurso SCORM..."
                                        className={`text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 outline-none placeholder:text-slate-300 w-full min-w-[280px]
                ${errores.tituloSesion ? 'border-rose-400' : 'border-indigo-400'}`}
                                    />
                                    <button onMouseDown={(e) => { e.preventDefault(); setEditandoTitulo(false); }}
                                        className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all flex-shrink-0">
                                        <Check size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 group/titulo">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                            {formData.tituloSesion
                                                ? <span className="text-indigo-600">{formData.tituloSesion}</span>
                                                : <><span className="text-slate-300">Configuracion </span><span className="text-purple-400">SCORM</span></>
                                            }
                                        </h2>
                                        <button onClick={() => setEditandoTitulo(true)}
                                            className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0"
                                            title="Editar título">
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

                    <button
                        onClick={onCancel}
                        className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="px-10 py-8 space-y-10">

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Información básica</h3>
                        <p className="text-xs text-slate-400">Datos generales del recurso SCORM</p>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                            Descripción
                            <span className="ml-1.5 text-slate-300 font-medium normal-case tracking-normal text-[11px]">(opcional)</span>
                        </label>
                        <textarea
                            value={formData.descripcionSesion}
                            onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                            placeholder="Describe brevemente el contenido de este recurso..."
                            className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            rows={3}
                        />
                    </div>
                </section>

                <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Tipo de Calificación</label>
                    <div className="relative">
                        <select
                            value={formData.tipoCalificacion}
                            onChange={(e) => handleInputChange("tipoCalificacion", parseInt(e.target.value))}
                            className="w-full appearance-none px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium cursor-pointer pr-10"
                        >
                            <option value={1}>⚡ Automático (Sistema)</option>
                            <option value={2}>✍️ Manual (Profesor)</option>
                            <option value={3}>📋 Manual con Rúbrica</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                            Archivo SCORM {!nombreArchivoGuardado && <span className="text-rose-400">*</span>}
                        </h3>
                        <p className="text-xs text-slate-400">Sube tu paquete en formato .zip · máx. 100 MB</p>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300
    ${dragging
                                ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                                : formData.archivoSCORM
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : errores.archivoSCORM
                                        ? 'border-rose-300 bg-rose-50'
                                        : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                            ${formData.archivoSCORM
                                ? 'bg-emerald-400 shadow-emerald-200'
                                : dragging
                                    ? 'bg-indigo-400 shadow-indigo-200'
                                    : 'bg-slate-200 shadow-slate-100'
                            }`}>
                            {formData.archivoSCORM
                                ? <FileArchive className="w-6 h-6 text-white" strokeWidth={2.5} />
                                : <Upload className={`w-6 h-6 ${dragging ? 'text-white' : 'text-slate-400'}`} strokeWidth={2.5} />
                            }
                        </div>

                        {formData.archivoSCORM ? (
                            <div className="text-center">
                                <p className="font-black text-sm text-emerald-700">{formData.archivoSCORM.name}</p>
                                <p className="text-xs text-emerald-500 font-medium mt-1">
                                    {(formData.archivoSCORM.size / (1024 * 1024)).toFixed(2)} MB · listo para subir
                                </p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, archivoSCORM: null })); }}
                                    className="mt-3 text-[11px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                                >
                                    Cambiar archivo
                                </button>
                            </div>
                        ) : nombreArchivoGuardado ? (
                            <div className="text-center">
                                <p className="font-black text-sm text-emerald-700">
                                    {cfg.NombreArchivo || 'Archivo guardado'}
                                </p>
                                <p className="text-xs text-emerald-500 font-medium mt-1">
                                    {cfg.TamañoMB ? `${cfg.TamañoMB} MB` : ''} · archivo guardado
                                </p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="mt-3 text-[11px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors"
                                >
                                    Cambiar archivo
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-500">
                                    Arrastra tu archivo o{" "}
                                    <span className="text-indigo-500">haz clic para buscar</span>
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-1">Solo archivos .zip · máx. 100 MB</p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".zip"
                            onChange={handleArchivoChange}
                            className="hidden"
                        />
                    </div>
                    {errores.archivoSCORM && (
                        <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1">
                            <span>⚠</span> {errores.archivoSCORM}
                        </p>
                    )}
                </section>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Configuración</h3>
                        <p className="text-xs text-slate-400">Parámetros de comportamiento del recurso</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleInputChange("agregarPonderacion", !formData.agregarPonderacion)}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left
                                ${formData.agregarPonderacion
                                    ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'
                                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300
                                ${formData.agregarPonderacion ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                <BarChart3 size={20} className={formData.agregarPonderacion ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.agregarPonderacion ? 'text-indigo-700' : 'text-slate-800'}`}>
                                    Agregar a ponderación
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Incluir en la nota final</p>
                            </div>
                            {formData.agregarPonderacion && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Sparkles size={12} className="text-indigo-400" />
                                    </div>
                                </div>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleInputChange("permitirPantallaCompleta", !formData.permitirPantallaCompleta)}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left
                                ${formData.permitirPantallaCompleta
                                    ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'
                                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300
                                ${formData.permitirPantallaCompleta ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                <Monitor size={20} className={formData.permitirPantallaCompleta ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.permitirPantallaCompleta ? 'text-indigo-700' : 'text-slate-800'}`}>
                                    Pantalla completa
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Permitir modo inmersivo</p>
                            </div>
                            {formData.permitirPantallaCompleta && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Sparkles size={12} className="text-indigo-400" />
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleGuardar}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
                >
                    <Sparkles size={14} />
                    Guardar SCORM
                </button>
            </div>

        </div>
    );
};

export default RecursoSCORM;
import React, { useState, useRef, useEffect } from "react";
import { X, BookOpen, Eye, Pencil, Check, Sparkles, Upload, FileText, Plus, Trash2, ChevronDown } from "lucide-react";

const RecursoLectura = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};
    const adjuntosGuardados = cfg.ArchivosAdjuntos || cfg.archivosAdjuntos || [];
    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || cfg.descripcion || "",
        tipoLectura: recursoData?.tipoLectura || (
            (cfg.TipoLecturaId || cfg.tipoLecturaId) === 2 ? "Subir PDF" : "Crear Manualmente"
        ),
        contenido: recursoData?.contenido || cfg.ContenidoHTML || cfg.contenidoHTML || "",
        archivoPDF: null,
        hacerVisibleDashboard: recursoData?.hacerVisibleDashboard ?? cfg.HacerVisibleDashboard ?? cfg.hacerVisibleDashboard ?? false,
        recursosAdjuntos: [],
        adjuntosGuardados: adjuntosGuardados
    });

    const nombrePDFGuardado = cfg.ArchivoPDFPath || cfg.archivoPDFPath || null;
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const [draggingPDF, setDraggingPDF] = useState(false);
    const [mostrarModalRecurso, setMostrarModalRecurso] = useState(false);
    const tituloInputRef = useRef(null);
    const pdfInputRef = useRef(null);
    const adjuntoInputRef = useRef(null);

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const processPDF = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') { alert('Solo se permiten archivos PDF'); return; }
        if (file.size > 50 * 1024 * 1024) { alert('El archivo excede el tamaño máximo de 50mb'); return; }
        setFormData(prev => ({ ...prev, archivoPDF: file }));
    };

    const handleArchivoPDFChange = (e) => processPDF(e.target.files?.[0]);

    const handleDropPDF = (e) => {
        e.preventDefault();
        setDraggingPDF(false);
        processPDF(e.dataTransfer.files?.[0]);
    };

    const handleRecursoAdjuntoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { alert('El archivo excede el tamaño máximo de 50mb'); return; }
            setFormData(prev => ({ ...prev, recursosAdjuntos: [...prev.recursosAdjuntos, file] }));
            setMostrarModalRecurso(false);
        }
    };

    const handleGuardar = () => {
        if (!formData.tituloSesion.trim()) { alert("El título es obligatorio"); return; }

        const adjuntosDelBackend = formData.adjuntosGuardados.map(a => ({
            NombreArchivo: a.NombreArchivo || a.nombreArchivo,
            RutaArchivo: a.RutaArchivo || a.rutaArchivo,
            TipoArchivo: a.TipoArchivo || a.tipoArchivo || '',
            TamañoMB: a.TamañoMB || a.tamañoMB || 0
        }));

        const adjuntosNuevos = formData.recursosAdjuntos.map(f => ({
            NombreArchivo: f.name,
            RutaArchivo: f.name,
            TipoArchivo: f.type || '',
            TamañoMB: parseFloat((f.size / (1024 * 1024)).toFixed(2))
        }));

        const todosLosAdjuntos = [...adjuntosDelBackend, ...adjuntosNuevos];

        const dataParaBackend = {
            titulo: formData.tituloSesion,
            descripcion: formData.descripcionSesion,
            tipoId: 5,
            configuracion: {
                TipoLecturaId: formData.tipoLectura === "Crear Manualmente" ? 1 : 2,
                Descripcion: formData.descripcionSesion || null,
                ContenidoHTML: formData.tipoLectura === "Crear Manualmente" ? formData.contenido : null,
                ArchivoPDFPath: formData.tipoLectura === "Subir PDF"
                    ? (formData.archivoPDF?.name || nombrePDFGuardado)
                    : null,
                HacerVisibleDashboard: formData.hacerVisibleDashboard,
                ArchivosAdjuntos: todosLosAdjuntos
            },
            duracion: "00:00",
            archivoReal: formData.tipoLectura === "Subir PDF" ? formData.archivoPDF : null,
            archivosImagenes: formData.recursosAdjuntos
        };
        onSave(dataParaBackend);
    };

    const archivoActivo = formData.archivoPDF;
    const tieneArchivoGuardado = !archivoActivo && nombrePDFGuardado && formData.tipoLectura === "Subir PDF";

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">

            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-400 shadow-lg shadow-indigo-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>

                        <div>
                            {editandoTitulo ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={tituloInputRef}
                                        type="text"
                                        value={formData.tituloSesion}
                                        onChange={(e) => handleInputChange("tituloSesion", e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditandoTitulo(false); }}
                                        onBlur={() => setEditandoTitulo(false)}
                                        placeholder="Nombre de la lectura..."
                                        className="text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-400 outline-none placeholder:text-slate-300 w-full min-w-[280px]"
                                    />
                                    <button
                                        onMouseDown={(e) => { e.preventDefault(); setEditandoTitulo(false); }}
                                        className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all flex-shrink-0"
                                    >
                                        <Check size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/titulo">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {formData.tituloSesion
                                            ? <span className="text-indigo-600">{formData.tituloSesion}</span>
                                            : <><span className="text-slate-300">Configuración </span><span className="text-indigo-400">Lectura</span></>
                                        }
                                    </h2>
                                    <button
                                        onClick={() => setEditandoTitulo(true)}
                                        className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0"
                                    >
                                        <Pencil size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}
                            <p className="text-slate-500 font-medium text-sm mt-0.5">Configura todos los detalles del recurso</p>
                        </div>
                    </div>

                    <button onClick={onCancel} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="px-10 py-8 space-y-10">

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Información básica</h3>
                        <p className="text-xs text-slate-400">Datos generales de la lectura</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 block">Tipo de lectura</label>
                            <div className="grid grid-cols-2 gap-3">
                                {["Crear Manualmente", "Subir PDF"].map((tipo) => (
                                    <button
                                        key={tipo}
                                        type="button"
                                        onClick={() => handleInputChange("tipoLectura", tipo)}
                                        className={`relative flex items-center gap-3 p-4 border-2 rounded-[1.5rem] transition-all duration-300 text-left
                                            ${formData.tipoLectura === tipo
                                                ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'
                                                : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-300
                                            ${formData.tipoLectura === tipo ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                            {tipo === "Crear Manualmente"
                                                ? <Pencil size={16} className={formData.tipoLectura === tipo ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                                                : <FileText size={16} className={formData.tipoLectura === tipo ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                                            }
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm transition-colors ${formData.tipoLectura === tipo ? 'text-indigo-700' : 'text-slate-800'}`}>
                                                {tipo}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">
                                                {tipo === "Crear Manualmente" ? "Editor de texto" : "Archivo .pdf"}
                                            </p>
                                        </div>
                                        {formData.tipoLectura === tipo && (
                                            <div className="absolute top-3 right-3">
                                                <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <Sparkles size={10} className="text-indigo-400" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Descripción</label>
                            <textarea
                                value={formData.descripcionSesion}
                                onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                                placeholder="Describe brevemente el contenido de esta lectura..."
                                className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                                rows={2}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => handleInputChange("hacerVisibleDashboard", !formData.hacerVisibleDashboard)}
                            className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left w-full
                                ${formData.hacerVisibleDashboard
                                    ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'
                                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300
                                ${formData.hacerVisibleDashboard ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                <Eye size={20} className={formData.hacerVisibleDashboard ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`font-bold text-sm transition-colors ${formData.hacerVisibleDashboard ? 'text-indigo-700' : 'text-slate-800'}`}>
                                    Visible en dashboard
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Mostrar en el panel principal</p>
                            </div>
                            {formData.hacerVisibleDashboard && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Sparkles size={12} className="text-indigo-400" />
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </section>

                {formData.tipoLectura === "Crear Manualmente" && (
                    <section>
                        <div className="mb-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contenido</h3>
                            <p className="text-xs text-slate-400">Escribe el contenido de la lectura</p>
                        </div>
                        <div className="border-2 border-slate-100 bg-slate-50 rounded-t-2xl px-4 py-2 flex items-center gap-1">
                            {[{ label: "B", style: "font-black" }, { label: "I", style: "italic" }, { label: "U", style: "underline" }].map(({ label, style }) => (
                                <button key={label} className={`w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all ${style}`}>
                                    {label}
                                </button>
                            ))}
                            <div className="w-px h-5 bg-slate-200 mx-1" />
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-indigo-600 rounded-xl transition-all">
                                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                </svg>
                            </button>
                        </div>
                        <textarea
                            value={formData.contenido}
                            onChange={(e) => handleInputChange("contenido", e.target.value)}
                            placeholder="Escribe el contenido de la lectura aquí..."
                            className="w-full px-4 py-3 border-2 border-t-0 border-slate-100 bg-white rounded-b-2xl focus:border-indigo-300 outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            rows={10}
                        />
                    </section>
                )}

                {formData.tipoLectura === "Subir PDF" && (
                    <section>
                        <div className="mb-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Archivo PDF</h3>
                            <p className="text-xs text-slate-400">Sube tu documento · máx. 50 MB</p>
                        </div>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDraggingPDF(true); }}
                            onDragLeave={() => setDraggingPDF(false)}
                            onDrop={handleDropPDF}
                            onClick={() => pdfInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300
                                ${draggingPDF
                                    ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                                    : archivoActivo
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : tieneArchivoGuardado
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                                ${archivoActivo ? 'bg-emerald-400 shadow-emerald-200' : tieneArchivoGuardado ? 'bg-blue-400 shadow-blue-200' : draggingPDF ? 'bg-indigo-400 shadow-indigo-200' : 'bg-slate-200 shadow-slate-100'}`}>
                                <FileText className={`w-6 h-6 ${archivoActivo || tieneArchivoGuardado || draggingPDF ? 'text-white' : 'text-slate-400'}`} strokeWidth={2.5} />
                            </div>

                            {archivoActivo ? (
                                <div className="text-center">
                                    <p className="font-black text-sm text-emerald-700">{archivoActivo.name}</p>
                                    <p className="text-xs text-emerald-500 font-medium mt-1">{(archivoActivo.size / (1024 * 1024)).toFixed(2)} MB · listo para subir</p>
                                    <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, archivoPDF: null })); }} className="mt-3 text-[11px] font-bold text-rose-400 hover:text-rose-600 transition-colors">
                                        Cambiar archivo
                                    </button>
                                </div>
                            ) : tieneArchivoGuardado ? (
                                <div className="text-center">
                                    <p className="font-black text-sm text-blue-700">{nombrePDFGuardado}</p>
                                    <p className="text-xs text-blue-500 font-medium mt-1">PDF guardado · haz clic para reemplazar</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-500">Arrastra tu PDF o <span className="text-indigo-500">haz clic para buscar</span></p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Solo archivos .pdf · máx. 50 MB</p>
                                </div>
                            )}
                            <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handleArchivoPDFChange} className="hidden" />
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                Archivos adjuntos
                                {(formData.adjuntosGuardados.length + formData.recursosAdjuntos.length) > 0 && (
                                    <span className="ml-2 normal-case font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                                        {formData.adjuntosGuardados.length + formData.recursosAdjuntos.length}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-400">Imágenes, PDF, Word, Excel, PowerPoint</p>
                        </div>
                        <button onClick={() => setMostrarModalRecurso(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-2xl hover:bg-indigo-50 transition-all">
                            <Plus size={14} strokeWidth={2.5} /> Agregar
                        </button>
                    </div>

                    {formData.adjuntosGuardados.length === 0 && formData.recursosAdjuntos.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-8 text-center">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <FileText size={18} className="text-slate-300" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Sin archivos adjuntos</p>
                            <p className="text-xs text-slate-300 mt-1">Agrega recursos complementarios</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {formData.adjuntosGuardados.map((archivo, index) => (
                                <div key={`guardado-${index}`} className="group flex items-center justify-between p-4 border-2 border-blue-100 bg-blue-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} className="text-blue-400" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-700">{archivo.NombreArchivo || archivo.nombreArchivo}</p>
                                            <p className="text-[10px] text-blue-400 font-medium">Guardado · {archivo.TamañoMB || archivo.tamañoMB} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, adjuntosGuardados: prev.adjuntosGuardados.filter((_, i) => i !== index) }))}
                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {formData.recursosAdjuntos.map((archivo, index) => (
                                <div key={`nuevo-${index}`} className="group flex items-center justify-between p-4 border-2 border-slate-100 hover:border-indigo-200 bg-white rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} className="text-indigo-400" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-700">{archivo.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{(archivo.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, recursosAdjuntos: prev.recursosAdjuntos.filter((_, i) => i !== index) }))}
                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">
                    Cancelar
                </button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                    <Sparkles size={14} />
                    Guardar lectura
                </button>
            </div>

            {mostrarModalRecurso && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setMostrarModalRecurso(false)} />
                    <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div className="p-8 pb-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Agregar <span className="text-indigo-600">recurso</span></h4>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Imágenes, PDF, Word, Excel, PowerPoint · máx. 50 MB</p>
                                </div>
                                <button onClick={() => setMostrarModalRecurso(false)} className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div
                                onClick={() => adjuntoInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-[1.5rem] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shadow-md">
                                    <Upload className="w-6 h-6 text-slate-400" strokeWidth={2.5} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-500">Arrastra tu archivo o <span className="text-indigo-500">haz clic aquí</span></p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Máx. 50 MB</p>
                                </div>
                                <input ref={adjuntoInputRef} type="file" onChange={handleRecursoAdjuntoChange} className="hidden" />
                            </div>
                        </div>
                        <div className="px-8 pb-8">
                            <button onClick={() => setMostrarModalRecurso(false)} className="w-full px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecursoLectura;
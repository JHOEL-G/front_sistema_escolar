import { useState, useRef, useEffect } from "react";
import { X, Monitor, Link, Calendar, Clock, Pencil, Check, Sparkles, Info } from "lucide-react";

export const RecursoZoom = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};
    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || cfg.descripcion || "",
        linkZoom: recursoData?.linkZoom || cfg.EnlaceZoom || cfg.enlaceZoom || "",
        fecha: recursoData?.fecha || recursoData?.fechaProgramada || "",
        hora: recursoData?.hora || recursoData?.horaProgramada || ""
    });

    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const tituloInputRef = useRef(null);

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGuardar = () => {
        if (!formData.tituloSesion.trim()) { alert("El título es obligatorio"); return; }
        if (!formData.linkZoom.trim()) { alert("El link de Zoom es obligatorio"); return; }

        onSave({
            titulo: formData.tituloSesion,
            descripcion: formData.descripcionSesion,
            tipoId: 6,
            configuracion: {
                EnlaceZoom: formData.linkZoom,
                Descripcion: formData.descripcionSesion || null,
            }
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">

            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-500 shadow-lg shadow-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Monitor className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                                        placeholder="Nombre de la sesión Zoom..."
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
                                            : <><span className="text-slate-300">Nueva sesión </span><span className="text-blue-500">Zoom</span></>
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
                        <p className="text-xs text-slate-400">Datos generales de la sesión</p>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Descripción</label>
                        <textarea
                            value={formData.descripcionSesion}
                            onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                            placeholder="Describe brevemente el propósito de esta sesión..."
                            className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            rows={3}
                        />
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Enlace</h3>
                        <p className="text-xs text-slate-400">URL de la reunión de Zoom</p>
                    </div>
                    <div className="space-y-3">
                        <div className="relative">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                            <input
                                type="url"
                                value={formData.linkZoom}
                                onChange={(e) => handleInputChange("linkZoom", e.target.value)}
                                placeholder="https://zoom.us/j/..."
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex gap-3 p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                            <Info size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                                Ingresa el enlace completo de la reunión. Los participantes podrán unirse directamente desde la plataforma.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">
                    Cancelar
                </button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                    <Sparkles size={14} />
                    Guardar sesión Zoom
                </button>
            </div>

        </div>
    );
};
import React, { useState, useRef, useEffect } from "react";
import { X, Dices, Pencil, Check, Sparkles } from "lucide-react";

const RecursoEmbebido = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};
    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || "",
        codigoEmbebido: recursoData?.codigoEmbebido || cfg.EnlaceEmbebido || ""
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
        if (!formData.tituloSesion.trim()) {
            alert("El título es obligatorio");
            return;
        }
        const dataParaBackend = {
            titulo: formData.tituloSesion,
            configuracion: {
                EnlaceEmbebido: formData.codigoEmbebido,
                Descripcion: formData.descripcionSesion
            }
        };
        onSave(dataParaBackend);
    };

    const lineCount = formData.codigoEmbebido.split("\n").length;

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">

            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-pink-400 shadow-lg shadow-pink-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Dices className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                                        placeholder="Nombre del contenido embebido..."
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
                                            : <><span className="text-slate-300">Configuracion </span><span className="text-pink-400">Embebido</span></>
                                        }
                                    </h2>
                                    <button
                                        onClick={() => setEditandoTitulo(true)}
                                        className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0"
                                        title="Editar título"
                                    >
                                        <Pencil size={14} strokeWidth={2.5} />
                                    </button>
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
                        <p className="text-xs text-slate-400">Datos generales del contenido embebido</p>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Descripción</label>
                        <textarea
                            value={formData.descripcionSesion}
                            onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                            placeholder="Describe brevemente el contenido que estás embebiendo..."
                            className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            rows={3}
                        />
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Código embebido</h3>
                        <p className="text-xs text-slate-400">Pega el iframe de YouTube, Google Forms, Genially u otra plataforma</p>
                    </div>

                    <div className="rounded-[1.5rem] overflow-hidden border-2 border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)]">
                        <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HTML · iframe</span>
                                {formData.codigoEmbebido && (
                                    <span className="text-[10px] font-bold text-slate-500">
                                        {lineCount} línea{lineCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900 flex">
                            <div className="select-none px-4 py-5 text-right border-r border-slate-700 min-w-[48px]">
                                {(formData.codigoEmbebido || " ").split("\n").map((_, i) => (
                                    <div key={i} className="text-xs font-mono text-slate-600 leading-6">{i + 1}</div>
                                ))}
                            </div>

                            <textarea
                                value={formData.codigoEmbebido}
                                onChange={(e) => handleInputChange("codigoEmbebido", e.target.value)}
                                placeholder={`<iframe\n  src="https://..."\n  width="100%"\n  height="500"\n  frameborder="0"\n></iframe>`}
                                className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none resize-none placeholder:text-slate-700 px-4 py-5 leading-6"
                                rows={Math.max(8, lineCount + 1)}
                                spellCheck={false}
                            />
                        </div>

                        <div className="bg-slate-800 px-5 py-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                {formData.codigoEmbebido ? `${formData.codigoEmbebido.length} caracteres` : 'Editor vacío'}
                            </span>
                            {formData.codigoEmbebido && (
                                <button
                                    onClick={() => handleInputChange("codigoEmbebido", "")}
                                    className="text-[10px] font-bold text-slate-600 hover:text-rose-400 uppercase tracking-wider transition-colors"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 font-medium mt-3 pl-1">
                        💡 Compatible con YouTube, Vimeo, Google Forms, Genially, Canva y cualquier plataforma que soporte iframes.
                    </p>
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
                    Guardar embebido
                </button>
            </div>

        </div>
    );
};

export default RecursoEmbebido;
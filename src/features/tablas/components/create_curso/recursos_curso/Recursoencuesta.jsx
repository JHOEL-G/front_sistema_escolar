import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, ClipboardList, Pencil, Check, Sparkles, BookOpen } from "lucide-react";
import { ModalBancaPreguntas } from "../modal/ModalBancaPreguntas";

const RecursoEncuesta = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};

    const initPreguntas = () => {
        const preguntas = cfg.Preguntas || cfg.preguntas || [];
        if (preguntas.length === 0) return [];

        return preguntas.map((p, i) => {
            const opcionesAnidadas = p.Opciones || p.opciones || [];
            const opcionesSeparadas = (cfg.Opciones || []).filter(o => o.PreguntaOrden === (i + 1));

            const opciones = opcionesAnidadas.length > 0 ? opcionesAnidadas : opcionesSeparadas;

            return {
                id: crypto.randomUUID(),
                pregunta: p.TextoPregunta || p.textoPregunta || "",
                opciones: opciones.length > 0
                    ? opciones.map(o => ({
                        id: crypto.randomUUID(),
                        titulo: o.TituloOpcion || o.tituloOpcion || "",
                        texto: o.TextoOpcion || o.textoOpcion || ""
                    }))
                    : [
                        { id: crypto.randomUUID(), titulo: "Opción A", texto: "" },
                        { id: crypto.randomUUID(), titulo: "Opción B", texto: "" },
                        { id: crypto.randomUUID(), titulo: "Opción C", texto: "" }
                    ]
            };
        });
    };

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        instrucciones: cfg.Instrucciones || cfg.instrucciones || "",
        preguntas: initPreguntas(),
        bancasSeleccionadas: cfg.BancasPreguntas || []
    });

    const [modalBancaAbierto, setModalBancaAbierto] = useState(false);
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const tituloInputRef = useRef(null);

    const handleAceptarBancas = (bancasSeleccionadas) => {
        setFormData(prev => ({ ...prev, bancasSeleccionadas }));
    };

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAgregarPregunta = () => {
        setFormData(prev => ({
            ...prev,
            preguntas: [...prev.preguntas, {
                id: crypto.randomUUID(),
                pregunta: "",
                opciones: [
                    { id: crypto.randomUUID(), titulo: "Opción A", texto: "" },
                    { id: crypto.randomUUID(), titulo: "Opción B", texto: "" },
                    { id: crypto.randomUUID(), titulo: "Opción C", texto: "" }
                ]
            }]
        }));
    };

    const handleEliminarPregunta = (id) => {
        setFormData(prev => ({ ...prev, preguntas: prev.preguntas.filter(p => p.id !== id) }));
    };

    const handlePreguntaChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p => p.id === id ? { ...p, pregunta: value } : p)
        }));
    };

    const handleOpcionChange = (preguntaId, opcionId, field, value) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === preguntaId
                    ? { ...p, opciones: p.opciones.map(o => o.id === opcionId ? { ...o, [field]: value } : o) }
                    : p
            )
        }));
    };

    const handleAgregarOpcion = (preguntaId) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === preguntaId
                    ? {
                        ...p,
                        opciones: [...p.opciones, {
                            id: crypto.randomUUID(),
                            titulo: `Opción ${String.fromCharCode(64 + p.opciones.length + 1)}`,
                            texto: ""
                        }]
                    }
                    : p
            )
        }));
    };

    const handleEliminarOpcion = (preguntaId, opcionId) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === preguntaId
                    ? { ...p, opciones: p.opciones.filter(o => o.id !== opcionId) }
                    : p
            )
        }));
    };

    const handleGuardar = () => {
        if (!formData.tituloSesion.trim()) { alert("El título es obligatorio"); return; }

        const dataParaBackend = {
            titulo: formData.tituloSesion,
            tipoId: 9,
            configuracion: {
                Instrucciones: formData.instrucciones,
                Preguntas: formData.preguntas.map((p, index) => ({
                    TextoPregunta: p.pregunta,
                    TipoPregunta: "OpcionMultiple",
                    OrdenPregunta: index + 1,
                    LimiteRespuestas: 1,
                    Opciones: p.opciones.map((o, oIndex) => ({
                        TituloOpcion: o.titulo,
                        TextoOpcion: o.texto,
                        OrdenOpcion: oIndex + 1
                    }))
                })),
                BancasPreguntas: formData.bancasSeleccionadas?.map(b => ({
                    bancaId: b.bancaId,
                    cantidad: b.cantidad
                })) || []
            }
        };
        onSave(dataParaBackend);
    };

    return (
        <>
            <div className="bg-white rounded-[2.5rem] overflow-hidden">

                <div className="relative p-10 pb-8 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-yellow-400 shadow-lg shadow-yellow-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <ClipboardList className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                                            placeholder="Nombre de la encuesta..."
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
                                                : <><span className="text-slate-300">Configuración </span><span className="text-yellow-400">Encuesta</span></>
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
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Instrucciones</h3>
                            <p className="text-xs text-slate-400">Indica a los participantes cómo completar la encuesta</p>
                        </div>
                        <input
                            type="text"
                            value={formData.instrucciones}
                            onChange={(e) => handleInputChange("instrucciones", e.target.value)}
                            placeholder="Ej. Responde con honestidad, no hay respuestas incorrectas..."
                            className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                        />
                    </section>

                    <section>
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                    Preguntas
                                    {formData.preguntas.length > 0 && (
                                        <span className="ml-2 normal-case font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                                            {formData.preguntas.length}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-400">Agrega las preguntas de la encuesta</p>
                            </div>
                        </div>

                        {formData.preguntas.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-10 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <BookOpen size={22} className="text-slate-300" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-bold text-slate-400">Sin preguntas aún</p>
                                <p className="text-xs text-slate-300 mt-1">Usa los botones de abajo para agregar</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.preguntas.map((pregunta, index) => (
                                    <div
                                        key={pregunta.id}
                                        className="group border-2 border-slate-100 hover:border-indigo-200 bg-white rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)] overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">
                                                Pregunta <span className="text-indigo-500">{index + 1}</span>
                                            </span>
                                            <button
                                                onClick={() => handleEliminarPregunta(pregunta.id)}
                                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <input
                                                type="text"
                                                value={pregunta.pregunta}
                                                onChange={(e) => handlePreguntaChange(pregunta.id, e.target.value)}
                                                placeholder="Escribe el enunciado de la pregunta..."
                                                className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                                            />
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                    Opciones · máx. 5
                                                </p>
                                                {pregunta.opciones.map((opcion, oi) => (
                                                    <div key={opcion.id} className="flex items-start gap-3">
                                                        <div className="w-7 h-7 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center flex-shrink-0 mt-2">
                                                            <span className="text-[9px] font-black text-slate-400">
                                                                {String.fromCharCode(65 + oi)}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <input
                                                                type="text"
                                                                value={opcion.titulo}
                                                                onChange={(e) => handleOpcionChange(pregunta.id, opcion.id, "titulo", e.target.value)}
                                                                placeholder="Título de la opción..."
                                                                className="w-full px-4 py-2 border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opcion.texto}
                                                                onChange={(e) => handleOpcionChange(pregunta.id, opcion.id, "texto", e.target.value)}
                                                                placeholder="Descripción de la opción (opcional)..."
                                                                className="w-full px-4 py-2 border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-sm text-slate-500 placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => handleEliminarOpcion(pregunta.id, opcion.id)}
                                                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex-shrink-0 mt-2"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {pregunta.opciones.length < 5 && (
                                                    <button
                                                        onClick={() => handleAgregarOpcion(pregunta.id)}
                                                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all mt-1"
                                                    >
                                                        <Plus size={13} />
                                                        Agregar opción
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setModalBancaAbierto(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-2xl hover:bg-indigo-100 transition-all"
                        >
                            <BookOpen size={15} strokeWidth={2.5} />
                            Bancos de preguntas
                            {formData.bancasSeleccionadas?.length > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {formData.bancasSeleccionadas.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handleAgregarPregunta}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-2xl hover:bg-indigo-50 transition-all"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            Agregar pregunta
                        </button>
                    </div>
                    <button
                        onClick={handleGuardar}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
                    >
                        <Sparkles size={14} />
                        Guardar encuesta
                    </button>
                </div>
            </div>

            <ModalBancaPreguntas
                isOpen={modalBancaAbierto}
                onClose={() => setModalBancaAbierto(false)}
                onAceptar={handleAceptarBancas}
                seleccionPrevias={formData.bancasSeleccionadas || []}
            />
        </>
    );
};

export default RecursoEncuesta;
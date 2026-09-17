import React, { useState, useRef, useEffect } from "react";
import {
    X, Plus, Trash2, FileCheck, BookOpen, Clock, Shuffle, BarChart3,
    RotateCcw, ChevronDown, Sparkles, Hash, Pencil, Check, Image,
    AlignLeft, AlignJustify, List, CheckSquare, ChevronDownSquare, Link2
} from "lucide-react";
import { ModalBancaPreguntas } from "../modal/ModalBancaPreguntas";
import { BtnImagen, crearOpcionVacia, crearPreguntaVacia, RichEditor } from "./diseño_evaluacion/DiseñoEvaluacion";

const TIPOS_PREGUNTA = [
    {
        value: 'multiple',
        label: 'Opción múltiple',
        icon: '⊙',
        color: 'indigo',
        tipoPreguntaId: 1,
        desc: 'Una sola respuesta correcta'
    },
    {
        value: 'relacion',
        label: 'Relación',
        icon: '↔',
        color: 'amber',
        tipoPreguntaId: 2,
        desc: 'Emparejar conceptos'
    },
    {
        value: 'desarrollo',
        label: 'Desarrollo',
        icon: '✍',
        color: 'violet',
        tipoPreguntaId: 5,
        desc: 'Respuesta argumentativa extensa'
    },
];

const TIPO_COLORS = {
    indigo: { badge: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200', focus: 'focus:border-indigo-300' },
    blue: { badge: 'bg-blue-100 text-blue-600', border: 'border-blue-200', focus: 'focus:border-blue-300' },
    violet: { badge: 'bg-violet-100 text-violet-600', border: 'border-violet-200', focus: 'focus:border-violet-300' },
    emerald: { badge: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200', focus: 'focus:border-emerald-300' },
    teal: { badge: 'bg-teal-100 text-teal-600', border: 'border-teal-200', focus: 'focus:border-teal-300' },
    amber: { badge: 'bg-amber-100 text-amber-600', border: 'border-amber-200', focus: 'focus:border-amber-300' },
};


export const RecursoEvaluacion = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.descripcionSesion || cfg.Descripcion || "",
        instrucciones: recursoData?.instrucciones || cfg.instrucciones || cfg.Instrucciones || "",
        tipoCalificacion: recursoData?.tipoCalificacion || cfg.tipoCalificacionId || cfg.TipoCalificacionId || 1,
        agregarPonderacion: recursoData?.agregarPonderacion ?? cfg.agregarPonderacion ?? cfg.AgregarPonderacion ?? false,
        preguntasAleatorias: recursoData?.preguntasAleatorias ?? cfg.preguntasAleatorias ?? cfg.PreguntasAleatorias ?? false,
        oportunidades: recursoData?.oportunidades || cfg.oportunidades || cfg.Oportunidades || 0,
        permitirReinicio: recursoData?.permitirReinicio || cfg.permitirReinicio || cfg.PermitirReinicio || "No reiniciar",
        preguntasCorrectas: recursoData?.preguntasCorrectas || cfg.preguntasCorrectasAprobar || cfg.PreguntasCorrectasAprobar || 0,
        tiempoHoras: recursoData?.tiempoHoras || cfg.tiempoHoras || cfg.TiempoHoras || 0,
        tiempoMinutos: recursoData?.tiempoMinutos || cfg.tiempoMinutos || cfg.TiempoMinutos || 0,
        preguntas: recursoData?.preguntas ||
            (cfg.preguntas || cfg.Preguntas || []).map(p => ({
                id: crypto.randomUUID(),
                tipo: p.tipoPreguntaId === 1 || p.TipoPreguntaId === 1 ? 'multiple'
                    : p.tipoPreguntaId === 2 || p.TipoPreguntaId === 2 ? 'relacion'
                        : p.tipoPreguntaId === 5 || p.TipoPreguntaId === 5 ? 'desarrollo'
                            : 'multiple',
                pregunta: p.textoPregunta || p.TextoPregunta || "",
                imagenPregunta: p.imagenPregunta || p.ImagenPregunta || null,
                imagenPreguntaFile: null,
                imagenPreguntaNombre: null,
                opciones: (p.opciones || p.Opciones || []).map(o => ({
                    id: crypto.randomUUID(),
                    texto: o.textoOpcion || o.TextoOpcion || "",
                    esCorrecta: o.esCorrecta ?? o.EsCorrecta ?? false,
                    explicacion: o.explicacionORelacion || o.ExplicacionORelacion || "",
                    imagen: o.imagenOpcion || o.ImagenOpcion || null,
                    imagenFile: null,
                    imagenNombre: null
                })),
                pares: p.tipoPreguntaId === 2 || p.TipoPreguntaId === 2
                    ? (p.opciones || p.Opciones || []).map(o => ({
                        id: crypto.randomUUID(),
                        izquierda: o.textoOpcion || o.TextoOpcion || "",
                        derecha: o.explicacionORelacion || o.ExplicacionORelacion || ""
                    })) : [],
                criterios: []
            })),

        bancasSeleccionadas: recursoData?.bancasSeleccionadas ||
            (cfg.BancasPreguntas || cfg.bancasIds || []).map(b => ({
                bancaId: b.bancaId || b.BancaId,
                cantidad: b.cantidad || b.Cantidad || 0,
                nombreBanca: b.nombreBanca || b.NombreBanca || "",
                totalPreguntas: b.totalPreguntas || 0,
                preguntas: b.preguntas || []
            }))
    });

    const [modalBancaAbierto, setModalBancaAbierto] = useState(false);
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const tituloInputRef = useRef(null);
    const [bancasExpandidas, setBancasExpandidas] = useState(new Set());
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const addPregunta = (tipo = 'multiple') =>
        setFormData(prev => ({ ...prev, preguntas: [...prev.preguntas, crearPreguntaVacia(tipo)] }));

    const removePregunta = (id) =>
        setFormData(prev => ({ ...prev, preguntas: prev.preguntas.filter(p => p.id !== id) }));

    const updatePregunta = (id, patch) =>
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p => p.id === id ? { ...p, ...patch } : p)
        }));

    const changeTipoPregunta = (id, nuevoTipo) => {
        const base = crearPreguntaVacia(nuevoTipo);
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === id ? { ...base, id: p.id, pregunta: p.pregunta, imagenPregunta: p.imagenPregunta } : p
            )
        }));
    };

    const updateOpcion = (pregId, opId, patch) =>
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === pregId
                    ? { ...p, opciones: p.opciones.map(o => o.id === opId ? { ...o, ...patch } : o) }
                    : p
            )
        }));

    const toggleCorrecta = (pregId, opId, tipo) =>
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p => {
                if (p.id !== pregId) return p;
                return {
                    ...p,
                    opciones: p.opciones.map(o =>
                        tipo === 'casillas'
                            ? (o.id === opId ? { ...o, esCorrecta: !o.esCorrecta } : o)
                            : { ...o, esCorrecta: o.id === opId }
                    )
                };
            })
        }));

    const addOpcion = (pregId) =>
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === pregId
                    ? { ...p, opciones: [...p.opciones, crearOpcionVacia(`Opción ${p.opciones.length + 1}`)] }
                    : p
            )
        }));

    const removeOpcion = (pregId, opId) =>
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map(p =>
                p.id === pregId
                    ? { ...p, opciones: p.opciones.filter(o => o.id !== opId) }
                    : p
            )
        }));

    const handleAceptarBancas = (bancasSeleccionadas) =>
        setFormData(prev => ({ ...prev, bancasSeleccionadas }));

    const toggleExpandir = (bancaId) =>
        setBancasExpandidas(prev => {
            const next = new Set(prev);
            next.has(bancaId) ? next.delete(bancaId) : next.add(bancaId);
            return next;
        });

    const handleGuardar = () => {
        const nuevosErrores = {};
        if (!formData.tituloSesion.trim()) nuevosErrores.tituloSesion = "El título es obligatorio";
        if (!formData.instrucciones.trim()) nuevosErrores.instrucciones = "Las instrucciones son obligatorias";

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        setErrores({});

        formData.preguntas.map(p => ({
            tipo: p.tipo,
            pregunta: p.pregunta,
            opciones: p.opciones?.length,
            pares: p.pares?.length
        }));

        const preguntasManuales = formData.preguntas.map(p => {
            const tipoInfo = TIPOS_PREGUNTA.find(t => t.value === p.tipo);
            return {
                PreguntaVideoId: 0,
                TextoPregunta: p.pregunta || '',
                ImagenPregunta: p.imagenPreguntaNombre || null,
                SegundoMarca: 0,
                TipoPreguntaId: tipoInfo?.tipoPreguntaId || 1,
                PuntosValor: 1,
                Activo: true,
                Opciones: p.tipo === 'multiple'
                    ? p.opciones.map(o => ({
                        TextoOpcion: o.texto || '',
                        Explicacion: o.explicacion || '',
                        EsCorrecta: !!o.esCorrecta,
                        ImagenOpcion: o.imagenNombre || null,
                    }))
                    : p.tipo === 'relacion'
                        ? p.pares.map(par => ({
                            TextoOpcion: par.izquierda || '',
                            EsCorrecta: false,
                            ExplicacionORelacion: par.derecha || ''
                        }))
                        : p.tipo === 'desarrollo'
                            ? (p.criterios || []).map(c => ({
                                TextoOpcion: c.descripcion || '',
                                EsCorrecta: false,
                                ExplicacionORelacion: String(c.puntos || 0)
                            }))
                            : []
            };
        });

        const archivosImagenes = [
            ...formData.preguntas
                .filter(p => p.imagenPreguntaFile instanceof File)
                .map(p => p.imagenPreguntaFile),
            ...formData.preguntas.flatMap(p =>
                (p.opciones || [])
                    .filter(o => o.imagenFile instanceof File)
                    .map(o => o.imagenFile)
            )
        ];

        onSave({
            titulo: formData.tituloSesion,
            tipoId: 1,
            archivosImagenes,
            configuracion: {
                Instrucciones: formData.instrucciones,
                Descripcion: formData.descripcionSesion || null,
                TipoCalificacionId: formData.tipoCalificacion,
                AgregarPonderacion: !!formData.agregarPonderacion,
                PreguntasAleatorias: !!formData.preguntasAleatorias,
                Oportunidades: parseInt(formData.oportunidades) || 0,
                PermitirReinicio: formData.permitirReinicio,
                PreguntasCorrectasAprobar: parseInt(formData.preguntasCorrectas) || 0,
                TiempoHoras: parseInt(formData.tiempoHoras) || 0,
                TiempoMinutos: parseInt(formData.tiempoMinutos) || 0,
                BancasPreguntas: formData.bancasSeleccionadas?.map(b => ({ bancaId: b.bancaId, cantidad: b.cantidad })) || [],
                Preguntas: preguntasManuales
            }
        });
    };


    const renderOpciones = (pregunta) => {
        const esCasillas = pregunta.tipo === 'casillas';

        return (
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                    Opciones · máx. 5
                </p>

                {pregunta.opciones.map((opcion, oi) => (
                    <div key={opcion.id} className="relative flex gap-3 items-start py-4">
                        <div className="flex-shrink-0 mt-2 text-slate-300 cursor-grab select-none">⠿</div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-1.5">Título de opción</p>
                                <RichEditor
                                    value={opcion.texto}
                                    onChange={(val) => updateOpcion(pregunta.id, opcion.id, { texto: val })}
                                    placeholder="Opción..."
                                    disableImage={true}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-500">Imagen de opción</p>
                                <BtnImagen
                                    size="sm"
                                    imagen={opcion.imagen}
                                    onImagen={(b64, file) => updateOpcion(pregunta.id, opcion.id, {
                                        imagen: b64,
                                        imagenFile: file,
                                        imagenNombre: file.name
                                    })}
                                    onEliminar={() => updateOpcion(pregunta.id, opcion.id, {
                                        imagen: null,
                                        imagenFile: null,
                                        imagenNombre: null
                                    })}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-1.5">Explicación</p>
                                <RichEditor
                                    value={opcion.explicacion}
                                    onChange={(val) => updateOpcion(pregunta.id, opcion.id, { explicacion: val })}
                                    placeholder="Explicación..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleCorrecta(pregunta.id, opcion.id, pregunta.tipo)}
                                    className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0
                ${opcion.esCorrecta ? 'bg-emerald-400' : 'bg-slate-200'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300
                ${opcion.esCorrecta ? 'left-4' : 'left-0.5'}`} />
                                </button>
                                <span className={`text-xs font-bold transition-colors
            ${opcion.esCorrecta ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    Respuesta correcta
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeOpcion(pregunta.id, opcion.id)}
                            className="flex-shrink-0 mt-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                ))}

                {pregunta.opciones.length < 5 && (
                    <button
                        type="button"
                        onClick={() => addOpcion(pregunta.id)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all mt-1"
                    >
                        <Plus size={13} /> Agregar opción
                    </button>
                )}
            </div>
        );
    };

    const renderCuerpoPregunta = (pregunta) => {
        switch (pregunta.tipo) {
            case 'multiple':
                return renderOpciones(pregunta);

            case 'relacion':
                return (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            Pares de relación
                        </p>
                        {pregunta.pares.map((par, pi) => (
                            <div key={par.id} className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-slate-400 w-5 text-center">
                                    {pi + 1}
                                </span>
                                <input
                                    type="text"
                                    value={par.izquierda}
                                    onChange={(e) => updatePregunta(pregunta.id, {
                                        pares: pregunta.pares.map(pr =>
                                            pr.id === par.id ? { ...pr, izquierda: e.target.value } : pr
                                        )
                                    })}
                                    placeholder="Concepto..."
                                    className="flex-1 px-4 py-2.5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-amber-300 focus:bg-white outline-none transition-all text-sm text-slate-700 font-medium"
                                />
                                <span className="text-slate-300 font-black">→</span>
                                <input
                                    type="text"
                                    value={par.derecha}
                                    onChange={(e) => updatePregunta(pregunta.id, {
                                        pares: pregunta.pares.map(pr =>
                                            pr.id === par.id ? { ...pr, derecha: e.target.value } : pr
                                        )
                                    })}
                                    placeholder="Definición..."
                                    className="flex-1 px-4 py-2.5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-amber-300 focus:bg-white outline-none transition-all text-sm text-slate-700 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => updatePregunta(pregunta.id, {
                                        pares: pregunta.pares.filter(pr => pr.id !== par.id)
                                    })}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => updatePregunta(pregunta.id, {
                                pares: [...pregunta.pares, { id: crypto.randomUUID(), izquierda: '', derecha: '' }]
                            })}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-500 hover:bg-amber-50 rounded-xl transition-all mt-1"
                        >
                            <Plus size={13} /> Agregar par
                        </button>
                    </div>
                );

            case 'desarrollo':
                return (
                    <div className="space-y-4">
                        <div className="px-4 py-5 border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">✍️</span>
                                <p className="text-xs font-black text-violet-500 uppercase tracking-wider">
                                    Pregunta de desarrollo
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                El estudiante deberá redactar una respuesta argumentativa extensa.
                                Define abajo los criterios de evaluación que usará el docente para calificar.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                Criterios de evaluación
                            </p>
                            {(pregunta.criterios || []).map((criterio, ci) => (
                                <div key={criterio.id} className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-slate-400 w-5 text-center">
                                        {ci + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={criterio.descripcion}
                                        onChange={(e) => updatePregunta(pregunta.id, {
                                            criterios: pregunta.criterios.map(c =>
                                                c.id === criterio.id ? { ...c, descripcion: e.target.value } : c
                                            )
                                        })}
                                        placeholder="Ej: Argumenta con fundamento teórico..."
                                        className="flex-1 px-4 py-2.5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-violet-300 focus:bg-white outline-none transition-all text-sm text-slate-700 font-medium"
                                    />
                                    <input
                                        type="number"
                                        value={criterio.puntos}
                                        onChange={(e) => updatePregunta(pregunta.id, {
                                            criterios: pregunta.criterios.map(c =>
                                                c.id === criterio.id ? { ...c, puntos: parseFloat(e.target.value) || 0 } : c
                                            )
                                        })}
                                        placeholder="pts"
                                        min={0}
                                        className="w-16 px-3 py-2.5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-violet-300 focus:bg-white outline-none transition-all text-sm text-slate-700 font-bold text-center"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updatePregunta(pregunta.id, {
                                            criterios: pregunta.criterios.filter(c => c.id !== criterio.id)
                                        })}
                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => updatePregunta(pregunta.id, {
                                    criterios: [
                                        ...(pregunta.criterios || []),
                                        { id: crypto.randomUUID(), descripcion: '', puntos: 0 }
                                    ]
                                })}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-violet-500 hover:bg-violet-50 rounded-xl transition-all mt-1"
                            >
                                <Plus size={13} /> Agregar criterio
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="bg-white rounded-[2.5rem] overflow-hidden">
                <div className="relative p-10 pb-8 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-400 shadow-lg shadow-amber-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <FileCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                                            placeholder="Nombre de la evaluación..."
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
                                                    : <><span className="text-slate-300">Configurando </span><span className="text-indigo-300">Evaluación</span></>
                                                }
                                            </h2>
                                            <button onClick={() => setEditandoTitulo(true)}
                                                className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0">
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
                        <button onClick={onCancel} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="px-10 py-8 space-y-10">
                    <section>
                        <div className="mb-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Información básica</h3>
                            <p className="text-xs text-slate-400">Datos generales de la evaluación</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Tipo de Calificación</label>
                                    <div className="relative">
                                        <select value={formData.tipoCalificacion}
                                            onChange={(e) => handleInputChange("tipoCalificacion", parseInt(e.target.value))}
                                            className="w-full appearance-none px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium cursor-pointer pr-10">
                                            <option value={1}>⚡ Automático (Sistema)</option>
                                            <option value={2}>✍️ Manual (Profesor)</option>
                                            <option value={3}>📋 Manual con Rúbrica</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Reinicio programado</label>
                                    <div className="relative">
                                        <select value={formData.permitirReinicio}
                                            onChange={(e) => handleInputChange("permitirReinicio", e.target.value)}
                                            className="w-full appearance-none px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium cursor-pointer pr-10">
                                            <option value="No reiniciar">🚫 No reiniciar</option>
                                            <option value="Reiniciar cada día">📅 Cada día</option>
                                            <option value="Reiniciar cada semana">🗓️ Cada semana</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                                    Descripción
                                    <span className="ml-1.5 text-slate-300 font-medium normal-case tracking-normal text-[11px]">(opcional)</span>
                                </label>
                                <textarea value={formData.descripcionSesion}
                                    onChange={(e) => handleInputChange("descripcionSesion", e.target.value)}
                                    placeholder="Describe brevemente el propósito de esta evaluación..."
                                    className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                                    rows={3} />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                                    Instrucciones <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    value={formData.instrucciones}
                                    onChange={(e) => { handleInputChange("instrucciones", e.target.value); setErrores(p => ({ ...p, instrucciones: '' })); }}
                                    placeholder="Explica cómo el estudiante debe completar la evaluación..."
                                    className={`w-full px-4 py-3 border-2 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300
        ${errores.instrucciones ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}
                                    rows={3}
                                />
                                {errores.instrucciones && (
                                    <p className="text-xs text-rose-500 font-medium mt-1.5">{errores.instrucciones}</p>
                                )}
                            </div>
                        </div>
                    </section>
                    <section>
                        <div className="mb-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Configuración</h3>
                            <p className="text-xs text-slate-400">Parámetros de comportamiento de la evaluación</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { field: 'agregarPonderacion', icon: BarChart3, label: 'Agregar a ponderación', sub: 'Incluir en la nota final' },
                                { field: 'preguntasAleatorias', icon: Shuffle, label: 'Preguntas aleatorias', sub: 'Orden distinto por alumno' },
                            ].map(({ field, icon: Icon, label, sub }) => (
                                <button key={field} type="button"
                                    onClick={() => handleInputChange(field, !formData[field])}
                                    className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left
                                        ${formData[field] ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'
                                            : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300
                                        ${formData[field] ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                                        <Icon size={20} className={formData[field] ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm transition-colors ${formData[field] ? 'text-indigo-700' : 'text-slate-800'}`}>{label}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">{sub}</p>
                                    </div>
                                    {formData[field] && (
                                        <div className="absolute top-4 right-4">
                                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <Sparkles size={12} className="text-indigo-400" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            {[
                                { field: 'oportunidades', icon: RotateCcw, label: 'Oportunidades' },
                                { field: 'preguntasCorrectas', icon: Hash, label: 'Para aprobar' },
                            ].map(({ field, icon: Icon, label }) => (
                                <div key={field} className="p-5 border-2 border-slate-100 bg-white rounded-[1.5rem] hover:border-indigo-100 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon size={13} className="text-slate-400" strokeWidth={2.5} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
                                    </div>
                                    <input type="number" value={formData[field]}
                                        onChange={(e) => handleInputChange(field, parseInt(e.target.value) || 0)}
                                        className="w-full text-4xl font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-1 transition-colors"
                                        min={0} />
                                </div>
                            ))}
                            <div className="p-5 border-2 border-slate-100 bg-white rounded-[1.5rem] hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={13} className="text-slate-400" strokeWidth={2.5} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Tiempo límite</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <input type="number" value={formData.tiempoHoras}
                                        onChange={(e) => handleInputChange("tiempoHoras", parseInt(e.target.value) || 0)}
                                        className="w-14 text-4xl font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-1 transition-colors text-center" min={0} />
                                    <span className="text-3xl font-black text-slate-200 pb-1">:</span>
                                    <input type="number" value={formData.tiempoMinutos}
                                        onChange={(e) => handleInputChange("tiempoMinutos", parseInt(e.target.value) || 0)}
                                        className="w-14 text-4xl font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-1 transition-colors text-center" min={0} max={59} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider pb-2 ml-1">h/m</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                Preguntas
                                {formData.preguntas.length > 0 && (
                                    <span className="ml-2 normal-case font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                                        {formData.preguntas.length}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-400">Agrega las preguntas de la evaluación</p>
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
                                {formData.preguntas.map((pregunta, index) => {
                                    const tipoInfo = TIPOS_PREGUNTA.find(t => t.value === pregunta.tipo);
                                    const colors = TIPO_COLORS[tipoInfo?.color || 'indigo'];
                                    return (
                                        <div key={pregunta.id}
                                            className="group border-2 border-slate-100 hover:border-indigo-200 bg-white rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)] overflow-hidden">

                                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 gap-4">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex-shrink-0">
                                                    Pregunta <span className="text-indigo-500">{index + 1}</span>
                                                </span>
                                                <div className="relative flex-shrink-0">
                                                    <select
                                                        value={pregunta.tipo}
                                                        onChange={(e) => changeTipoPregunta(pregunta.id, e.target.value)}
                                                        className={`appearance-none text-[10px] font-black uppercase tracking-wider pl-3 pr-7 py-1.5 rounded-full border-2 cursor-pointer outline-none transition-all ${colors.badge} ${colors.border}`}
                                                    >
                                                        {TIPOS_PREGUNTA.map(t => (
                                                            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                                                </div>

                                                <button onClick={() => removePregunta(pregunta.id)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all ml-auto">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>

                                            <div className="p-8 space-y-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">

                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                                                            <span className="text-lg font-black">?</span>
                                                        </div>
                                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Enunciado de la Pregunta</h3>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <BtnImagen
                                                            size="sm"
                                                            imagen={pregunta.imagenPregunta}
                                                            onImagen={(b64, file) => updatePregunta(pregunta.id, {
                                                                imagenPregunta: b64,
                                                                imagenPreguntaFile: file,
                                                                imagenPreguntaNombre: file.name
                                                            })}
                                                            onEliminar={() => updatePregunta(pregunta.id, {
                                                                imagenPregunta: null,
                                                                imagenPreguntaFile: null,
                                                                imagenPreguntaNombre: null
                                                            })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="relative group px-1">
                                                    <textarea
                                                        rows="1"
                                                        value={pregunta.pregunta}
                                                        onChange={(e) => {
                                                            updatePregunta(pregunta.id, { pregunta: e.target.value });
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                                        }}
                                                        placeholder="¿Qué quieres preguntar hoy?"
                                                        className="w-full text-2xl font-bold text-slate-700 placeholder:text-slate-200 bg-transparent border-none focus:ring-0 focus:outline-none resize-none transition-all p-0 leading-snug"
                                                    />

                                                    <div className="h-[2px] w-full bg-slate-50 mt-2 rounded-full overflow-hidden">
                                                        <div className="h-full w-0 group-focus-within:w-full bg-indigo-500/50 transition-all duration-700 ease-out" />
                                                    </div>
                                                </div>

                                                {pregunta.imagenPregunta && (
                                                    <div className="relative group max-w-2xl mx-auto">
                                                        <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-xl transition-all duration-500">
                                                            <img
                                                                src={pregunta.imagenPregunta}
                                                                alt="pregunta"
                                                                className="w-full max-h-[450px] object-cover transition-transform duration-700 hover:scale-[1.02]"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => updatePregunta(pregunta.id, {
                                                                imagenPregunta: null,
                                                                imagenPreguntaFile: null,
                                                                imagenPreguntaNombre: null
                                                            })}
                                                            className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center bg-white/80 backdrop-blur-md text-slate-400 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 border border-white"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="relative pt-8 mt-4">
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] whitespace-nowrap bg-indigo-50/30 px-3 py-1 rounded-lg">
                                                            Opciones de respuesta
                                                        </span>
                                                        <div className="h-[1px] w-full bg-gradient-to-r from-slate-100 to-transparent" />
                                                    </div>

                                                    <div className="bg-slate-50/40 p-1 rounded-[2.5rem] border border-slate-100/30">
                                                        {renderCuerpoPregunta(pregunta)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {formData.bancasSeleccionadas?.length > 0 && (
                        <section>
                            <div className="mb-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                    Bancas seleccionadas
                                    <span className="ml-2 normal-case font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full text-[11px]">
                                        {formData.bancasSeleccionadas.length}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400">Preguntas que se tomarán de los bancos configurados</p>
                            </div>
                            <div className="space-y-4">
                                {formData.bancasSeleccionadas.map((banca) => {
                                    const expandida = bancasExpandidas.has(banca.bancaId);
                                    return (
                                        <div key={banca.bancaId} className="border-2 border-violet-100 bg-violet-50/40 rounded-[1.5rem] overflow-hidden">
                                            <div className="flex items-center justify-between px-6 py-4 bg-violet-50 border-b border-violet-100 cursor-pointer select-none"
                                                onClick={() => toggleExpandir(banca.bancaId)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <BookOpen size={14} className="text-white" strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-violet-800">{banca.nombreBanca}</p>
                                                        <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">
                                                            Mostrando <span className="font-black text-violet-600">{banca.cantidad}</span> de {banca.totalPreguntas} preguntas
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 bg-violet-100 text-violet-500 rounded-xl transition-transform duration-200 ${expandida ? "rotate-180" : ""}`}>
                                                        <ChevronDown size={15} />
                                                    </div>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData(prev => ({ ...prev, bancasSeleccionadas: prev.bancasSeleccionadas.filter(b => b.bancaId !== banca.bancaId) }));
                                                    }} className="p-1.5 text-violet-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                            {expandida && banca.preguntas?.length > 0 && (
                                                <div className="p-4 space-y-3">
                                                    {banca.preguntas.map((preg, idx) => (
                                                        <div key={idx} className="bg-white border border-violet-100 rounded-2xl p-4">
                                                            <p className="text-sm font-semibold text-slate-700">{preg.textoPregunta}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {expandida && (!banca.preguntas || banca.preguntas.length === 0) && (
                                                <div className="p-6 text-center text-slate-400 text-xs font-medium">Esta banca no tiene preguntas cargadas</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div className="flex flex-col min-w-[240px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                Agregar nueva pregunta
                            </p>
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            addPregunta(e.target.value);
                                            e.target.value = "";
                                        }
                                    }}
                                    defaultValue=""
                                    className="w-full h-11 pl-4 pr-10 py-2 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-2xl appearance-none focus:border-indigo-500 focus:ring-0 transition-all cursor-pointer"
                                >
                                    <option value="" disabled>Selecciona un tipo...</option>
                                    {TIPOS_PREGUNTA.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.icon} {tipo.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
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
                                onClick={handleGuardar}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
                            >
                                <Sparkles size={14} />
                                Guardar evaluación
                            </button>
                        </div>
                    </div>
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
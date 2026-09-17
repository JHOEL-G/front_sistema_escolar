import React, { useState, useEffect } from "react";
import {
    X, FileCheck, MessageSquare, PenTool, Video, BookOpen,
    Monitor, Sparkles, Calendar, Code, Dices, ClipboardList, MapPin
} from "lucide-react";

import { RecursoEvaluacion } from "./RecursoEvaluacion";
import RecursoTarea from "./RecursoTarea";
import RecursoEvaluacionPresencial from "./RecursoEvaluacionPresencial";
import RecursoSCORM from "./RecursoSCORM";
import RecursoVideo from "./RecursoVideo";
import RecursoLectura from "./RecursoLectura";
import RecursoEmbebido from "./RecursoEmbebido";
import RecursoEncuesta from "./RecursoEncuesta";
import RecursoForo from "./Recursoforo";
import { RecursoZoom } from "./RecursoZoom";
import { RecursoSesionPresencial } from "./RecursoSesionPresencial";
import RecursoVideoPregunta from "./RecursoVideoPregunta";

const COMPONENTES_RECURSOS = {
    Evaluacion: RecursoEvaluacion,
    Foro: RecursoForo,
    Tarea: RecursoTarea,
    EvaluacionPresencial: RecursoEvaluacionPresencial,
    SCORM: RecursoSCORM,
    Video: RecursoVideo,
    Lectura: RecursoLectura,
    Embebido: RecursoEmbebido,
    Encuesta: RecursoEncuesta,
    Zoom: RecursoZoom,
    SesionPresencial: RecursoSesionPresencial,
    VideoPregunta: RecursoVideoPregunta,
};

const RECURSOS_CONFIG = [
    { categoria: "Actividad", tipo: "Evaluacion", tipoId: 1, nombre: "Evaluación", Icon: FileCheck, color: "bg-amber-400 shadow-amber-200" },
    { categoria: "Actividad", tipo: "Foro", tipoId: 2, nombre: "Foro", Icon: MessageSquare, color: "bg-sky-400 shadow-sky-200" },
    { categoria: "Actividad", tipo: "Tarea", tipoId: 3, nombre: "Tarea", Icon: PenTool, color: "bg-emerald-400 shadow-emerald-200" },
    { categoria: "Actividad", tipo: "Video", tipoId: 4, nombre: "Video", Icon: Video, color: "bg-rose-400 shadow-rose-200" },
    { categoria: "Actividad", tipo: "Lectura", tipoId: 5, nombre: "Lectura", Icon: BookOpen, color: "bg-indigo-400 shadow-indigo-200" },
    { categoria: "Actividad", tipo: "SCORM", tipoId: 8, nombre: "SCORM", Icon: Code, color: "bg-purple-400 shadow-purple-200" },
    { categoria: "Lección", tipo: "Zoom", tipoId: 6, nombre: "Zoom", Icon: Monitor, color: "bg-blue-500 shadow-blue-200" },
    { categoria: "Lección", tipo: "Embebido", tipoId: 7, nombre: "Contenido Embebido", Icon: Dices, color: "bg-pink-400 shadow-pink-200" },
    { categoria: "Extras", tipo: "Encuesta", tipoId: 9, nombre: "Encuesta", Icon: ClipboardList, color: "bg-yellow-500 shadow-yellow-200" },
    { categoria: "Extras", tipo: "SesionPresencial", tipoId: 10, nombre: "Sesión Presencial", Icon: MapPin, color: "bg-slate-700 shadow-slate-200" },
    { categoria: "Extras", tipo: "EvaluacionPresencial", tipoId: 11, nombre: "Ev. Presencial", Icon: Calendar, color: "bg-orange-400 shadow-orange-200" },
    { categoria: "Extras", tipo: "VideoPregunta", tipoId: 12, nombre: "Video Pregunta", Icon: Video, color: "bg-rose-400 shadow-rose-200" },
];

const TIPOID_A_TIPO = Object.fromEntries(RECURSOS_CONFIG.map(r => [r.tipoId, r.tipo]));

const CATEGORIAS = ["Actividad", "Lección", "Extras"].map(cat => ({
    categoria: cat,
    descripcion: { Actividad: "Herramientas de evaluación y participación", Lección: "Contenido teórico e interactivo", Extras: "Recursos adicionales y presenciales" }[cat],
    recursos: RECURSOS_CONFIG.filter(r => r.categoria === cat),
}));

const SelectorRecursos = ({ isOpen, onClose, onRecursoCreado, initialData = null, modoEdicion = false, tipoIdForzado = null }) => {
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);

    useEffect(() => {
        if (isOpen && tipoIdForzado && modoEdicion) {
            const tipoStr = TIPOID_A_TIPO[tipoIdForzado];
            if (tipoStr) {
                setRecursoSeleccionado({ tipo: tipoStr, tipoId: tipoIdForzado });
            }
        }
        if (!isOpen) setRecursoSeleccionado(null);
    }, [isOpen, tipoIdForzado, modoEdicion]);

    const ComponenteActivo = recursoSeleccionado ? COMPONENTES_RECURSOS[recursoSeleccionado.tipo] : null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-auto shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)]">
                {recursoSeleccionado ? (
                    <div className="h-full flex flex-col bg-slate-50">
                        <div className="flex-1 overflow-y-auto">
                            <ComponenteActivo
                                onSave={(datos) => {
                                    onRecursoCreado({
                                        titulo: datos.tituloSesion || recursoSeleccionado.nombre,
                                        ...datos,
                                        tipoId: recursoSeleccionado.tipoId,
                                    });
                                    setRecursoSeleccionado(null);
                                    onClose();
                                }}
                                onCancel={() => modoEdicion ? onClose() : setRecursoSeleccionado(null)}
                                recursoData={initialData ?? {}}
                                modoEdicion={modoEdicion}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="relative p-10 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                        ¿Qué vas a <span className="text-indigo-600">crear?</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium">Potencia tu curso con actividades dinámicas.</p>
                                </div>
                                <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-12">
                            {CATEGORIAS.map((cat, idx) => (
                                <section key={idx}>
                                    <div className="mb-6">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{cat.categoria}</h3>
                                        <p className="text-xs text-slate-400">{cat.descripcion}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {cat.recursos.map((rec) => (
                                            <button key={rec.tipoId} onClick={() => setRecursoSeleccionado(rec)}
                                                className="group relative flex flex-col p-5 bg-white border border-slate-100 rounded-[2rem] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                                                <div className={`w-14 h-14 ${rec.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                                    <rec.Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{rec.nombre}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Click para configurar</p>
                                                </div>
                                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center">
                                                        <Sparkles size={12} className="text-indigo-400" />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                        <div className="p-6 bg-indigo-50 border-t border-indigo-100 flex items-center justify-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-200" />)}
                            </div>
                            <p className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider">
                                Soporta PDF, Video, SCORM y contenido interactivo
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectorRecursos;
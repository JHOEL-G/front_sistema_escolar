import { useState, useRef, useEffect } from "react";
import { X, MapPin, Link, Calendar, Clock, Pencil, Check, Sparkles, Navigation } from "lucide-react";

export const RecursoSesionPresencial = ({ recursoData, onSave, onCancel }) => {

    const cfg = recursoData?.configuracion || {};

    const fechaSesion = cfg.FechaSesion || cfg.fechaSesion || "";
    const fechaParte = fechaSesion ? fechaSesion.split("T")[0] : "";
    const horaParte = fechaSesion ? fechaSesion.split("T")[1]?.substring(0, 5) : "";

    const horaFinParte = (() => {
        if (cfg.HoraFin || cfg.horaFin) return (cfg.HoraFin || cfg.horaFin).substring(0, 5);
        if (!horaParte || !(cfg.Duracion || cfg.duracion)) return "";
        const [h, m] = horaParte.split(":").map(Number);
        const totalMin = h * 60 + m + (cfg.Duracion || cfg.duracion || 0);
        return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
    })();

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: cfg.Descripcion || cfg.descripcion || "",
        ubicacion: cfg.Lugar || cfg.lugar || "",
        direccion: cfg.Direccion || cfg.direccion || "",
        fecha: fechaParte,
        horaInicio: horaParte,
        horaFin: horaFinParte,
        instrucciones: cfg.Instrucciones || cfg.instrucciones || ""
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
        if (!formData.ubicacion.trim()) { alert("La ubicación es obligatoria"); return; }
        onSave({
            titulo: formData.tituloSesion,
            tipoId: 10,
            configuracion: {
                FechaSesion: formData.fecha && formData.horaInicio
                    ? `${formData.fecha}T${formData.horaInicio}:00`
                    : null,
                Lugar: formData.ubicacion,
                Duracion: formData.horaInicio && formData.horaFin
                    ? calcularDuracionMinutos(formData.horaInicio, formData.horaFin)
                    : 0,
                Instrucciones: formData.instrucciones,
                Direccion: formData.direccion,
            },
            descripcion: formData.descripcionSesion
        });
    };

    const calcularDuracionMinutos = (inicio, fin) => {
        const [h1, m1] = inicio.split(':').map(Number);
        const [h2, m2] = fin.split(':').map(Number);
        return (h2 * 60 + m2) - (h1 * 60 + m1);
    };
    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">

            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-700 shadow-lg shadow-slate-300 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                                        placeholder="Nombre de la sesión presencial..."
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
                                            : <><span className="text-slate-300">Configuracion Sesión </span><span className="text-slate-700">Presencial</span></>
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
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ubicación</h3>
                        <p className="text-xs text-slate-400">Lugar donde se realizará la sesión</p>
                    </div>
                    <div className="space-y-3">
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                            <input
                                type="text"
                                value={formData.ubicacion}
                                onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                                placeholder="Nombre del lugar (ej. Auditorio principal)..."
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            />
                        </div>
                        <div className="relative">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                            <input
                                type="text"
                                value={formData.direccion}
                                onChange={(e) => handleInputChange("direccion", e.target.value)}
                                placeholder="Dirección completa..."
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Programación</h3>
                        <p className="text-xs text-slate-400">Fecha y horario de la sesión</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 border-2 border-slate-100 bg-white rounded-[1.5rem] hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={13} className="text-slate-400" strokeWidth={2.5} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Fecha</p>
                            </div>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={(e) => handleInputChange("fecha", e.target.value)}
                                className="w-full text-base font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-1 transition-colors"
                            />
                        </div>

                        <div className="p-5 border-2 border-slate-100 bg-white rounded-[1.5rem] hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={13} className="text-slate-400" strokeWidth={2.5} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Hora inicio</p>
                            </div>
                            <input
                                type="time"
                                value={formData.horaInicio}
                                onChange={(e) => handleInputChange("horaInicio", e.target.value)}
                                className="w-full text-base font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-1 transition-colors"
                            />
                        </div>

                        <div className="p-5 border-2 border-slate-100 bg-white rounded-[1.5rem] hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={13} className="text-slate-400" strokeWidth={2.5} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Hora fin</p>
                            </div>
                            <input
                                type="time"
                                value={formData.horaFin}
                                onChange={(e) => handleInputChange("horaFin", e.target.value)}
                                className="w-full text-base font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-1 transition-colors"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Instrucciones adicionales</h3>
                        <p className="text-xs text-slate-400">Indicaciones opcionales para los participantes</p>
                    </div>
                    <textarea
                        value={formData.instrucciones}
                        onChange={(e) => handleInputChange("instrucciones", e.target.value)}
                        placeholder="Ej. Traer laptop, llegar 10 minutos antes, estacionamiento disponible..."
                        className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                        rows={3}
                    />
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">
                    Cancelar
                </button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                    <Sparkles size={14} />
                    Guardar sesión presencial
                </button>
            </div>

        </div>
    );
};
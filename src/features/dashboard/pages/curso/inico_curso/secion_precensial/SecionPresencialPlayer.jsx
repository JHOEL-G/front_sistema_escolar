import { MapPin, Clock, Calendar, ExternalLink } from 'lucide-react';

const formatFecha = (f) => f.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const formatHora = (f) => f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
const formatDuracion = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}`.trim() : `${m} min`;
};

const SesionPresencialPlayer = ({ dataJson, titulo }) => {
    const fecha = dataJson?.fechaSesion ? new Date(dataJson.fechaSesion) : null;
    const duracionMin = dataJson?.duracion;
    const lugar = dataJson?.lugar;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-emerald-100">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="p-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <MapPin size={30} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Sesión Presencial</p>
                        <h3 className="text-2xl font-black text-slate-900">{titulo}</h3>
                    </div>
                </div>

                {/* Tarjeta de fecha */}
                {fecha && (
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 p-8 mb-6">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl" />
                        </div>
                        <div className="relative flex items-center gap-8">
                            <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 flex-shrink-0">
                                <span className="text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-1">
                                    {fecha.toLocaleDateString('es-PE', { month: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-white text-5xl font-black leading-none">
                                    {fecha.getDate()}
                                </span>
                                <span className="text-white/50 text-[10px] font-bold mt-1">
                                    {fecha.toLocaleDateString('es-PE', { weekday: 'short' }).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">Próxima sesión</span>
                                </div>
                                <p className="text-white text-lg font-black leading-tight">
                                    {formatFecha(fecha)}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-white/40" />
                                        <span className="text-white/70 text-sm font-bold">{formatHora(fecha)}</span>
                                    </div>
                                    {duracionMin && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="text-white/50 text-sm font-medium">{formatDuracion(duracionMin)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid de info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lugar && (
                        <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPin size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Lugar</p>
                                <p className="text-sm font-bold text-slate-800">{lugar}</p>
                            </div>
                        </div>
                    )}
                    {duracionMin && (
                        <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Duración</p>
                                <p className="text-sm font-bold text-slate-800">{formatDuracion(duracionMin)}</p>
                            </div>
                        </div>
                    )}
                    {fecha && (
                        <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Calendar size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Hora de inicio</p>
                                <p className="text-sm font-bold text-slate-800">{formatHora(fecha)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón Maps */}
                {lugar && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-200 text-sm uppercase tracking-widest"
                    >
                        <MapPin size={18} /> Ver ubicación en Maps
                        <ExternalLink size={14} className="opacity-70" />
                    </a>
                )}
            </div>
        </div>
    );
};

export default SesionPresencialPlayer;
import { useNavigate } from "react-router-dom";
import { Bell, X, ChevronRight, AlertCircle, Info, GraduationCap, CheckCheck, Trash2 } from "lucide-react";

const iconMap = {
    NOT_GLOBAL: <AlertCircle size={16} className="text-indigo-500" />,
    NOT_ANUNCIOS: <Info size={16} className="text-blue-500" />,
    NOT_CHAT: <Info size={16} className="text-violet-500" />,
    NOT_CAPACITACION_MASTER: <GraduationCap size={16} className="text-emerald-500" />,
    NOT_CERTIFICADOS: <CheckCheck size={16} className="text-amber-500" />,
    NOT_RECORDATORIOS: <Bell size={16} className="text-rose-500" />,
    NOT_ASIGNACIONES: <GraduationCap size={16} className="text-cyan-500" />,
    NOT_FEEDBACK: <Info size={16} className="text-orange-500" />,
};

const NotificationsPanel = ({ darkMode, onClose, notificaciones, noLeidas, loading, onMarcarLeida, onVaciar }) => {
    const navigate = useNavigate();

    return (
        <div className={`w-[450px] rounded-3xl border shadow-2xl overflow-hidden
            ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>

            <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <Bell size={18} className="text-indigo-500" />
                    <span className="text-base font-black uppercase tracking-widest">Notificaciones</span>
                </div>
                <div className="flex items-center gap-2">
                    {noLeidas > 0 && (
                        <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-full">
                            {noLeidas} nuevas
                        </span>
                    )}
                    {notificaciones.length > 0 && (
                        <button
                            onClick={onVaciar}
                            title="Vaciar notificaciones"
                            className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-white/10 text-white/50 hover:text-rose-400' : 'hover:bg-slate-100 text-slate-400 hover:text-rose-500'}`}>
                            <Trash2 size={16} />
                        </button>
                    )}
                    <button onClick={onClose} className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`h-16 rounded-2xl animate-pulse ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                ) : notificaciones.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <Bell size={40} className="opacity-30" />
                        <p className="text-sm font-bold">Sin notificaciones nuevas</p>
                    </div>
                ) : (
                    <div className="p-5 space-y-3">
                        {notificaciones.map(n => (
                            <div
                                key={n.notificacionId}
                                onClick={() => onMarcarLeida(n.notificacionId)}
                                className={`flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all cursor-pointer
                                    ${!n.leida
                                        ? darkMode
                                            ? 'bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20'
                                            : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                                        : darkMode
                                            ? 'bg-white/5 border-white/5 opacity-50 hover:opacity-70'
                                            : 'bg-slate-50 border-slate-100 opacity-50 hover:opacity-70'
                                    }`}>
                                <div className="shrink-0 mt-0.5 p-2 rounded-xl bg-white/10 relative">
                                    {iconMap[n.tipo] ?? <Bell size={16} className="text-slate-400" />}
                                    {n.contador > 1 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                            {n.contador > 9 ? '9+' : n.contador}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black">{n.mensaje}</p>
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>
                                        {new Date(n.fechaCreacion).toLocaleDateString('es-MX', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {!n.leida && (
                                    <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={`px-6 py-4 border-t ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                    onClick={() => { navigate('/configuracion_notificaciones'); onClose(); }}
                    className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                    Gestionar notificaciones <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;
import { X } from "lucide-react";
import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { User } from "lucide-react";
import { Info } from "lucide-react";
import { Settings } from "lucide-react";
import { ChevronRight } from "lucide-react";

const LaunchPanel = ({ darkMode, onClose }) => {
    const navigate = useNavigate();

    const actions = [
        { label: 'Nuevo curso', desc: 'Crea y publica un curso', icon: GraduationCap, color: 'bg-indigo-600', path: '/curso' },
        { label: 'Nueva ruta', desc: 'Diseña una ruta de aprendizaje', icon: Rocket, color: 'bg-violet-600', path: '/ruta_aprendizaje' },
        { label: 'Gestionar usuarios', desc: 'Administra tu equipo', icon: User, color: 'bg-blue-600', path: '/usuarios' },
        { label: 'Ver reportes', desc: 'Analiza el progreso', icon: Info, color: 'bg-emerald-600', path: '/resportes_tabla' },
        { label: 'Configuración', desc: 'Ajusta preferencias', icon: Settings, color: 'bg-amber-600', path: '/configuracion' },
    ];

    return (
        <div className={`w-72 rounded-3xl border shadow-2xl overflow-hidden
            ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>

            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                    <Rocket size={16} className="text-indigo-500" />
                    <span className="text-sm font-black uppercase tracking-widest">Acciones rápidas</span>
                </div>
                <button onClick={onClose} className={`p-1.5 rounded-xl transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <X size={14} />
                </button>
            </div>

            <div className="p-4 space-y-2">
                {actions.map((a, i) => (
                    <button
                        key={i}
                        onClick={() => { navigate(a.path); onClose(); }}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group
                            ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                        <div className={`w-10 h-10 ${a.color} rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0`}>
                            <a.icon size={18} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-black">{a.label}</p>
                            <p className={`text-[10px] font-medium ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>{a.desc}</p>
                        </div>
                        <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-white/50' : 'text-slate-400'}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LaunchPanel;

import { HelpCircle } from "lucide-react";
import { X } from "lucide-react";
import { ExternalLink } from "lucide-react";

const HelpPanel = ({ darkMode, onClose }) => {
    const faqs = [
        { q: '¿Cómo creo un curso?', a: 'Ve a Cursos → Nuevo curso y completa el formulario.' },
        { q: '¿Cómo inscribo usuarios?', a: 'Desde la ficha del curso, usa el botón "Inscribir participantes".' },
        { q: '¿Cómo genero un reporte?', a: 'En Reportes, filtra por curso o ruta y pulsa "Exportar".' },
        { q: '¿Cómo configuro alertas?', a: 'Ve a Configuración → Notificaciones y activa las que necesitas.' },
    ];

    return (
        <div className={`w-80 rounded-3xl border shadow-2xl overflow-hidden
            ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>

            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-500" />
                    <span className="text-sm font-black uppercase tracking-widest">Ayuda rápida</span>
                </div>
                <button onClick={onClose} className={`p-1.5 rounded-xl transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <X size={14} />
                </button>
            </div>

            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {faqs.map((f, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-xs font-black mb-1">{f.q}</p>
                        <p className={`text-[11px] leading-relaxed font-medium ${darkMode ? 'text-white/50' : 'text-slate-400'}`}>{f.a}</p>
                    </div>
                ))}
            </div>

            <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                    onClick={() => window.open('/Guía de Usuario.pdf', '_blank')}
                    className="w-full flex items-center justify-between py-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                    Ver documentación completa <ExternalLink size={13} />
                </button>
            </div>
        </div>
    );
};

export default HelpPanel;

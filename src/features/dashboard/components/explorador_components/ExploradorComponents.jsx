import { Bookmark } from "lucide-react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const CheckboxItem = ({ label, onChange }) => {
    const [checked, setChecked] = useState(false);

    const handleToggle = () => {
        const next = !checked;
        setChecked(next);
        onChange?.(next);
    };

    return (
        <label
            onClick={handleToggle}
            className="flex items-center space-x-3 cursor-pointer group"
        >
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
                ${checked ? 'border-indigo-500 bg-indigo-500' : 'border-gray-200 group-hover:border-indigo-400'}`}>
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className={`text-sm font-medium transition-colors ${checked ? 'text-indigo-600' : 'text-gray-600'}`}>
                {label}
            </span>
        </label>
    );
};

export const CourseCard = ({ course, darkMode, temas }) => {
    const navigate = useNavigate();

    const handleClick = () => navigate(`/intro_curso/${course.id}`);

    const generateUniqueImageUrl = () => {
        if (course.image && course.image !== "https://picsum.photos/400/225?grayscale") return course.image;
        const seed = `${course.id}-${course.title.replace(/\s+/g, '-')}`;
        return `https://picsum.photos/seed/${seed}/400/225`;
    };

    const generateFallbackImage = () => {
        const hash = course.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const styles = ['shapes', 'identicon', 'bottts', 'avataaars', 'rings'];
        return `https://api.dicebear.com/7.x/${styles[hash % styles.length]}/svg?seed=${encodeURIComponent(course.title)}-${course.id}`;
    };

    const resolverNombreTema = (tema) => {
        const found = temas.find(t => t.temaId === tema.temaId);
        return found?.nombreTema || `Tema ${tema.temaId}`;
    };


    return (
        <div
            className={`rounded-[2rem] shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer ${darkMode ? "bg-slate-800 border-slate-700 shadow-emerald-900/10" : "bg-white border-slate-100 shadow-slate-200/50"
                }`}
            onClick={handleClick}
        >
            <div className="relative h-44 overflow-hidden bg-emerald-50">
                <img
                    src={generateUniqueImageUrl()}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = generateFallbackImage(); }}
                />

                <div className="absolute inset-0 pointer-events-none">
                    <svg viewBox="0 0 200 200" className="w-full h-full opacity-60 transition-opacity group-hover:opacity-80">
                        <path d="M150 0 L200 0 L200 120 L120 200 L0 200 L0 150 Z" fill="white" fillOpacity="0.15" />
                        <rect x="140" y="-20" width="20" height="100" fill="#10b981" transform="rotate(35)" className="opacity-80" />
                        <rect x="170" y="20" width="20" height="80" fill="#06b6d4" transform="rotate(35)" className="opacity-70" />
                        <path d="M170 120 L190 140 L170 160" stroke="#a3e635" strokeWidth="8" fill="none" />
                    </svg>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-lg border border-white/50">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-slate-700">{course.rating}</span>
                </div>

                <div className="absolute top-4 left-4 w-11 h-11">
                    <div className="w-full h-full rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-xl italic shadow-inner">
                        U
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                    {course.gamificacion && (
                        <span className="bg-amber-400/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow">
                            🎮 Gamificado
                        </span>
                    )}
                    {course.inscripcionAutomatica && (
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow">
                            ⚡ Auto
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Universidad Confía
                        </span>
                    </div>
                    <Bookmark className="w-4 h-4 text-slate-300 hover:text-emerald-500 hover:fill-emerald-500 transition-all cursor-pointer" />
                </div>

                <h4 className={`text-[14px] font-black leading-tight mb-2 h-10 line-clamp-2 transition-colors ${darkMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-emerald-600'
                    }`}>
                    {course.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                    {course.description}
                </p>

                {course.temas?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {course.temas.slice(0, 2).map((tema, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-wide">
                                {resolverNombreTema(tema)}
                            </span>
                        ))}
                        {course.temas.length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-black rounded-lg">
                                +{course.temas.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {course.evaluadores?.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Evaluadores:</span>
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-500 text-[9px] font-black rounded-lg">
                            {course.evaluadores.length} asignado{course.evaluadores.length > 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                <div className={`pt-4 border-t flex flex-col space-y-1 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
                        Información general
                    </span>
                    <div className={`text-[11px] font-bold flex items-center gap-1 flex-wrap ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span>{course.type}</span>
                        <span className="opacity-30">•</span>
                        <span>{course.duration}</span>
                        {!course.permitirDesinscripcion && (
                            <>
                                <span className="opacity-30">•</span>
                                <span className="text-rose-400 text-[9px] font-black uppercase">Sin baja</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
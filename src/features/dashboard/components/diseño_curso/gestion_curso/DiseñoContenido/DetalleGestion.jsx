import {
    Trash2, GripVertical, Video, Plus, MessageSquare,
    FileCheck, PenTool, BookOpen, Monitor, Sparkles,
    Code, Dices, ClipboardList, MapPin, Calendar,
} from "lucide-react";

const getIconoRecurso = (tipoId) => {
    const iconos = {
        1: <FileCheck size={18} />, 2: <MessageSquare size={18} />,
        3: <PenTool size={18} />, 4: <Video size={18} />,
        5: <BookOpen size={18} />, 6: <Monitor size={18} />,
        7: <Dices size={18} />, 8: <Code size={18} />,
        9: <ClipboardList size={18} />, 10: <MapPin size={18} />,
        11: <Calendar size={18} />, 12: <Video size={18} />,
    };
    return iconos[tipoId] ?? <Sparkles size={18} />;
};

const TIPO_COLOR = {
    1: "#F59E0B", 2: "#38BDF8", 3: "#34D399", 4: "#F87171",
    5: "#818CF8", 6: "#3B82F6", 7: "#F472B6", 8: "#A78BFA",
    9: "#FBBF24", 10: "#64748B", 11: "#FB923C", 12: "#F87171",
};

const TIPO_NOMBRE = {
    1: "Evaluación", 2: "Foro", 3: "Tarea", 4: "Video",
    5: "Lectura", 6: "Zoom", 7: "Embebido", 8: "SCORM",
    9: "Encuesta", 10: "Sesión Presencial", 11: "Ev. Presencial", 12: "Video Pregunta",
};


export const RecursoRow = ({ recurso, index, onEditar, onEliminar }) => {
    const color = TIPO_COLOR[recurso.tipoId] ?? "#818CF8";
    const nombre = TIPO_NOMBRE[recurso.tipoId] ?? "Recurso";

    return (
        <div
            onClick={onEditar}
            className="group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
            style={{
                background: "rgba(16, 185, 129, 0.03)",
                border: "1px solid rgba(16, 185, 129, 0.08)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.07)";
                e.currentTarget.style.border = "1px solid rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.03)";
                e.currentTarget.style.border = "1px solid rgba(16, 185, 129, 0.08)";
            }}
        >
            <div
                className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}
            />

            <div className="p-0.5 text-emerald-900/40">
                <GripVertical size={14} />
            </div>

            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                style={{
                    background: `${color}15`,
                    border: `1px solid ${color}35`,
                    color,
                    boxShadow: `0 0 12px ${color}15`,
                }}
            >
                {getIconoRecurso(recurso.tipoId)}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold truncate" style={{ color: "#d1fae5" }}>
                    {recurso.tituloSesion}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className="text-[9px] font-black uppercase tracking-wider"
                        style={{ color }}
                    >
                        {nombre}
                    </span>
                    {recurso.incluirEnPonderacion && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{
                                color: "#fbbf24",
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.2)"
                            }}>
                            Ponderable
                        </span>
                    )}
                    {recurso.archivoReal && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{
                                color: "#34d399",
                                background: "rgba(52,211,153,0.1)",
                                border: "1px solid rgba(52,211,153,0.2)"
                            }}>
                            Archivo adjunto
                        </span>
                    )}
                </div>
            </div>

            <span className="hidden group-hover:flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                style={{ color: "rgba(52,211,153,0.5)" }}>
                <PenTool size={10} /> Editar
            </span>

            <button
                onClick={(e) => { e.stopPropagation(); onEliminar(); }}
                className="p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                style={{ color: "rgba(148,163,184,0.4)" }}
                onMouseEnter={e => {
                    e.currentTarget.style.color = "#f87171";
                    e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.color = "rgba(148,163,184,0.4)";
                    e.currentTarget.style.background = "transparent";
                }}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};


export const ModuloCard = ({
    modulo, index, isNew = false,
    onAgregarRecurso, onEditarRecurso, onEliminarRecurso, onEliminarModulo
}) => (
    <div
        className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
            background: isNew
                ? "linear-gradient(135deg, rgba(6,78,59,0.15) 0%, rgba(4,120,87,0.08) 100%)"
                : "linear-gradient(135deg, rgba(6,47,37,0.6) 0%, rgba(3,36,28,0.8) 100%)",
            border: isNew
                ? "1px solid rgba(16,185,129,0.25)"
                : "1px solid rgba(16,185,129,0.1)",
            boxShadow: isNew
                ? "0 0 30px rgba(16,185,129,0.06), inset 0 1px 0 rgba(16,185,129,0.08)"
                : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(16,185,129,0.05)",
        }}
    >
        <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}
        >
            <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                style={isNew ? {
                    background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))",
                    border: "1px solid rgba(16,185,129,0.4)",
                    color: "#6ee7b7",
                    boxShadow: "0 0 12px rgba(16,185,129,0.2)",
                } : {
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.15)",
                    color: "#34d399",
                }}
            >
                {index + 1}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3
                        className="text-sm font-black truncate"
                        style={{ color: "#ecfdf5" }}
                    >
                        {modulo.moduloTitulo || modulo.tituloModulo || `Módulo ${index + 1}`}
                    </h3>
                    {isNew && (
                        <span
                            className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                                color: "#6ee7b7",
                                background: "rgba(16,185,129,0.12)",
                                border: "1px solid rgba(16,185,129,0.25)",
                                boxShadow: "0 0 8px rgba(16,185,129,0.1)",
                            }}
                        >
                            ✦ Nuevo
                        </span>
                    )}
                </div>
                {modulo.descripcion && (
                    <p
                        className="text-[10px] truncate mt-0.5"
                        style={{ color: "rgba(52,211,153,0.45)" }}
                    >
                        {modulo.descripcion}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <span
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg"
                    style={{
                        color: "rgba(52,211,153,0.5)",
                        background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.1)",
                    }}
                >
                    {modulo.recursos.length} rec.
                </span>
                {isNew && onEliminarModulo && (
                    <button
                        onClick={onEliminarModulo}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        style={{ color: "rgba(148,163,184,0.35)" }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = "#f87171";
                            e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = "rgba(148,163,184,0.35)";
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>

        <div className="px-4 py-3 space-y-2">
            {modulo.recursos.map((rec, rIdx) => (
                <RecursoRow
                    key={rec.id}
                    recurso={rec}
                    index={rIdx}
                    onEditar={(e) => onEditarRecurso(rec, e)}
                    onEliminar={() => onEliminarRecurso(rec.id)}
                />
            ))}

            <button
                onClick={onAgregarRecurso}
                className="group w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-200"
                style={{
                    border: "1px dashed rgba(16,185,129,0.15)",
                    color: "rgba(52,211,153,0.35)",
                    background: "transparent",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.border = "1px dashed rgba(16,185,129,0.4)";
                    e.currentTarget.style.color = "#34d399";
                    e.currentTarget.style.background = "rgba(16,185,129,0.04)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.border = "1px dashed rgba(16,185,129,0.15)";
                    e.currentTarget.style.color = "rgba(52,211,153,0.35)";
                    e.currentTarget.style.background = "transparent";
                }}
            >
                <Plus
                    size={13}
                    className="transition-transform duration-300 group-hover:rotate-90"
                />
                Añadir recurso
            </button>
        </div>
    </div>
);
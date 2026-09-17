import { Star, CheckCircle2 } from "lucide-react";

export const getPaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export const StarRating = ({ rating, size = 16 }) => (
    <div
        className="flex items-center gap-1"
        role="img"
        aria-label={`Calificación de ${rating} sobre 5 estrellas`}
    >
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={size}
                className={`transition-colors duration-300 ${i < rating
                    ? "fill-purple-600 text-purple-600 drop-shadow-sm"
                    : "fill-slate-100 text-slate-200"
                    }`}
            />
        ))}
    </div>
);

export const Header = ({ nombreCurso }) => (
    <header className="mb-1 select-none border-slate-100 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">

            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <span className="text-xs font-bold tracking-widest text-purple-600 uppercase">
                    Gestión de Curso
                </span>
                {nombreCurso ? (
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight leading-tight">
                        {nombreCurso}
                    </h1>
                ) : (
                    <div className="h-10 w-3/4 sm:w-80 bg-slate-200 animate-pulse rounded-md"></div>
                )}
            </div>

            <button
                type="button"
                className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full overflow-hidden transition-all duration-300 hover:bg-purple-600 hover:shadow-[0_8px_30px_rgb(147,51,234,0.25)] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 active:scale-95"
            >
                <CheckCircle2
                    size={16}
                    className="transition-transform duration-300 group-hover:scale-110"
                />
                <span>Finalización Masiva</span>
            </button>

        </div>
    </header>
);
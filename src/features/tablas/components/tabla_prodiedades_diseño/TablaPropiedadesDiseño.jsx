import { ToggleLeft } from "lucide-react";
import { ToggleRight } from "lucide-react";

export const getPaginationRange = (current, total) => {
    const range = [];
    for (let i = 1; i <= total; i++) range.push(i);
    return range;
};

export const StatusBadge = ({ active }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all ${active
        ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
        : 'bg-slate-50 border-slate-100 text-slate-400'
        }`}>
        {active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        {active ? 'Activado' : 'Desactivado'}
    </div>
);
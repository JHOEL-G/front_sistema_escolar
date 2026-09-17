import React, { useState } from "react";
import { X } from "lucide-react";

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAYS_ES = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

function formatDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function CalendarMonth({ year, month, selectedDate, onSelectDay, onNavMonth, onOpenPicker, side }) {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    return (
        <div className="flex-1 px-3 py-2">
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => onNavMonth(side, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 transition">
                    ‹
                </button>
                <button onClick={() => onOpenPicker(side)}
                    className="text-sm font-bold text-slate-700 hover:bg-slate-50 px-2 py-1 rounded-lg capitalize transition">
                    {MONTHS_ES[month]} {year}
                </button>
                <button onClick={() => onNavMonth(side, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 transition">
                    ›
                </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
                {DAYS_ES.map(d => (
                    <span key={d} className="text-center text-[10px] font-bold text-slate-300 py-1">{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {[...Array(offset)].map((_, i) => <div key={`e-${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const ds = formatDate(year, month, day);
                    const isSel = selectedDate === ds;
                    const isTod = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                    return (
                        <button key={day} onClick={() => onSelectDay(ds)}
                            className={`h-8 w-full rounded-lg text-xs font-medium transition-all
                ${isSel ? 'bg-purple-600 text-white' : isTod ? 'text-purple-600 font-bold hover:bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const DatePickerModal = ({ isOpen, onClose, onApply }) => {
    const today = new Date();
    const [leftYear, setLeftYear] = useState(today.getFullYear());
    const [leftMonth, setLeftMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);
    const [view, setView] = useState('calendar'); // 'calendar' | 'picker'
    const [editingSide, setEditingSide] = useState(null);
    const [pickerYear, setPickerYear] = useState(today.getFullYear());

    const rightMonth = leftMonth + 1 > 11 ? 0 : leftMonth + 1;
    const rightYear = leftMonth + 1 > 11 ? leftYear + 1 : leftYear;

    const navMonth = (side, dir) => {
        setLeftMonth(prev => {
            let m = prev + (side === 'left' ? dir : dir);
            let y = leftYear;
            if (m > 11) { m = 0; setLeftYear(y + 1); }
            if (m < 0) { m = 11; setLeftYear(y - 1); }
            return m;
        });
    };

    const openPicker = (side) => {
        setEditingSide(side);
        setPickerYear(side === 'left' ? leftYear : rightYear);
        setView('picker');
    };

    const selectMonth = (m) => {
        if (editingSide === 'left') setLeftMonth(m);
        else setLeftMonth(m - 1 < 0 ? 11 : m - 1);
        setView('calendar');
    };

    const formattedDate = selectedDate
        ? new Date(...selectedDate.split('-').map((v, i) => i === 1 ? +v - 1 : +v))
            .toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-[1.75rem] shadow-2xl overflow-hidden">

                <div className="flex justify-between items-center px-6 pt-5 pb-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrar por fecha</p>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 transition">
                        <X size={15} />
                    </button>
                </div>

                {view === 'calendar' && (
                    <div className="flex divide-x divide-slate-100 px-3 pb-2 pt-1">
                        <CalendarMonth year={leftYear} month={leftMonth} selectedDate={selectedDate}
                            onSelectDay={setSelectedDate} onNavMonth={navMonth} onOpenPicker={openPicker} side="left" />
                        <CalendarMonth year={rightYear} month={rightMonth} selectedDate={selectedDate}
                            onSelectDay={setSelectedDate} onNavMonth={navMonth} onOpenPicker={openPicker} side="right" />
                    </div>
                )}

                {view === 'picker' && (
                    <div className="px-6 pb-2 pt-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Año</p>
                        <div className="grid grid-cols-5 gap-1 mb-4">
                            {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 4 + i).map(y => (
                                <button key={y} onClick={() => setPickerYear(y)}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition border
                    ${pickerYear === y ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                                    {y}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mes</p>
                        <div className="grid grid-cols-4 gap-1">
                            {MONTHS_ES.map((mn, i) => (
                                <button key={i} onClick={() => selectMonth(i)}
                                    className="py-1.5 rounded-lg text-xs font-bold border border-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition capitalize">
                                    {mn.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 px-6 pb-5 pt-3 border-t border-slate-100 mt-2">
                    <button onClick={() => { setSelectedDate(null); onApply(null); onClose(); }}
                        className="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition">
                        Limpiar
                    </button>
                    <button onClick={() => { onApply(selectedDate); onClose(); }}
                        className="flex-1 py-2.5 rounded-2xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                        Aplicar filtro
                    </button>
                </div>
            </div>
        </div>
    );
};
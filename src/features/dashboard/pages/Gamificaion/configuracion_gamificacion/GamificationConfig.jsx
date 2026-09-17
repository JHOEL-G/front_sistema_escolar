import React, { useState } from 'react';
import {
    Info, ChevronUp, Wand2, Bold, Italic,
    List, Link, Sparkles, BookOpen, Route,
    Save, X
} from 'lucide-react';

const GamificationConfig = () => {
    return (
        <div className="min-h-full font-sans text-slate-700 p-6">
            <div className="max-w-full mx-auto space-y-10">

                <header className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Políticas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Configuración</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Personaliza las reglas de puntuación y redención de tu ecosistema de aprendizaje.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-8">

                    <SectionCard
                        icon={<BookOpen className="text-indigo-600" size={22} />}
                        title="Puntajes por Cursos"
                        description="Ajusta la recompensa según la complejidad y el tiempo invertido en cada unidad educativa."
                    >
                        <PointsTable
                            headers={['Nivel de Horas', 'Baja', 'Media', 'Avanzada', 'Experto', 'Estado']}
                            rows={[
                                { label: 'Micro ( < 1h )', values: [5, 6, 7, 8], count: '19 Activos' },
                                { label: 'Corto ( 1-3h )', values: [10, 11, 13, 16], count: '38 Activos' },
                                { label: 'Medio ( 3-8h )', values: [20, 22, 25, 29], count: '11 Activos' },
                                { label: 'Largo ( 8-16h )', values: [40, 44, 50, 55], count: '0 Activos' },
                            ]}
                        />
                    </SectionCard>

                    <SectionCard
                        icon={<Route className="text-violet-600" size={22} />}
                        title="Estructura de Rutas"
                        description="Bonificaciones adicionales por completar rutas de aprendizaje compuestas."
                    >
                        <PointsTable
                            headers={['Duración', '1-2 Cursos', '3-5 Cursos', '6-10 Cursos', '10+ Cursos', 'Estado']}
                            rows={[
                                { label: 'Ruta Micro', values: [5, 10, 15, 20], count: '6 Activos' },
                                { label: 'Ruta Corta', values: [25, 30, 35, 40], count: '7 Activos' },
                                { label: 'Ruta Media', values: [45, 50, 55, 60], count: '1 Activos' },
                            ]}
                        />
                    </SectionCard>

                    <SectionCard
                        icon={<Sparkles className="text-amber-500" size={22} />}
                        title="Políticas de Redención"
                        description="Define las reglas claras para que tus colaboradores canjeen sus puntos acumulados."
                        isSpecial
                    >
                        <div className="mt-6 border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all">
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex gap-1">
                                    <EditorBtn icon={<Bold size={18} />} />
                                    <EditorBtn icon={<Italic size={18} />} />
                                    <div className="w-px h-6 bg-slate-200 mx-2" />
                                    <EditorBtn icon={<List size={18} />} />
                                    <EditorBtn icon={<Link size={18} />} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Smart Editor</span>
                                    <Wand2 size={16} className="text-indigo-400" />
                                </div>
                            </div>
                            <textarea
                                className="w-full p-8 min-h-[180px] outline-none text-slate-600 text-lg leading-relaxed placeholder:text-slate-300 resize-none"
                                placeholder="Escribe las reglas aquí... ej: 'Los puntos expiran cada 12 meses'."
                            />
                        </div>
                    </SectionCard>
                </div>

                <footer className="pt-10 pb-16 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold text-slate-900">Configuración de Gamificación v2.4</p>
                            <p className="text-xs text-slate-400 font-medium">Los cambios se aplicarán a todos los usuarios activos inmediatamente.</p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                                <X size={18} /> Cancelar
                            </button>
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};


const SectionCard = ({ title, description, children, icon, isSpecial }) => (
    <div className={`group bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 relative overflow-hidden ${isSpecial ? 'ring-2 ring-indigo-50/50' : ''}`}>
        <div className="flex justify-between items-start mb-10">
            <div className="flex gap-5">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mt-1">{description}</p>
                </div>
            </div>
            <button className="p-2 text-slate-300 hover:bg-slate-50 rounded-full transition-all">
                <ChevronUp size={24} />
            </button>
        </div>

        {children}

        <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Módulo activo</span>
            </div>
            <ToggleSwitch />
        </div>
    </div>
);

const PointsTable = ({ headers, rows }) => (
    <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-slate-50/50 p-2">
        <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx} className="bg-white group transition-all duration-300 hover:shadow-sm">
                        <td className="px-6 py-5 rounded-l-2xl text-sm font-bold text-slate-700 border-y border-l border-slate-50">
                            <div className="flex items-center gap-2">
                                {row.label}
                                <Info size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </td>
                        {row.values.map((val, vIdx) => (
                            <td key={vIdx} className="px-6 py-4 border-y border-slate-50">
                                <input
                                    type="number"
                                    defaultValue={val}
                                    className="w-16 bg-slate-50 border border-transparent rounded-xl px-3 py-2 text-sm font-bold text-indigo-600 outline-none focus:bg-white focus:border-indigo-300 transition-all"
                                />
                            </td>
                        ))}
                        <td className="px-6 py-4 rounded-r-2xl border-y border-r border-slate-50">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-400 uppercase tracking-tighter">
                                {row.count}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ToggleSwitch = () => {
    const [enabled, setEnabled] = useState(true);
    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className="flex items-center gap-4 group"
        >
            <span className={`text-[10px] font-black uppercase tracking-widest ${enabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                {enabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
            <div className={`w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 bg-white w-5 h-5 rounded-full transition-all duration-500 shadow-sm ${enabled ? 'left-6' : 'left-1'}`} />
            </div>
        </button>
    );
};

const EditorBtn = ({ icon }) => (
    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
        {icon}
    </button>
);

export default GamificationConfig;
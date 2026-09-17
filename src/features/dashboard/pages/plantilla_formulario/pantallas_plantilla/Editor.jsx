import React from "react";
import {
    Plus, Trash2, AlignLeft, AlignJustify, List,
    Eye, Save, ChevronLeft, Loader2, GripVertical,
    CheckSquare, Star, Calendar, BarChart2, MoveVertical
} from "lucide-react";

const TIPOS = {
    text: { label: 'Texto corto', icon: AlignLeft, bg: 'bg-blue-50 text-blue-600 border-blue-100' },
    textarea: { label: 'Párrafo', icon: AlignJustify, bg: 'bg-violet-50 text-violet-600 border-violet-100' },
    radio: { label: 'Opción única', icon: List, bg: 'bg-amber-50 text-amber-600 border-amber-100' },
    checkbox: { label: 'Múltiple', icon: CheckSquare, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    rating: { label: 'Escala', icon: BarChart2, bg: 'bg-pink-50 text-pink-600 border-pink-100' },
    stars: { label: 'Estrellas', icon: Star, bg: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    ranking: { label: 'Ordenamiento', icon: MoveVertical, bg: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    fecha: { label: 'Fecha', icon: Calendar, bg: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const TypeBadge = ({ type }) => {
    const { label, icon: Icon, bg } = TIPOS[type] || TIPOS.text;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight border ${bg}`}>
            <Icon size={12} /> {label}
        </span>
    );
};


const PreviewRadio = ({ q, updateQuestion }) => (
    <div className="space-y-3 pl-11">
        {(q.options || []).map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-3 group/opt">
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-slate-50 shrink-0" />
                <input
                    className="flex-1 text-sm text-slate-600 focus:outline-none border-b border-transparent focus:border-indigo-400 py-1 transition-all"
                    value={opt}
                    placeholder={`Opción ${oIdx + 1}`}
                    onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oIdx] = e.target.value;
                        updateQuestion(q.id, 'options', newOpts);
                    }}
                />
                {q.options.length > 1 && (
                    <button onClick={() => updateQuestion(q.id, 'options', q.options.filter((_, i) => i !== oIdx))}
                        className="opacity-0 group-hover/opt:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        ))}
        <button onClick={() => updateQuestion(q.id, 'options', [...(q.options || []), `Opción ${(q.options?.length || 0) + 1}`])}
            className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all mt-2 border border-dashed border-indigo-100">
            <Plus size={14} /> Añadir opción
        </button>
    </div>
);

const PreviewCheckbox = ({ q, updateQuestion }) => (
    <div className="space-y-3 pl-11">
        {(q.options || []).map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-3 group/opt">
                <div className="w-5 h-5 rounded-md border-2 border-slate-200 bg-slate-50 shrink-0" />
                <input
                    className="flex-1 text-sm text-slate-600 focus:outline-none border-b border-transparent focus:border-indigo-400 py-1 transition-all"
                    value={opt}
                    placeholder={`Opción ${oIdx + 1}`}
                    onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oIdx] = e.target.value;
                        updateQuestion(q.id, 'options', newOpts);
                    }}
                />
                {q.options.length > 1 && (
                    <button onClick={() => updateQuestion(q.id, 'options', q.options.filter((_, i) => i !== oIdx))}
                        className="opacity-0 group-hover/opt:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        ))}
        <button onClick={() => updateQuestion(q.id, 'options', [...(q.options || []), `Opción ${(q.options?.length || 0) + 1}`])}
            className="flex items-center gap-2 text-emerald-600 text-xs font-bold hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all mt-2 border border-dashed border-emerald-100">
            <Plus size={14} /> Añadir opción
        </button>
    </div>
);

const PreviewRating = ({ q, updateQuestion }) => {
    const max = q.ratingMax || 5;
    return (
        <div className="pl-11 space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Escala:</span>
                {[5, 10].map(n => (
                    <button key={n} onClick={() => updateQuestion(q.id, 'ratingMax', n)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${max === n ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-500 border-slate-200 hover:border-pink-300'}`}>
                        1 – {n}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                {Array.from({ length: max }, (_, i) => i + 1).map(n => (
                    <div key={n} className="w-8 h-8 rounded-full border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 flex items-center justify-center">{n}</div>
                ))}
            </div>
            <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Etiqueta inicio</p>
                    <input className="w-full text-xs border-b border-slate-100 focus:border-indigo-400 outline-none py-1 text-slate-600"
                        value={q.labelMin || ''} placeholder="Ej: Muy malo"
                        onChange={e => updateQuestion(q.id, 'labelMin', e.target.value)} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Etiqueta fin</p>
                    <input className="w-full text-xs border-b border-slate-100 focus:border-indigo-400 outline-none py-1 text-slate-600"
                        value={q.labelMax || ''} placeholder="Ej: Excelente"
                        onChange={e => updateQuestion(q.id, 'labelMax', e.target.value)} />
                </div>
            </div>
        </div>
    );
};

const PreviewStars = ({ q, updateQuestion }) => {
    const max = q.starsMax || 5;
    return (
        <div className="pl-11 space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Estrellas:</span>
                {[3, 5, 10].map(n => (
                    <button key={n} onClick={() => updateQuestion(q.id, 'starsMax', n)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${max === n ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-slate-500 border-slate-200 hover:border-yellow-300'}`}>
                        {n} ★
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-1">
                {Array.from({ length: max }, (_, i) => (
                    <Star key={i} size={24} className="text-yellow-300" />
                ))}
            </div>
        </div>
    );
};

const PreviewRanking = ({ q, updateQuestion }) => (
    <div className="space-y-2 pl-11">
        {(q.options || []).map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-3 group/opt bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                <GripVertical size={16} className="text-slate-300 shrink-0" />
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 text-[10px] font-black flex items-center justify-center shrink-0">{oIdx + 1}</span>
                <input
                    className="flex-1 text-sm text-slate-600 bg-transparent focus:outline-none"
                    value={opt}
                    placeholder={`Elemento ${oIdx + 1}`}
                    onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oIdx] = e.target.value;
                        updateQuestion(q.id, 'options', newOpts);
                    }}
                />
                {q.options.length > 1 && (
                    <button onClick={() => updateQuestion(q.id, 'options', q.options.filter((_, i) => i !== oIdx))}
                        className="opacity-0 group-hover/opt:opacity-100 p-1 text-slate-300 hover:text-red-500 rounded-lg transition-all">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        ))}
        <button onClick={() => updateQuestion(q.id, 'options', [...(q.options || []), `Elemento ${(q.options?.length || 0) + 1}`])}
            className="flex items-center gap-2 text-cyan-600 text-xs font-bold hover:bg-cyan-50 px-3 py-2 rounded-xl transition-all mt-2 border border-dashed border-cyan-100">
            <Plus size={14} /> Añadir elemento
        </button>
    </div>
);

const PreviewFecha = () => (
    <div className="pl-11">
        <input type="date" disabled
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
        <p className="text-[10px] text-slate-300 mt-2 font-medium">Vista previa — el usuario seleccionará una fecha</p>
    </div>
);

const Editor = ({ currentForm, setCurrentForm, plantillaIdGuardada, isSaving, addQuestion, updateQuestion, deleteQuestion, saveForm, setView }) => (
    <div className="min-h-screen bg-[#FDFDFE] pb-24">
        <div className="fixed inset-0 bg-[radial-gradient(at_top_left,#f1f5f9_0%,transparent_30%)] pointer-events-none" />

        <header className="relative max-w-[80%] mx-auto px-6 pt-12 mb-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <button onClick={() => setView('dashboard')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-medium text-sm">
                    <div className="p-2 bg-white border border-slate-100 rounded-xl group-hover:border-slate-300 shadow-sm transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    Volver a mis proyectos
                </button>

                <div className="flex items-center gap-3">
                    <button onClick={() => setView('public')}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-semibold text-sm">
                        <Eye size={18} /> Vista previa
                    </button>
                    <button onClick={saveForm} disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {isSaving ? 'Guardando...' : 'Guardar borrador'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <input
                    className="w-full text-5xl font-black text-slate-950 bg-transparent focus:outline-none placeholder:text-slate-200 tracking-tight"
                    value={currentForm.title}
                    placeholder="Título del formulario..."
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <div className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea rows={1} placeholder="Añade una descripción aquí..."
                        className="w-full text-slate-500 bg-transparent resize-none focus:outline-none text-sm font-medium placeholder:text-slate-300"
                        value={currentForm.descripcion || ''}
                        onChange={(e) => setCurrentForm(prev => ({ ...prev, descripcion: e.target.value }))} />
                </div>
            </div>
        </header>

        <main className="relative max-w-[80%] mx-auto px-6 space-y-6">
            {currentForm.questions.map((q, idx) => (
                <div key={q.id} className="group relative bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hidden md:block">
                        <GripVertical size={20} />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                                <input
                                    className="w-full text-xl font-bold text-slate-800 focus:outline-none placeholder:text-slate-200"
                                    value={q.label}
                                    placeholder="Título de la pregunta"
                                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <select
                                    className="appearance-none text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-600 cursor-pointer"
                                    value={q.type}
                                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                >
                                    <option value="text">Texto corto</option>
                                    <option value="textarea">Párrafo largo</option>
                                    <option value="radio">Opción única</option>
                                    <option value="checkbox">Casillas múltiples</option>
                                    <option value="rating">Escala de valoración</option>
                                    <option value="stars">Calificación con estrellas</option>
                                    <option value="ranking">Ordenamiento</option>
                                    <option value="fecha">Fecha</option>
                                </select>
                                <TypeBadge type={q.type} />
                            </div>
                        </div>

                        {q.type === 'radio' && <PreviewRadio q={q} updateQuestion={updateQuestion} />}
                        {q.type === 'checkbox' && <PreviewCheckbox q={q} updateQuestion={updateQuestion} />}
                        {q.type === 'rating' && <PreviewRating q={q} updateQuestion={updateQuestion} />}
                        {q.type === 'stars' && <PreviewStars q={q} updateQuestion={updateQuestion} />}
                        {q.type === 'ranking' && <PreviewRanking q={q} updateQuestion={updateQuestion} />}
                        {q.type === 'fecha' && <PreviewFecha />}

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <button onClick={() => updateQuestion(q.id, 'required', !q.required)}
                                className={`flex items-center gap-2 text-xs font-bold transition-colors ${q.required ? 'text-indigo-600' : 'text-slate-400'}`}>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${q.required ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${q.required ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                Requerido
                            </button>
                            <button onClick={() => deleteQuestion(q.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 text-xs font-bold">
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">Eliminar</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button onClick={addQuestion}
                className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <Plus size={24} />
                </div>
                <span className="font-bold text-sm">Insertar nueva pregunta</span>
            </button>
        </main>
    </div>
);

export default Editor;
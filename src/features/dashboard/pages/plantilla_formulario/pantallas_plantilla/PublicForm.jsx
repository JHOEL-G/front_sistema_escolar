import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Loader2, Send, RotateCcw } from 'lucide-react';

const PublicForm = ({ currentForm, setView, onSubmit }) => {
    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        const missing = currentForm.questions.filter(q => q.required && !responses[q.id]);
        if (missing.length) {
            alert(`Completa los campos obligatorios: ${missing.map(q => q.label).join(', ')}`);
            return;
        }
        setSending(true);
        try {
            if (onSubmit) await onSubmit(responses);
            setSubmitted(true);
        } catch {
            alert('Error al enviar las respuestas.');
        } finally {
            setSending(false);
        }
    };

    if (submitted) return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-[90%] text-center space-y-8">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                    <div className="relative w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 size={48} strokeWidth={1.5} />
                    </div>
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">¡Todo listo!</h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Tus respuestas se han enviado con éxito. Gracias por tu tiempo.
                    </p>
                </div>
                <button
                    onClick={() => setView('dashboard')}
                    className="w-full py-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFE] pb-32">
            <div className="fixed inset-0 bg-[radial-gradient(at_bottom_left,#f8fafc_0%,transparent_40%)] pointer-events-none" />

            <div className="relative max-w-[90%] mx-auto pt-16 px-6">

                <button
                    onClick={() => setView('editor')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest mb-12 transition-all"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Salir de vista previa
                </button>

                <header className="mb-12 space-y-4">
                    <h1 className="text-5xl font-black text-slate-950 tracking-tight leading-tight">
                        {currentForm.title}
                    </h1>
                    {currentForm.descripcion && (
                        <div className="pl-4 border-l-2 border-indigo-100">
                            <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                {currentForm.descripcion}
                            </p>
                        </div>
                    )}
                    <div className="flex items-center gap-2 pt-4">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Campos requeridos
                        </p>
                    </div>
                </header>

                <div className="space-y-10">
                    {currentForm.questions.map((q, idx) => (
                        <div key={q.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <label className="block mb-6">
                                <span className="block text-slate-300 text-xs font-black uppercase tracking-widest mb-2">
                                    Pregunta {idx + 1} {q.required && <span className="text-red-400">*</span>}
                                </span>
                                <span className="text-xl font-bold text-slate-900 leading-tight block">
                                    {q.label}
                                </span>
                            </label>

                            {q.type === 'text' && (
                                <input
                                    type="text"
                                    placeholder="Escribe tu respuesta aquí..."
                                    className="w-full bg-transparent border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-4 text-lg text-slate-700 transition-all placeholder:text-slate-200"
                                    value={responses[q.id] || ''}
                                    onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                />
                            )}

                            {q.type === 'textarea' && (
                                <textarea
                                    placeholder="Escribe con detalle..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-2xl p-4 outline-none text-lg text-slate-700 transition-all resize-none placeholder:text-slate-300 shadow-sm"
                                    value={responses[q.id] || ''}
                                    onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                />
                            )}

                            {q.type === 'radio' && (
                                <div className="grid grid-cols-1 gap-3">
                                    {(q.options || []).map((opt, oIdx) => {
                                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                                        const optId = typeof opt === 'object' ? opt.id : null;
                                        const isSelected = responses[q.id]?.label === optLabel || responses[q.id] === optLabel;

                                        return (
                                            <label
                                                key={oIdx}
                                                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 group/option ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                                                    }`}
                                            >
                                                <span className="font-bold">{optLabel}</span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-white/40 bg-white/20' : 'border-slate-200'
                                                    }`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    className="hidden"
                                                    onChange={() => setResponses(prev => ({ ...prev, [q.id]: { label: optLabel, id: optId } }))}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <footer className="mt-20 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-slate-950 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95"
                    >
                        {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                        {sending ? 'Procesando...' : 'Enviar respuestas'}
                    </button>

                    <button
                        onClick={() => setResponses({})}
                        className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm font-bold transition-colors py-2"
                    >
                        <RotateCcw size={16} />
                        Reiniciar formulario
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PublicForm;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Send, CheckCircle2, RotateCcw, Star, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';

const LoadingScreen = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={22} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Cargando formulario...</p>
        </div>
    </div>
);

const ErrorScreen = ({ message }) => (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-400 text-3xl font-black">×</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Formulario no disponible</h2>
            <p className="text-slate-400 text-sm">{message}</p>
        </div>
    </div>
);

const SuccessScreen = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-8">
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping" />
                <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={44} className="text-white" strokeWidth={2} />
                </div>
            </div>
            <div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-3">¡Enviado!</h2>
                <p className="text-slate-400 text-lg leading-relaxed">Tus respuestas han sido registradas. Gracias por tu tiempo.</p>
            </div>
            <div className="h-px bg-slate-800" />
            <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">Puedes cerrar esta ventana</p>
        </div>
    </div>
);

const mapQuestion = (p) => {
    const base = {
        id: p.preguntaId,
        type: p.tipoPregunta,
        label: p.etiqueta,
        required: p.obligatorio,
        options: [],
        ratingMax: 5,
        starsMax: 5,
        labelMin: '',
        labelMax: '',
    };
    if (p.tipoPregunta === 'rating') {
        (p.opciones || []).forEach(o => {
            if (o.textoOpcion?.startsWith('max:')) base.ratingMax = parseInt(o.textoOpcion.split(':')[1]) || 5;
            if (o.textoOpcion?.startsWith('labelMin:')) base.labelMin = o.textoOpcion.slice(9);
            if (o.textoOpcion?.startsWith('labelMax:')) base.labelMax = o.textoOpcion.slice(9);
        });
    } else if (p.tipoPregunta === 'stars') {
        (p.opciones || []).forEach(o => {
            if (o.textoOpcion?.startsWith('max:')) base.starsMax = parseInt(o.textoOpcion.split(':')[1]) || 5;
        });
    } else if (p.tipoPregunta === 'radio') {
        base.options = (p.opciones || []).map(o => ({ id: o.opcionId, label: o.textoOpcion }));
    } else {
        base.options = (p.opciones || []).map(o => o.textoOpcion);
    }
    return base;
};

const buildRespuestas = (form, responses) => {
    const rows = [];
    form.questions.forEach(q => {
        const resp = responses[q.id];
        if (resp === undefined || resp === null || resp === '') return;

        if (['text', 'textarea', 'fecha'].includes(q.type)) {
            rows.push({ preguntaId: q.id, textoRespuesta: resp, opcionId: null });
        } else if (q.type === 'radio') {
            rows.push({ preguntaId: q.id, textoRespuesta: resp?.label || null, opcionId: resp?.id || null });
        } else if (q.type === 'checkbox') {
            (Array.isArray(resp) ? resp : []).forEach(opt => {
                rows.push({ preguntaId: q.id, textoRespuesta: opt, opcionId: null });
            });
        } else if (q.type === 'ranking') {
            (Array.isArray(resp) ? resp : []).forEach((opt, idx) => {
                rows.push({ preguntaId: q.id, textoRespuesta: `${idx + 1}:${opt}`, opcionId: null });
            });
        } else if (q.type === 'rating' || q.type === 'stars') {
            rows.push({ preguntaId: q.id, textoRespuesta: String(resp), opcionId: null });
        }
    });
    return rows;
};

const InputText = ({ q, value, onChange }) => (
    <input type="text" placeholder="Tu respuesta..."
        className="w-full bg-transparent border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-3 text-slate-700 text-base transition-colors placeholder:text-slate-200 font-medium"
        value={value || ''}
        onChange={e => onChange(e.target.value)} />
);

const InputTextarea = ({ q, value, onChange }) => (
    <textarea placeholder="Escribe aquí..." rows={3}
        className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl p-4 outline-none text-slate-700 text-base transition-all resize-none placeholder:text-slate-300 font-medium"
        value={value || ''}
        onChange={e => onChange(e.target.value)} />
);

const InputFecha = ({ value, onChange }) => (
    <input type="date"
        className="bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-400 rounded-xl px-4 py-3 outline-none text-slate-700 text-base transition-all font-medium"
        value={value || ''}
        onChange={e => onChange(e.target.value)} />
);

const InputRadio = ({ q, value, onChange }) => (
    <div className="space-y-2">
        {q.options.map((opt, oIdx) => {
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const optId = typeof opt === 'object' ? opt.id : null;
            const isSelected = value?.label === optLabel;
            return (
                <label key={oIdx}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all ${isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-white/30 bg-white/10' : 'border-slate-200'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-semibold text-sm">{optLabel}</span>
                    <input type="radio" name={`q-${q.id}`} className="hidden"
                        onChange={() => onChange({ label: optLabel, id: optId })} />
                </label>
            );
        })}
    </div>
);

const InputCheckbox = ({ q, value, onChange }) => {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
        const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
        onChange(next);
    };
    return (
        <div className="space-y-2">
            {q.options.map((opt, oIdx) => {
                const isSelected = selected.includes(opt);
                return (
                    <label key={oIdx}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-white/30 bg-white/20' : 'border-slate-200'}`}>
                            {isSelected && <span className="text-white text-[10px] font-black">✓</span>}
                        </div>
                        <span className="font-semibold text-sm">{opt}</span>
                        <input type="checkbox" className="hidden" onChange={() => toggle(opt)} />
                    </label>
                );
            })}
        </div>
    );
};

const InputRating = ({ q, value, onChange }) => {
    const max = q.ratingMax || 5;
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: max }, (_, i) => i + 1).map(n => (
                    <button key={n} type="button" onClick={() => onChange(n)}
                        className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-all ${value === n ? 'bg-pink-600 border-pink-600 text-white scale-110 shadow-lg shadow-pink-100' : 'bg-white border-slate-200 text-slate-400 hover:border-pink-300 hover:text-pink-500'}`}>
                        {n}
                    </button>
                ))}
            </div>
            {(q.labelMin || q.labelMax) && (
                <div className="flex justify-between text-xs text-slate-400 font-medium pt-1">
                    <span>{q.labelMin}</span>
                    <span>{q.labelMax}</span>
                </div>
            )}
        </div>
    );
};

const InputStars = ({ q, value, onChange }) => {
    const max = q.starsMax || 5;
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: max }, (_, i) => i + 1).map(n => (
                <button key={n} type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 active:scale-95">
                    <Star size={32}
                        className={`transition-colors ${n <= (hover || value || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-100'}`} />
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 text-sm font-bold text-slate-400">{value} / {max}</span>
            )}
        </div>
    );
};

const InputRanking = ({ q, value, onChange }) => {
    const items = Array.isArray(value) && value.length === q.options.length
        ? value
        : [...q.options];

    const move = (idx, dir) => {
        const arr = [...items];
        const swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= arr.length) return;
        [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
        onChange(arr);
    };

    return (
        <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium mb-3">Usa las flechas para ordenar según tu preferencia (1 = más importante)</p>
            {items.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 hover:border-slate-200 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-600 text-[11px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="flex-1 text-sm font-semibold text-slate-700">{opt}</span>
                    <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-all text-slate-400 hover:text-slate-700">
                            <ChevronUp size={16} />
                        </button>
                        <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}
                            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-all text-slate-400 hover:text-slate-700">
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const FormularioPublicoPage = () => {
    const { uuid } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await serviceApiNet.Formulario.obtenerPorPublicId(uuid);
                const data = response.data?.data;
                if (data) {
                    setForm({
                        id: data.plantillaId?.toString(),
                        plantillaId: data.plantillaId,
                        title: data.titulo,
                        descripcion: data.descripcion || '',
                        questions: (data.preguntas || []).map(mapQuestion)
                    });
                }
            } catch {
                setError('Este formulario no existe o ha sido desactivado.');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [uuid]);

    const setResponse = (qId, val) => setResponses(prev => ({ ...prev, [qId]: val }));

    const handleSubmit = async () => {
        const missing = form.questions.filter(q => {
            if (!q.required) return false;
            const r = responses[q.id];
            if (r === undefined || r === null || r === '') return true;
            if (Array.isArray(r) && r.length === 0) return true;
            return false;
        });
        if (missing.length) {
            alert(`Por favor completa: ${missing.map(q => q.label).join(', ')}`);
            return;
        }
        setSending(true);
        try {
            const respuestas = buildRespuestas(form, responses);
            await serviceApiNet.Formulario.guardarRespuestas(form.plantillaId, {
                plantillaId: form.plantillaId,
                respuestas,
            });
            setSubmitted(true);
        } catch {
            alert('Ocurrió un error al enviar. Intenta de nuevo.');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (error || !form) return <ErrorScreen message={error || 'Formulario no disponible.'} />;
    if (submitted) return <SuccessScreen />;

    const completedCount = form.questions.filter(q => {
        const r = responses[q.id];
        return r !== undefined && r !== null && r !== '' && !(Array.isArray(r) && r.length === 0);
    }).length;
    const progress = form.questions.length > 0 ? (completedCount / form.questions.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-white">
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-100">
                <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>

            <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-6">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        Formulario activo
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight mb-4">{form.title}</h1>
                    {form.descripcion && (
                        <p className="text-slate-500 text-lg leading-relaxed border-l-4 border-slate-100 pl-4">{form.descripcion}</p>
                    )}
                    <div className="mt-6 flex items-center gap-3 text-xs text-slate-400 font-medium">
                        <span>{form.questions.length} pregunta{form.questions.length !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>{completedCount} completada{completedCount !== 1 ? 's' : ''}</span>
                    </div>
                </header>

                <div className="space-y-12">
                    {form.questions.map((q, idx) => {
                        const isFocused = activeQuestion === q.id;
                        const hasAnswer = (() => {
                            const r = responses[q.id];
                            return r !== undefined && r !== null && r !== '' && !(Array.isArray(r) && r.length === 0);
                        })();

                        return (
                            <div key={q.id} onClick={() => setActiveQuestion(q.id)}
                                className={`relative transition-all duration-300 ${isFocused ? 'opacity-100' : 'opacity-75 hover:opacity-95'}`}>
                                <div className={`absolute -left-6 top-0 bottom-0 w-0.5 rounded-full transition-all duration-300 ${isFocused ? 'bg-indigo-500' : hasAnswer ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center transition-colors ${isFocused ? 'bg-indigo-600 text-white' : hasAnswer ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {hasAnswer ? '✓' : idx + 1}
                                        </span>
                                        <p className="font-bold text-slate-900 text-lg leading-snug">
                                            {q.label}
                                            {q.required && <span className="text-red-400 ml-1 text-sm">*</span>}
                                        </p>
                                    </div>
                                    <div className="pl-9">
                                        {q.type === 'text' && <InputText q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'textarea' && <InputTextarea q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'fecha' && <InputFecha value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'radio' && <InputRadio q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'checkbox' && <InputCheckbox q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'rating' && <InputRating q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'stars' && <InputStars q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                        {q.type === 'ranking' && <InputRanking q={q} value={responses[q.id]} onChange={v => setResponse(q.id, v)} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <footer className="mt-20 flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={handleSubmit} disabled={sending}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-950 text-white rounded-2xl font-black text-base hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95">
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        {sending ? 'Enviando...' : 'Enviar respuestas'}
                    </button>
                    <button onClick={() => setResponses({})}
                        className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm font-bold transition-colors">
                        <RotateCcw size={15} /> Limpiar todo
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default FormularioPublicoPage;
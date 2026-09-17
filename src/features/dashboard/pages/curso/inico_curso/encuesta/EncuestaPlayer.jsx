import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, ClipboardList, Send, RotateCcw } from 'lucide-react';
import serviceApiNet from '../../../../../../lib/api/serviceApiNet';
import { useEffect } from 'react';

const EncuestaPlayer = ({ dataJson, titulo, moduloRecursoId, usuarioId }) => {
    const [respuestas, setRespuestas] = useState({});
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [enviado, setEnviado] = useState(false);
    const [todasPreguntas, setTodasPreguntas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const instrucciones = dataJson?.instrucciones || dataJson?.Instrucciones || '';

    useEffect(() => {
        const cargarPreguntas = async () => {
            setCargando(true);
            try {
                const manuales = dataJson?.preguntas || dataJson?.Preguntas || [];

                const bancas = dataJson?.bancasIds || dataJson?.BancasIds || [];
                const preguntasDeBancas = [];

                for (const banca of bancas) {
                    const bancaId = banca.BancaId || banca.bancaId;
                    const cantidad = banca.Cantidad || banca.cantidad || 0;
                    try {
                        const res = await serviceApiNet.Preguntas.listarPorBanco(bancaId);
                        const preguntas = res.data?.data?.preguntas || [];
                        const seleccionadas = cantidad > 0
                            ? preguntas.sort(() => Math.random() - 0.5).slice(0, cantidad)
                            : preguntas;
                        seleccionadas.forEach((p, idx) => {
                            preguntasDeBancas.push({
                                EncuestaPreguntaId: `banca-${bancaId}-${idx}`,
                                TextoPregunta: p.textoPregunta || p.TextoPregunta,
                                TipoPregunta: 'OpcionMultiple',
                                OrdenPregunta: preguntasDeBancas.length + 1,
                                LimiteRespuestas: 1,
                                Opciones: (p.opciones || p.Opciones || []).map((o, oIdx) => ({
                                    EncuestaOpcionId: `banca-${bancaId}-${idx}-op-${oIdx}`,
                                    TituloOpcion: o.textoOpcion || o.TextoOpcion || '',
                                    TextoOpcion: o.explicacionORelacion || '',
                                    OrdenOpcion: o.orden || o.Orden || oIdx + 1
                                }))
                            });
                        });
                    } catch (e) {
                        console.error(`Error cargando banca ${bancaId}:`, e);
                    }
                }

                setTodasPreguntas([...manuales, ...preguntasDeBancas]);
            } finally {
                setCargando(false);
            }
        };

        cargarPreguntas();
    }, [dataJson]);

    const total = todasPreguntas.length;
    const respondidas = Object.keys(respuestas).length;
    const progreso = total > 0 ? Math.round((respondidas / total) * 100) : 0;
    const pregunta = todasPreguntas[preguntaActual];

    const handleSeleccionar = (preguntaId, opcionId) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: opcionId }));
    };

    const handleEnviar = () => {
        setEnviado(true);
    };

    const handleReiniciar = () => {
        setRespuestas({});
        setPreguntaActual(0);
        setEnviado(false);
    };


    if (cargando) return (
        <div className="bg-white rounded-[2.5rem] p-16 flex items-center justify-center border border-yellow-100">
            <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-400 rounded-full animate-spin" />
        </div>
    );

    if (enviado) return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-yellow-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 to-orange-400" />
            <div className="p-16 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-[2rem] flex items-center justify-center shadow-xl shadow-yellow-200 mb-8 rotate-3">
                    <ClipboardList size={44} className="text-white -rotate-3" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">¡Gracias por responder!</h2>
                <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed">
                    Tus respuestas han sido registradas. Tu opinión es muy valiosa para mejorar este curso.
                </p>
                <button
                    onClick={handleReiniciar}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition-all"
                >
                    <RotateCcw size={15} /> Ver respuestas nuevamente
                </button>
            </div>
        </div>
    );

    if (total === 0) return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-16 text-center">
            <ClipboardList size={40} className="mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 font-bold">Esta encuesta no tiene preguntas.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-yellow-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 to-orange-400" />

            <div className="p-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 flex-shrink-0">
                        <ClipboardList size={26} className="text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-0.5">Encuesta</p>
                        <h3 className="text-xl font-black text-slate-900">{titulo}</h3>
                        {instrucciones && (
                            <p className="text-sm text-slate-500 mt-1">{instrucciones}</p>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-black text-slate-900">{preguntaActual + 1}<span className="text-slate-300 text-base font-bold">/{total}</span></p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{respondidas} respondidas</p>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] font-bold text-slate-400">Progreso</span>
                        <span className="text-[10px] font-black text-yellow-500">{progreso}%</span>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Pregunta {preguntaActual + 1}
                    </span>
                    <p className="text-lg font-black text-slate-900 mt-2 leading-snug">
                        {pregunta.TextoPregunta || pregunta.textoPregunta}
                    </p>
                </div>

                <div className="space-y-3">
                    {(pregunta.Opciones || pregunta.opciones || []).map((opcion) => {
                        const opcionId = opcion.EncuestaOpcionId || opcion.encuestaOpcionId;
                        const preguntaId = pregunta.EncuestaPreguntaId || pregunta.encuestaPreguntaId;
                        const seleccionada = respuestas[preguntaId] === opcionId;

                        return (
                            <button
                                key={opcionId}
                                onClick={() => handleSeleccionar(preguntaId, opcionId)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${seleccionada
                                    ? 'border-yellow-400 bg-yellow-50 shadow-[0_8px_24px_-8px_rgba(250,204,21,0.4)]'
                                    : 'border-slate-100 bg-slate-50 hover:border-yellow-200 hover:bg-yellow-50/40'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${seleccionada ? 'text-yellow-500' : 'text-slate-300 group-hover:text-yellow-300'
                                    }`}>
                                    {seleccionada
                                        ? <CheckCircle2 size={22} strokeWidth={2.5} />
                                        : <Circle size={22} strokeWidth={2} />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold text-sm transition-colors ${seleccionada ? 'text-slate-900' : 'text-slate-600'
                                        }`}>
                                        {opcion.TituloOpcion || opcion.tituloOpcion}
                                    </p>
                                    {(opcion.TextoOpcion || opcion.textoOpcion) && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {opcion.TextoOpcion || opcion.textoOpcion}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-8 pb-8 flex items-center justify-between gap-4">
                <button
                    onClick={() => setPreguntaActual(p => Math.max(0, p - 1))}
                    disabled={preguntaActual === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} /> Anterior
                </button>

                <div className="flex gap-1.5">
                    {todasPreguntas.map((_, i) => {
                        const pId = todasPreguntas[i].EncuestaPreguntaId || todasPreguntas[i].encuestaPreguntaId;
                        const respondida = respuestas[pId] !== undefined;
                        return (
                            <button
                                key={i}
                                onClick={() => setPreguntaActual(i)}
                                className={`rounded-full transition-all duration-300 ${i === preguntaActual
                                    ? 'w-6 h-2 bg-yellow-400'
                                    : respondida
                                        ? 'w-2 h-2 bg-yellow-200'
                                        : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                                    }`}
                            />
                        );
                    })}
                </div>

                {preguntaActual < total - 1 ? (
                    <button
                        onClick={() => setPreguntaActual(p => Math.min(total - 1, p + 1))}
                        className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(250,204,21,0.6)]"
                    >
                        Siguiente <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleEnviar}
                        disabled={respondidas === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(250,204,21,0.6)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Send size={14} /> Enviar encuesta
                    </button>
                )}
            </div>
        </div>
    );
};

export default EncuestaPlayer;
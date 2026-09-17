import { XCircle } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

export const OverlayPregunta = ({ preguntaActiva, feedback, handleRespuesta }) => (
    <div
        className="bg-white rounded-[1.5rem] p-4 w-full shadow-2xl"
        style={{ maxWidth: '380px', maxHeight: '90vh', overflowY: 'auto' }}
    >
        {feedback ? (
            <div className="text-center py-6">
                {feedback === 'correcto' ? (
                    <div className="flex flex-col items-center gap-3">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                        <h2 className="text-xl font-black text-slate-800">¡Muy bien!</h2>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <XCircle className="w-14 h-14 text-red-500" />
                        <h2 className="text-xl font-black text-slate-800">¡Casi lo logras!</h2>
                    </div>
                )}
            </div>
        ) : (
            <>
                <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-2 block">
                    Pregunta de validación
                </span>
                <h2 className="text-sm font-black text-slate-800 mb-3 leading-snug">
                    {preguntaActiva.TextoPregunta}
                </h2>
                <div className="space-y-2">
                    {preguntaActiva.Opciones?.map((opcion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleRespuesta(opcion.EsCorrecta)}
                            className="w-full text-left p-3 rounded-xl border-2 border-slate-100 hover:border-violet-500 hover:bg-violet-50 active:bg-violet-100 transition-all font-semibold text-slate-700 text-sm leading-snug"
                        >
                            {opcion.TextoOpcion}
                        </button>
                    ))}
                </div>
            </>
        )}
    </div>
);
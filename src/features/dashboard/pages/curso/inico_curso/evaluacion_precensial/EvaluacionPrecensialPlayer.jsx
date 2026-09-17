import React from 'react';
import { Calendar, MapPin, ClipboardList } from 'lucide-react';
import ActividadCard from '../card/ActividadCard';

const EvaluacionPresencialPlayer = ({ dataJson, titulo }) => {
    const tipoCalificacion = dataJson?.tipoCalificacionId === 1
        ? 'Automático'
        : dataJson?.tipoCalificacionId === 2
            ? 'Manual'
            : 'Con Rúbrica';

    const campos = [
        { key: 'Fecha', val: dataJson?.Fecha ? new Date(dataJson.Fecha).toLocaleString() : null, Icon: Calendar },
        { key: 'Lugar', val: dataJson?.Lugar, Icon: MapPin },
        { key: 'Puntaje máximo', val: dataJson?.PuntajeMaximo ? `${dataJson.PuntajeMaximo} pts` : null, Icon: ClipboardList },
    ].filter(d => d.val);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-orange-100">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-amber-400" />
            <div className="p-10">

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-200">
                        <ClipboardList size={30} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">Evaluación Presencial</p>
                        <h3 className="text-2xl font-black text-slate-900">{titulo}</h3>
                    </div>
                </div>

                {campos.length > 0 && (
                    <div className="space-y-3 mb-6">
                        {campos.map(({ key, val, Icon }) => (
                            <div key={key} className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
                                <Icon size={18} className="text-orange-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{key}</p>
                                    <p className="text-sm font-bold text-slate-700">{val}</p>
                                </div>
                            </div>
                        ))}
                        {dataJson?.Instrucciones && (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Instrucciones</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{dataJson.Instrucciones}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo de calificación</p>
                        <p className="text-sm font-bold text-slate-700">{tipoCalificacion}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ponderación</p>
                        <p className="text-sm font-bold text-slate-700">{dataJson?.agregarPonderacion ? 'Incluida' : 'No incluida'}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solicitud revisión</p>
                        <p className="text-sm font-bold text-slate-700">{dataJson?.colaboradorSolicitarRevision ? 'Permitida' : 'No permitida'}</p>
                    </div>
                </div>

                {dataJson?.rubricas?.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Rúbricas de evaluación</p>
                        {dataJson.rubricas.map((rubrica, rIdx) => (
                            <div key={rIdx} className="border border-orange-100 rounded-2xl overflow-hidden">
                                <div className="bg-orange-50 px-5 py-3">
                                    <p className="font-black text-sm text-slate-800">{rubrica.rubricaNombre}</p>
                                    {rubrica.rubricaDescripcion && (
                                        <p className="text-xs text-slate-500 mt-0.5">{rubrica.rubricaDescripcion}</p>
                                    )}
                                </div>
                                {(rubrica.Criterios || []).map((criterio, cIdx) => (
                                    <div key={cIdx} className="px-5 py-4 border-t border-orange-50">
                                        <p className="text-xs font-bold text-slate-700 mb-2">{criterio.TituloCriterio}</p>
                                        {criterio.criterioDescripcion && (
                                            <p className="text-xs text-slate-400 mb-3">{criterio.criterioDescripcion}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {(criterio.Calificaciones || []).map((cal, calIdx) => (
                                                <span key={calIdx} className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl text-xs font-bold text-orange-700">
                                                    {cal.calificacionNombre} · {cal.Puntos} pts
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {(!dataJson?.rubricas || dataJson.rubricas.length === 0) && campos.length === 0 && (
                    <div className="flex flex-col items-center py-10 bg-orange-50 border border-orange-100 rounded-[1.5rem]">
                        <div className="w-16 h-16 bg-orange-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
                            <ClipboardList size={32} className="text-white" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2">Evaluación presencial</h4>
                        <p className="text-sm text-slate-500 text-center max-w-sm">
                            Esta evaluación será calificada por el instructor de forma presencial.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluacionPresencialPlayer;
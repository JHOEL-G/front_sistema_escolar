import React from 'react';
import {
    ChevronRight,
    CheckCircle2,
    Settings,
    Trophy,
    ArrowLeft,
    Sparkles,
    Info,
    Loader2,
    Pencil
} from 'lucide-react';
import { StepperLayout } from './stepper_layout/StepperLayout';

const ConfiguracionScreen = ({ courseData, updateCourseData, isEditMode, onBack, onComplete, isSaving }) => {
    return (
        <div className="min-h-full bg-slate-50/50 font-sans selection:bg-indigo-100">
            <main className="max-w-full mx-auto p-4 sm:p-6 space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {isEditMode ? (
                                    <>Guardar <span className="text-indigo-600">cambios</span></>
                                ) : (
                                    <>Finalizar <span className="text-indigo-600">configuración</span></>
                                )}
                            </h2>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    Paso 5 de 5 • Ajustes finales
                                </p>
                                {isEditMode && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100">
                                        <Pencil size={10} /> Editando
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <StepperLayout currentStep={5} />

                <div className="mx-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

                        <div className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${courseData.gamificacion
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <Trophy size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800">Gamificación</h3>
                                        <span className="px-2 py-0.5 bg-indigo-600 text-[9px] font-black text-white uppercase tracking-tighter rounded-md flex items-center gap-1 shadow-sm shadow-indigo-100">
                                            <Sparkles size={10} /> Nuevo
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Activa mecánicas de juego para aumentar el engagement de tus colaboradores.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => updateCourseData({ gamificacion: !courseData.gamificacion })}
                                disabled={isSaving}
                                className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${courseData.gamificacion ? 'bg-indigo-600' : 'bg-slate-200'
                                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${courseData.gamificacion ? 'translate-x-6' : ''
                                    }`}></div>
                            </button>
                        </div>

                        <div className="p-8 bg-indigo-50/30 border-t border-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
                                    <Info size={20} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-800 leading-none">
                                        {isEditMode ? 'Revisión de cambios' : 'Revisión de configuración'}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                                        {isEditMode ? (
                                            <>
                                                Revisa los cambios realizados. Al hacer clic en{' '}
                                                <span className="font-bold text-indigo-600">Guardar cambios</span>, la gestión del curso
                                                será actualizada con la nueva configuración de privacidad, participantes y evaluadores.
                                            </>
                                        ) : (
                                            <>
                                                Has completado todos los pasos obligatorios. Al hacer clic en{' '}
                                                <span className="font-bold text-indigo-600">Finalizar</span>, el curso será creado con
                                                los criterios de privacidad, participantes y evaluadores que definiste anteriormente.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800">Resumen Final</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Nombre del Curso
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{courseData.nombreCurso}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Privacidad
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{courseData.privacidad}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Temas Seleccionados
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{courseData.temas?.length || 0} temas</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Evaluadores
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{courseData.evaluadores?.length || 0} evaluadores</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Inscripción Automática
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {courseData.inscripcionAutomatica ? 'Sí' : 'No'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Gamificación
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {courseData.gamificacion ? 'Activada' : 'Desactivada'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-8">
                    <button
                        onClick={onBack}
                        disabled={isSaving}
                        className="text-slate-400 font-black text-[11px] hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Regresar
                    </button>

                    <button
                        onClick={onComplete}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 text-xs uppercase tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                {isEditMode ? 'Guardando cambios...' : 'Guardando...'}
                            </>
                        ) : isEditMode ? (
                            <>
                                Guardar cambios
                                <Pencil size={18} />
                            </>
                        ) : (
                            <>
                                Finalizar
                                <CheckCircle2 size={18} />
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ConfiguracionScreen;
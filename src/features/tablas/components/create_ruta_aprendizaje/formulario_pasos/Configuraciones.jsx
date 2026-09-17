import React, { useState, useEffect } from 'react';
import {
    ChevronRight, Info, HelpCircle, Trophy,
    Bold, Italic, Underline, List, Link2,
    ListOrdered, Save, Eye, Settings, Award,
    MessageSquare, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from '../../gestion_curso/crear_gestion_curso/stepper_layout/StepperLayout';
import { useNavigate } from 'react-router-dom';
import { useRutaActiveContext } from '../useRutaActiveContext';

const Configuraciones = () => {
    const navigate = useNavigate();
    const { rutaData, updateRutaData, handleCancel, isEditing, rutaId, isSaving, handleGuardarRutaCompleta } = useRutaActiveContext();
    const [formData, setFormData] = useState({
        condicionAvanceCurso: rutaData?.condicionAvanceCurso || false,
        condicionAvanceSeccion: rutaData?.condicionAvanceSeccion || false,
        criterioAprobacion: rutaData?.criterioAprobacion || '80',
        nombreCertificado: rutaData?.nombreCertificado || '',
        gamificacion: rutaData?.gamificacion || null,
        mensajeBienvenida: rutaData?.mensajeBienvenida || '',
        utilizarMensajePredeterminado: false
    });

    const [gamificacionActiva, setGamificacionActiva] = useState(!!rutaData?.gamificacion);
    const [puntosGamificacion, setPuntosGamificacion] = useState(rutaData?.gamificacion || 0);
    const [certificados, setCertificados] = useState([]);
    const [loadingCertificados, setLoadingCertificados] = useState(true);

    useEffect(() => {
        if (isEditing && rutaData?.nombreCertificado) {
            setFormData({
                condicionAvanceCurso: rutaData.condicionAvanceCurso || false,
                condicionAvanceSeccion: rutaData.condicionAvanceSeccion || false,
                criterioAprobacion: rutaData.criterioAprobacion || '80',
                nombreCertificado: rutaData.nombreCertificado || '',
                gamificacion: rutaData.gamificacion || null,
                mensajeBienvenida: rutaData.mensajeBienvenida || '',
                utilizarMensajePredeterminado: false
            });
            if (rutaData.gamificacion) {
                setGamificacionActiva(true);
                setPuntosGamificacion(rutaData.gamificacion);
            }
        }
    }, [rutaData?.nombreCertificado, isEditing]);

    useEffect(() => {
        const cargarCertificados = async () => {
            try {
                setLoadingCertificados(true);
                const response = await serviceApiNet.Certificados.list();
                setCertificados(response.data.data || []);
            } catch (error) {
                console.error('Error al cargar certificados:', error);
                setCertificados([
                    { certificadoId: 1, nombreCertificado: 'Certificado Básico' },
                    { certificadoId: 2, nombreCertificado: 'Certificado Avanzado' },
                    { certificadoId: 3, nombreCertificado: 'Certificado Profesional' }
                ]);
            } finally {
                setLoadingCertificados(false);
            }
        };
        cargarCertificados();
    }, []);

    const handleGamificacionToggle = () => {
        const nuevoEstado = !gamificacionActiva;
        setGamificacionActiva(nuevoEstado);
        if (!nuevoEstado) {
            setPuntosGamificacion(0);
            setFormData(prev => ({ ...prev, gamificacion: null }));
        }
    };

    const handlePuntosChange = (value) => {
        const puntos = parseInt(value) || 0;
        setPuntosGamificacion(puntos);
        setFormData(prev => ({ ...prev, gamificacion: puntos > 0 ? puntos : null }));
    };

    const handleMensajePredeterminadoToggle = () => {
        const nuevoEstado = !formData.utilizarMensajePredeterminado;
        setFormData(prev => ({
            ...prev,
            utilizarMensajePredeterminado: nuevoEstado,
            mensajeBienvenida: nuevoEstado
                ? '¡Bienvenido a esta ruta de aprendizaje! Estamos emocionados de acompañarte en este viaje de desarrollo profesional.'
                : ''
        }));
    };

    const handleFinalizar = async () => {
        if (!formData.nombreCertificado) {
            toast.error('Debe seleccionar un certificado');
            return;
        }
        if (!formData.criterioAprobacion ||
            parseInt(formData.criterioAprobacion) < 0 ||
            parseInt(formData.criterioAprobacion) > 100) {
            toast.error('El criterio de aprobación debe ser entre 0 y 100');
            return;
        }

        updateRutaData(formData);
        await handleGuardarRutaCompleta(formData);
    };


    return (
        <div className="min-h-full bg-slate-50/30 selection:bg-indigo-100 font-sans">
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                Ruta de Aprendizaje
                            </span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Configuración Final
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Configuraciones</span> Finales
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                            <Save size={18} /> Borrador
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                            <Eye size={18} /> Vista previa
                        </button>
                    </div>
                </div>

                <StepperLayout currentStep={5} />

                <div className="mx-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <Settings className="text-indigo-600" size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Configuración de Avance</h3>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { key: 'condicionAvanceCurso', label: 'Condicionar avance entre cursos', desc: 'Los participantes deberán completar un curso antes de acceder al siguiente.' },
                                { key: 'condicionAvanceSeccion', label: 'Condicionar avance entre secciones', desc: 'Los participantes deberán completar todos los cursos de una sección antes de la siguiente.' }
                            ].map(item => (
                                <div key={item.key} className="flex items-start gap-4 p-5 bg-slate-50/50 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition-all">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                        className={`relative w-14 h-7 rounded-full transition-all shadow-inner flex-shrink-0 ${formData[item.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${formData[item.key] ? 'left-8' : 'left-1'}`} />
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-800">{item.label}</span>
                                            <HelpCircle size={16} className="text-slate-400" />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mx-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <Award className="text-indigo-600" size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Criterios de Aprobación y Certificados</h3>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                Criterio de aprobación (%)
                            </label>
                            <div className="max-w-md flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus-within:border-indigo-500 transition-all">
                                <input
                                    type="number" min="0" max="100"
                                    value={formData.criterioAprobacion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, criterioAprobacion: e.target.value }))}
                                    className="flex-1 bg-transparent outline-none text-lg font-bold text-slate-800"
                                />
                                <span className="text-sm font-bold text-slate-400">%</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                Certificado <span className="text-rose-500">*</span>
                            </label>
                            <div className="max-w-md">
                                <select
                                    value={formData.nombreCertificado}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nombreCertificado: e.target.value }))}
                                    className={`w-full px-6 py-5 rounded-[2rem] border-2 outline-none transition-all text-sm font-semibold cursor-pointer ${!formData.nombreCertificado
                                        ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500'
                                        : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500'
                                        }`}
                                    disabled={loadingCertificados}
                                >
                                    <option value="">Seleccionar certificado</option>
                                    {certificados.map(cert => (
                                        <option key={cert.certificadoId} value={cert.nombreCertificado}>
                                            {cert.nombreCertificado}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                                <Trophy className="text-amber-600" size={20} />
                            </div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-bold text-slate-900">Gamificación</h3>
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Nuevo</span>
                            </div>
                        </div>
                        <button
                            onClick={handleGamificacionToggle}
                            className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${gamificacionActiva ? 'bg-amber-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${gamificacionActiva ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>
                    {gamificacionActiva && (
                        <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                    Puntos por completar la ruta
                                </label>
                                <div className="max-w-md flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl focus-within:border-amber-400 transition-all">
                                    <Trophy className="w-5 h-5 text-amber-600" />
                                    <input
                                        type="number" min="0"
                                        value={puntosGamificacion}
                                        onChange={(e) => handlePuntosChange(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-lg font-bold text-slate-800"
                                        placeholder="0"
                                    />
                                    <span className="text-sm font-bold text-amber-600">pts</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mx-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <MessageSquare className="text-indigo-600" size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Mensaje de Bienvenida</h3>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            {[Bold, Italic, Underline].map((Icon, i) => (
                                <button key={i} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                    <Icon size={18} />
                                </button>
                            ))}
                            <div className="w-px h-6 bg-slate-200" />
                            {[ListOrdered, List].map((Icon, i) => (
                                <button key={i} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                    <Icon size={18} />
                                </button>
                            ))}
                            <div className="w-px h-6 bg-slate-200" />
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                <Link2 size={18} />
                            </button>
                        </div>
                        <textarea
                            value={formData.mensajeBienvenida}
                            onChange={(e) => setFormData(prev => ({ ...prev, mensajeBienvenida: e.target.value }))}
                            placeholder="Escribe un mensaje de bienvenida para los participantes..."
                            className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm text-slate-700 resize-none"
                            disabled={formData.utilizarMensajePredeterminado}
                        />
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={handleMensajePredeterminadoToggle}
                                className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${formData.utilizarMensajePredeterminado ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${formData.utilizarMensajePredeterminado ? 'left-8' : 'left-1'}`} />
                            </button>
                            <span className="text-sm font-bold text-slate-700">Utilizar mensaje predeterminado</span>

                        </div>
                        <div className="flex items-end gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-tight justify-end bottom-auto">
                            <Info size={14} className="text-indigo-400" />
                            <span>Asegúrate de revisar toda la configuración antes de finalizar.</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={isSaving}
                        className="text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest disabled:opacity-50"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={handleFinalizar}
                        disabled={isSaving || !formData.nombreCertificado}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:from-green-700 hover:to-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isSaving ? (
                            <><Loader2 size={20} className="animate-spin" /> Guardando...</>
                        ) : isEditing ? (
                            <><Award size={20} /> Guardar Cambios</>
                        ) : (
                            <><Award size={20} /> Finalizar y Crear Ruta</>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Configuraciones;
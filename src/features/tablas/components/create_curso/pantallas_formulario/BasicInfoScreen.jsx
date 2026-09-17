import React, { useState, useEffect } from 'react';
import { Info, Upload, ChevronRight, Image as ImageIcon, Save, Eye, Loader2, X } from 'lucide-react';
import Stepper from './Stepper';
import { Search } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../../components/modal/PageModal';
import { useCurso } from '../useCurso';
import { useRef } from 'react';

const BasicInfoScreen = ({ onCancel }) => {
    const { courseData, updateCourseData, isEditing, id, limpiarBorrador } = useCurso();
    const navigate = useNavigate();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [habilitarCronograma, setHabilitarCronograma] = useState(courseData?.HabilitarFechas ?? false);
    const [nombreCurso, setNombreCurso] = useState(courseData?.NombreCurso || '');
    const [imagen, setImagen] = useState(courseData?.imagen || null);
    const inicializado = useRef(false);

    useEffect(() => {
        if (!inicializado.current && courseData) {
            setNombreCurso(courseData.NombreCurso || '');
            setImagen(courseData.imagen || null);
            setHabilitarCronograma(courseData.HabilitarFechas ?? false);
            inicializado.current = true;
        }
    }, [courseData]);

    useEffect(() => {
        if (!imagen) {
            setPreviewUrl(null);
            return;
        }

        if (imagen instanceof File) {
            const objectUrl = URL.createObjectURL(imagen);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof imagen === 'string') {
            setPreviewUrl(imagen);
        }
    }, [imagen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("La imagen es demasiado grande. El máximo es 5MB.");
                return;
            }
            setImagen(file);
        }
    };

    const handleNext = () => {
        if (!nombreCurso.trim()) {
            return alert("El nombre del curso es obligatorio para continuar.");
        }
        setIsSaving(true);
        setTimeout(() => {
            updateCourseData({ NombreCurso: nombreCurso, HabilitarFechas: habilitarCronograma, imagen });

            if (isEditing) {
                navigate(`/curso/editar/${id}/landing-page`);
            } else {
                navigate('/curso/crear/landing-page');
            }
            setIsSaving(false);
        }, 600);
    };

    const handleSwitchChange = (checked) => {
        if (checked) {
            setIsModalOpen(true);
        } else {
            setHabilitarCronograma(false);
        }
    };

    const handleConfirmModal = () => {
        setHabilitarCronograma(true);
        setIsModalOpen(false);
    };

    if (!courseData) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-full selection:bg-indigo-100">
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Gestión Docente</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nuevo Curso</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Configuración <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Inicial</span>
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

                <div className="px-2">
                    <Stepper currentStep={1} type="completo" />
                </div>
                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-7 p-8 lg:p-12 space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                    <ImageIcon className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Identidad del Curso</h3>
                                    <p className="text-sm text-slate-500 font-medium">Define los datos básicos y visuales.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Título oficial del curso
                                    </label>
                                    <input
                                        type="text"
                                        value={nombreCurso}
                                        onChange={(e) => setNombreCurso(e.target.value)}
                                        className="w-full p-5 bg-slate-50/30 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder:text-slate-300 text-lg"
                                        placeholder="Ej: Máster en Arquitectura de Microservicios"
                                    />
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                                        <Info size={14} className="text-indigo-400" />
                                        <span>Este nombre aparecerá en los certificados oficiales.</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-800">Cronograma por módulos</h4>
                                        <p className="text-xs text-slate-500 font-medium">Habilita fechas de entrega.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={habilitarCronograma}
                                            onChange={(e) => handleSwitchChange(e.target.checked)}
                                        />
                                        <div className="w-14 h-7 bg-slate-200 rounded-full peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] peer-checked:after:translate-x-7 after:transition-all"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={handleConfirmModal}
                            title="Configuración de tiempos"
                            confirmText="Entendido, habilitar"
                            variant="primary"
                        >
                            <div className="space-y-3">
                                <h4 className="text-xl font-bold text-slate-800">Tareas pendientes:</h4>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    Una vez completada la creación del curso, dejará de estar como borrador y
                                    <span className="text-indigo-600 font-bold"> deberás gestionar la temporalidad</span> de los módulos de forma manual.
                                </p>
                            </div>
                        </Modal>

                        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Miniatura de portada
                                </label>
                            </div>

                            <div
                                onClick={() => document.getElementById('imageInput').click()}
                                className="flex-grow group relative border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center overflow-hidden min-h-[350px]"
                            >
                                {previewUrl ? (
                                    <div className="absolute inset-0 p-3">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[2rem]" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem] backdrop-blur-[2px]">
                                            <p className="text-white font-bold text-xs uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                                Cambiar imagen
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center p-8 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                                            <Upload className="text-indigo-600" size={28} />
                                        </div>
                                        <h5 className="text-slate-900 font-bold text-base mb-1">Sube tu portada</h5>
                                        <p className="text-slate-400 text-xs font-medium">Arrastra o haz clic aquí</p>

                                        <div className="mt-6 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                O pega una URL directamente
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <input id="imageInput" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </div>

                            <div className="mt-6 relative">
                                <input
                                    type="text"
                                    placeholder="Pegar enlace directo de imagen (http://...)"
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                                    onChange={(e) => {
                                        const url = e.target.value.trim();
                                        if (!url) return;

                                        const img = new Image();
                                        img.onload = () => {
                                            setPreviewUrl(url);
                                            setImagen(url);
                                        };
                                        img.onerror = () => {
                                        };
                                        img.src = url;
                                    }}
                                />
                                <div className="absolute right-4 top-3.5 p-1 bg-slate-50 rounded-lg">
                                    <Search className="text-slate-300" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={() => {
                            limpiarBorrador?.();
                            navigate(isEditing ? '/curso' : '/curso/crear');
                        }}
                        className="flex items-center gap-2 px-6 py-3 text-slate-400 font-bold hover:text-rose-500 transition-colors text-xs uppercase tracking-[0.2em]"
                    >
                        <ChevronLeft size={18} />
                        {isEditing ? 'Volver a cursos' : 'Cancelar proceso'}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Siguiente paso
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default BasicInfoScreen;
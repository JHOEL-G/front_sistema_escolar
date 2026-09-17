import React, { useState, useCallback } from 'react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { X, Sparkles, Save, CheckCircle2 } from 'lucide-react';
import { InputConError } from '../diseño_formulario/DiseñoFormulario';
import { Upload } from 'lucide-react';
import { useEffect } from 'react';

const CrearTema = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombreTema: "",
        descripcion: "",
        creacionSubtema: [],
        imagenPortada: "",
    });


    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!formData.imagenPortada) {
            setPreviewUrl(null);
            return;
        }

        if (formData.imagenPortada instanceof File) {
            const objectUrl = URL.createObjectURL(formData.imagenPortada);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        else if (typeof imagen === 'string') {
            setPreviewUrl(imagen);
        }
    }, [formData.imagenPortada]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("La imagen es demasiado grande. El máximo es 5MB.");
                return;
            }
            setFormData(prev => ({
                ...prev,
                imagenPortada: file
            }));
        }
    };
    const validarCampo = useCallback((name, value) => {
        if (name === "nombreTema") {
            if (!value.trim()) return "El nombre es requerido";
            if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
        }
        return "";
    }, []);

    const manejarCambio = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validarCampo(name, value) }));
    }, [validarCampo]);

    const manejarEnvios = async () => {
        const errorNombre = validarCampo("nombreTema", formData.nombreTema);
        if (errorNombre) {
            setErrors({ nombreTema: errorNombre });
            return;
        }

        try {
            setLoading(true);

            const subtemasTexto = Array.isArray(formData.creacionSubtema)
                ? formData.creacionSubtema.join(", ")
                : formData.creacionSubtema;

            const temaData = {
                nombreTema: formData.nombreTema,
                descripcion: formData.descripcion,
                creacionSubtema: subtemasTexto,
                imagenPortada: formData.imagenPortada,
            };

            await serviceApiNet.Temas.create(temaData);

            setStep(5);
            setTimeout(() => {
                if (onClose) onClose();
            }, 5000);
        } catch (error) {
            console.error("Error al crear el tema:", error);
            setErrors({ general: "Ocurrió un error al guardar el tema" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-300">
            <div className="w-[450px] bg-white m-4 shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 rounded-3xl overflow-hidden border border-slate-200">

                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                        style={{ width: step === 5 ? '100%' : '50%' }}
                    ></div>
                </div>

                <div className="flex justify-between items-start p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Temas
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {step === 5 ? '¡Completado!' : 'Configuración de nuevo tema'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="text-slate-400" size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Información del Tema</h3>
                                    <p className="text-xs text-slate-500">Define los permisos generales</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <InputConError
                                    label="Nombre del Tema"
                                    name="nombreTema"
                                    value={formData.nombreTema}
                                    onChange={manejarCambio}
                                    errors={errors}
                                    required
                                />
                                <InputConError
                                    label="Descripción"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={manejarCambio}
                                    errors={errors}
                                />
                                <InputConError
                                    label="Creación de Subtemas"
                                    name="creacionSubtema"
                                    value={formData.creacionSubtema}
                                    onChange={manejarCambio}
                                    errors={errors}
                                />
                                <div className="lg:col-span-5 bg-slate-50/50 p-8 lg:p-12 border-l border-slate-50">
                                    <div className="h-full flex flex-col">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Miniatura de portada</label>

                                        <div
                                            onClick={() => document.getElementById('imageInput').click()}
                                            className="flex-grow group relative border-2 border-dashed border-slate-200 rounded-[2rem] bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center overflow-hidden min-h-[300px]"
                                        >
                                            {previewUrl ? (
                                                <div className="relative w-full h-full p-2">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.8rem]">
                                                        <p className="text-white font-bold text-sm bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">Cambiar imagen</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative z-10 flex flex-col items-center p-6 text-center">
                                                    <div className="bg-slate-50 p-5 rounded-3xl mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                                                        <Upload className="text-indigo-600" size={32} />
                                                    </div>
                                                    <h5 className="text-slate-900 font-bold text-lg">Sube tu portada</h5>
                                                    <p className="text-slate-400 text-sm font-medium max-w-[200px]">Formatos recomendados: JPG, PNG o WebP</p>
                                                </div>
                                            )}
                                            <input id="imageInput" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500 py-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                <div className="relative bg-emerald-50 rounded-full p-8">
                                    <CheckCircle2 className="text-emerald-600" size={80} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mt-8 mb-3 text-center">¡Tema Guardado!</h3>
                            <p className="text-slate-500 text-center max-w-xs">
                                El nuevo tema se ha registrado correctamente y ya puede ser asignado a los usuarios.
                            </p>
                        </div>
                    )}
                </div>

                {step === 1 && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="text-slate-600 font-semibold px-6 py-2.5 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={manejarEnvios}
                            disabled={loading}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <><Save size={18} /> Guardar Tema</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrearTema;
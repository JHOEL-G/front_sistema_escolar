import React, { useState, useCallback, useEffect } from 'react';
import { X, Sparkles, Save, CheckCircle2, Loader2, Upload } from 'lucide-react';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { InputConError } from '../../diseño_formulario/DiseñoFormulario';

const EditarTema = ({ onClose, onSuccess, temaId }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingTema, setLoadingTema] = useState(true);
    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imagenOriginal, setImagenOriginal] = useState(null);

    const [formData, setFormData] = useState({
        temaId: null,
        nombreTema: "",
        descripcion: "",
        creacionSubtema: [],
        imagenPortada: null,
        nuevaImagen: null,
    });

    useEffect(() => {
        const cargarTema = async () => {
            try {
                setLoadingTema(true);
                const res = await serviceApiNet.Temas.getById(temaId);
                const data = res.data?.data || res.data;
                const tema = Array.isArray(data) ? data[0] : data;
                setFormData({
                    temaId: tema.temaId,
                    nombreTema: tema.nombreTema || "",
                    descripcion: tema.descripcion || "",
                    creacionSubtema: tema.creacionSubtemaList ||
                        (tema.creacionSubtema ? tema.creacionSubtema.split(',').map(s => s.trim()) : []),
                    imagenPortada: tema.imagenPortada || null,
                    nuevaImagen: null,
                });

                if (tema.imagenPortada) {
                    setImagenOriginal(tema.imagenPortada);
                    setPreviewUrl(tema.imagenPortada);
                }

            } catch (error) {
                console.error("Error al cargar el tema:", error);
                alert("No se pudo cargar la información del tema");
                onClose();
            } finally {
                setLoadingTema(false);
            }
        };

        if (temaId) cargarTema();
    }, [temaId]);

    useEffect(() => {
        if (formData.nuevaImagen instanceof File) {
            const objectUrl = URL.createObjectURL(formData.nuevaImagen);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [formData.nuevaImagen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es demasiado grande. El máximo es 5MB.");
            return;
        }

        setFormData(prev => ({ ...prev, nuevaImagen: file }));
    };

    const validarCampo = useCallback((name, value) => {
        if (name === "nombreTema") {
            if (!value.trim()) return "El nombre es requerido";
            if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
        }
        return "";
    }, []);

    const manejarCambio = useCallback((e) => {
        const name = e.target ? e.target.name : e.name;
        const value = e.target ? e.target.value : e.value;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (!Array.isArray(value)) {
            setErrors(prev => ({ ...prev, [name]: validarCampo(name, value) }));
        }
    }, [validarCampo]);

    const manejarEnvios = async () => {
        const errorNombre = validarCampo("nombreTema", formData.nombreTema);
        if (errorNombre) {
            setErrors({ nombreTema: errorNombre });
            return;
        }

        try {
            setLoading(true);

            const temaData = {
                temaId: formData.temaId,
                nombreTema: formData.nombreTema,
                descripcion: formData.descripcion,
                creacionSubtema: Array.isArray(formData.creacionSubtema)
                    ? formData.creacionSubtema.join(', ')
                    : formData.creacionSubtema,
                imagenPortada: formData.imagenPortada,
                nuevaImagen: formData.nuevaImagen,
            };

            await serviceApiNet.Temas.update(temaData);

            if (onSuccess) onSuccess();
            setStep(5);
            setTimeout(() => {
                if (onClose) onClose();
            }, 3000);

        } catch (error) {
            console.error("Error al actualizar el tema:", error);
            const msg = error.response?.data?.mensaje ||
                error.response?.data?.message ||
                "Ocurrió un error al actualizar el tema";
            setErrors({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    if (loadingTema) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50">
                <div className="w-[450px] bg-white m-4 shadow-2xl flex flex-col items-center justify-center rounded-3xl">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-500 font-medium mt-4">Cargando tema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-300">
            <div className="w-[450px] bg-white m-4 shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 rounded-3xl overflow-hidden border border-slate-200">

                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: step === 5 ? '100%' : '50%' }}
                    />
                </div>

                <div className="flex justify-between items-start p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Editar Tema
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {step === 5 ? '¡Cambios guardados!' : 'Modifica la información del tema'}
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
                                    <p className="text-xs text-slate-500">Modifica los datos del tema</p>
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

                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                                        Miniatura de portada
                                        {previewUrl && (
                                            <span className="ml-2 text-indigo-500 normal-case font-normal">
                                                (imagen actual — haz clic para cambiar)
                                            </span>
                                        )}
                                    </label>

                                    <div
                                        onClick={() => document.getElementById('imageInputEdit').click()}
                                        className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center overflow-hidden min-h-[220px]"
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-full p-2">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-[1.8rem]"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.8rem]">
                                                    <p className="text-white font-bold text-sm bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
                                                        Cambiar imagen
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative z-10 flex flex-col items-center p-6 text-center">
                                                <div className="bg-slate-50 p-5 rounded-3xl mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                                                    <Upload className="text-indigo-600" size={32} />
                                                </div>
                                                <h5 className="text-slate-900 font-bold text-lg">Sube tu portada</h5>
                                                <p className="text-slate-400 text-sm font-medium max-w-[200px]">
                                                    Formatos: JPG, PNG o WebP
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            id="imageInputEdit"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>

                                    {formData.nuevaImagen && (
                                        <p className="text-xs text-indigo-600 font-medium mt-2 text-center">
                                            ✅ Nueva imagen seleccionada: {formData.nuevaImagen.name}
                                        </p>
                                    )}
                                </div>

                                {errors.general && (
                                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl px-4 py-3">
                                        {errors.general}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500 py-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-20 animate-pulse" />
                                <div className="relative bg-indigo-50 rounded-full p-8">
                                    <CheckCircle2 className="text-indigo-600" size={80} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mt-8 mb-3 text-center">
                                ¡Tema Actualizado!
                            </h3>
                            <p className="text-slate-500 text-center max-w-xs">
                                Los cambios se han guardado correctamente.
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
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <><Save size={18} /> Guardar Cambios</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditarTema;
import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, X, Save, CheckCircle2, Loader2 } from 'lucide-react';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { InputConError, SelectConError } from '../../diseño_formulario/DiseñoFormulario';

const EditOU = ({ onClose, onSuccess, ouId }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingOU, setLoadingOU] = useState(true);
    const [errors, setErrors] = useState({});
    const [jefes, setJefes] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        jefeId: "",
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoadingOU(true);
                const [resOU, resJefes] = await Promise.all([
                    serviceApiNet.Ous.getById(ouId),
                    serviceApiNet.Jefes.list(),
                ]);

                const jefesArray = Array.isArray(resJefes.data?.data)
                    ? resJefes.data.data
                    : Array.isArray(resJefes.data)
                        ? resJefes.data
                        : [];

                setJefes(jefesArray.map(j => ({
                    value: (j.jefeId || "").toString(),
                    label: j.nombre || "Sin Nombre"
                })));

                const ou = resOU.data?.data || resOU.data;
                setFormData({
                    nombre: ou.nombre || "",
                    descripcion: ou.descripcion || "",
                    jefeId: (ou.jefeId || "").toString(),
                });

            } catch (error) {
                console.error("Error al cargar la OU:", error);
                alert("No se pudo cargar la información de la unidad organizativa");
                onClose();
            } finally {
                setLoadingOU(false);
            }
        };

        if (ouId) cargarDatos();
    }, [ouId]);

    const validarCampo = useCallback((name, value) => {
        const validaciones = {
            nombre: () => {
                if (!value.trim()) return "El nombre es requerido";
                if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras";
                return "";
            },
        };
        return validaciones[name] ? validaciones[name]() : "";
    }, []);

    const manejarCambio = useCallback((e) => {
        const name = e.target ? e.target.name : e.name;
        const value = e.target ? e.target.value : e.value;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validarCampo(name, value) }));
    }, [validarCampo]);

    const manejarEnvios = async () => {
        const errorNombre = validarCampo("nombre", formData.nombre);
        if (errorNombre) {
            setErrors(prev => ({ ...prev, nombre: errorNombre }));
            return;
        }

        try {
            setLoading(true);

            const ouData = {
                OrganizacionalesId: Number(ouId),
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                jefeId: formData.jefeId ? parseInt(formData.jefeId) : null,
            };

            await serviceApiNet.Ous.update(ouId, ouData);

            if (onSuccess) onSuccess();
            setStep(5);
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);

        } catch (error) {
            console.error("Error al actualizar la OU:", error);
            const msg = error.response?.data?.mensaje ||
                error.response?.data?.message ||
                "No se pudo actualizar la unidad organizativa";
            setErrors(prev => ({ ...prev, general: msg }));
        } finally {
            setLoading(false);
        }
    };

    if (loadingOU) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50">
                <div className="w-[450px] bg-white m-4 shadow-2xl flex flex-col items-center justify-center rounded-3xl">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-500 font-medium mt-4">Cargando unidad organizativa...</p>
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
                            Editar Unidad Organizativa
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {step === 5 ? '¡Cambios guardados!' : 'Modifica la información de la OU'}
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
                                    <h3 className="font-bold text-slate-800">Información de la OU</h3>
                                    <p className="text-xs text-slate-500">Modifica los datos de la unidad</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <InputConError
                                    label="Nombre de la OU"
                                    name="nombre"
                                    value={formData.nombre}
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
                                <SelectConError
                                    label="Jefe"
                                    name="jefeId"
                                    value={formData.jefeId}
                                    onChange={manejarCambio}
                                    options={jefes}
                                    errors={errors}
                                />

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
                                ¡OU Actualizada!
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

export default EditOU;
import React from 'react'
import { useCallback } from 'react';
import { useState } from 'react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { Sparkles } from 'lucide-react';
import { X } from 'lucide-react';
import { Save } from 'lucide-react';
import { InputConError, SelectConError } from '../diseño_formulario/DiseñoFormulario';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';



const CreateOU = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        jefeId: "",
    });
    const [jefes, setJefes] = useState([]);


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

    useEffect(() => {
        const cargarJefes = async () => {
            try {
                const res = await serviceApiNet.Jefes.list();
                const jefesArray = Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];

                setJefes(jefesArray.map(j => ({
                    value: (j.jefeId || "").toString(),
                    label: j.nombre || "Sin Nombre"
                })));
            } catch (error) {
                console.error("Error al cargar jefes:", error);
            }
        };

        cargarJefes();
    }, []);

    const manejarCambio = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const error = validarCampo(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
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
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                jefeId: formData.jefeId ? parseInt(formData.jefeId) : null,
            };

            await serviceApiNet.Ous.create(ouData);

            setStep(5);

            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (error) {
            console.error("Error al crear la OU:", error);
            setErrors(prev => ({ ...prev, general: "No se pudo crear la unidad organizativa" }));
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
                            Unidades Organizativas
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {step === 5 ? '¡Completado!' : 'Configuración de nueva OU'}
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
                                    <p className="text-xs text-slate-500">Define los permisos generales</p>
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
                                    required
                                />
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
                            <h3 className="text-3xl font-bold text-slate-800 mt-8 mb-3 text-center">¡OU Guardada!</h3>
                            <p className="text-slate-500 text-center max-w-xs">
                                La nueva OU se ha registrado correctamente y ya puede ser asignada a los usuarios.
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
                                <><Save size={18} /> Guardar OU</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateOU
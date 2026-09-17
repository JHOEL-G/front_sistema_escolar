import React, { useState, useCallback } from 'react';
import { X, Save, CheckCircle2, ChevronRight, ChevronLeft, Info, Sparkles, Settings2, Layout } from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { InputConError, SelectConError, StepItem } from '../diseño_formulario/DiseñoFormulario';

const TIPOS_CAMPO = [
    { id: 1, nombre: 'Texto de una sola línea' },
    { id: 2, nombre: 'Selección de múltiples valores' },
    { id: 3, nombre: 'Casilla de verificación individual' },
    { id: 4, nombre: 'Casilla de verificación múltiple' },
    { id: 5, nombre: 'Correo electrónico' },
];

const CreatePropiedad = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombrePropiedad: "",
        etiqueta: "",
        descripcion: "",
        tipoCampo: "",
        usarComoFiltro: false,
        usarEnReporte: false,
        esRequerido: false,
    });

    const manejarCambio = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    }, []);

    const validarPaso = (pasoActual) => {
        const nuevosErrores = {};
        if (pasoActual === 1) {
            if (!formData.nombrePropiedad.trim()) nuevosErrores.nombrePropiedad = "El nombre es requerido";
            if (!formData.etiqueta.trim()) nuevosErrores.etiqueta = "La etiqueta es requerida";
        } else if (pasoActual === 2) {
            if (!formData.tipoCampo) nuevosErrores.tipoCampo = "Debes seleccionar un tipo de campo";
        }
        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const manejarEnvioFinal = async () => {
        try {
            setLoading(true);
            const dataParaEnviar = {
                ...formData,
                tipoCampo: parseInt(formData.tipoCampo),
                valorDefecto: ""
            };

            await serviceApiNet.Propiedades.create(dataParaEnviar);
            setStep(3);
            setTimeout(() => { if (onClose) onClose(); }, 2500);
        } catch (error) {
            setErrors({ general: error.response?.data?.mensaje || "Error al guardar" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-300">
            <div className="w-[500px] bg-white m-4 shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 rounded-3xl overflow-hidden border border-slate-200">

                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-start p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Nueva Propiedad
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {step === 3 ? '¡Completado!' : `Configuración del campo • Paso ${step} de 2`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="text-slate-400" size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Información básica</h3>
                                    <p className="text-xs text-slate-500">Define cómo se identificará este campo</p>
                                </div>
                            </div>

                            <InputConError label="Nombre Interno" name="nombrePropiedad" placeholder="ej: fecha_nacimiento" value={formData.nombrePropiedad} onChange={manejarCambio} errors={errors} required />
                            <InputConError label="Etiqueta Visible" name="etiqueta" placeholder="ej: Fecha de Nacimiento" value={formData.etiqueta} onChange={manejarCambio} errors={errors} required />

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Descripción (opcional)</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={manejarCambio}
                                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all min-h-[100px] resize-none text-sm"
                                    placeholder="¿Para qué sirve este campo?"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Tipo y Comportamiento</h3>
                                    <p className="text-xs text-slate-500">Configura la entrada de datos</p>
                                </div>
                            </div>

                            <SelectConError label="Tipo de dato" name="tipoCampo" value={formData.tipoCampo} onChange={manejarCambio} options={TIPOS_CAMPO} errors={errors} required />

                            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ajustes avanzados</p>
                                {[
                                    { id: 'usarComoFiltro', label: 'Habilitar como filtro', desc: 'Permite buscar registros por este campo' },
                                    { id: 'usarEnReporte', label: 'Incluir en reportes', desc: 'Aparecerá en las exportaciones de datos' },
                                    { id: 'esRequerido', label: 'Campo obligatorio', desc: 'No se podrá guardar sin completar este valor' }
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{item.label}</span>
                                            <span className="text-[11px] text-slate-400">{item.desc}</span>
                                        </div>
                                        <div className="relative inline-flex items-center">
                                            <input type="checkbox" name={item.id} checked={formData[item.id]} onChange={manejarCambio} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500 py-10 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-30 rounded-full"></div>
                                <div className="relative bg-emerald-50 rounded-full p-8 mb-6">
                                    <CheckCircle2 className="text-emerald-500" size={60} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">¡Propiedad Lista!</h3>
                            <p className="text-slate-500 max-w-[240px] mt-2 text-sm">La configuración se ha guardado y el campo está listo para usarse.</p>
                        </div>
                    )}
                </div>

                {step < 3 && (
                    <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm px-4 transition-colors">
                            Cancelar
                        </button>

                        <div className="flex gap-3">

                            <button
                                onClick={step === 1 ? () => validarPaso(1) && setStep(2) : manejarEnvioFinal}
                                disabled={loading}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg
                                    ${loading ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
                                {loading ? 'Guardando...' : step === 1 ? 'Siguiente' : 'Finalizar Configuración'}
                                {!loading && <ChevronRight size={18} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePropiedad;
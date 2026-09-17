import React, { useState, useCallback, useEffect } from 'react';
import { EyeOff, Eye, X, Upload, ChevronRight, ChevronLeft, Save, AlertCircle, CheckCircle2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { InputConError, SelectConError, StepItem } from '../../diseño_formulario/DiseñoFormulario';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';

const EditUsuario = ({ onClose, onSuccess, usuarioId }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingUsuario, setLoadingUsuario] = useState(true);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);

    const [roles, setRoles] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [jefes, setJefes] = useState([]);
    const [unidades_organizacionales, setUnidades] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        nombre: "",
        apeLLido: "",
        correo: "",
        contraseña: "",
        puestoId: "",
        unidad_Organizacional: "",
        jefeId: "",
        correoAlternativo: "",
        curp: "",
        fechaActivacion: "",
        fechaDesactivacion: "",
        fechaNacimiento: "",
        idEmpleado: "",
        razonSocial: "",
        rolId: "",
        nivelPermiso: "Lite",
        activo: true,
    });

    const mapeoNiveles = [
        { id: 1, nombre: "Administrador" },
        { id: 2, nombre: "Colaborador" },
        { id: 3, nombre: "Instructor" },
        { id: 4, nombre: "Lite" },
    ];

    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        return fecha.split('T')[0];
    };

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                setIsLoadingData(true);
                setLoadingUsuario(true);

                const [resRoles, resOus, resPuestos, resJefes, resUsuario] = await Promise.all([
                    serviceApiNet.Roles.list(),
                    serviceApiNet.Ous.list(),
                    serviceApiNet.Puestos.list(),
                    serviceApiNet.Jefes.list(),
                    serviceApiNet.Usuario.getById(usuarioId),
                ]);

                const rolesArray = Array.isArray(resRoles.data?.data) ? resRoles.data.data : (Array.isArray(resRoles.data) ? resRoles.data : []);
                setRoles(rolesArray.map(r => ({ value: (r.rolId || "").toString(), label: r.nombreRol || "Sin Nombre" })));

                const ousArray = Array.isArray(resOus.data?.data) ? resOus.data.data : (Array.isArray(resOus.data) ? resOus.data : []);
                setUnidades(ousArray.map(ou => ({ value: (ou.organizacionalesId || "").toString(), label: ou.nombre || "Sin Nombre" })));

                const puestosArray = Array.isArray(resPuestos.data?.data) ? resPuestos.data.data : (Array.isArray(resPuestos.data) ? resPuestos.data : []);
                setPuestos(puestosArray.map(p => ({ value: (p.puestoId || "").toString(), label: p.nombre_Puesto || "Sin Nombre" })));

                const jefesArray = Array.isArray(resJefes.data?.data) ? resJefes.data.data : (Array.isArray(resJefes.data) ? resJefes.data : []);
                setJefes(jefesArray.map(j => ({ value: (j.jefeId || "").toString(), label: j.nombre || "Sin Nombre" })));

                const u = resUsuario.data?.data || resUsuario.data;
                setFormData({
                    nombre: u.nombre || "",
                    apeLLido: u.apeLLido || u.apellido || "",
                    correo: u.correo || "",
                    contraseña: "",
                    puestoId: (u.puestoId || "").toString(),
                    unidad_Organizacional: (u.organizacionalesId || u.unidad_Organizacional || "").toString(),
                    jefeId: (u.jefeId || "").toString(),
                    correoAlternativo: u.correoAlternativo || "",
                    curp: u.curp || "",
                    fechaActivacion: formatearFecha(u.fechaActivacion),
                    fechaDesactivacion: formatearFecha(u.fechaDesactivacion),
                    fechaNacimiento: formatearFecha(u.fechaNacimiento),
                    idEmpleado: (u.idEmpleado || "").toString(),
                    razonSocial: u.razonSocial || "",
                    rolId: (u.rolId || "").toString(),
                    nivelPermiso: (u.nivelPermisoId || 4).toString(),
                    activo: u.activo ?? true,
                });

            } catch (error) {
                console.error("Error cargando datos:", error);
                alert("Error al cargar los datos del usuario");
            } finally {
                setIsLoadingData(false);
                setLoadingUsuario(false);
            }
        };

        if (usuarioId) cargarTodo();
    }, [usuarioId]);

    const generarContraseña = useCallback(() => {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%&*';
        const todos = mayusculas + minusculas + numeros + especiales;

        let contraseña = '';
        contraseña += mayusculas[Math.floor(Math.random() * mayusculas.length)];
        contraseña += minusculas[Math.floor(Math.random() * minusculas.length)];
        contraseña += numeros[Math.floor(Math.random() * numeros.length)];
        contraseña += especiales[Math.floor(Math.random() * especiales.length)];

        for (let i = 4; i < 12; i++) {
            contraseña += todos[Math.floor(Math.random() * todos.length)];
        }

        contraseña = contraseña.split('').sort(() => Math.random() - 0.5).join('');
        setFormData(prev => ({ ...prev, contraseña }));
        setErrors(prev => ({ ...prev, contraseña: "" }));
    }, []);

    const validarCampo = useCallback((name, value) => {
        const validaciones = {
            nombre: () => {
                if (!value.trim()) return "El nombre es requerido";
                if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras";
                return "";
            },
            apeLLido: () => {
                if (!value.trim()) return "El apellido es requerido";
                if (value.length < 2) return "El apellido debe tener al menos 2 caracteres";
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El apellido solo puede contener letras";
                return "";
            },
            correo: () => {
                if (!value.trim()) return "El correo es requerido";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Formato de correo inválido";
                return "";
            },
            correoAlternativo: () => {
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Formato de correo inválido";
                return "";
            },
            contraseña: () => {
                if (!value) return "";
                if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return "Debe contener mayúsculas, minúsculas y números";
                return "";
            },
            fechaNacimiento: () => {
                if (!value) return "La fecha de nacimiento es requerida";
                const fecha = new Date(value);
                const hoy = new Date();
                const edad = hoy.getFullYear() - fecha.getFullYear();
                if (edad < 18) return "El usuario debe ser mayor de 18 años";
                if (edad > 100) return "Fecha de nacimiento inválida";
                return "";
            },
            rolId: () => !value ? "El rol es requerido" : "",
            jefeId: () => !value ? "El jefe es requerido" : "",
            unidad_Organizacional: () => !value.trim() ? "La unidad organizacional es requerida" : "",
        };

        return validaciones[name] ? validaciones[name]() : "";
    }, []);

    const validarPaso = useCallback((pasoActual) => {
        const camposPorPaso = {
            1: ['nombre', 'apeLLido', 'correo', 'correoAlternativo'],
            2: ['contraseña', 'rolId', 'puestoId', 'jefeId'],
            3: ['unidad_Organizacional', 'fechaActivacion', 'idEmpleado'],
            4: ['fechaNacimiento', 'razonSocial', 'nivelPermiso'],
        };

        const campos = camposPorPaso[pasoActual] || [];
        const nuevosErrores = {};

        campos.forEach(campo => {
            const error = validarCampo(campo, formData[campo]);
            if (error) nuevosErrores[campo] = error;
        });

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    }, [formData, validarCampo]);

    const manejarCambio = useCallback((e) => {
        const name = e.target ? e.target.name : e.name;
        const value = e.target ? e.target.value : e.value;

        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validarCampo(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [validarCampo]);

    const manejarImagenSubida = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { alert("La imagen no debe superar los 5MB"); return; }
            if (!file.type.startsWith('image/')) { alert("Por favor selecciona una imagen válida"); return; }

            setImagenFile(file);

            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const siguientePaso = useCallback(() => {
        if (validarPaso(step)) setStep(prev => prev + 1);
    }, [step, validarPaso]);

    const anteriorPaso = useCallback(() => {
        setStep(prev => prev - 1);
        setErrors({});
    }, []);

    const manejarEnvios = async () => {
        if (!validarPaso(4)) return;

        try {
            setLoading(true);

            const limpiarId = (valor) => {
                if (valor === null || valor === undefined || valor === "") return null;
                const num = Number(valor);
                return isNaN(num) ? null : num;
            };

            const usuarioData = {
                UsuarioId: Number(usuarioId),
                Nombre: formData.nombre.trim(),
                ApeLLido: formData.apeLLido.trim(),
                Correo: formData.correo.trim(),
                CorreoAlternativo: formData.correoAlternativo || null,
                Curp: formData.curp.toUpperCase(),
                FechaNacimiento: formData.fechaNacimiento,
                FechaActivacion: formData.fechaActivacion || null,
                FechaDesactivacion: formData.fechaDesactivacion || null,
                IdEmpleado: formData.idEmpleado.toString(),
                RazonSocial: formData.razonSocial,
                OrganizacionalesId: limpiarId(formData.unidad_Organizacional),
                RolId: limpiarId(formData.rolId),
                PuestoId: limpiarId(formData.puestoId),
                JefeId: limpiarId(formData.jefeId),
                NivelPermisoId: Number(formData.nivelPermiso) || 4,
                Activo: formData.activo,
            };

            if (formData.contraseña) {
                usuarioData.Contraseña = formData.contraseña;
            }


            const formDataToSend = new FormData();
            formDataToSend.append('UsuarioData', JSON.stringify(usuarioData));
            if (imagenFile) {
                formDataToSend.append('imagen', imagenFile);
            }
            await serviceApiNet.Usuario.update(usuarioId, formDataToSend);


            setStep(5);
            if (onSuccess) onSuccess();
            setTimeout(() => { if (onClose) onClose(); }, 3000);

        } catch (error) {
            console.error("❌ Error:", error);
            let mensajeError = 'Hubo un error al actualizar el usuario';
            if (error.response) {
                mensajeError = error.response.data?.mensaje ||
                    error.response.data?.Mensaje ||
                    error.response.data?.message ||
                    mensajeError;
            }
            alert(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    if (loadingUsuario || isLoadingData) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50">
                <div className="w-[500px] bg-white m-4 shadow-2xl flex flex-col items-center justify-center rounded-3xl">
                    <Loader2 className="animate-spin text-indigo-500" size={48} />
                    <p className="text-slate-500 font-medium mt-4">Cargando datos del usuario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-300">
            <div className="w-[500px] bg-white m-4 shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 rounded-3xl overflow-hidden border border-slate-200">

                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-start p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Editar Usuario
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {step === 5 ? '¡Cambios guardados!' : `Paso ${step} de 4`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200">
                        <X className="text-slate-400" size={22} />
                    </button>
                </div>

                {step <= 4 && (
                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                        <div className="flex items-center justify-between relative">
                            <StepItem label="Personales" active={step === 1} completed={step > 1} number={1} />
                            <div className={`flex-1 h-0.5 mx-3 mb-6 transition-all duration-500 ${step > 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-200'}`} />
                            <StepItem label="Acceso" active={step === 2} completed={step > 2} number={2} />
                            <div className={`flex-1 h-0.5 mx-3 mb-6 transition-all duration-500 ${step > 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-200'}`} />
                            <StepItem label="Organización" active={step === 3} completed={step > 3} number={3} />
                            <div className={`flex-1 h-0.5 mx-3 mb-6 transition-all duration-500 ${step > 3 ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-slate-200'}`} />
                            <StepItem label="Resumen" active={step === 4} number={4} />
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Información Personal</h3>
                                    <p className="text-xs text-slate-500">Datos básicos del usuario</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputConError label="Nombre" name="nombre" value={formData.nombre} onChange={manejarCambio} errors={errors} required />
                                <InputConError label="Apellido" name="apeLLido" value={formData.apeLLido} onChange={manejarCambio} errors={errors} required />
                            </div>
                            <InputConError label="Correo Electrónico" name="correo" type="email" value={formData.correo} onChange={manejarCambio} errors={errors} required />
                            <InputConError label="Correo Alternativo" name="correoAlternativo" type="email" value={formData.correoAlternativo} onChange={manejarCambio} errors={errors} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <Eye className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Información de Acceso</h3>
                                    <p className="text-xs text-slate-500">Deja la contraseña vacía para no cambiarla</p>
                                </div>
                            </div>

                            <div className="space-y-2 opacity-60">
                                <label className="text-sm font-semibold text-slate-700 flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <span>Contraseña</span>
                                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-tight border border-slate-200">
                                            Solo lectura
                                        </span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        name="contraseña"
                                        className="w-full px-4 py-3 border-2 rounded-xl outline-none bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed transition-all duration-200"
                                        type="password"
                                        value="********"
                                        disabled
                                        readOnly
                                        placeholder="No se puede modificar desde aquí"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <div className="p-1.5 opacity-30">
                                            <RefreshCw className="text-slate-400" size={16} />
                                        </div>
                                        <div className="p-1.5 opacity-30">
                                            <EyeOff className="text-slate-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-400 italic">
                                    Para cambiar la contraseña, utilice la opción "Restablecer contraseña" del menú de acciones.
                                </p>
                            </div>

                            <SelectConError label="Rol" name="rolId" value={formData.rolId} onChange={manejarCambio} options={roles} errors={errors} required />
                            <SelectConError label="Puesto" name="puestoId" value={formData.puestoId} onChange={manejarCambio} options={puestos} errors={errors} required />
                            <SelectConError label="Jefe Directo" name="jefeId" value={formData.jefeId} onChange={manejarCambio} options={jefes} errors={errors} required />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                    <CheckCircle2 className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Información Organizacional</h3>
                                    <p className="text-xs text-slate-500">Datos laborales</p>
                                </div>
                            </div>
                            <SelectConError label="Unidad Organizacional" name="unidad_Organizacional" value={formData.unidad_Organizacional} onChange={manejarCambio} options={unidades_organizacionales} errors={errors} required />
                            <div className="grid grid-cols-2 gap-4">
                                <InputConError label="Fecha de Activación" name="fechaActivacion" type="date" value={formData.fechaActivacion} onChange={manejarCambio} errors={errors} required />
                                <InputConError label="Fecha de Desactivación" name="fechaDesactivacion" type="date" value={formData.fechaDesactivacion} onChange={manejarCambio} errors={errors} />
                            </div>
                            <InputConError label="ID Empleado" name="idEmpleado" value={formData.idEmpleado} onChange={manejarCambio} errors={errors} required />
                            <InputConError label="CURP" name="curp" value={formData.curp} onChange={manejarCambio} errors={errors} required />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <CheckCircle2 className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Información Adicional</h3>
                                    <p className="text-xs text-slate-500">Últimos detalles</p>
                                </div>
                            </div>
                            <InputConError label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={manejarCambio} errors={errors} required />
                            <InputConError label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={manejarCambio} errors={errors} required />
                            <SelectConError label="Nivel de Permiso" name="nivelPermiso" value={formData.nivelPermiso} onChange={manejarCambio} options={mapeoNiveles} errors={errors} required />

                            <div className="mt-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-indigo-100">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-indigo-600" />
                                    Resumen de Cambios
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center py-2 border-b border-indigo-100/50">
                                        <span className="text-slate-600 font-medium">Nombre Completo:</span>
                                        <span className="text-slate-800 font-semibold">{formData.nombre} {formData.apeLLido}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-indigo-100/50">
                                        <span className="text-slate-600 font-medium">Correo:</span>
                                        <span className="text-slate-800 font-semibold">{formData.correo}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-indigo-100/50">
                                        <span className="text-slate-600 font-medium">Rol:</span>
                                        <span className="text-slate-800 font-semibold">{roles.find(r => r.value === formData.rolId.toString())?.label || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-indigo-100/50">
                                        <span className="text-slate-600 font-medium">Permiso:</span>
                                        <span className="text-slate-800 font-semibold">{mapeoNiveles.find(n => n.id === Number(formData.nivelPermiso))?.nombre || formData.nivelPermiso}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-600 font-medium">Contraseña:</span>
                                        <span className={`font-semibold text-xs px-2 py-1 rounded-full ${formData.contraseña ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {formData.contraseña ? '🔑 Se actualizará' : 'Sin cambios'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                <label className="text-sm font-semibold text-slate-700">Fotografía (Opcional)</label>
                                <input type="file" accept="image/*" onChange={manejarImagenSubida} className="hidden" id="foto-upload" />
                                <label htmlFor="foto-upload" className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 hover:border-indigo-300 cursor-pointer transition-all duration-200 group block">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="h-28 w-28 object-cover rounded-2xl shadow-lg" />
                                            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="text-white" size={28} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                                                <Upload className="text-indigo-600" size={24} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-600">Subir fotografía</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG (máx. 5MB)</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-50 animate-pulse" />
                                <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full p-8">
                                    <CheckCircle2 className="text-emerald-600" size={72} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mt-8 mb-3">¡Cambios Guardados!</h3>
                            <p className="text-slate-500 text-center max-w-sm">
                                El usuario ha sido actualizado exitosamente en el sistema
                            </p>
                        </div>
                    )}
                </div>

                {step <= 4 && (
                    <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                        {step > 1 ? (
                            <button onClick={anteriorPaso} className="text-slate-600 font-semibold px-6 py-2.5 hover:bg-slate-100 rounded-xl transition-colors duration-200 flex items-center gap-2" disabled={loading}>
                                <ChevronLeft size={18} /> Atrás
                            </button>
                        ) : (
                            <button onClick={onClose} className="text-slate-600 font-semibold px-6 py-2.5 hover:bg-slate-100 rounded-xl transition-colors duration-200">
                                Cancelar
                            </button>
                        )}

                        {step < 4 ? (
                            <button onClick={siguientePaso} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-200">
                                Siguiente <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button onClick={manejarEnvios} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Guardando...</>
                                ) : (
                                    <><Save size={18} /> Guardar Cambios</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditUsuario;
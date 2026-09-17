import React, { useState, useEffect } from 'react';
import {
    ChevronRight, Search, Info, Eye, AlertCircle, X, Save,
    Shield, Users, Building2, Globe, ChevronDown, Tag, UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { StepperLayout } from '../../gestion_curso/crear_gestion_curso/stepper_layout/StepperLayout';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { useNavigate } from 'react-router-dom';
import { useRutaActiveContext } from '../useRutaActiveContext';

const Privacidad = () => {
    const navigate = useNavigate();
    const { rutaData, updateRutaData, handleCancel, isEditing, rutaId } = useRutaActiveContext();
    const [formData, setFormData] = useState({
        nombrePrivacidad: rutaData?.nombrePrivacidad || 'Privado',
        externo: rutaData?.externo || false,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(rutaData?.seleccionados || []);
    const [agruparPor, setAgruparPor] = useState('ou');
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(true);

    const [unidadesOrganizacionales, setUnidadesOrganizacionales] = useState([]);
    const [roles, setRoles] = useState([]);
    const [propiedades, setPropiedades] = useState([]);

    useEffect(() => {
        if (!isEditing || !rutaData?.seleccionados?.length) return;
        if (!unidadesOrganizacionales.length && !roles.length && !propiedades.length) return;

        const enriquecidos = rutaData.seleccionados.map(s => {
            let catalogo = [];
            if (s.tipo === 'ou') catalogo = unidadesOrganizacionales;
            else if (s.tipo === 'rol') catalogo = roles;
            else if (s.tipo === 'propiedad') catalogo = propiedades;

            const encontrado = catalogo.find(item => item.id === s.id);
            return encontrado ?? s;
        });

        setSelectedItems(enriquecidos);
    }, [rutaData?.seleccionados, unidadesOrganizacionales, roles, propiedades]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [uoResponse, rolesResponse, propiedadesResponse] = await Promise.all([
                    serviceApiNet.Ous.list(),
                    serviceApiNet.Roles.list(),
                    serviceApiNet.Propiedades.list()
                ]);

                setUnidadesOrganizacionales((uoResponse.data?.data || []).map(uo => ({
                    id: uo.organizacionalesId,
                    nombre: uo.nombre,
                    colaboradores: uo.cantidadColaboradores ?? 0,
                    tipo: 'ou'
                })));

                setRoles((rolesResponse.data?.data || []).map(rol => ({
                    id: rol.rolId,
                    nombre: rol.nombreRol,
                    colaboradores: rol.cantidadUsuarios ?? 0,
                    tipo: 'rol'
                })));

                setPropiedades((propiedadesResponse.data?.data || []).map(prop => ({
                    id: prop.propiedadId,
                    nombre: prop.nombrePropiedad,
                    colaboradores: prop.totalUsuarios || 0,
                    tipo: 'propiedad'
                })));
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los catálogos');
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const getDatosActuales = () => {
        switch (agruparPor) {
            case 'ou': return unidadesOrganizacionales;
            case 'roles': return roles;
            case 'propiedades': return propiedades;
            default: return [];
        }
    };

    const handleToggleItem = (item) => {
        if (selectedItems.some(s => s.id === item.id && s.tipo === item.tipo)) {
            setSelectedItems(selectedItems.filter(s => !(s.id === item.id && s.tipo === item.tipo)));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleRemoveItem = (id, tipo) => {
        setSelectedItems(selectedItems.filter(s => !(s.id === id && s.tipo === tipo)));
    };

    const handleSelectAll = () => {
        const nuevos = datosFiltrados.filter(item =>
            !selectedItems.some(s => s.id === item.id && s.tipo === item.tipo)
        );
        setSelectedItems([...selectedItems, ...nuevos]);
        toast.success(`${nuevos.length} elementos agregados`);
    };

    const handlePrivacidadChange = (value) => {
        setFormData({ ...formData, nombrePrivacidad: value });
        if (value !== 'Privado') setSelectedItems([]);
    };

    const handleNext = () => {
        if (formData.nombrePrivacidad === 'Privado' && selectedItems.length === 0) {
            toast.warning('Debe seleccionar al menos un elemento para continuar');
            return;
        }

        const uosPrivacidad = selectedItems
            .filter(item => item.tipo === 'ou')
            .map(item => item.id);

        updateRutaData({
            ...formData,
            seleccionados: selectedItems,
            uosPrivacidad: uosPrivacidad,
        });
        if (isEditing) navigate(`/editar_ruta/${rutaId}/recursos`);
        else navigate('/crear_ruta/recursos');
    };

    const datosActuales = getDatosActuales();
    const datosFiltrados = datosActuales.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isSelected = (id, tipo) => selectedItems.some(s => s.id === id && s.tipo === tipo);

    const getIconoTipo = (tipo) => {
        switch (tipo) {
            case 'ou': return <Building2 className="w-3 h-3" />;
            case 'rol': return <UserCheck className="w-3 h-3" />;
            case 'propiedad': return <Tag className="w-3 h-3" />;
            default: return <Users className="w-3 h-3" />;
        }
    };

    const getLabelTipo = (tipo) => {
        switch (tipo) {
            case 'ou': return 'O.U';
            case 'rol': return 'Rol';
            case 'propiedad': return 'Propiedad';
            default: return '';
        }
    };

    const handleToggleUO = (uoId) => {
        const uosActuales = rutaData.uosPrivacidad || [];
        const nuevasUOs = uosActuales.includes(uoId)
            ? uosActuales.filter(id => id !== uoId)
            : [...uosActuales, uoId];
        updateRutaData({ uosPrivacidad: nuevasUOs });
    };

    const mostrarSeccionSeleccion = formData.nombrePrivacidad === 'Privado';

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
                                Configuración de Acceso
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Configurar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Privacidad</span>
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

                <StepperLayout currentStep={2} />

                {showBanner && (
                    <div className="mx-2 bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-200 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-400 rounded-full p-2 shadow-lg">
                                <AlertCircle className="w-5 h-5 text-indigo-900" />
                            </div>
                            <span className="text-xs font-medium leading-relaxed">
                                Debes tener en cuenta que los recursos de estudio tienen que tener la misma privacidad que la configurada en la ruta para que los colaboradores puedan visualizarlos en el explorador
                            </span>
                        </div>
                        <button className="text-white/60 hover:text-white transition-colors" onClick={() => setShowBanner(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="p-8 lg:p-12 border-b border-slate-100 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <Shield className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Configuración de Privacidad</h3>
                                <p className="text-sm text-slate-500 font-medium">Define quién puede acceder a esta ruta.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                    Nivel de Privacidad
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.nombrePrivacidad}
                                        onChange={(e) => handlePrivacidadChange(e.target.value)}
                                        className="w-full px-6 py-5 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-bold text-base cursor-pointer appearance-none"
                                    >
                                        <option value="Privado">Privado</option>
                                        <option value="Público">Público</option>
                                        <option value="Restringido">Restringido</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                    Acceso Externo
                                </label>
                                <div className="flex items-center gap-4 px-6 py-5 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] hover:border-indigo-300 transition-all">
                                    <button
                                        onClick={() => setFormData({ ...formData, externo: !formData.externo })}
                                        className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${formData.externo ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${formData.externo ? 'left-8' : 'left-1'}`} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <Globe className={`w-5 h-5 transition-colors ${formData.externo ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-bold transition-colors ${formData.externo ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {formData.externo ? 'Habilitado' : 'Deshabilitado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {mostrarSeccionSeleccion && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 animate-in fade-in slide-in-from-top-4">
                            <div className="lg:col-span-7 p-8 lg:p-12 border-r border-slate-50 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                        {agruparPor === 'ou' && <Building2 className="text-indigo-600" size={24} />}
                                        {agruparPor === 'roles' && <UserCheck className="text-indigo-600" size={24} />}
                                        {agruparPor === 'propiedades' && <Tag className="text-indigo-600" size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                            {agruparPor === 'ou' && 'Unidades Organizacionales'}
                                            {agruparPor === 'roles' && 'Roles'}
                                            {agruparPor === 'propiedades' && 'Propiedades'}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">Selecciona los elementos con acceso.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-3">
                                        <div className="relative group flex-1">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Escribe el nombre que quieres buscar..."
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder:text-slate-300 text-sm shadow-inner"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative w-48">
                                            <select
                                                value={agruparPor}
                                                onChange={(e) => { setAgruparPor(e.target.value); setSearchTerm(''); }}
                                                className="w-full px-4 py-5 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-bold text-sm cursor-pointer appearance-none"
                                            >
                                                <option value="ou">O.U</option>
                                                <option value="roles">Roles</option>
                                                <option value="propiedades">Propiedades</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                            <label className="absolute -top-2 left-4 bg-white px-2 text-[9px] font-bold text-slate-400 uppercase">
                                                Agrupar por
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pl-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            Resultados ({datosFiltrados.length})
                                        </label>
                                        <button onClick={handleSelectAll} className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wide">
                                            Seleccionar todos
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            </div>
                                        ) : datosFiltrados.length > 0 ? (
                                            datosFiltrados.map((item) => (
                                                <div
                                                    key={`${item.tipo}-${item.id}`}
                                                    onClick={() => handleToggleItem(item)}
                                                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer group ${isSelected(item.id, item.tipo)
                                                        ? 'border-indigo-500 bg-indigo-50/20 shadow-lg shadow-indigo-100'
                                                        : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected(item.id, item.tipo) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                            {isSelected(item.id, item.tipo) && (
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-base font-bold transition-colors ${isSelected(item.id, item.tipo) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                    {item.nombre}
                                                                </span>
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                                                                    {getLabelTipo(item.tipo)}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                                                                <Users className="w-3 h-3" />
                                                                {item.colaboradores} Colaboradores
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Eye size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                <Building2 className="w-12 h-12 mb-2 opacity-20" />
                                                <p className="text-sm font-medium">No se encontraron resultados</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight pl-2">
                                        <Info size={14} className="text-indigo-400" />
                                        <span>Puedes combinar O.U, Roles y Propiedades en tu selección.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 p-8 lg:p-12 bg-slate-50/30 flex flex-col space-y-8">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Selección Actual</label>
                                    <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                                        {selectedItems.length} Elementos
                                    </span>
                                </div>

                                <div className="flex-grow space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                                    {selectedItems.length > 0 ? (
                                        selectedItems.map((item) => (
                                            <div
                                                key={`selected-${item.tipo}-${item.id}`}
                                                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-start justify-between group animate-in fade-in slide-in-from-right-4"
                                            >
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {getIconoTipo(item.tipo)}
                                                        <h4 className="font-black text-slate-900 text-sm">{item.nombre}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase">
                                                            {getLabelTipo(item.tipo)}
                                                        </span>
                                                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                                                            <Users className="w-3 h-3" />{item.colaboradores}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveItem(item.id, item.tipo)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex-grow border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                                                <Building2 size={32} />
                                            </div>
                                            <div>
                                                <h5 className="text-slate-900 font-bold text-base mb-1">Sin elementos seleccionados</h5>
                                                <p className="text-slate-400 text-xs font-medium">Selecciona elementos del panel izquierdo.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                    <div className="relative z-10 space-y-2">
                                        <h4 className="text-sm font-bold">Consejo de privacidad</h4>
                                        <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                                            Puedes combinar diferentes criterios para definir con precisión quién tendrá acceso a la ruta.
                                        </p>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Shield size={100} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!mostrarSeccionSeleccion && (
                        <div className="p-12 text-center space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                <Globe className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Acceso {formData.nombrePrivacidad}</h3>
                                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                    {formData.nombrePrivacidad === 'Público'
                                        ? 'Esta ruta será visible para todos los colaboradores de la organización.'
                                        : 'Esta ruta tendrá acceso restringido según las configuraciones globales.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={mostrarSeccionSeleccion && selectedItems.length === 0}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuar a Recursos
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Privacidad;
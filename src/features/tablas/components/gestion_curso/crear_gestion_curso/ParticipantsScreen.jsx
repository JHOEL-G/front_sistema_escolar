import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    X,
    Users,
    ChevronDown,
    Filter,
    ChevronLeft,
    UploadCloud,
    ArrowLeft,
    Settings2
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from './stepper_layout/StepperLayout';
import { Plus } from 'lucide-react';

const UserCard = ({ user, selected, onToggle }) => (
    <div
        onClick={onToggle}
        className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${selected
            ? 'bg-indigo-50/50 border-indigo-200'
            : 'bg-white border-slate-100 hover:border-indigo-100'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`}
                        alt={user.nombre}
                        className="w-full h-full object-cover"
                    />
                </div>
                {selected && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800">{user.nombre}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {user.nombreOu} / {user.nombreRol}
                </p>
            </div>
        </div>
        {!selected ? (
            <div className="w-5 h-5 border-2 border-slate-200 rounded-lg group-hover:border-indigo-300 transition-colors"></div>
        ) : (
            <X size={16} className="text-slate-300 hover:text-rose-500" />
        )}
    </div>
);

const ParticipantsScreen = ({ initialData, onNext, onBack }) => {
    const [inscripcionAutomatica, setInscripcionAutomatica] = useState(
        initialData?.inscripcionAutomatica || false
    );
    const [permitirDesinscripcion, setPermitirDesinscripcion] = useState(
        initialData?.permitirDesinscripcion || false
    );
    const [participantesSeleccionados, setParticipantesSeleccionados] = useState(
        initialData?.participantes || []
    );
    const [criterios, setCriterios] = useState(initialData?.criterios || []);

    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSelected, setSearchSelected] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);

    const [rolesDisponibles, setRolesDisponibles] = useState([]);
    const [ousDisponibles, setOusDisponibles] = useState([]);
    const [propiedadesDisponibles, setPropiedadesDisponibles] = useState([]);
    const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
    const [ousSeleccionadas, setOusSeleccionadas] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);

                const normalizarArray = (response) => {
                    if (Array.isArray(response.data)) {
                        return response.data;
                    }
                    if (response.data?.data && Array.isArray(response.data.data)) {
                        return response.data.data;
                    }
                    if (response.data?.items && Array.isArray(response.data.items)) {
                        return response.data.items;
                    }
                    return [];
                };

                const responseUsuarios = await serviceApiNet.Usuario.list(true);
                const usuarios = normalizarArray(responseUsuarios);
                setUsuariosDisponibles(normalizarArray(responseUsuarios));

                const responseRoles = await serviceApiNet.Roles.list();
                const rolesData = normalizarArray(responseRoles);
                setRolesDisponibles(rolesData);

                const responseOus = await serviceApiNet.Ous.list();
                const ousRaw = normalizarArray(responseOus);

                const ousData = ousRaw.map(ou => ({
                    ouId: ou.organizacionalesId,
                    nombreOu: ou.nombre,
                    descripcion: ou.descripcion,
                    jefeId: ou.jefeId,
                    organizacionalesId: ou.organizacionalesId
                }));

                setOusDisponibles(ousData);

                const responsePropiedades = await serviceApiNet.Propiedades.list();
                const propiedadesData = normalizarArray(responsePropiedades);
                setPropiedadesDisponibles(propiedadesData);

                if (initialData?.criterios && Array.isArray(initialData.criterios)) {
                    const rolesIniciales = initialData.criterios
                        .filter(c => c.tipoCriterio === 'ROL')
                        .map(c => c.propiedadId)
                        .filter(id => id != null);
                    setRolesSeleccionados(rolesIniciales);

                    const ousIniciales = initialData.criterios
                        .filter(c => c.tipoCriterio === 'OU')
                        .map(c => c.organizationalUnitId)
                        .filter(id => id != null);
                    setOusSeleccionadas(ousIniciales);
                }

            } catch (error) {
                console.error('❌ Error al cargar datos:', error);
                toast.error('Error al cargar los datos necesarios');

                setRolesDisponibles([]);
                setOusDisponibles([]);
                setPropiedadesDisponibles([]);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [initialData]);

    const toggleUsuario = (usuarioId) => {
        if (participantesSeleccionados.includes(usuarioId)) {
            setParticipantesSeleccionados(participantesSeleccionados.filter(id => id !== usuarioId));
        } else {
            setParticipantesSeleccionados([...participantesSeleccionados, usuarioId]);
        }
    };

    const isSelected = (usuarioId) => {
        return participantesSeleccionados.includes(usuarioId);
    };

    const handleSeleccionarTodos = () => {
        const usuariosFiltrados = usuariosFiltradosDisponibles.map(u => u.usuarioId);
        const nuevosUsuarios = usuariosFiltrados.filter(id => !isSelected(id));

        if (nuevosUsuarios.length > 0) {
            setParticipantesSeleccionados([...participantesSeleccionados, ...nuevosUsuarios]);
            toast.success(`${nuevosUsuarios.length} usuarios agregados`);
        }
    };

    const handleDeseleccionarTodos = () => {
        setParticipantesSeleccionados([]);
        toast.info('Todos los usuarios deseleccionados');
    };

    const toggleRol = (rolId) => {
        if (rolesSeleccionados.includes(rolId)) {
            setRolesSeleccionados(rolesSeleccionados.filter(id => id !== rolId));
        } else {
            setRolesSeleccionados([...rolesSeleccionados, rolId]);
        }
    };

    const toggleOU = (ouId) => {
        if (ousSeleccionadas.includes(ouId)) {
            setOusSeleccionadas(ousSeleccionadas.filter(id => id !== ouId));
        } else {
            setOusSeleccionadas([...ousSeleccionadas, ouId]);
        }
    };

    const handleNext = () => {
        if (inscripcionAutomatica && rolesSeleccionados.length === 0 && ousSeleccionadas.length === 0) {
            toast.error('Debe definir al menos un criterio para inscripción automática');
            return;
        }

        if (!inscripcionAutomatica && participantesSeleccionados.length === 0) {
            toast.warning('No has seleccionado ningún participante');
        }

        const criteriosFormateados = [];

        rolesSeleccionados.forEach(rolId => {
            criteriosFormateados.push({
                tipoCriterio: 'ROL',
                propiedadId: rolId,
                operadorLogico: 'Y'
            });
        });

        ousSeleccionadas.forEach(ouId => {
            criteriosFormateados.push({
                tipoCriterio: 'OU',
                organizationalUnitId: ouId,
                operadorLogico: 'Y'
            });
        });

        onNext({
            inscripcionAutomatica,
            permitirDesinscripcion,
            participantes: participantesSeleccionados,
            criterios: criteriosFormateados
        });
    };

    const usuariosFiltradosDisponibles = usuariosDisponibles
        .filter(u => !isSelected(u.usuarioId))
        .filter(u => {
            if (!searchTerm) return true;
            const nombre = u.nombre?.toLowerCase() || '';
            const correo = u.correo?.toLowerCase() || '';
            return nombre.includes(searchTerm.toLowerCase()) || correo.includes(searchTerm.toLowerCase());
        })
        .filter(u => {
            const hayRoles = rolesSeleccionados.length > 0;
            const hayOus = ousSeleccionadas.length > 0;
            if (!hayRoles && !hayOus) return true;

            const cumpleRol = !hayRoles || rolesSeleccionados.includes(u.rolId);
            const cumpleOU = !hayOus || ousSeleccionadas.includes(u.organizacionalesId);
            return cumpleRol && cumpleOU;
        });

    const usuariosSeleccionadosData = usuariosDisponibles
        .filter(u => isSelected(u.usuarioId))
        .filter(u =>
            u.nombre?.toLowerCase().includes(searchSelected.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchSelected.toLowerCase())
        );

    const totalPages = Math.ceil(usuariosFiltradosDisponibles.length / pageSize);
    const usuariosPaginados = usuariosFiltradosDisponibles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="min-h-full bg-slate-50/30 font-sans selection:bg-indigo-100 pb-12">
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                Gestión Docente
                            </span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Selección de usuarios
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Configurar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Participantes</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 transition-all">
                            <UploadCloud size={18} className="text-indigo-500" /> Carga masiva
                        </button>
                    </div>
                </div>

                <StepperLayout currentStep={3} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-2">

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[600px]">
                        <div className="p-6 border-b border-slate-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Users size={18} className="text-indigo-500" /> Elige quién participará
                                </h3>
                                <button
                                    onClick={handleSeleccionarTodos}
                                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                >
                                    Seleccionar todos
                                </button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        {inscripcionAutomatica && (rolesSeleccionados.length > 0 || ousSeleccionadas.length > 0) && (
                            <div className="flex items-center gap-2 px-1 pb-1">
                                <Filter size={12} className="text-indigo-500" />
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                    Filtrando por criterios activos
                                </p>
                                {rolesSeleccionados.map(rolId => {
                                    const rol = rolesDisponibles.find(r => r.rolId === rolId);
                                    return rol ? (
                                        <span key={rolId} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">
                                            {rol.nombreRol}
                                        </span>
                                    ) : null;
                                })}
                                {ousSeleccionadas.map(ouId => {
                                    const ou = ousDisponibles.find(o => o.ouId === ouId);
                                    return ou ? (
                                        <span key={ouId} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-bold border border-violet-100">
                                            {ou.nombreOu}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}

                        <div className="flex-grow overflow-y-auto p-6 space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2">
                                Resultados ({usuariosFiltradosDisponibles.length})
                            </p>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="text-sm text-slate-400 mt-2">Cargando usuarios...</p>
                                </div>
                            ) : usuariosPaginados.length > 0 ? (
                                usuariosPaginados.map(user => (
                                    <UserCard
                                        key={user.usuarioId}
                                        user={user}
                                        selected={false}
                                        onToggle={() => toggleUsuario(user.usuarioId)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    No se encontraron usuarios
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Renglones por página</span>
                                <span className="bg-white border border-slate-200 rounded-lg text-xs p-1 font-bold">
                                    {pageSize}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, usuariosFiltradosDisponibles.length)} de {usuariosFiltradosDisponibles.length}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[600px]">
                        <div className="p-6 border-b border-slate-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    Usuarios seleccionados
                                </h3>
                                <button
                                    onClick={handleDeseleccionarTodos}
                                    className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                                >
                                    Deseleccionar todos
                                </button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar en la selección..."
                                    value={searchSelected}
                                    onChange={(e) => setSearchSelected(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto px-6 custom-scrollbar">
                            <div className="space-y-3 py-4">
                                {usuariosSeleccionadosData.length > 0 ? (
                                    usuariosSeleccionadosData.map(user => (
                                        <div key={user.usuarioId} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <UserCard
                                                user={user}
                                                selected={true}
                                                onToggle={() => toggleUsuario(user.usuarioId)}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-[2.5rem] mt-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                            <Users size={32} strokeWidth={1.5} />
                                        </div>
                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {participantesSeleccionados.length === 0 ? 'Lista vacía' : 'Sin coincidencias'}
                                        </h5>
                                        <p className="text-[10px] text-slate-400 mt-1 italic text-center">
                                            {participantesSeleccionados.length === 0
                                                ? 'Selecciona participantes para verlos aquí'
                                                : 'Prueba con otros términos de búsqueda'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 ">
                            <div className="py-2 rounded-2xl ">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] text-center">
                                    {participantesSeleccionados.length} Usuarios seleccionados
                                </p>
                                {searchSelected && (
                                    <p className="text-[9px] text-slate-400 text-center mt-1 font-bold uppercase tracking-tighter">
                                        Mostrando {usuariosSeleccionadosData.length} de la búsqueda
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Settings2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Configuración de Participantes</h3>
                    </div>

                    <div className="p-8 space-y-10">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="space-y-1 max-w-xl">
                                <h4 className="text-sm font-bold text-slate-800">Permitir Inscripción Automática</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Si activas esta opción, los usuarios que cumplan los criterios de acceso se inscribirán automáticamente.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 min-w-[140px] justify-end">
                                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${inscripcionAutomatica ? 'text-indigo-600' : 'text-slate-400'
                                    }`}>
                                    {inscripcionAutomatica ? 'Activo' : 'Inactivo'}
                                </span>

                                <button
                                    onClick={() => setInscripcionAutomatica(!inscripcionAutomatica)}
                                    className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${inscripcionAutomatica ? 'bg-indigo-600' : 'bg-slate-200'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 transform ${inscripcionAutomatica ? 'translate-x-6' : ''
                                        }`}></div>
                                </button>
                            </div>
                        </div>

                        {inscripcionAutomatica && (
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Criterios de Selección
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Roles</label>

                                        <div className="relative group">
                                            <div className="min-h-[52px] p-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all flex flex-wrap gap-2 items-center">

                                                {rolesSeleccionados.map(rolId => {
                                                    const rol = rolesDisponibles.find(r => r.rolId === rolId);
                                                    return rol ? (
                                                        <div key={rolId} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 rounded-xl text-[11px] font-bold border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                                                            {rol.nombreRol}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleRol(rolId);
                                                                }}
                                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}

                                                <div className="flex-1 min-w-[40px] h-8 relative">
                                                    <select
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        value=""
                                                        onChange={(e) => e.target.value && toggleRol(parseInt(e.target.value))}
                                                    >
                                                        <option value="" disabled></option>
                                                        {rolesDisponibles
                                                            .filter(r => !rolesSeleccionados.includes(r.rolId))
                                                            .map(rol => (
                                                                <option key={rol.rolId} value={rol.rolId}>
                                                                    {rol.nombreRol}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-all shadow-sm">
                                                    <Plus size={14} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-slate-400 font-medium italic pl-1">
                                            Inscripción automática por rol
                                        </p>
                                    </div>



                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Unidades Organizacionales (O.U)</label>

                                        <div className="relative group">
                                            <div className="min-h-[52px] p-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all flex flex-wrap gap-2 items-center">

                                                {ousSeleccionadas.map(ouId => {
                                                    const ou = ousDisponibles.find(o => o.ouId === ouId);
                                                    return ou ? (
                                                        <div key={ouId} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 rounded-xl text-[11px] font-bold border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                                                            {ou.nombreOu}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleOU(ouId);
                                                                }}
                                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}

                                                <div className="flex-1 min-w-[40px] h-8 relative">
                                                    <select
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        value=""
                                                        onChange={(e) => e.target.value && toggleOU(parseInt(e.target.value))}
                                                    >
                                                        <option value="" disabled></option>
                                                        {ousDisponibles
                                                            .filter(o => !ousSeleccionadas.includes(o.ouId))
                                                            .map(ou => (
                                                                <option key={ou.ouId} value={ou.ouId}>
                                                                    {ou.nombreOu}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-all shadow-sm">
                                                    <Plus size={14} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-slate-400 font-medium italic pl-1">
                                            Inscripción automática por unidad organizativa
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-opacity duration-300 ${!inscripcionAutomatica ? 'opacity-50' : 'opacity-100'
                            }`}>
                            <div className="space-y-1 max-w-xl">
                                <h4 className="text-sm font-bold text-slate-800">Permitir Desinscripción Automática</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Si se activa, los usuarios que dejen de cumplir los criterios serán desuscritos automáticamente.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 min-w-[140px] justify-end">
                                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${permitirDesinscripcion && inscripcionAutomatica ? 'text-indigo-600' : 'text-slate-400'
                                    }`}>
                                    {permitirDesinscripcion ? 'Activo' : 'Inactivo'}
                                </span>

                                <button
                                    onClick={() => setPermitirDesinscripcion(!permitirDesinscripcion)}
                                    disabled={!inscripcionAutomatica}
                                    className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${permitirDesinscripcion && inscripcionAutomatica ? 'bg-indigo-600' : 'bg-slate-200'
                                        } ${!inscripcionAutomatica ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 transform ${permitirDesinscripcion ? 'translate-x-6' : ''
                                        }`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={onBack}
                        className="text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Regresar
                    </button>

                    <button
                        onClick={handleNext}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm"
                    >
                        Siguiente paso
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ParticipantsScreen;
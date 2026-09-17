import React, { useState, useEffect } from 'react';
import {
    ChevronRight, Search, Info, Eye, Save,
    Filter, Users, ChevronLeft, Download, X,
    UserPlus, Shield, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from '../../gestion_curso/crear_gestion_curso/stepper_layout/StepperLayout';
import { useNavigate } from 'react-router-dom';
import { useRutaActiveContext } from '../useRutaActiveContext';

const Participantes = () => {
    const navigate = useNavigate();
    const { rutaData, updateRutaData, handleCancel, isEditing, rutaId } = useRutaActiveContext();

    const [formData, setFormData] = useState({
        propiedadesId: rutaData?.propiedadesId || null,
        permiteDesinscripcion: rutaData?.permiteDesinscripcion || false,
    });
    const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
    const [ousSeleccionadas, setOusSeleccionadas] = useState([]);

    const [participantesRaw, setParticipantesRaw] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [inscripcionAutomatica, setInscripcionAutomatica] = useState(false);
    const [participantes, setParticipantes] = useState([]);
    const [participantesSeleccionados, setParticipantesSeleccionados] = useState(
        rutaData?.participantesSeleccionados || []
    );
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [roles, setRoles] = useState([]);
    const [unidadesOrganizacionales, setUnidadesOrganizacionales] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [certificadores, setCertificadores] = useState(rutaData?.certificadores || []);
    const [searchCert, setSearchCert] = useState('');
    const [currentPageCert, setCurrentPageCert] = useState(1);

    useEffect(() => {
        if (isEditing && rutaData?.participantesSeleccionados?.length > 0) {
            setParticipantesSeleccionados(rutaData.participantesSeleccionados);
        }
    }, [rutaData?.participantesSeleccionados, isEditing]);

    useEffect(() => {
        if (!isEditing || !rutaData?.inscripcionAutomatica?.length) return;

        const rolesData = rutaData.inscripcionAutomatica.filter(i => i.tipo === 'rol');
        const ousData = rutaData.inscripcionAutomatica.filter(i => i.tipo === 'ou');
        const propData = rutaData.inscripcionAutomatica.find(i => i.tipo === 'propiedad');

        if (rolesData.length > 0 || ousData.length > 0) {
            setRolesSeleccionados(rolesData.map(r => r.id));
            setOusSeleccionadas(ousData.map(o => o.id));
            setInscripcionAutomatica(true);
        }

        setFormData(prev => ({
            ...prev,
            propiedadesId: propData?.id || null,
            permiteDesinscripcion: rutaData.permiteDesinscripcion || false,
        }));
    }, [rutaData?.inscripcionAutomatica, isEditing]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const responseUsuarios = await serviceApiNet.Usuario.list();
                const rawUsuarios = responseUsuarios.data || [];

                setParticipantesRaw(rawUsuarios);
                setParticipantes(rawUsuarios.map(user => ({
                    id: user.usuarioId,
                    nombre: `${user.nombre} ${user.apeLLido || ''}`.trim(),
                    area: user.unidad_Organizacional || 'Sin área',
                    cargo: user.nombreRol || 'Sin cargo',
                    iniciales: `${user.nombre?.charAt(0) || ''}${user.apeLLido?.charAt(0) || ''}`.toUpperCase(),
                    email: user.correo,
                    rolId: user.rolId,
                    organizacionalesId: user.organizacionalesId,
                })));

                const [rolesRes, uoRes, propRes] = await Promise.all([
                    serviceApiNet.Roles.list(),
                    serviceApiNet.Ous.list(),
                    serviceApiNet.Propiedades.list()
                ]);
                setRoles(rolesRes.data?.data || []);
                setUnidadesOrganizacionales(uoRes.data?.data || []);
                setPropiedades(propRes.data?.data || []);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los datos de participantes');
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    useEffect(() => {
        if (!inscripcionAutomatica) return;
        if (rolesSeleccionados.length === 0 && ousSeleccionadas.length === 0 && !formData.propiedadesId) {
            setParticipantesSeleccionados([]);
            return;
        }

        const usuariosFiltrados = participantesRaw.filter(user => {
            const cumpleRol = rolesSeleccionados.length > 0 ? rolesSeleccionados.includes(user.rolId) : true;
            const cumpleUo = ousSeleccionadas.length > 0 ? ousSeleccionadas.includes(user.organizacionalesId) : true;
            const cumpleProp = formData.propiedadesId ? user.propiedadId === formData.propiedadesId : true;
            return cumpleRol && cumpleUo && cumpleProp;
        });

        const seleccionados = usuariosFiltrados.map(user => ({
            id: user.usuarioId,
            nombre: `${user.nombre} ${user.apeLLido || ''}`.trim(),
            area: user.unidad_Organizacional || 'Sin área',
            iniciales: `${user.nombre?.charAt(0) || ''}${user.apeLLido?.charAt(0) || ''}`.toUpperCase(),
            email: user.correo,
        }));

        setParticipantesSeleccionados(seleccionados);

        toast.info(
            seleccionados.length > 0
                ? `${seleccionados.length} usuario(s) coinciden con los criterios`
                : 'Ningún usuario coincide con los criterios seleccionados',
            { toastId: 'auto-inscripcion' }
        );
    }, [rolesSeleccionados, ousSeleccionadas, formData.propiedadesId, inscripcionAutomatica, participantesRaw]);

    const handleToggleInscripcion = () => {
        const nuevoValor = !inscripcionAutomatica;
        setInscripcionAutomatica(nuevoValor);
        if (!nuevoValor) {
            setParticipantesSeleccionados([]);
            setRolesSeleccionados([]);
            setOusSeleccionadas([]);
            setFormData(prev => ({ ...prev, propiedadesId: null }));
        }
    };

    const handleToggleParticipante = (participante) => {
        setParticipantesSeleccionados(prev =>
            prev.some(p => p.id === participante.id)
                ? prev.filter(p => p.id !== participante.id)
                : [...prev, participante]
        );
    };

    const handleSeleccionarTodos = () => {
        setParticipantesSeleccionados(participantesFiltrados);
        toast.success(`${participantesFiltrados.length} participantes seleccionados`);
    };

    const handleNext = () => {
        if (inscripcionAutomatica && rolesSeleccionados.length === 0 && ousSeleccionadas.length === 0) {
            toast.error('Debe seleccionar al menos un rol o una unidad organizacional');
            return;
        }

        const inscripcionLista = inscripcionAutomatica ? [
            ...rolesSeleccionados.map(id => ({ id, tipo: 'rol' })),
            ...ousSeleccionadas.map(id => ({ id, tipo: 'ou' })),
            ...(formData.propiedadesId ? [{ id: formData.propiedadesId, tipo: 'propiedad' }] : []),
        ] : [];

        updateRutaData({
            propiedadesId: formData.propiedadesId,
            permiteDesinscripcion: formData.permiteDesinscripcion,
            participantesSeleccionados,
            inscripcionAutomatica: inscripcionLista,
            certificadores,
        });

        if (isEditing) navigate(`/editar_ruta/${rutaId}/configuracion`);
        else navigate('/crear_ruta/configuracion');
    };

    const participantesFiltrados = participantes.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(participantesFiltrados.length / itemsPerPage);
    const participantesPaginados = participantesFiltrados.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const isSelected = (id) => participantesSeleccionados.some(p => p.id === id);

    const criteriosCompletos = rolesSeleccionados.length > 0 || ousSeleccionadas.length > 0;
    const botonDeshabilitado = inscripcionAutomatica && !criteriosCompletos;

    const toggleRol = (id) => {
        setRolesSeleccionados(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const toggleOu = (id) => {
        setOusSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
        );
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
                                Gestión de Acceso
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Configurar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Participantes</span>
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

                <StepperLayout currentStep={4} />

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <UserPlus className="text-indigo-600" size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Selección Manual de Participantes</h3>
                                <p className="text-xs text-slate-500 font-medium">Opcional: Agrega usuarios específicos</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition-all">
                            <Download size={16} /> Carga masiva
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-7 border-r border-slate-100 flex flex-col">
                            <div className="p-6 space-y-4 border-b border-slate-100">
                                <div className="flex gap-3">
                                    <button className="p-3 border-2 border-slate-200 rounded-xl hover:border-indigo-300 transition-all">
                                        <Filter className="w-5 h-5 text-slate-400" />
                                    </button>
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre o correo..."
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder:text-slate-300 text-sm shadow-inner"
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pl-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Resultados ({participantesFiltrados.length})
                                    </span>
                                    <button onClick={handleSeleccionarTodos} className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wide">
                                        Seleccionar todos
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[400px]">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                                    </div>
                                ) : participantesPaginados.length > 0 ? (
                                    participantesPaginados.map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => handleToggleParticipante(p)}
                                            className={`flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${isSelected(p.id) ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected(p.id) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                    {isSelected(p.id) && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                                    {p.iniciales}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{p.nombre}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{p.area} / {p.cargo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <Users className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No se encontraron participantes</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="text-[10px]">
                                    {participantesFiltrados.length === 0 ? '0' : ((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, participantesFiltrados.length)} de {participantesFiltrados.length}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border-2 border-slate-200 rounded-lg bg-white disabled:opacity-30 hover:border-indigo-300 transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 border-2 border-slate-200 rounded-lg bg-white disabled:opacity-30 hover:border-indigo-300 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 bg-slate-50/30 p-8 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Seleccionados</label>
                                <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                                    {participantesSeleccionados.length}
                                </span>
                            </div>

                            {inscripcionAutomatica && criteriosCompletos && (
                                <div className="mb-4 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                                    <CheckCircle2 size={14} className="text-indigo-500 flex-shrink-0" />
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                                        Selección automática activa
                                    </span>
                                </div>
                            )}

                            <div className="flex-grow space-y-3 max-h-[360px] overflow-y-auto">
                                {participantesSeleccionados.length > 0 ? (
                                    participantesSeleccionados.map((p) => (
                                        <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                    {p.iniciales}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{p.nombre}</p>
                                                    <p className="text-[9px] text-slate-400 font-semibold uppercase">{p.area}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setParticipantesSeleccionados(prev => prev.filter(x => x.id !== p.id))}
                                                className="text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center h-full">
                                        <Users className="w-16 h-16 text-slate-200 mb-3" />
                                        <h5 className="text-sm font-bold text-slate-700 mb-1">Sin participantes</h5>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {inscripcionAutomatica
                                                ? 'Selecciona los criterios para auto-inscribir usuarios'
                                                : 'Selecciona usuarios del panel izquierdo'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <Shield className="text-indigo-600" size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Criterios de Inscripción Automática</h3>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
                            <div className="flex-1 pr-8">
                                <h4 className="text-sm font-bold text-slate-800 mb-2">Permitir Inscripción Automática</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Si activas esta opción, los usuarios que cumplan los criterios se inscribirán automáticamente.
                                </p>
                            </div>
                            <button
                                onClick={handleToggleInscripcion}
                                className={`relative w-14 h-7 rounded-full transition-all shadow-inner flex-shrink-0 ${inscripcionAutomatica ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${inscripcionAutomatica ? 'left-8' : 'left-1'}`} />
                            </button>
                        </div>

                        {inscripcionAutomatica && (
                            <>
                                {!criteriosCompletos && (
                                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                        <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                                        <p className="text-xs font-semibold text-amber-700">
                                            Debes seleccionar al menos un rol o una unidad organizacional para continuar.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                            Roles <span className="text-rose-500"></span>
                                        </label>
                                        <div className="bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] p-3 space-y-2 max-h-48 overflow-y-auto">
                                            {roles.map(item => (
                                                <label key={item.rolId} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${rolesSeleccionados.includes(item.rolId) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={rolesSeleccionados.includes(item.rolId)}
                                                        onChange={() => toggleRol(item.rolId)}
                                                        className="w-4 h-4 text-indigo-600 rounded"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-700">{item.nombreRol}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {rolesSeleccionados.length > 0 && (
                                            <p className="text-[10px] text-indigo-600 font-bold pl-2">{rolesSeleccionados.length} seleccionado(s)</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                            Unidad Organizacional <span className="text-rose-500"></span>
                                        </label>
                                        <div className="bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] p-3 space-y-2 max-h-48 overflow-y-auto">
                                            {unidadesOrganizacionales.map(item => (
                                                <label key={item.organizacionalesId} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${ousSeleccionadas.includes(item.organizacionalesId) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={ousSeleccionadas.includes(item.organizacionalesId)}
                                                        onChange={() => toggleOu(item.organizacionalesId)}
                                                        className="w-4 h-4 text-indigo-600 rounded"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-700">{item.nombre}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {ousSeleccionadas.length > 0 && (
                                            <p className="text-[10px] text-indigo-600 font-bold pl-2">{ousSeleccionadas.length} seleccionada(s)</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                            Propiedades
                                        </label>
                                        <select
                                            value={formData.propiedadesId || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                propiedadesId: e.target.value ? parseInt(e.target.value) : null
                                            }))}
                                            className={`w-full px-4 py-4 bg-slate-50/50 border-2 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-semibold cursor-pointer ${formData.propiedadesId ? 'border-indigo-300' : 'border-slate-200'}`}
                                        >
                                            <option value="">Seleccionar propiedad</option>
                                            {propiedades.map(item => (
                                                <option key={item.propiedadId} value={item.propiedadId}>{item.nombrePropiedad}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-6 border-t border-slate-100 space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">
                                        Inscripción de Certificadores
                                    </h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Elige al menos 4 certificadores para esta ruta de aprendizaje.
                                    </p>
                                </div>
                                <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold flex-shrink-0 ${certificadores.length >= 4
                                    ? 'bg-teal-100 text-teal-700'
                                    : 'bg-rose-100 text-rose-600'
                                    }`}>
                                    {certificadores.length} / 4 mín.
                                </span>
                            </div>

                            {certificadores.length > 0 && certificadores.length < 4 && (
                                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                                    <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                                    <p className="text-xs font-semibold text-amber-700">
                                        Faltan {4 - certificadores.length} certificador(es) para cumplir el mínimo requerido.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 border-2 border-slate-100 rounded-[2rem] overflow-hidden">

                                <div className="border-r border-slate-100 flex flex-col">
                                    <div className="p-4 border-b border-slate-100">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre o correo..."
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:border-indigo-400 outline-none transition-all"
                                                value={searchCert}
                                                onChange={e => { setSearchCert(e.target.value); setCurrentPageCert(1); }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-3 px-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Resultados ({participantes.filter(p =>
                                                    p.nombre.toLowerCase().includes(searchCert.toLowerCase()) ||
                                                    p.email?.toLowerCase().includes(searchCert.toLowerCase())
                                                ).length})
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const todos = participantes.filter(p =>
                                                        p.nombre.toLowerCase().includes(searchCert.toLowerCase()) ||
                                                        p.email?.toLowerCase().includes(searchCert.toLowerCase())
                                                    );
                                                    setCertificadores(todos);
                                                }}
                                                className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wide"
                                            >
                                                Seleccionar todos
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto max-h-64">
                                        {loading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                                            </div>
                                        ) : (
                                            participantes
                                                .filter(p =>
                                                    p.nombre.toLowerCase().includes(searchCert.toLowerCase()) ||
                                                    p.email?.toLowerCase().includes(searchCert.toLowerCase())
                                                )
                                                .slice((currentPageCert - 1) * itemsPerPage, currentPageCert * itemsPerPage)
                                                .map(p => {
                                                    const seleccionado = certificadores.some(c => c.id === p.id);
                                                    return (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => setCertificadores(prev =>
                                                                seleccionado
                                                                    ? prev.filter(c => c.id !== p.id)
                                                                    : [...prev, p]
                                                            )}
                                                            className={`flex items-center gap-3 p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors group ${seleccionado ? 'bg-indigo-50/30' : ''}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${seleccionado ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                                {seleccionado && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                                                {p.iniciales}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-700">{p.nombre}</p>
                                                                <p className="text-[10px] font-semibold text-slate-400 uppercase">{p.area} / {p.cargo}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>

                                    <div className="p-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                                        <span>
                                            {(() => {
                                                const filtered = participantes.filter(p =>
                                                    p.nombre.toLowerCase().includes(searchCert.toLowerCase()) ||
                                                    p.email?.toLowerCase().includes(searchCert.toLowerCase())
                                                );
                                                const start = filtered.length === 0 ? 0 : (currentPageCert - 1) * itemsPerPage + 1;
                                                const end = Math.min(currentPageCert * itemsPerPage, filtered.length);
                                                return `${start}–${end} de ${filtered.length}`;
                                            })()}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setCurrentPageCert(p => Math.max(1, p - 1))}
                                                disabled={currentPageCert === 1}
                                                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:border-indigo-300 transition-all"
                                            >
                                                <ChevronLeft size={12} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const filtered = participantes.filter(p =>
                                                        p.nombre.toLowerCase().includes(searchCert.toLowerCase()) ||
                                                        p.email?.toLowerCase().includes(searchCert.toLowerCase())
                                                    );
                                                    setCurrentPageCert(p => Math.min(Math.ceil(filtered.length / itemsPerPage), p + 1));
                                                }}
                                                disabled={(() => {
                                                    const filtered = participantes.filter(p =>
                                                        p.nombre.toLowerCase().includes(searchCert.toLowerCase()) ||
                                                        p.email?.toLowerCase().includes(searchCert.toLowerCase())
                                                    );
                                                    return currentPageCert >= Math.ceil(filtered.length / itemsPerPage);
                                                })()}
                                                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:border-indigo-300 transition-all"
                                            >
                                                <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/30 p-5 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Seleccionados
                                        </span>
                                        {certificadores.length >= 4 && (
                                            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-xl px-3 py-1">
                                                <CheckCircle2 size={12} className="text-teal-500" />
                                                <span className="text-[10px] font-bold text-teal-600">Mínimo cumplido</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 overflow-y-auto max-h-64">
                                        {certificadores.length > 0 ? (
                                            certificadores.map(c => (
                                                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                                                            {c.iniciales}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{c.nombre}</p>
                                                            <p className="text-[9px] text-slate-400 uppercase font-semibold">{c.area}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setCertificadores(prev => prev.filter(x => x.id !== c.id))}
                                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
                                                <Shield className="w-10 h-10 text-slate-200 mb-2" />
                                                <p className="text-xs font-bold text-slate-600 mb-1">No hay certificadores seleccionados</p>
                                                <p className="text-[10px] text-slate-400">Selecciona los certificadores que consideres para la ruta de aprendizaje</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        disabled={botonDeshabilitado}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuar a Configuración
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Participantes;
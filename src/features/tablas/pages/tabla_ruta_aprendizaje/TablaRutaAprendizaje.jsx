import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Search, Hash,
    ArrowRight, ArrowLeft, Loader2, Info,
    List, LayoutGrid, RefreshCcw, MoreVertical,
    Users, Shield, ShieldCheck, FileUp, Download,
    UserPlus, FileDown, PlusCircle, Calendar, CheckCircle2
} from 'lucide-react';
import { getPaginationRange } from "../../components/tabla_rol_diseño/TablaRolDiseño";
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import ActionDropdown from '../../../../components/acciones/UserActions';
import Modal from '../../../../components/modal/PageModal';
import { BookOpen } from 'lucide-react';
import { Users2 } from 'lucide-react';

const COLUMNS = [
    { key: 'imagenPortada', label: 'Imagen', icon: Shield },
    { key: 'nombreRuta', label: 'Ruta de aprendizaje', icon: Shield },
    { key: 'tipo', label: 'Tipo', icon: Hash },
    { key: 'creacion', label: 'Creación', icon: Calendar },
    { key: 'estatus', label: 'Estatus', icon: CheckCircle2 },
    { key: 'recursos', label: 'Recursos de Estudio', icon: List },
    { key: 'secciones', label: 'Secciones', icon: List },
    { key: 'participantes', label: 'Nº de Participantes', icon: Users },
];

const TablaRutaAprendizaje = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nombreRuta', direction: 'ascending' });
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('Todos');
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [selectedRuta, setSelectedRuta] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);


    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await serviceApiNet.RutaAprendizaje.list();
            const rawData = response.data?.data || [];

            const datosFormateados = rawData.map((ruta) => ({
                id: ruta.rutaId,
                nombreRuta: ruta.nombreRuta || 'Sin nombre',
                tipo: ruta.nombrePrivacidad || 'Privado',
                creacion: ruta.fechaCreacion
                    ? new Date(ruta.fechaCreacion).toLocaleDateString('es-ES')
                    : '-',
                estatus: ruta.condicionAvanceCurso || ruta.condicionAvanceSeccion
                    ? 'Configurado'
                    : 'Pendiente',
                recursos: ruta.totalRecursos ?? 0,
                secciones: ruta.totalSecciones ?? 0,
                participantes: ruta.totalParticipantes ?? 0,
                descripcion: ruta.descripcion,
                imagenPortada: ruta.imagenPortada,
                certificado: ruta.nombreCertificado,
                externo: ruta.externo,
            }));

            setData(datosFormateados);
        } catch (error) {
            console.error("Error al obtener las rutas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData();
        return () => controller.abort();
    }, []);

    const handleCrearRuta = () => {
        navigate('/crear_ruta');
    };

    const processedData = useMemo(() => {
        let filtered = [...data];
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                Object.values(item).some(val => String(val).toLowerCase().includes(low))
            );
        }
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [data, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(firstPageIndex, firstPageIndex + itemsPerPage);
    }, [currentPage, processedData]);

    const handleView = async (ruta) => {
        try {
            setLoadingDetail(true);
            setModalOpen(true);
            const response = await serviceApiNet.RutaAprendizaje.getById(ruta.id);
            setSelectedRuta(response.data?.data || null);
        } catch (error) {
            console.error('Error al obtener detalle:', error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleEdit = (ruta) => {
        navigate(`/editar_ruta/${ruta.id}`);
    };

    const getRowOptions = (ruta) => [
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(ruta)
        },
        {
            label: 'Editar Ruta',
            icon: <PencilLine size={16} />,
            onClick: () => handleEdit(ruta)
        },
    ]

    if (loading) return (
        <div className="flex inset-0 h-screen flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-700">
            <div className="relative flex items-center justify-center mb-9">
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-500/10 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full border-t-4 border-b-4 border-indigo-600 animate-[spin_2s_linear_infinite]" />
                <div className="relative p-4 bg-white rounded-full shadow-xl">
                    <Shield className="animate-pulse text-indigo-600" size={40} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Rutas</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Configurando entorno de aprendizaje...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-gray-800">
            <div className="max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rutas de aprendizaje</h1>
                    <div className='pt-3 flex gap-3'>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-600">
                            <FileDown size={16} />
                            Importar catálogo
                        </button>
                        <button
                            className='flex items-center gap-2 px-6 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100'
                            onClick={handleCrearRuta}
                        >
                            <PlusCircle size={20} />
                            Crear nueva
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Comienza a buscar..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto justify-end">
                        <div className="bg-white border border-slate-200 p-1 rounded-2xl flex shadow-sm">
                            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition ${viewMode === 'table' ? 'bg-slate-100 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}>
                                <List size={20} />
                            </button>
                            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}>
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                        <button onClick={fetchData} className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
                                    <tr>
                                        {COLUMNS.map(col => (
                                            <th
                                                key={col.key}
                                                onClick={() => setSortConfig({ key: col.key, direction: sortConfig.key === col.key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
                                                className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <col.icon size={14} className="opacity-50" />
                                                    {col.label}
                                                    {sortConfig.key === col.key && (sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="px-6 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                                            <td className="px-6 py-5 font-medium text-slate-700 text-sm">
                                                {item.imagenPortada ? (
                                                    <img
                                                        src={item.imagenPortada}
                                                        alt={item.nombreRuta}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <BookOpen size={20} className="text-slate-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 font-medium text-slate-700 text-sm">{item.nombreRuta}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold border border-indigo-100">
                                                    {item.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-500">{item.creacion}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.estatus === 'Configurado' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                                                    <span className="text-sm text-slate-600 font-medium">{item.estatus}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-600 text-center">{item.recursos}</td>
                                            <td className="px-6 py-5 text-sm text-slate-600 text-center">{item.secciones}</td>
                                            <td className="px-6 py-5 text-sm text-slate-600 text-center">{item.participantes}</td>
                                            <td className="px-6 py-5 text-right">
                                                <ActionDropdown options={getRowOptions(item)} title="Gestión" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentData.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                                        {item.imagenPortada ? (
                                            <img
                                                src={item.imagenPortada}
                                                alt={item.nombreRuta}
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Shield size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 rounded-md text-slate-500">{item.tipo}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{item.nombreRuta}</h3>
                                <p className="text-xs text-slate-400 mb-4 italic">{item.estatus}</p>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Recursos</p>
                                        <p className="text-sm font-bold text-slate-700">{item.recursos}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Secciones</p>
                                        <p className="text-sm font-bold text-slate-700">{item.secciones}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Participantes</p>
                                        <p className="text-sm font-bold text-slate-700">{item.participantes}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-indigo-600">{processedData.length}</span> Temas definidos
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(c => c - 1)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm text-slate-600"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex gap-1">
                            {getPaginationRange(currentPage, totalPages).map((page, i) => (
                                <button
                                    key={i}
                                    onClick={() => page !== "..." && setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === page
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(c => c + 1)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm text-slate-600"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </footer>
                <Modal
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false); setSelectedRuta(null); }}
                    title="Detalle de Ruta de Aprendizaje"
                    showConfirm={true}
                    confirmText="Editar Ruta"
                    onConfirm={() => { setModalOpen(false); navigate(`/editar_ruta/${selectedRuta?.rutaId}`); }}
                    variant="primary"
                >
                    {loadingDetail ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-indigo-500" size={36} />
                        </div>
                    ) : selectedRuta ? (
                        <div className="space-y-6">

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800">{selectedRuta.nombreRuta}</h2>
                                    <p className="text-sm text-slate-400 mt-1">{selectedRuta.descripcion}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Secciones', value: selectedRuta.totalSecciones, icon: BookOpen },
                                    { label: 'Cursos', value: selectedRuta.totalCursos, icon: List },
                                    { label: 'Participantes', value: selectedRuta.totalParticipantes, icon: Users2 },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                        <Icon size={18} className="mx-auto text-indigo-400 mb-1" />
                                        <p className="text-xl font-black text-slate-800">{value}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: 'Privacidad', value: selectedRuta.nombrePrivacidad },
                                    { label: 'Certificado', value: selectedRuta.nombreCertificado },
                                    { label: 'Criterio Aprobación', value: `${selectedRuta.criterioAprobacion}%` },
                                    { label: 'Gamificación', value: selectedRuta.gamificacion ?? '—' },
                                    { label: 'Fecha Asignación', value: selectedRuta.asignarFecha ? new Date(selectedRuta.asignarFecha).toLocaleDateString('es-ES') : '—' },
                                    { label: 'Día', value: selectedRuta.asignarDia ?? '—' },
                                    { label: 'Fecha Límite', value: selectedRuta.fechaLimite ? 'Sí' : 'No' },
                                    { label: 'Permite Desinscripción', value: selectedRuta.permiteDesinscripcion ? 'Sí' : 'No' },
                                    { label: 'Avance por Curso', value: selectedRuta.condicionAvanceCurso ? 'Requerido' : 'Libre' },
                                    { label: 'Avance por Sección', value: selectedRuta.condicionAvanceSeccion ? 'Requerido' : 'Libre' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
                                        <p className="font-semibold text-slate-700">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedRuta.mensajeBienvenida && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4">
                                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2">Mensaje de Bienvenida</p>
                                    <p className="text-sm text-slate-600 italic">"{selectedRuta.mensajeBienvenida}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8">No se pudo cargar el detalle.</p>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default TablaRutaAprendizaje;
import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Search, Hash,
    ArrowRight, ArrowLeft, Loader2, Info,
    List, LayoutGrid, RefreshCcw, MoreVertical,
    Users, Shield, ShieldCheck, FileUp, Download,
    UserPlus, FileDown, PlusCircle
} from 'lucide-react';
import { getPaginationRange, AvatarStack } from "../../components/tabla_rol_diseño/TablaRolDiseño"
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { useNavigate } from 'react-router-dom';
import CreateRol from '../../components/create_rol/CreateRol';
import ImportarRol from './importar_rol/ImportarRol';
import ActionDropdown from '../../../../components/acciones/UserActions';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import EditRol from '../../components/create_rol/editar_rol/EditRol';
import { AlignLeft } from 'lucide-react';
import Modal from '../../../../components/modal/PageModal';

const COLUMNS = [
    { key: 'id', label: 'ID', icon: Hash },
    { key: 'name', label: 'Nombre del Rol', icon: Shield },
    { key: 'asociados', label: 'Usuarios Asociados', icon: Users },
    { key: 'description', label: 'Descripción', icon: Info },
];


const TablaRol = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('Todos');
    const [editandoRolId, setEditandoRolId] = useState(null);
    const itemsPerPage = 6;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await serviceApiNet.Roles.list();

            const rawData = response.data?.data || [];

            const datosFormateados = rawData.map((u) => ({
                id: u.rolId,
                name: u.nombreRol,
                description: u.descripcion,
                asociados: u.cantidadUsuarios,
            }));
            if (response.data) {
                setData(datosFormateados);
            }
        } catch (error) {
            console.error("Error al obtener los roles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, []);

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

    const handleView = async (role) => {
        try {
            setLoadingDetalle(true);
            setIsViewModalOpen(true);

            const response = await serviceApiNet.Roles.getById(role.id);

            if (response.data && response.data.data) {
                setRolSeleccionado(response.data.data);
            }
        } catch (error) {
            console.error("Error al obtener detalle del rol:", error);
            alert("No se pudo cargar la información del rol");
            setIsViewModalOpen(false);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleEdit = (role) => {
        setEditandoRolId(role.id);
    };

    const getRowOptions = (rol) => [
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(rol)
        },
        {
            label: 'Editar Rol',
            icon: <PencilLine size={16} />,
            onClick: () => handleEdit(rol)
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
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Roles</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Configurando permisos de acceso...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-gray-800">
            <div className="max-w-8xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Roles</h1>
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-600"
                    >
                        <FileDown size={16} />
                        Importar catálogo
                    </button>

                    {isImportOpen && (
                        <ImportarRol
                            onClose={() => setIsImportOpen(false)}
                            onImportSuccess={() => {
                                fetchData();
                            }}
                        />
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de rol o descripción..."
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
                        <button
                            className='flex items-center gap-2 px-6 py-3 bg-[#E91E63] text-white rounded-2xl text-sm font-bold hover:bg-red-800 transition-all shadow-lg shadow-pink-100'
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <PlusCircle size={20} />
                            Crear rol
                        </button>
                        {isSidebarOpen && (
                            <CreateRol
                                onClose={() => setIsSidebarOpen(false)}
                                onSuccess={() => {
                                    setIsSidebarOpen(false);
                                    fetchData();
                                }}
                            />
                        )}
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
                                        <th className="px-6 py-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentData.map((role) => (
                                        <tr key={role.id} className="hover:bg-slate-50/50 transition group">
                                            <td className="px-6 py-5 font-mono text-indigo-600 text-xs">#{role.id.toString().padStart(3, '0')}</td>
                                            <td className="px-6 py-5 font-bold text-slate-800 text-sm italic">{role.name}</td>
                                            <td className="px-6 py-5">
                                                <AvatarStack count={role.asociados} />
                                            </td>
                                            <td className="px-6 py-5 text-xs text-slate-500 leading-relaxed max-w-xs truncate">{role.description}</td>
                                            <td className="px-6 py-5 text-right">
                                                <ActionDropdown options={getRowOptions(role)} title="Gestión" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentData.map((role) => (
                            <div key={role.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                                        <Shield size={24} />
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{role.name}</h3>
                                <p className="text-xs text-slate-400 mb-6 h-8 line-clamp-2">{role.description}</p>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Integrantes</span>
                                        <AvatarStack count={role.asociados} />
                                    </div>
                                    <button className="w-full bg-slate-50 hover:bg-indigo-600 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white border border-slate-100">
                                        Gestionar Permisos
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-indigo-600">{processedData.length}</span> Roles definidos
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
                {editandoRolId && (
                    <EditRol
                        rolId={editandoRolId}
                        onClose={() => setEditandoRolId(null)}
                        onSuccess={() => {
                            setEditandoRolId(null);
                            fetchData();
                        }}
                    />
                )}

                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Información del Rol"
                    showConfirm={false}
                    cancelText="Cerrar Panel"
                >
                    {loadingDetalle ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full border-4 border-indigo-500/10 animate-ping absolute" />
                                <Loader2 className="animate-spin text-indigo-600 relative" size={48} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Consultando Servidor...</p>
                        </div>
                    ) : rolSeleccionado && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 mb-4 border border-slate-50">
                                    <ShieldCheck className="text-indigo-600" size={40} />
                                </div>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                                    ID Rol: {rolSeleccionado.rolId}
                                </span>
                                <h4 className="text-xl font-black text-slate-800 leading-tight">
                                    {rolSeleccionado.nombreRol}
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="group p-5 bg-white rounded-3xl border-2 border-slate-50 hover:border-indigo-100 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <AlignLeft size={14} className="text-slate-500 group-hover:text-indigo-600" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción del Perfil</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${!rolSeleccionado.descripcion ? 'text-slate-400 italic' : 'text-slate-600 font-medium'}`}>
                                        {rolSeleccionado.descripcion || "Este rol no cuenta con una descripción detallada en el sistema."}
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1 p-5 bg-emerald-50/50 rounded-3xl border-2 border-emerald-100/50">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2 text-center">Usuarios</span>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-3xl font-black text-emerald-700">
                                                {rolSeleccionado.cantidadUsuarios}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-600/70 text-uppercase">Asignados</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-5 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100/50 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Estado</span>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-indigo-100 shadow-sm">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-indigo-700 uppercase">Operativo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

            </div>
        </div>
    );
};

export default TablaRol;
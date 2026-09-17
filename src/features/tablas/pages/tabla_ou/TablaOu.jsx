import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Search, Hash,
    ArrowRight, ArrowLeft, Info,
    List, LayoutGrid, RefreshCcw, MoreVertical,
    Users, Shield, FileDown, PlusCircle, Filter, Settings
} from 'lucide-react';
import { AvatarStack, getPaginationRange } from '../../components/tabla_ou_diseño/TablaOuDiseño';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { useNavigate } from 'react-router-dom';
import CreateOU from '../../components/create_ou/CreateOU';
import ActionDropdown from '../../../../components/acciones/UserActions';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import EditOU from '../../components/create_ou/editar_ou/EditOU';
import Modal from '../../../../components/modal/PageModal';

const COLUMNS = [
    { key: 'name', label: 'Nombre', icon: Shield },
    { key: 'lider', label: 'Líder', icon: Info },
    { key: 'usuarios', label: 'Usuarios', icon: Users },
    { key: 'alineado', label: 'Alineado', icon: Hash },
];

const TablaOu = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [viewMode, setViewMode] = useState('table');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [editandoOuId, setEditandoOuId] = useState(null);
    const [ouSeleccionada, setOuSeleccionada] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const fetchData = async (signal) => {
        try {
            setLoading(true);

            const [responseOus, responseJefes] = await Promise.all([
                serviceApiNet.Ous.list(signal),
                serviceApiNet.Jefes.list(signal),
            ]);

            const rawData = responseOus.data?.data || [];
            const rawJefes = responseJefes.data?.data || responseJefes.data || [];

            const jefesMap = {};
            rawJefes.forEach(j => {
                jefesMap[j.jefeId] = {
                    nombre: j.nombre || 'Sin nombre',
                    avatar: j.nombre ? j.nombre.charAt(0).toUpperCase() : '?',
                };
            });

            const datosFormateados = rawData.map((o) => ({
                id: o.organizacionalesId,
                name: o.nombre,
                lider: o.jefeId ? jefesMap[o.jefeId]?.nombre || `Jefe #${o.jefeId}` : null,
                liderAvatar: o.jefeId ? jefesMap[o.jefeId]?.avatar || '?' : null,
                usuarios: o.cantidadColaboradores || 0,
                alineado: o.alineado,
            }));

            setData(datosFormateados);

        } catch (error) {
            if (error.name === 'CanceledError') return;
            console.error("Error al obtener las OUs", error);
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

    const handleView = (ou) => {
        setOuSeleccionada(ou);
        setIsViewModalOpen(true);
    };

    const handleEdit = (ou) => {
        setEditandoOuId(ou.id);
    };

    const getRowOptions = (ou) => [
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(ou)
        },
        {
            label: 'Editar OU',
            icon: <PencilLine size={16} />,
            onClick: () => handleEdit(ou)
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
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Unidades</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Configurando entorno corporativo...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]  lg:p-8 font-sans text-gray-800">
            <div className="max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-6 mt-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unidades Organizacionales</h1>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-600">
                            <FileDown size={16} /> Importar archivo
                        </button>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
                            <Settings size={20} />
                        </button>
                        <button onClick={fetchData} className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 bg-[#7C4DFF] text-white rounded-xl text-sm font-bold hover:bg-[#6C3EEB] transition-all shadow-lg shadow-indigo-100"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <PlusCircle size={20} /> Crear nuevo
                        </button>
                        {isSidebarOpen && (
                            <CreateOU
                                onClose={() => setIsSidebarOpen(false)}
                                onSuccess={() => { setIsSidebarOpen(false); fetchData(); }}
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
                    <div className="relative flex-1 w-full">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filtrar o buscar por..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
                                    {currentData.map((ou) => (
                                        <tr key={ou.id} className="hover:bg-slate-50/50 transition group">
                                            <td className="px-6 py-5 font-bold text-slate-800 text-sm">{ou.name}</td>
                                            <td className="px-6 py-5">
                                                {ou.lider ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                                                            {ou.liderAvatar}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">{ou.lider}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 italic text-xs">Sin asignar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <AvatarStack count={ou.usuarios} />
                                            </td>
                                            <td className={`px-6 py-5 text-sm font-medium ${ou.alineado === 'Confia' ? 'text-indigo-600' : 'text-slate-400 italic'}`}>
                                                {ou.alineado}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <ActionDropdown options={getRowOptions(ou)} title="Gestión" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentData.map((ou) => (
                            <div key={ou.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                                        <Shield size={24} />
                                    </div>
                                    <button className="text-slate-300 hover:text-indigo-600 transition"><MoreVertical size={18} /></button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{ou.nombre}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    {ou.lider ? (
                                        <>
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                {ou.liderAvatar}
                                            </div>
                                            <span className="text-xs text-slate-600 font-medium">{ou.lider}</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Sin líder asignado</span>
                                    )}
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alineado: {ou.alineado}</span>
                                        <AvatarStack count={ou.usuarios} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-indigo-600">{processedData.length}</span> Unidades encontradas
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
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(c => c + 1)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm text-slate-600"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </footer>
                {editandoOuId && (
                    <EditOU
                        ouId={editandoOuId}
                        onClose={() => setEditandoOuId(null)}
                        onSuccess={() => { setEditandoOuId(null); fetchData(); }}
                    />
                )}

                {isViewModalOpen && ouSeleccionada && (
                    <Modal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        title="Detalle de Unidad Organizacional"
                        showConfirm={false}
                        cancelText="Cerrar"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl">
                                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{ouSeleccionada.name}</h4>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">ID: {ouSeleccionada.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-100 rounded-2xl">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Líder a Cargo</span>
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                        <Info size={14} className="text-indigo-500" />
                                        {ouSeleccionada.lider || 'Sin asignar'}
                                    </div>
                                </div>
                                <div className="p-4 border border-slate-100 rounded-2xl">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Colaboradores</span>
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                        <Users size={14} className="text-indigo-500" />
                                        {ouSeleccionada.usuarios} miembros
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-slate-100 rounded-2xl">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripcion</span>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${ouSeleccionada.descripcion === 'Confia' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                                    }`}>
                                    <Hash size={12} />
                                    {ouSeleccionada.alineado}
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

            </div>
        </div>
    );
};

export default TablaOu;
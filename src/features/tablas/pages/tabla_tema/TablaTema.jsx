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
import CrearTema from '../../components/create_tema/CrearTema';
import ActionDropdown from '../../../../components/acciones/UserActions';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import EditarTema from '../../components/create_tema/editar_tema/EditarTema';
import Modal from '../../../../components/modal/PageModal';

const COLUMNS = [
    { key: 'imagenPortada', label: 'Imagen', icon: Hash },
    { key: 'nombreTema', label: 'Nombre del Tema', icon: Shield },
    { key: 'creacionSubtema', label: 'Subtemas Creados', icon: Users },
    { key: 'descripcion', label: 'Descripción', icon: Info },
];


const TablaTema = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nombreTema', direction: 'ascending' });
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('Todos');
    const itemsPerPage = 6;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [editandoTemaId, setEditandoTemaId] = useState(null);
    const [temaDetalle, setTemaDetalle] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await serviceApiNet.Temas.list();

            const rawData = response.data?.data || [];

            const datosFormateados = rawData.map((u) => ({
                id: u.temaId,
                nombreTema: u.nombreTema,
                descripcion: u.descripcion,
                creacionSubtema: u.creacionSubtema,
                imagenPortada: u.imagenPortada,
            }));
            if (response.data) {
                setData(datosFormateados);
            }
        } catch (error) {
            console.error("Error al obtener los temas:", error);
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

    const handleView = (tema) => {
        setTemaDetalle(tema);
    };

    const handleEdit = (tema) => {
        setEditandoTemaId(tema.id);
    };

    const getRowOptions = (tema) => [
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(tema)
        },
        {
            label: 'Editar Tema',
            icon: <PencilLine size={16} />,
            onClick: () => handleEdit(tema)
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
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Temas</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Configurando permisos de acceso...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-gray-800">
            <div className="max-w-8xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Temas</h1>
                    <div className='pt-3'>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-600">
                            <FileDown size={16} />
                            Importar catálogo
                        </button>
                    </div>
                </div>

                <div className="flex gap-8 border-b border-slate-200 mb-8">
                    {[
                        { name: 'Todos', icon: Shield, count: data.length },
                        { name: 'SubTema', icon: Shield, count: data.length },
                    ].map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => { setActiveTab(tab.name); setCurrentPage(1); }}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === tab.name ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={16} />
                            {tab.name} ({tab.count})
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
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
                            Crear tema
                        </button>
                        {isSidebarOpen && (
                            <CrearTema
                                onClose={() => setIsSidebarOpen(false)}
                                onSuccess={() => { setIsSidebarOpen(false); fetchData(); }}
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
                                    {currentData.map((tema) => (
                                        <tr key={tema.id} className="hover:bg-slate-50/50 transition group">
                                            <td className="px-6 py-5">
                                                {tema.imagenPortada ? (
                                                    <img
                                                        src={tema.imagenPortada}
                                                        alt={tema.nombreTema}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Shield size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-slate-800 text-sm italic">{tema.nombreTema}</td>
                                            <td className="px-6 py-5 max-w-xs">
                                                <div className="flex flex-wrap gap-2">
                                                    {tema.creacionSubtema && tema.creacionSubtema.split(',').map((subtema, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                                                        >
                                                            {subtema.trim()}
                                                        </span>
                                                    ))}
                                                    {!tema.creacionSubtema && (
                                                        <span className="text-slate-400 italic text-xs">Sin subtemas</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-slate-500 leading-relaxed max-w-xs truncate">{tema.descripcion}</td>
                                            <td className="px-6 py-5 text-right">
                                                <ActionDropdown options={getRowOptions(tema)} title="Gestión" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentData.map((tema) => (
                            <div key={tema.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    {tema.imagenPortada ? (
                                        <div className="relative group/img">
                                            <img
                                                src={tema.imagenPortada}
                                                alt={tema.nombreTema}
                                                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white ring-4 ring-indigo-50/50 transition-transform duration-300 group-hover/img:scale-110"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 animate-pulse">
                                            <Shield size={32} />
                                        </div>
                                    )}

                                    <button className="text-slate-300 hover:text-slate-600 p-1 transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{tema.nombreTema}</h3>
                                <p className="text-xs text-slate-400 mb-6 h-8 line-clamp-2">{tema.descripcion}</p>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subtema</span>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                            {tema.creacionSubtema}
                                        </span>
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
                {editandoTemaId && (
                    <EditarTema
                        temaId={editandoTemaId}
                        onClose={() => setEditandoTemaId(null)}
                        onSuccess={() => { setEditandoTemaId(null); fetchData(); }}
                    />
                )}

                <Modal
                    isOpen={!!temaDetalle}
                    onClose={() => setTemaDetalle(null)}
                    title="Detalles del Tema"
                    showConfirm={false}
                    cancelText="Cerrar"
                >
                    {temaDetalle && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center">
                                {temaDetalle.imagenPortada ? (
                                    <img
                                        src={temaDetalle.imagenPortada}
                                        alt={temaDetalle.nombreTema}
                                        className="w-32 h-32 rounded-[2rem] object-cover shadow-xl border-4 border-white mb-4"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                                        <Shield size={48} />
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-slate-900">{temaDetalle.nombreTema}</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción</span>
                                    <p className="text-sm text-slate-600 leading-relaxed">{temaDetalle.descripcion || 'Sin descripción disponible.'}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subtemas Relacionados</span>
                                    <div className="flex flex-wrap gap-2">
                                        {temaDetalle.creacionSubtema ? (
                                            temaDetalle.creacionSubtema.split(',').map((sub, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-white border border-indigo-100 text-indigo-600 text-xs font-bold rounded-lg shadow-sm">
                                                    {sub.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No hay subtemas registrados</span>
                                        )}
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

export default TablaTema;
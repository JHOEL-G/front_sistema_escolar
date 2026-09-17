import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Search, Settings,
    ArrowRight, ArrowLeft, RefreshCcw, MoreVertical,
    FileText, CheckSquare, Filter, PlusCircle, FileDown, Shield, Loader2
} from 'lucide-react';
import { getPaginationRange, StatusBadge } from "../../components/tabla_prodiedades_diseño/TablaPropiedadesDiseño";
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import CreatePropiedad from '../../components/create_propiedad/CreatePropiedad';
import ActionDropdown from '../../../../components/acciones/UserActions';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import EditPropiedad from '../../components/create_propiedad/editar_propiedad/EditPropiedad';
import Modal from '../../../../components/modal/PageModal';

const COLUMNS = [
    { key: 'nombrePropiedad', label: 'Nombre de propiedad', icon: FileText },
    { key: 'tipoCampo', label: 'Tipo de campo', icon: Settings },
    { key: 'usarComoFiltro', label: 'Usar como filtro', icon: Filter },
    { key: 'usarEnReporte', label: 'Usar en reporte', icon: FileDown },
    { key: 'esRequerido', label: 'Campo requerido', icon: CheckSquare },
];

const TablaPropiedades = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'nombrePropiedad', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [propiedadEditando, setPropiedadEditando] = useState(null);
    const [propiedadViendo, setPropiedadViendo] = useState(null);

    const itemsPerPage = 10;

    const TIPOS_NOMBRE = {
        1: 'Texto',
        2: 'Selección Múltiple',
        3: 'Check Individual',
        4: 'Check Múltiple',
        5: 'Email'
    };

    const processedData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        let filtered = [...data];
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(item => {
                const nombre = item.nombrePropiedad?.toLowerCase() || "";
                const tipoNombre = TIPOS_NOMBRE[item.tipoCampo]?.toLowerCase() || "";
                return nombre.includes(low) || tipoNombre.includes(low);
            });
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

    const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
    const currentData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(firstPageIndex, firstPageIndex + itemsPerPage);
    }, [currentPage, processedData]);


    const fetchData = async (signal) => {
        try {
            setLoading(true);
            const response = await serviceApiNet.Propiedades.list(signal);
            const rawData = response.data?.data || [];
            setData(rawData);
        } catch (error) {
            if (error.name !== 'CanceledError') console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, []);

    const handleView = (propiedad) => {
        setPropiedadViendo(propiedad);
    };

    const handleEdit = (propiedad) => {
        setPropiedadEditando(propiedad);
    };

    const getRowOptions = (propiedad) => [
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(propiedad)
        },
        {
            label: 'Editar Propiedad',
            icon: <PencilLine size={16} />,
            onClick: () => handleEdit(propiedad)
        }
    ];

    if (loading) return (
        <div className="flex inset-0 h-screen flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-700">
            <div className="relative flex items-center justify-center mb-9">
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-500/10 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full border-t-4 border-b-4 border-indigo-600 animate-[spin_2s_linear_infinite]" />
                <div className="relative p-4 bg-white rounded-full shadow-xl">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Propiedades</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Sincronizando con el servidor...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
            <div className="max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-6 ">
                    <h1 className="text-2xl font-bold text-slate-900">Propiedades</h1>
                    <div className="flex gap-3 mt-3">
                        <button onClick={() => fetchData()} className="bg-white border border-slate-200 p-3 rounded-2xl hover:bg-slate-50">
                            <RefreshCcw size={20} className="text-slate-600" />
                        </button>
                        <button
                            className="flex items-center gap-2 px-6 py-2 bg-[#7C4DFF] text-white rounded-xl font-bold shadow-lg hover:bg-[#6A3DE8] transition-all"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <PlusCircle size={20} /> Crear propiedad
                        </button>
                    </div>
                </div>

                {isSidebarOpen && <CreatePropiedad onClose={() => { setIsSidebarOpen(false); fetchData(); }} />}
                {propiedadEditando && (
                    <EditPropiedad
                        propiedad={propiedadEditando}
                        onClose={() => { setPropiedadEditando(null); fetchData(); }}
                    />
                )}

                <Modal
                    isOpen={!!propiedadViendo}
                    onClose={() => setPropiedadViendo(null)}
                    title="Detalle de Propiedad"
                    showConfirm={false}
                    cancelText="Cerrar"
                >
                    {propiedadViendo && (
                        <div className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre interno</p>
                                    <p className="font-bold text-slate-800">{propiedadViendo.nombrePropiedad}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Etiqueta visible</p>
                                    <p className="font-bold text-slate-800">{propiedadViendo.etiqueta || '—'}</p>
                                </div>
                            </div>

                            {propiedadViendo.descripcion && (
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                    <p className="text-sm text-slate-600">{propiedadViendo.descripcion}</p>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo de campo</p>
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-200">
                                    {TIPOS_NOMBRE[propiedadViendo.tipoCampo] || `ID: ${propiedadViendo.tipoCampo}`}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Usar como filtro', value: propiedadViendo.usarComoFiltro },
                                    { label: 'Usar en reporte', value: propiedadViendo.usarEnReporte },
                                    { label: 'Campo requerido', value: propiedadViendo.esRequerido },
                                ].map((item) => (
                                    <div key={item.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        <StatusBadge active={item.value} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal>

                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Buscar por propiedad o tipo..."
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-5 pr-12 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>

                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
                                <tr>
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="px-6 py-5">{col.label}</th>
                                    ))}
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentData.map((prop) => (
                                    <tr key={prop.propiedadId} className="hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-5 font-bold text-slate-800 text-sm">{prop.nombrePropiedad}</td>
                                        <td className="px-6 py-5">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200">
                                                {TIPOS_NOMBRE[prop.tipoCampo] || `ID: ${prop.tipoCampo}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5"><StatusBadge active={prop.usarComoFiltro} /></td>
                                        <td className="px-6 py-5"><StatusBadge active={prop.usarEnReporte} /></td>
                                        <td className="px-6 py-5"><StatusBadge active={prop.esRequerido} /></td>
                                        <td className="px-6 py-5 text-right">
                                            <ActionDropdown options={getRowOptions(prop)} title="Gestión" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-indigo-600">{processedData.length}</span> Propiedades
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(c => c - 1)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm"
                        >
                            <ArrowLeft size={18} className="text-slate-600" />
                        </button>

                        <div className="flex gap-1">
                            {getPaginationRange(currentPage, totalPages).map((page, i) => (
                                <button
                                    key={i}
                                    onClick={() => page !== "..." && setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === page
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(c => c + 1)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm"
                        >
                            <ArrowRight size={18} className="text-slate-600" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TablaPropiedades;
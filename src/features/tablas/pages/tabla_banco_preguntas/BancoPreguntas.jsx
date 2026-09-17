import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, MoreVertical, Filter as FilterIcon, Loader2,
    BookOpen, Clock, Layers, FileSpreadsheet, ChevronRight,
    Calendar, Info, Plus
} from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import CreatePregunta from '../../components/create_preguntas/CrearPregunta';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import ActionDropdown from '../../../../components/acciones/UserActions';
import EditBancoPreguntas from '../../components/create_preguntas/editar_pregunta/EditBancoPreguntas';
import Modal from '../../../../components/modal/PageModal';
import { ChevronDown } from 'lucide-react';
import { ChevronUp } from 'lucide-react';

const TablaBancoPreguntas = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editandoBancaId, setEditandoBancaId] = useState(null);
    const [verDetalle, setVerDetalle] = useState(null);
    const [expandedPregunta, setExpandedPregunta] = useState(null);

    const fetchData = async (signal) => {
        try {
            setLoading(true);
            const response = await serviceApiNet.Preguntas.listar(signal);
            const rawData = response.data?.data || [];
            setData(rawData);
        } catch (error) {
            if (error.name !== 'CanceledError') {
                console.error("Error al obtener el banco de preguntas:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, []);

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
            const nombre = item.nombreBanca?.toLowerCase() || "";
            const descripcion = item.descripcion?.toLowerCase() || "";
            const term = searchTerm.toLowerCase();
            return nombre.includes(term) || descripcion.includes(term);
        });
    }, [data, searchTerm]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleView = (banco) => {
        setVerDetalle(banco);
        setExpandedPregunta(null);
    };

    const handleEdit = (banco) => {
        setEditandoBancaId(banco.bancaId);
    };

    const getRowOptions = (banco) => [
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(banco)
        },
        {
            label: 'Editar Banco de Preguntas',
            icon: <PencilLine size={16} />,
            onClick: () => handleEdit(banco)
        },
    ]

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50/50">
            <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-500/10 animate-ping" />
                <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            </div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">
                Sincronizando Banco de Datos
            </span>
        </div>
    );

    return (
        <div className="min-h-full p-4 md:p-8">
            <div className="max-w-8xl mx-auto">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Banco de Preguntas</h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium ml-4">
                            Central de inteligencia y gestión de reactivos.
                        </p>
                    </div>

                    <button
                        className="mt-3 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Plus size={20} />
                        Nuevo Banco
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por título o contenido..."
                            className="w-full bg-white border-0 ring-1 ring-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm placeholder:text-slate-400 font-medium"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-4 bg-white ring-1 ring-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-slate-600 font-bold text-sm">
                        <FilterIcon size={18} />
                        Filtros
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredData.map((banco) => (
                        <div
                            key={banco.bancaId}
                            className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 relative flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-500">
                                    <BookOpen size={26} />
                                </div>
                                <div className={`ml-20 flex items-center gap-1.5 px-3 py-1 rounded-full border
  ${banco.activo
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-red-50 text-red-600 border-red-100"
                                    }`}
                                >
                                    <div className={`h-1.5 w-1.5 rounded-full animate-pulse 
    ${banco.activo ? "bg-emerald-500" : "bg-red-500"}
  `} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {banco.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>

                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {banco.nombreBanca}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 italic">
                                    "{banco.descripcion || "Sin descripción proporcionada."}"
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2">
                                {banco.preguntas?.slice(0, 2).map((preg, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-400 font-medium overflow-hidden">
                                        <ChevronRight size={12} className="text-indigo-400 shrink-0" />
                                        <span className="truncate uppercase tracking-tight">{preg.textoPregunta}</span>
                                    </div>
                                ))}
                                {banco.preguntas?.length > 2 && (
                                    <div className="text-[10px] text-indigo-500 font-bold pl-5">
                                        + {banco.preguntas.length - 2} preguntas más...
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Total Items</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Layers size={14} />
                                        </div>
                                        <span className="text-sm font-black text-slate-700">
                                            {banco.preguntas?.length || banco.totalPreguntas || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Registro</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Calendar size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600">
                                            {formatDate(banco.fechaCreacion)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionDropdown options={getRowOptions(banco)} title="Gestión" />
                            </div>
                        </div>
                    ))}
                </div>

                {filteredData.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mt-4 shadow-sm">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-50" />
                            <div className="relative bg-white p-6 rounded-3xl shadow-xl ring-1 ring-slate-100">
                                <FileSpreadsheet className="text-indigo-500" size={54} />
                            </div>
                        </div>
                        <h3 className="text-slate-800 font-black text-2xl mb-2">Biblioteca vacía</h3>
                        <p className="text-slate-400 text-sm max-w-xs text-center font-medium leading-relaxed">
                            Parece que aún no has importado reactivos. Sube tu primer archivo Excel para comenzar.
                        </p>
                    </div>
                )}
            </div>

            {isSidebarOpen && (
                <CreatePregunta
                    onClose={() => {
                        setIsSidebarOpen(false);
                        fetchData();
                    }}
                />
            )}
            {editandoBancaId && (
                <EditBancoPreguntas
                    bancaId={editandoBancaId}
                    onClose={() => setEditandoBancaId(null)}
                    onSuccess={() => fetchData()}
                />
            )}

            <Modal
                isOpen={!!verDetalle}
                onClose={() => setVerDetalle(null)}
                title={`Detalle — ${verDetalle?.nombreBanca || ''}`}
                cancelText="Cerrar"
                showConfirm={true}
                confirmText="Editar banco"
                onConfirm={() => {
                    setVerDetalle(null);
                    setEditandoBancaId(verDetalle?.bancaId);
                }}
                variant="primary"
            >
                {verDetalle && (
                    <div className="space-y-6">

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Total preguntas', value: verDetalle.preguntas?.length || verDetalle.totalPreguntas || 0 },
                                { label: 'Registro', value: formatDate(verDetalle.fechaCreacion) },
                                { label: 'Estado', value: verDetalle.activo ? 'Activo' : 'Inactivo' },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
                                    <p className="font-semibold text-slate-700 text-sm">{value}</p>
                                </div>
                            ))}

                            {verDetalle.descripcion && (
                                <div className="col-span-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Descripción</p>
                                    <p className="font-semibold text-slate-700 text-sm italic">"{verDetalle.descripcion}"</p>
                                </div>
                            )}
                        </div>

                        {verDetalle.preguntas?.length > 0 && (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Preguntas</p>
                                {verDetalle.preguntas.map((p, idx) => (
                                    <div key={p.preguntaId ?? idx} className="border border-slate-100 rounded-xl overflow-hidden">
                                        <div
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => setExpandedPregunta(expandedPregunta === idx ? null : idx)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                                                    {idx + 1}
                                                </span>
                                                <p className="text-sm text-slate-700 font-medium">{p.textoPregunta}</p>
                                            </div>
                                            {expandedPregunta === idx
                                                ? <ChevronUp size={16} className="text-slate-400 shrink-0" />
                                                : <ChevronDown size={16} className="text-slate-400 shrink-0" />
                                            }
                                        </div>

                                        {expandedPregunta === idx && p.opciones?.length > 0 && (
                                            <div className="px-4 pb-3 space-y-2 bg-slate-50 border-t border-slate-100">
                                                {p.opciones.map((o, oIdx) => (
                                                    <div key={o.opcionId ?? oIdx} className="flex items-start gap-3 pt-2">
                                                        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${o.esCorrecta ? 'border-indigo-500' : 'border-slate-300'}`}>
                                                            {o.esCorrecta && <div className="h-2 w-2 bg-indigo-600 rounded-full" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-600">{o.textoOpcion}</p>
                                                            {o.explicacionORelacion && (
                                                                <p className="text-xs text-slate-400 italic mt-0.5">{o.explicacionORelacion}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TablaBancoPreguntas;
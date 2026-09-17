import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Search, Hash,
    ArrowRight, ArrowLeft, Info,
    List, LayoutGrid, RefreshCcw, MoreVertical,
    Users, Shield, FileDown, PlusCircle, Filter, Settings,
    BookOpen, CheckCircle, Star, Clock, Loader2
} from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import ActionDropdown from '../../../../components/acciones/UserActions';
import { Eye } from 'lucide-react';
import { PencilLine } from 'lucide-react';
import { Settings2 } from 'lucide-react';
import { Users2 } from 'lucide-react';
import { Users2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../components/modal/PageModal';
import { useRef } from 'react';

const getPaginationRange = (current, total) => {
    const range = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            range.push(i);
        } else if (range[range.length - 1] !== "...") {
            range.push("...");
        }
    }
    return range;
};

const COLUMNS = [
    { key: 'titulo', label: 'Curso', icon: BookOpen },
    { key: 'autor', label: 'Dificultad', icon: Users },
    { key: 'duracion', label: 'Duración', icon: Clock },
    { key: 'temas', label: 'Módulos', icon: Info },
    { key: 'status', label: 'Estatus', icon: Hash },
];

const PageTablaGestionCurso = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'titulo', direction: 'ascending' });
    const [viewMode, setViewMode] = useState('table');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const refreshRef = useRef(null);
    const [gestionesMap, setGestionesMap] = useState({});

    const fetchData = async (signal) => {
        try {
            setLoading(true);

            const [resCursos, resGestiones] = await Promise.all([
                serviceApiNet.Cursos.list(signal),
                serviceApiNet.GestionCursos.list(signal).catch(() => ({ data: { data: [] } }))
            ]);

            const rawCursos = resCursos.data?.data || resCursos.data?.$values || resCursos.data || [];

            const gestiones = resGestiones.data?.data || [];
            const map = {};
            gestiones.forEach(g => {
                map[g.cursoId] = g.gestionCursoId;
            });
            setGestionesMap(map);

            const cursosFormateados = rawCursos.map((curso) => ({
                id: curso.cursoId,
                titulo: curso.nombreCurso || 'Sin título',
                autor: curso.nombreDificultad || 'Sin dificultad',
                duracion: curso.duracionCurso ? `${curso.duracionCurso}h` : 'N/A',
                temas: curso.totalModulos || 0,
                status: curso.estaPublicado ? 'Publicado' : 'Borrador',
                descripcion: curso.descripcionCurso || '',
                imagen: curso.imagenPortadaPath || null,
                lenguaje: curso.nombreLenguaje || '',
                reacreditacion: curso.reacreditacion,
                activo: curso.activo,
                fechaCreacion: curso.fechaCreacion,
                avance: curso.avance,
                instructorId: curso.instructorId,
            }));

            setData(cursosFormateados);

        } catch (error) {
            if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
            console.error("Error al cargar cursos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, []);

    const handleRefresh = () => {
        if (refreshRef.current) refreshRef.current.abort();
        refreshRef.current = new AbortController();
        fetchData(refreshRef.current.signal);
    };

    const processedData = useMemo(() => {
        let filtered = [...data];
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                [item.titulo, item.autor, item.status, item.lenguaje].some(val =>
                    String(val).toLowerCase().includes(low)
                )
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

    const handleGestionar = (curso) => {
        const gestionId = gestionesMap[curso.id];
        if (gestionId) {
            navigate(`/curso/${curso.id}/gestion/${gestionId}/editar`);
        } else {
            navigate(`/gestion_curso/${curso.id}`);
        }
    };

    const handleView = (curso) => {
        setCursoSeleccionado(curso);
        setModalOpen(true);
    };

    const handleViewGestion = (curso) => {
        setCursoSeleccionado(curso);
        setModalOpen(true);
    };

    const handleViewParticipantes = (curso) => {
        navigate(`/cursos/${curso.id}/participantes`);
    };

    const handleViewReportes = (curso) => {
    };

    const getRowOptions = (curso) => [
        {
            label: gestionesMap[curso.id] ? 'Editar Gestión' : 'Crear Gestión',
            icon: <Settings size={16} />,
            onClick: () => handleGestionar(curso)
        },
        {
            label: 'Ver Detalle',
            icon: <Eye size={16} />,
            onClick: () => handleView(curso)
        },
        {
            label: 'Gestionar Participantes',
            icon: <Users2Icon size={16} />,
            onClick: () => handleViewParticipantes(curso)
        },
        {
            label: 'Ver Reportes',
            icon: <FileDown size={16} />,
            onClick: () => handleViewReportes(curso)
        },
    ];

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(firstPageIndex, firstPageIndex + itemsPerPage);
    }, [currentPage, processedData]);

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
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Gestion de Cursos</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">Sincronizando biblioteca académica...</p>
            </div>
        </div>
    );

    const statusConfig = {
        'Publicado': 'text-green-600',
        'En Revisión': 'text-amber-500',
        'Borrador': 'text-slate-500'
    };

    return (
        <div className="min-h-full bg-[#f8fafc] lg:p-8 font-sans text-gray-800">
            <div className="max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-6 mt-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Cursos</h1>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-600">
                            <FileDown size={16} /> Exportar
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
                    <div className="relative flex-1 w-full">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cursos, dificultad o estatus..."
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
                        <button
                            onClick={handleRefresh}
                            className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
                        >
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
                                        <th className="px-6 py-5 text-right">Gestión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentData.map((curso) => (
                                        <tr key={curso.id} className="hover:bg-slate-50/50 transition group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                        <img
                                                            src={curso.imagen || `https://picsum.photos/seed/${curso.id}/400/225`}
                                                            alt={curso.titulo}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = 'https://picsum.photos/400/225?grayscale'; }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-sm">{curso.titulo}</span>
                                                        {curso.reacreditacion && (
                                                            <span className="bg-[#D8B4FE] text-[#6B21A8] text-[9px] font-black px-1.5 py-0.5 rounded italic uppercase w-fit mt-1">
                                                                Reacreditación
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-slate-600 font-medium">{curso.autor}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <span className="text-sm font-medium">{curso.duracion}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                                                    {curso.temas} módulos
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${curso.status === 'Publicado'
                                                        ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {curso.status}
                                                    </span>
                                                    {gestionesMap[curso.id] ? (
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-wide">
                                                            Con gestión
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-wide">
                                                            Sin gestión
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <ActionDropdown options={getRowOptions(curso)} title="Gestión" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentData.map((curso) => (
                            <div key={curso.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                                <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                                    <img
                                        src={curso.imagen || `https://picsum.photos/seed/${curso.id}/400/225`}
                                        alt={curso.titulo}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://picsum.photos/400/225?grayscale'; }}
                                    />
                                </div>

                                <div className="flex items-start gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 flex-1">
                                        {curso.titulo}
                                    </h3>
                                    {curso.reacreditacion && (
                                        <span className="bg-[#D8B4FE] text-[#6B21A8] text-[8px] font-black px-1.5 py-0.5 rounded italic uppercase flex-shrink-0">
                                            REACRED
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Users size={14} className="text-slate-400" />
                                    <p className="text-xs text-slate-400 font-medium">{curso.autor}</p>
                                </div>

                                <button
                                    onClick={() => handleGestionar(curso)}
                                    className="w-full py-2 rounded-xl text-xs font-bold border transition-all mb-4
                                        bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                                >
                                    {gestionesMap[curso.id] ? '✏️ Editar Gestión' : '➕ Crear Gestión'}
                                </button>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${curso.status === 'Publicado' ? 'text-green-600' : 'text-slate-500'}`}>
                                            <CheckCircle size={12} /> {curso.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <Clock size={12} /> {curso.duracion}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-bold">Módulos</span>
                                        <span className="text-xs font-bold text-slate-700">{curso.temas}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-indigo-600">{processedData.length}</span> Cursos en gestión
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

                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title="Detalles Completos del Curso"
                    confirmText="Cerrar"
                    onConfirm={() => setModalOpen(false)}
                >
                    {cursoSeleccionado && (
                        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start border-b border-slate-100 pb-4">
                                <img
                                    src={cursoSeleccionado.imagen || `https://picsum.photos/seed/${cursoSeleccionado.id}/400/225`}
                                    alt={cursoSeleccionado.titulo}
                                    className="w-32 h-20 object-cover rounded-xl shadow-sm border border-slate-200"
                                />
                                <div className="text-center md:text-left">
                                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{cursoSeleccionado.titulo}</h2>
                                    <p className="text-xs text-slate-500 mt-1">{cursoSeleccionado.descripcion}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                        <BookOpen size={14} /> Información del Curso
                                    </h3>
                                    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Dificultad:</span>
                                            <span className="font-bold text-slate-700">{cursoSeleccionado.autor}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Duración:</span>
                                            <span className="font-bold text-slate-700">{cursoSeleccionado.duracion}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Módulos:</span>
                                            <span className="font-bold text-slate-700">{cursoSeleccionado.temas} temas</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Lenguaje:</span>
                                            <span className="font-bold text-slate-700">{cursoSeleccionado.lenguaje || 'No especificado'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                        <Settings size={14} /> Estado de Gestión
                                    </h3>
                                    <div className="space-y-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Estatus Público:</span>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold w-fit ${cursoSeleccionado.status === 'Publicado'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {cursoSeleccionado.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">ID de Gestión:</span>
                                            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                                                {gestionesMap[cursoSeleccionado.id] || 'SIN GESTIÓN ACTIVA'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {cursoSeleccionado.reacreditacion && (
                                                <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-1 rounded uppercase flex items-center gap-1">
                                                    <Shield size={10} /> Reacreditación Activa
                                                </span>
                                            )}
                                            {cursoSeleccionado.activo ? (
                                                <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-1 rounded uppercase">Curso Activo</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-1 rounded uppercase">Inactivo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 italic">
                                <span>ID Sistema: {cursoSeleccionado.id}</span>
                                <span>Creado: {new Date(cursoSeleccionado.fechaCreacion).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default PageTablaGestionCurso;
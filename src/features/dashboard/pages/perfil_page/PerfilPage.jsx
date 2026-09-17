import React, { useState, useEffect } from 'react';
import {
    Search, Info, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    Hash, BookOpen, Layers, CheckCircle, BarChart, GraduationCap, Calendar, MoreVertical
} from 'lucide-react';
import keycloak from '../../../auth/services/keycloakConfig';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { UserHeader, FilterButton, EmptyState, FilterSelect } from '../../components/diseño_perfil/DiseñoPerfil';
import { RefreshCw, Target } from 'lucide-react';
import { X } from 'lucide-react';
import { useImpersonation } from '../../../../components/perstectiva/ImpersonationProviderr';

export default function PerfilPage() {
    const [cursos, setCursos] = useState([]);
    const { impersonatedUser } = useImpersonation();
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'nombreCurso', direction: 'ascending' });
    const [modalDescripcion, setModalDescripcion] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filterEstatus, setFilterEstatus] = useState('all');
    const [filterFecha, setFilterFecha] = useState('all');

    const usuarioId = impersonatedUser?.keycloakId || keycloak.tokenParsed?.sub || "";

    const generateImageUrl = (curso, index) => {
        if (curso.imagenPortadaPath) return curso.imagenPortadaPath;

        const hashBase = `${curso.cursoId || curso.inscripcionId}-${curso.nombreCurso}-${index}`;
        const hash = hashBase.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `https://picsum.photos/seed/${hash}/80/80`;
    };

    const generateFallbackUrl = (curso, index) => {
        const styles = ['shapes', 'identicon', 'bottts', 'rings', 'avataaars'];
        const styleIndex = ((curso.cursoId || curso.inscripcionId || 0) + index) % styles.length;
        return `https://api.dicebear.com/7.x/${styles[styleIndex]}/svg?seed=${encodeURIComponent(curso.nombreCurso)}-${index}`;
    };

    useEffect(() => {
        const fetchKardex = async () => {
            try {
                const response = await serviceApiNet.Inscripcion.getById(usuarioId);
                if (response.success) {
                    const cursosData = response.data?.$values || response.data || [];
                    setCursos(Array.isArray(cursosData) ? cursosData : [cursosData]);
                } else {
                    console.error('❌ Error en la respuesta:', response.message);
                    setCursos([]);
                }
            } catch (error) {
                console.error("❌ Error al cargar el Kardex:", error);
                setCursos([]);
            } finally {
                setLoading(false);
            }
        };

        if (usuarioId) {
            fetchKardex();
        } else {
            setLoading(false);
            console.warn('⚠️ No hay usuario ID disponible');
        }
    }, [usuarioId]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedCursos = [...cursos].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setCursos(sortedCursos);
    };

    const handleVerMas = (descripcion) => {
        setModalDescripcion(descripcion);
    };

    const cerrarModal = () => {
        setModalDescripcion(null);
    };

    const cursosFiltrados = cursos.filter((curso) => {
        const matchesSearch = curso.nombreCurso?.toLowerCase().includes(searchText.toLowerCase());

        let matchesEstatus = true;
        if (filterEstatus === 'approved') {
            matchesEstatus = curso.esCompletado && curso.calificacionFinal >= 7;
        } else if (filterEstatus === 'progress') {
            matchesEstatus = !curso.esCompletado;
        } else if (filterEstatus === 'reprobados') {
            matchesEstatus = curso.esCompletado && curso.calificacionFinal < 6;
        } else if (filterEstatus === 'no_acreditados') {
            matchesEstatus = curso.esCompletado && curso.calificacionFinal >= 6 && curso.calificacionFinal < 7;
        }

        let matchesFecha = true;
        if (curso.fechaInscripcion) {
            const fecha = new Date(curso.fechaInscripcion);
            const ahora = new Date();
            if (filterFecha === 'periodo') {
                const hace3Meses = new Date();
                hace3Meses.setMonth(ahora.getMonth() - 3);
                matchesFecha = fecha >= hace3Meses;
            } else if (filterFecha === 'fecha') {
                matchesFecha = fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
            } else if (filterFecha === 'semestre') {
                const semActual = ahora.getMonth() < 6 ? 0 : 1;
                const semCurso = fecha.getMonth() < 6 ? 0 : 1;
                matchesFecha = semCurso === semActual && fecha.getFullYear() === ahora.getFullYear();
            } else if (filterFecha === 'personalizado') {
                matchesFecha = true;
            }
        }

        return matchesSearch && matchesEstatus && matchesFecha;
    });

    return (
        <div className="min-h-full p-6 font-sans antialiased pt-5">
            <div className="max-w-8xl mx-auto">
                <UserHeader />

                <div className="mb-8">
                    <div className="flex items-center space-x-2 mb-6">
                        <h1 className="text-lg font-bold text-gray-800">Kardex</h1>
                        <div className="w-5 h-5 rounded-full border border-indigo-200 flex items-center justify-center cursor-help">
                            <Info className="w-3 h-3 text-indigo-400" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-10">
                        <div className="flex-[2] relative flex flex-col justify-end">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Comienza a buscar..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm"
                                />
                                <Search className="absolute left-3.5 top-3 text-gray-300 w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estatus</label>
                            <select
                                value={filterEstatus}
                                onChange={(e) => setFilterEstatus(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm text-slate-600"
                            >
                                <option value="all">Todos</option>
                                <option value="approved">Aprobados</option>
                                <option value="progress">En proceso</option>
                                <option value="reprobados">Reprobados</option>
                                <option value="no_acreditados">No acreditados</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha de asignación</label>
                            <select
                                value={filterFecha}
                                onChange={(e) => setFilterFecha(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm text-slate-600"
                            >
                                <option value="all">Todos</option>
                                <option value="periodo">Por periodo (últimos 3 meses)</option>
                                <option value="fecha">Este mes</option>
                                <option value="semestre">Este semestre</option>
                                <option value="personalizado">Personalizado</option>
                            </select>
                        </div>
                    </div>

                    {modalDescripcion && (
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={cerrarModal}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={cerrarModal}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl">
                                        <BookOpen className="text-indigo-600" size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Descripción del curso</h3>
                                </div>

                                <div className="p-4">
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {modalDescripcion}
                                    </p>
                                </div>

                                <button
                                    onClick={cerrarModal}
                                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-20 text-center text-slate-400 text-sm italic">
                            Cargando información del servidor...
                        </div>
                    ) : cursos.length === 0 ? (
                        <EmptyState />
                    ) : cursosFiltrados.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 text-sm italic">
                            No se encontraron cursos con los filtros aplicados.
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-5">
                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('nombreCurso')}>
                                                    <BookOpen size={14} className="opacity-50" />
                                                    Mis cursos
                                                    {sortConfig.key === 'nombreCurso' && (
                                                        sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Layers size={14} className="opacity-50" />
                                                    Tipo
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleSort('esCompletado')}>
                                                    <CheckCircle size={14} className="opacity-50" />
                                                    Estatus
                                                    {sortConfig.key === 'esCompletado' && (
                                                        sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleSort('progreso')}>
                                                    <BarChart size={14} className="opacity-50" />
                                                    Avance
                                                    {sortConfig.key === 'progreso' && (
                                                        sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <GraduationCap size={14} className="opacity-50" />
                                                    Calificación
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleSort('fechaInscripcion')}>
                                                    <Calendar size={14} className="opacity-50" />
                                                    Fecha de Inscripción
                                                    {sortConfig.key === 'fechaInscripcion' && (
                                                        sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <RefreshCw size={14} className="opacity-50" />
                                                    Reacreditación
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Target size={14} className="opacity-50" />
                                                    Competencias
                                                </div>
                                            </th>
                                            <th className="px-6 py-5 text-right opacity-50"><MoreVertical size={16} className="ml-auto" /></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cursosFiltrados.map((curso, index) => (
                                            <tr key={curso.inscripcionId} className="hover:bg-slate-50/50 transition group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                            <img
                                                                src={generateImageUrl(curso, index)}
                                                                className="w-full h-full object-cover"
                                                                alt={curso.nombreCurso}
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = generateFallbackUrl(curso, index);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800 leading-tight">
                                                                {curso.nombreCurso}
                                                            </span>
                                                            <span className="text-[10px] text-indigo-500 font-medium uppercase tracking-tighter">Académico</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-sm text-slate-600 font-medium">
                                                    E-learning
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${curso.esCompletado
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                        }`}>
                                                        {curso.esCompletado ? 'Finalizado' : 'En progreso'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-bold text-slate-600">
                                                            {Math.round(curso.progreso)}%
                                                        </span>
                                                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-indigo-500 h-full transition-all duration-500"
                                                                style={{ width: `${curso.progreso}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center text-xs font-bold text-slate-700">
                                                    {curso.calificacionFinal ? Number(curso.calificacionFinal).toFixed(1) : '0.0'}
                                                </td>
                                                <td className="px-4 py-5 text-center text-xs text-slate-400 italic">
                                                    {curso.fechaInscripcion
                                                        ? new Intl.DateTimeFormat('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }).format(new Date(curso.fechaInscripcion))
                                                        : "---"
                                                    }
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                                                        No aplica
                                                    </span>
                                                </td>
                                                <td className="px-4">
                                                    <div className="flex flex-wrap justify-center gap-1">
                                                        {curso.descripcionCurso ? (
                                                            <>
                                                                {curso.descripcionCurso.length > 40 ? (
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <span className="bg-white text-slate-600 px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-medium shadow-sm">
                                                                            {curso.descripcionCurso.substring(0, 40)}...
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleVerMas(curso.descripcionCurso)}
                                                                            className="group/btn text-indigo-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all hover:gap-1.5 px-2 py-1 rounded-md hover:bg-indigo-50"
                                                                        >
                                                                            Ver más
                                                                            <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="bg-white text-slate-600 px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-medium shadow-sm">
                                                                        {curso.descripcionCurso}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-300 italic text-xs text-center w-full block">
                                                                ---
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="text-slate-300 hover:text-indigo-600 p-2 transition">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <footer className="p-6 bg-white border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Total: <span className="text-indigo-600">{cursosFiltrados.length}</span> Cursos inscritos
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 transition shadow-sm">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex gap-1">
                                        <button className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-100">
                                            1
                                        </button>
                                    </div>
                                    <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 transition shadow-sm">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </footer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
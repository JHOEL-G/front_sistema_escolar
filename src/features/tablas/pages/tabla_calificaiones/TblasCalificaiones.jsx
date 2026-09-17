import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, ChevronDown, Download, RefreshCw, Eye,
    Filter, Calendar, Star,
    Hash, Users, BookOpen, Trophy, CheckCircle2,
    ArrowLeft, ArrowRight, Loader2, PencilLine,
    BarChart2, FileUp
} from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, StarRating, getPaginationRange } from './diseño_table/DiseñoTable';
import { DatePickerModal } from './diseño_table/date/DatePickerModal';

const REVIEWS = [
    { id: 1, user: 'VICENTE FRUTOS', email: 'moreliavicentefrutosvaleconfia45880gerente@uniconfia.com', rating: 5, date: '13 de agosto de 2025', comment: '' },
    { id: 2, user: 'JUAN NUNEZ', email: 'santiagopapasquiaro-juannunezvaleconfia45880gerente@uniconfia.com', rating: 5, date: '13 de agosto de 2025', comment: 'EXCELENTE' },
    { id: 3, user: 'MALIK MEDINA', email: 'juarez03malikmedinavaleconfia45901gerente@uniconfia.com', rating: 5, date: '4 de septiembre de 2025', comment: '' },
    { id: 4, user: 'GERARDO MORALES', email: 'salamancagerardomoralesvaleconfia45901gerente@uniconfia.com', rating: 5, date: '4 de septiembre de 2025', comment: 'Gracias' },
];

export default function TblasCalificaiones() {
    const { cursoId } = useParams();
    const [activeTab, setActiveTab] = useState('participantes');
    const [participantes, setParticipantes] = useState([]);
    const [manualGrades, setManualGrades] = useState([]);
    const [autoGrades, setAutoGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCalif, setLoadingCalif] = useState(false);
    const [nombreCurso, setNombreCurso] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [roles, setRoles] = useState([]);
    const [ous, setOus] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const navigate = useNavigate();
    const [filtros, setFiltros] = useState({
        fecha: null,
        rol: '',
        ou: ''
    });

    const tabs = [
        { id: 'participantes', label: 'Participantes', icon: Users },
        { id: 'manuales', label: 'Calificaciones manuales', icon: PencilLine },
        { id: 'automaticas', label: 'Calificaciones automáticas', icon: BarChart2 },
        { id: 'resenas', label: 'Reseñas', icon: Star },
    ];

    const handleExport = () => {
        import('xlsx').then(XLSX => {
            const datos = filteredParticipantes.map(u => ({
                'Nombre': `${u.nombre} ${u.apeLLido}`,
                'Correo': u.correo || '',
                'OU': u.nombreOU || '',
                'Rol': u.nombreRol || '',
                'Inscripción': u.fechaInscripcion
                    ? new Date(u.fechaInscripcion).toLocaleDateString('es-MX')
                    : '',
                'Avance (%)': u.progreso ?? 0,
                'Calificación': u.calificacionFinal ?? '',
                'Estado': u.esCompletado ? 'Completado' : 'Pendiente',
            }));

            const ws = XLSX.utils.json_to_sheet(datos);

            ws['!cols'] = [
                { wch: 28 }, { wch: 36 }, { wch: 20 },
                { wch: 18 }, { wch: 14 }, { wch: 12 },
                { wch: 14 }, { wch: 12 },
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Participantes');

            const fecha = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `participantes_${nombreCurso || cursoId}_${fecha}.xlsx`);
        });
    };

    const fetchData = async (filtrosApp = null, signal = null) => {
        if (!cursoId) return;

        setLoading(true);
        setLoadingCalif(true);

        try {
            const params = filtrosApp || filtros;
            const [resPart, resCalif, resCurso] = await Promise.all([
                serviceApiNet.Inscripcion.getParticipantes(cursoId, params, signal),
                serviceApiNet.Inscripcion.getCalificaciones(cursoId, signal),
                serviceApiNet.Cursos.getById(cursoId, signal)
            ]);

            setParticipantes(resPart.data?.data || []);

            const curso = resCurso.data?.data || resCurso.data;
            if (curso?.nombreCurso || curso?.nombre) {
                setNombreCurso(curso.nombreCurso || curso.nombre);
            }

            const dataCalif = resCalif.data?.data || [];
            setAutoGrades(dataCalif.filter(d => d.tipoCalificacionId === 1));
            setManualGrades(dataCalif.filter(d => d.tipoCalificacionId === 2 || d.tipoCalificacionId === 3));

            if (!nombreCurso && dataCalif.length > 0 && dataCalif[0].nombreCurso) {
                setNombreCurso(dataCalif[0].nombreCurso);
            }

        } catch (err) {
            if (err.name !== 'CanceledError') console.error("Error al cargar datos:", err);
        } finally {
            setLoading(false);
            setLoadingCalif(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(null, controller.signal);
        return () => controller.abort();
    }, [cursoId]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchFiltros = async () => {
            try {
                const [resRoles, resOus] = await Promise.all([
                    serviceApiNet.Roles.list(controller.signal),
                    serviceApiNet.Ous.list(controller.signal)
                ]);
                setRoles(resRoles.data?.data || []);
                setOus(resOus.data?.data || []);
            } catch (err) {
                if (err.name !== 'CanceledError') console.error("Error al cargar filtros:", err);
            }
        };
        fetchFiltros();
        return () => controller.abort();
    }, []);

    const handleCalificacionManual = (item) => {
        navigate(`/calificaciones_manual/${cursoId}`, {
            state: {
                tipoRecurso: item.tipoRecursoId,
                recursoId: item.recursoEspecificoId,
                tipoCalificacion: item.tipoCalificacionId,
                nombreRecurso: item.leccion,
                tipoRecursoNombre: item.tipoRecurso
            }
        });
    };

    const handleCalificacionAutomatica = (item) => {
        navigate(`/calificaciones_automatica/${cursoId}`, {
            state: {
                nombreRecurso: item.leccion,
                recursoId: item.recursoEspecificoId,
                tipoRecursoNombre: item.tipoRecurso
            }
        });
    };

    // Reemplaza filteredParticipantes con esto:
    const filteredParticipantes = useMemo(() => {
        let result = participantes;

        // Filtro por búsqueda de texto
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            result = result.filter(u =>
                `${u.nombre} ${u.apeLLido}`.toLowerCase().includes(low) ||
                u.correo?.toLowerCase().includes(low) ||
                u.nombreRol?.toLowerCase().includes(low) ||
                u.nombreOU?.toLowerCase().includes(low)
            );
        }

        // Filtro por fecha de inscripción
        if (filtros.fecha) {
            result = result.filter(u => {
                if (!u.fechaInscripcion) return false;
                const fechaUser = new Date(u.fechaInscripcion).toISOString().split('T')[0];
                return fechaUser >= filtros.fecha;
            });
        }

        // Filtro por rol
        if (filtros.rol) {
            result = result.filter(u =>
                u.nombreRol?.toLowerCase().includes(filtros.rol.toLowerCase())
            );
        }

        // Filtro por OU
        if (filtros.ou) {
            result = result.filter(u =>
                u.nombreOU?.toLowerCase().includes(filtros.ou.toLowerCase())
            );
        }

        return result;
    }, [participantes, searchTerm, filtros]);

    const totalPages = Math.ceil(filteredParticipantes.length / itemsPerPage);
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredParticipantes.slice(start, start + itemsPerPage);
    }, [currentPage, filteredParticipantes]);

    if (loading && activeTab === 'participantes') return (
        <div className="flex inset-0 h-screen flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-700">
            <div className="relative flex items-center justify-center mb-9">
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-purple-500/10 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full border-t-4 border-b-4 border-purple-600 animate-[spin_2s_linear_infinite]" />
                <div className="relative p-4 bg-white rounded-full shadow-xl">
                    <Loader2 className="animate-spin text-purple-600" size={40} />
                </div>
            </div>
            <span className="text-[10px] text-purple-600 font-black uppercase tracking-[0.3em] animate-pulse">Cargando Participantes</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/30 p-4 lg:p-8 font-sans text-gray-800">
            <div className="max-w-full mx-auto space-y-8">

                <Header nombreCurso={nombreCurso} />

                <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in duration-300">

                    {activeTab === 'participantes' && (
                        <div className="space-y-5">

                            <div className="flex flex-col lg:flex-row gap-3 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, correo, rol o unidad..."
                                        className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition text-sm font-medium text-slate-700 placeholder:text-slate-300"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>

                                <div className="flex gap-2 w-full lg:w-auto items-center">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowCalendar(true)}
                                            className="flex items-center bg-white border border-slate-100 rounded-2xl py-3 pl-4 pr-9 text-sm text-slate-500 shadow-sm outline-none font-medium hover:bg-slate-50 transition-all"
                                        >
                                            {filtros.fecha ? `Desde: ${filtros.fecha}` : "Fecha inscripción"}
                                            <Calendar size={13} className="absolute right-3 text-slate-300 pointer-events-none" />
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <select
                                            value={`${filtros.rol}|${filtros.ou}`}
                                            onChange={(e) => {
                                                const [rol, ou] = e.target.value.split('|');
                                                setFiltros(prev => ({ ...prev, rol, ou }));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-white border border-slate-100 rounded-2xl py-3 pl-4 pr-9 text-sm text-slate-500 shadow-sm appearance-none outline-none font-medium cursor-pointer hover:border-purple-200"
                                        >
                                            <option value="|">Propiedades (Todas)</option>

                                            <optgroup label="Por Rol">
                                                {roles.map(r => (
                                                    <option key={r.rolId} value={`${r.nombreRol}|`}>
                                                        {r.nombreRol}
                                                    </option>
                                                ))}
                                            </optgroup>

                                            <optgroup label="Por Unidad (OU)">
                                                {ous.map(o => (
                                                    <option key={o.organizacionalesId} value={`|${o.nombre}`}>
                                                        {o.nombre}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <ChevronDown size={13} className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" />
                                    </div>

                                    <button
                                        onClick={() => fetchData(filtros)}
                                        disabled={loading}
                                        className="bg-white border border-slate-100 p-3 rounded-2xl text-slate-400 hover:text-purple-600 hover:border-purple-200 transition shadow-sm disabled:opacity-40"
                                    >
                                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                    </button>

                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 ml-auto"
                                    >
                                        <FileUp size={16} /> Exportar
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 w-10">
                                                    <input type="checkbox" className="rounded border-slate-200 accent-purple-600" />
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5"><Users size={12} />Participante</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5"><BookOpen size={12} />OU</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5"><Hash size={12} />Rol</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5"><Calendar size={12} />Inscripción</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                    <div className="flex items-center justify-center gap-1.5"><BarChart2 size={12} />Avance</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                    <div className="flex items-center justify-center gap-1.5"><Trophy size={12} />Calificación</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                    <div className="flex items-center justify-center gap-1.5"><CheckCircle2 size={12} />Estado</div>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                                            <Users size={36} strokeWidth={1} />
                                                            <p className="text-sm font-bold">Sin participantes registrados</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : currentData.map((user) => (
                                                <tr key={user.inscripcionId} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <input type="checkbox" className="rounded border-slate-200 accent-purple-600" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-100 shadow-sm shrink-0">
                                                                <img
                                                                    src={user.imagenPortada || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`}
                                                                    alt={user.nombre}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`; }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{user.nombre} {user.apeLLido}</p>
                                                                <p className="text-[10px] text-purple-400 font-medium truncate max-w-[160px]">{user.correo}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {user.nombreOU || <span className="text-slate-300 italic text-xs">Sin OU</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${user.nombreRol ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {user.nombreRol || 'Sin Rol'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                                                        {new Date(user.fechaInscripcion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-purple-500 rounded-full transition-all"
                                                                    style={{ width: `${user.progreso}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-500 w-8">{user.progreso}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {user.calificacionFinal === null || user.calificacionFinal === undefined
                                                            ? <span className="text-slate-300 font-black">—</span>
                                                            : <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${user.calificacionFinal >= 60
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-rose-50 text-rose-500'
                                                                }`}>
                                                                {user.calificacionFinal}
                                                            </span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${user.esCompletado
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-amber-50 text-amber-500'
                                                            }`}>
                                                            {user.esCompletado ? '✓ Completado' : '· Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleRefresh(user.inscripcionId)}
                                                                className="p-2 hover:bg-purple-50 rounded-xl transition text-slate-300 hover:text-purple-500">
                                                                <RefreshCw size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleView(user.inscripcionId)}
                                                                className="p-2 hover:bg-purple-50 rounded-xl transition text-slate-300 hover:text-purple-500">
                                                                <Eye size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total: <span className="text-purple-600">{filteredParticipantes.length}</span> participantes
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(c => c - 1)}
                                        className="p-2.5 rounded-xl bg-white border border-slate-100 disabled:opacity-30 hover:border-purple-200 hover:text-purple-500 transition shadow-sm text-slate-400"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    {getPaginationRange(currentPage, totalPages).map((page, i) => (
                                        <button
                                            key={i}
                                            onClick={() => page !== '...' && setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${currentPage === page
                                                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                                                : 'bg-white border border-slate-100 text-slate-400 hover:border-purple-200 hover:text-purple-500'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(c => c + 1)}
                                        className="p-2.5 rounded-xl bg-white border border-slate-100 disabled:opacity-30 hover:border-purple-200 hover:text-purple-500 transition shadow-sm text-slate-400"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'manuales' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        placeholder="Buscar lección..."
                                        className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition text-sm font-medium text-slate-600 placeholder:text-slate-300"
                                    />
                                </div>
                                <button className="bg-white border border-slate-100 p-3 rounded-2xl text-slate-400 hover:text-purple-500 hover:border-purple-200 transition shadow-sm">
                                    <Filter size={16} />
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                {['Módulo', 'Lección', 'Tipo recurso', 'Tipo calificación', 'Participaciones', 'Pendientes', 'Calificados', 'Acción'].map(h => (
                                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingCalif ? (
                                                <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-300 text-sm font-bold">Cargando...</td></tr>
                                            ) : manualGrades.length === 0 ? (
                                                <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-300 text-sm font-bold">No hay recursos con calificación manual</td></tr>
                                            ) : manualGrades.map((item, idx) => (
                                                <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">
                                                            {item.modulo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.leccion}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-600">
                                                            {item.tipoRecurso}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.tipoCalificacionId === 3 ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {item.tipoCalificacionId === 3 ? 'Rúbrica' : 'Manual'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-black text-slate-400">{item.participacionesTotales || 0}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${item.pendientes > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {item.pendientes}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${item.calificados > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {item.calificados}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleCalificacionManual(item)}
                                                            className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-500 rounded-xl transition"
                                                        >
                                                            <PencilLine size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'automaticas' && (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        placeholder="Buscar..."
                                        className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition text-sm font-medium text-slate-600 placeholder:text-slate-300"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {['Estado', 'Tipo recurso', 'Módulos'].map(f => (
                                        <button key={f} className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs text-slate-500 hover:border-purple-200 hover:text-purple-500 transition shadow-sm font-bold">
                                            {f}
                                        </button>
                                    ))}
                                </div>
                                <button className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs text-slate-500 hover:border-purple-200 hover:text-purple-500 transition shadow-sm font-bold">
                                    Exportar <Download size={13} />
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                {['Módulo', 'Lección', 'Tipo recurso', 'Módulos', 'Participantes', 'Pendientes', 'Calificados auto.', 'Ver'].map(h => (
                                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingCalif ? (
                                                <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-300 text-sm font-bold">Cargando...</td></tr>
                                            ) : autoGrades.length === 0 ? (
                                                <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-300 text-sm font-bold">No hay recursos con calificación automática</td></tr>
                                            ) : autoGrades.map((item, idx) => (
                                                <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">
                                                            {item.modulo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.leccion}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-500">
                                                            {item.tipoRecurso}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                                                            {item.recursoModuloId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                                                            {item.participacionesTotales}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${item.pendientes > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {item.pendientes}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${item.calificados > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {item.calificados}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleCalificacionAutomatica(item)}
                                                            className="p-2 hover:bg-purple-50 rounded-xl transition text-slate-300 hover:text-purple-500">
                                                            <Eye size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resenas' && (
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="w-full lg:w-60 shrink-0">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Reseñas generales</p>
                                    <div className="flex items-end gap-3 mb-5">
                                        <span className="text-5xl font-black text-purple-600 leading-none">5.0</span>
                                        <StarRating rating={5} size={18} />
                                    </div>
                                    <div className="space-y-2 mb-5">
                                        {[5, 4, 3, 2, 1].map(num => (
                                            <div key={num} className="flex items-center gap-2">
                                                <StarRating rating={num} size={11} />
                                                <span className="text-[10px] text-slate-400 font-black">{num === 5 ? '4' : '0'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total reseñas</p>
                                        <p className="text-3xl font-black text-slate-800">4</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex justify-end">
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                                        <FileUp size={15} /> Exportar
                                    </button>
                                </div>
                                {REVIEWS.map(review => (
                                    <div key={review.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                                                    {review.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{review.user}</p>
                                                    <p className="text-[10px] text-purple-400 truncate max-w-[200px]">{review.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valoración</p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                                                <p className="text-xs text-slate-500 font-medium">{review.date}</p>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="pt-4 border-t border-slate-100 text-sm text-slate-500 font-medium leading-relaxed">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DatePickerModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onApply={(fechaSeleccionada) => {
                    setFiltros(prev => ({ ...prev, fecha: fechaSeleccionada }));
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}
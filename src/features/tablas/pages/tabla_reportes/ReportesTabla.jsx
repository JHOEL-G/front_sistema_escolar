import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Search,
    ArrowRight, ArrowLeft, Loader2,
    List, LayoutGrid, RefreshCcw, MoreVertical,
    Download, Settings2,
    BookOpen, MonitorPlay,
    Eye, PencilLine, Trash2,
    TrendingUp, GraduationCap, Map
} from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

const getPaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const fmt = (n) => (n === 0 ? null : n);
const pct = (num, den) => den > 0 ? `${((num / den) * 100).toFixed(2)}%` : '0.00%';

const StatBadge = ({ value, type, showZero = false }) => {
    if ((value === null || value === undefined || value === '') ||
        (value === 0 && !showZero) ||
        value === '0.00%')
        return <span className="text-slate-300 font-bold text-xs">—</span>;

    const colors = {
        passed: 'bg-emerald-50 text-emerald-600',
        failed: 'bg-rose-50 text-rose-600',
        started: 'bg-blue-50 text-blue-600',
        enrolled: 'bg-indigo-50 text-indigo-600',
        neutral: 'bg-slate-50 text-slate-600',
        pctPassed: 'bg-emerald-50 text-emerald-700',
        pctFailed: 'bg-rose-50 text-rose-700',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${colors[type] ?? colors.neutral}`}>
            {value}
        </span>
    );
};


const cursoColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo' },
    { key: 'date', label: 'Fecha creación' },
    { key: 'enrolled', label: 'Inscritos' },
    { key: 'started', label: 'Iniciados' },
    { key: 'failed', label: 'Reprobados' },
    { key: 'passed', label: 'Aprobados' },
    { key: 'pctFailed', label: '% Reprobados' },
    { key: 'pctPassed', label: '% Aprobación' },
];

const rutaColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'createDate', label: 'Fecha creación' },
    { key: 'enrolled', label: 'Inscritos' },
    { key: 'started', label: 'Iniciados' },
    { key: 'failed', label: 'Reprobados' },
    { key: 'passed', label: 'Aprobados' },
    { key: 'pctFailed', label: '% Reprobación' },
    { key: 'pctPassed', label: '% Aprobación' },
];


const RowActionsMenu = ({ row }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const options = [
        { label: 'Ver detalle', icon: <Eye size={15} /> },
        { label: 'Editar', icon: <PencilLine size={15} /> },
        { label: 'Exportar fila', icon: <Download size={15} /> },
        {
            label: 'Eliminar', icon: <Trash2 size={15} />,
            className: 'text-rose-600 hover:bg-rose-50 border-t border-slate-100',
        },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all"
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 overflow-hidden">
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => { opt.onClick(); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors ${opt.className ?? ''}`}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const CursoCard = ({ row }) => (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-white shadow-md text-indigo-500">
                <MonitorPlay size={26} />
            </div>
            <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                E-learning
            </span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1 leading-tight line-clamp-2">{row.name}</h3>
        <p className="text-[11px] text-slate-400 font-medium mb-4 truncate">{row.date}</p>
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 mb-4">
            {[
                { label: 'Inscritos', value: row.enrolled, type: 'enrolled' },
                { label: 'Aprobados', value: row.passed, type: 'passed' },
                { label: 'Reprobados', value: row.failed, type: 'failed' },
            ].map(s => (
                <div key={s.label} className="text-center">
                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-1">{s.label}</p>
                    <StatBadge value={s.value} type={s.type} />
                </div>
            ))}
        </div>
        <button className="w-full bg-slate-50 hover:bg-indigo-600 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white border border-slate-100">
            Ver detalle
        </button>
    </div>
);

const RutaCard = ({ row }) => (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center border-2 border-white shadow-md text-violet-500">
                <Map size={26} />
            </div>
            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.enrolled > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {row.enrolled > 0 ? 'Con inscritos' : 'Sin inscritos'}
            </span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1 leading-tight line-clamp-2">{row.name}</h3>
        <p className="text-[11px] text-slate-400 font-medium mb-4 truncate">{row.createDate}</p>
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 mb-4">
            {[
                { label: 'Inscritos', value: row.enrolled, type: 'enrolled' },
                { label: 'Aprobados', value: row.passed, type: 'passed' },
                { label: 'Reprobados', value: row.failed, type: 'failed' },
            ].map(s => (
                <div key={s.label} className="text-center">
                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-1">{s.label}</p>
                    <StatBadge value={s.value} type={s.type} />
                </div>
            ))}
        </div>
        <button className="w-full bg-slate-50 hover:bg-violet-600 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white border border-slate-100">
            Ver detalle
        </button>
    </div>
);


const ReportesApp = () => {
    const [activeTab, setActiveTab] = useState('cursos');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [cursosRows, setCursosRows] = useState([]);
    const [rutasRows, setRutasRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const signal = controller.signal;

        try {
            const cursosRes = await serviceApiNet.Cursos.list(signal);
            const cursosRaw = cursosRes.data?.data ?? cursosRes.data ?? [];

            const cursosFormateados = cursosRaw.map(c => {
                const enrolled = c.totalInscritos ?? 0;
                const passed = c.totalCompletados ?? 0;
                const started = c.progresoPromedio > 0 ? enrolled : 0;
                const failed = Math.max(enrolled - passed, 0);

                return {
                    id: c.cursoId ?? c.id,
                    name: c.nombreCurso ?? 'Sin nombre',
                    type: 'E-learning',
                    date: c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleString('es-MX', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                    }) : '-',
                    enrolled,
                    started,
                    passed,
                    failed,
                    pctFailed: pct(failed, enrolled),
                    pctPassed: pct(passed, enrolled),
                    _raw: c,
                };
            });
            setCursosRows(cursosFormateados);

            const rutasRes = await serviceApiNet.RutaAprendizaje.list(signal);
            const rutasRaw = rutasRes.data?.data ?? rutasRes.data ?? [];

            const rutasFormateadas = rutasRaw.map(r => ({
                id: r.rutaId ?? r.rutaAprendizajeId ?? r.id,
                name: r.nombreRuta ?? 'Sin nombre',
                createDate: r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleString('es-MX', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }) : '-',
                enrolled: r.totalParticipantes ?? 0,
                started: r.iniciados ?? 0,
                passed: r.aprobados ?? 0,
                failed: r.reprobados ?? 0,
                pctFailed: pct(r.reprobados ?? 0, r.totalParticipantes ?? 0),
                pctPassed: pct(r.aprobados ?? 0, r.totalParticipantes ?? 0),
                _raw: r,
            }));

            setRutasRows(rutasFormateadas);

        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                setError('No se pudieron cargar los datos.');
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const rawData = activeTab === 'cursos' ? cursosRows : rutasRows;
    const columns = activeTab === 'cursos' ? cursoColumns : rutaColumns;


    const handleSort = (key) => {
        setSortConfig(prev =>
            prev.key === key
                ? { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
                : { key, direction: 'ascending' }
        );
    };

    const processedData = useMemo(() => {
        let filtered = [...rawData];
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(row =>
                row.name.toLowerCase().includes(low) ||
                (row.type ?? '').toLowerCase().includes(low)
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
    }, [rawData, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedData.length / pageSize);
    const currentData = useMemo(() =>
        processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [processedData, currentPage, pageSize]
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSearchTerm('');
        setSortConfig({ key: null, direction: null });
    };


    const kpis = useMemo(() => {
        const totalEnrolled = rawData.reduce((s, r) => s + (r.enrolled ?? 0), 0);
        const totalPassed = rawData.reduce((s, r) => s + (r.passed ?? 0), 0);
        const avgPct = totalEnrolled > 0
            ? `${((totalPassed / totalEnrolled) * 100).toFixed(1)}%`
            : '0.0%';
        return { total: rawData.length, totalEnrolled, totalPassed, avgPct };
    }, [rawData]);

    const handleExport = () => {
        const headers = columns.map(c => c.label);
        const rows = processedData.map(row => columns.map(c => row[c.key] ?? ''));
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `reporte_${activeTab}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
            <div className="relative flex items-center justify-center mb-9">
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-500/10 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full border-t-4 border-b-4 border-indigo-600 animate-[spin_2s_linear_infinite]" />
                <div className="relative p-4 bg-white rounded-full shadow-xl">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            </div>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">
                Cargando Reportes
            </span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">
                Sincronizando cursos e inscripciones...
            </p>
        </div>
    );

    return (
        <div className="min-h-full p-4 lg:p-3 font-sans text-gray-800">
            <div className="max-w-full mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reportes</h1>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Panel de análisis de datos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-9">
                        <button
                            onClick={handleExport}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm text-slate-600 active:scale-95"
                        >
                            <Download size={18} className="text-indigo-500" />
                            Exportar
                        </button>

                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl shadow-indigo-100 active:scale-95 group">
                            <TrendingUp size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                            Generar Reporte
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3 text-xs font-bold mb-6">
                        <span>{error}</span>
                        <button onClick={fetchAll} className="ml-auto flex items-center gap-1 hover:underline">
                            <RefreshCcw size={13} /> Reintentar
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: activeTab === 'cursos' ? 'Total cursos' : 'Total rutas', value: kpis.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Total inscritos', value: kpis.totalEnrolled, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Total aprobados', value: kpis.totalPassed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: '% Aprobación prom.', value: kpis.avgPct, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map(k => (
                        <div key={k.label} className="bg-white border border-slate-100 rounded-3xl px-6 py-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                                <p className={`text-2xl font-black tracking-tighter ${k.color}`}>{k.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-2xl ${k.bg} flex items-center justify-center`}>
                                <GraduationCap size={20} className={k.color} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-8 border-b border-slate-200 mb-8">
                    {[
                        { id: 'cursos', label: 'Actividad de Cursos', icon: BookOpen, count: cursosRows.length },
                        { id: 'rutas', label: 'Actividad de Rutas de Aprendizaje', icon: Map, count: rutasRows.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label} ({tab.count})
                            {activeTab === tab.id && (
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
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                        <button onClick={fetchAll} className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
                            <RefreshCcw size={20} />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                            <Settings2 size={18} /> Columnas
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                            <Download size={18} /> CSV
                        </button>
                    </div>
                </div>
                {viewMode === 'table' ? (
                    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
                                    <tr>
                                        {columns.map(col => (
                                            <th
                                                key={col.key}
                                                onClick={() => handleSort(col.key)}
                                                className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition whitespace-nowrap"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {col.label}
                                                    {sortConfig.key === col.key
                                                        ? sortConfig.direction === 'ascending'
                                                            ? <ChevronUp size={13} className="text-indigo-500" />
                                                            : <ChevronDown size={13} className="text-indigo-500" />
                                                        : <ChevronDown size={13} className="opacity-20" />
                                                    }
                                                </div>
                                            </th>
                                        ))}
                                        <th className="px-6 py-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                                    <Search size={40} />
                                                    <p className="text-sm font-bold text-slate-400">
                                                        {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay datos disponibles'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : activeTab === 'cursos' ? (
                                        currentData.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 transition group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                                                            <MonitorPlay size={16} className="text-indigo-500" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800 truncate max-w-[220px]" title={row.name}>{row.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">{row.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">{row.date}</td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.enrolled} type="enrolled" /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.started} type="started" /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.failed} type="failed" /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.passed} type="passed" /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.pctFailed} type="pctFailed" /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.pctPassed} type="pctPassed" /></td>
                                                <td className="px-6 py-4 text-right"><RowActionsMenu row={row} /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        currentData.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 transition group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100 shrink-0">
                                                            <Map size={16} className="text-violet-500" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800 truncate max-w-[220px]" title={row.name}>{row.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">{row.createDate}</td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.enrolled} type="enrolled" showZero /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.started} type="started" showZero /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.failed} type="failed" showZero /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.passed} type="passed" showZero /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.pctFailed} type="pctFailed" /></td>
                                                <td className="px-6 py-4 text-center"><StatBadge value={row.pctPassed} type="pctPassed" /></td>
                                                <td className="px-6 py-4 text-right"><RowActionsMenu row={row} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentData.map(row =>
                            activeTab === 'cursos'
                                ? <CursoCard key={row.id} row={row} />
                                : <RutaCard key={row.id} row={row} />
                        )}
                    </div>
                )}
                <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-indigo-600">{processedData.length}</span> registros encontrados
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Renglones
                            <select
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                className="border border-slate-200 rounded-xl py-1.5 pl-3 pr-7 bg-white text-slate-600 text-[10px] font-black focus:ring-0 cursor-pointer appearance-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
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
                                        onClick={() => page !== '...' && setCurrentPage(page)}
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
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default ReportesApp;
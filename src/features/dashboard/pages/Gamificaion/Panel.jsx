import React, { useState, useEffect, useCallback } from 'react';
import {
    Trophy, Target, Gift, Zap, Star, Search,
    Filter, Download, ChevronDown, LayoutGrid, ExternalLink,
    RefreshCw, AlertCircle
} from 'lucide-react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { ChevronRight } from 'lucide-react';

const useAbortSignal = () => {
    const controllerRef = React.useRef(null);
    const getSignal = useCallback(() => {
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();
        return controllerRef.current.signal;
    }, []);
    useEffect(() => () => controllerRef.current?.abort(), []);
    return getSignal;
};


const KPICard = ({ title, value, subtitle, icon: Icon, colorClass, loading }) => {
    const textColor = colorClass.replace('bg-', 'text-');

    return (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    {loading
                        ? <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse mt-1" />
                        : <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
                    }
                </div>
                <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 shadow-sm flex items-center justify-center`}>
                    {Icon && (
                        <Icon
                            size={24}
                            className={textColor}
                            style={{ color: 'currentColor' }}
                        />
                    )}
                </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-6 leading-relaxed">{subtitle}</p>
        </div>
    );
};

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <Icon size={40} />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-2 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed font-medium">{description}</p>
    </div>
);

const ErrorBanner = ({ message, onRetry }) => (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3 text-xs font-bold mb-6">
        <AlertCircle size={16} />
        <span>{message}</span>
        {onRetry && (
            <button onClick={onRetry} className="ml-auto flex items-center gap-1 hover:underline">
                <RefreshCw size={14} /> Reintentar
            </button>
        )}
    </div>
);

const GamificacionPanel = ({ darkMode }) => {
    const getSignal = useAbortSignal();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [usuarios, setUsuarios] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [ous, setOus] = useState([]);
    const [roles, setRoles] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchGlobal, setSearchGlobal] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const signal = getSignal();

            const [usuariosRes, ousRes, rolesRes, cursosRes] = await Promise.all([
                serviceApiNet.Usuario.list(true, signal),
                serviceApiNet.Ous.list(signal),
                serviceApiNet.Roles.list(signal),
                serviceApiNet.Cursos.list(signal),
            ]);

            const usuariosRaw = usuariosRes.data;
            const usuariosData = Array.isArray(usuariosRaw)
                ? usuariosRaw
                : (usuariosRaw?.data ?? []);

            const ousData = ousRes.data?.data ?? [];

            const rolesData = rolesRes.data?.data ?? [];

            const cursosData = cursosRes.data?.data ?? [];

            setUsuarios(usuariosData);
            setOus(ousData);
            setRoles(rolesData);

            if (cursosData.length > 0) {
                const inscripcionesResults = await Promise.allSettled(
                    cursosData.map(curso =>
                        serviceApiNet.Inscripcion.getParticipantes(
                            curso.cursoId ?? curso.id,
                            signal
                        )
                    )
                );
                const allInscripciones = inscripcionesResults
                    .filter(r => r.status === 'fulfilled')
                    .flatMap(r => r.value?.data?.data ?? r.value?.data ?? []);
                setInscripciones(allInscripciones);
            } else {
                setInscripciones([]);
            }
        } catch (err) {
            if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                console.error('Error cargando datos de gamificación:', err);
                setError('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    }, [getSignal]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const puntajesPorUsuario = React.useMemo(() => {
        const map = {};
        inscripciones.forEach(ins => {
            const uid = ins.usuarioId ?? ins.userId;
            if (!uid) return;
            if (!map[uid]) map[uid] = { total: 0, redimidos: 0 };

            const completado = (ins.completado || ins.estadoCompletado) ? 100 : 0;
            const progreso = ins.progreso ?? ins.porcentajeProgreso ?? 0;
            const calificacion = ins.calificacion ?? ins.promedio ?? 0;

            map[uid].total += completado + Math.floor(progreso * 0.5) + Math.floor(calificacion * 2);
            map[uid].redimidos += ins.puntosRedimidos ?? 0;
        });
        return map;
    }, [inscripciones]);

    const colaboradoresConPuntos = React.useMemo(() => {
        return usuarios.map(u => {
            const uid = u.usuarioId ?? u.id;
            const puntos = puntajesPorUsuario[uid] ?? { total: 0, redimidos: 0 };

            const nombreCompleto = `${u.nombre ?? ''} ${u.apeLLido ?? u.apellido ?? ''}`.trim() || 'Sin nombre';

            const ouNombre = u.nombreOu
                ?? ous.find(o => o.organizacionalesId === u.organizacionalesId)?.nombre
                ?? u.unidad_Organizacional
                ?? '-';

            const rolNombre = u.nombreRol
                ?? roles.find(r => r.rolId === u.rolId)?.nombreRol
                ?? u.puesto
                ?? '-';

            return {
                id: uid,
                nombre: nombreCompleto,
                ou: ouNombre || '-',
                rol: rolNombre || '-',
                puesto: u.puesto ?? '-',
                total: puntos.total,
                redimidos: puntos.redimidos,
                activo: u.activo,
            };
        }).sort((a, b) => b.total - a.total);
    }, [usuarios, puntajesPorUsuario, ous, roles]);

    const kpis = React.useMemo(() => {
        const totalPuntos = colaboradoresConPuntos.reduce((s, c) => s + c.total, 0);
        const totalRedimidos = colaboradoresConPuntos.reduce((s, c) => s + c.redimidos, 0);
        const topLider = colaboradoresConPuntos[0] ?? null;
        const conPuntos = colaboradoresConPuntos.filter(c => c.total > 0).length;
        return { totalPuntos, totalRedimidos, topLider, conPuntos };
    }, [colaboradoresConPuntos]);

    const top5 = colaboradoresConPuntos.slice(0, 5);

    const distribucionOU = React.useMemo(() => {
        const map = {};
        colaboradoresConPuntos.forEach(c => {
            if (!c.ou || c.ou === '-') return;
            if (!map[c.ou]) map[c.ou] = 0;
            map[c.ou] += c.total;
        });
        if (Object.keys(map).length === 0) {
            ous.forEach(o => { map[o.nombre] = 0; });
        }
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
    }, [colaboradoresConPuntos, ous]);

    const filteredTable = React.useMemo(() => {
        const term = searchGlobal.toLowerCase();
        if (!term) return colaboradoresConPuntos;
        return colaboradoresConPuntos.filter(c =>
            c.nombre.toLowerCase().includes(term) ||
            c.ou.toLowerCase().includes(term) ||
            c.rol.toLowerCase().includes(term) ||
            c.puesto.toLowerCase().includes(term)
        );
    }, [colaboradoresConPuntos, searchGlobal]);

    const totalPages = Math.ceil(filteredTable.length / pageSize);
    const paginatedTable = filteredTable.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const filteredGlobal = React.useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return colaboradoresConPuntos.slice(0, 20);
        return colaboradoresConPuntos
            .filter(c => c.nombre.toLowerCase().includes(term))
            .slice(0, 20);
    }, [colaboradoresConPuntos, searchTerm]);


    const handleDownload = () => {
        const headers = ['#', 'Colaborador', 'O.U.', 'Puesto', 'Rol', 'Total disponible', 'Redimidos'];
        const rows = filteredTable.map((c, i) => [
            i + 1, `"${c.nombre}"`, `"${c.ou}"`, `"${c.puesto}"`, `"${c.rol}"`, c.total, c.redimidos
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'gamificacion.csv'; a.click();
        URL.revokeObjectURL(url);
    };


    return (
        <div className="min-h-full p-6 lg:p-7 font-sans text-slate-900 selection:bg-indigo-100">
            <div className="max-w-full mx-auto">

                <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6 px-2">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gamificación</h1>
                        <p className="text-base text-slate-400 font-medium mt-1">
                            Gestiona el progreso y recompensas de tus colaboradores.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchAll}
                            disabled={loading}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Cargando…' : 'Actualizar'}
                        </button>
                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:bg-indigo-50">
                            Políticas de Redención
                        </button>
                    </div>
                </header>

                {error && <ErrorBanner message={error} onRetry={fetchAll} />}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <KPICard
                        title="Top Líder"
                        value={kpis.topLider ? kpis.topLider.nombre.split(' ')[0] : '-'}
                        subtitle={kpis.topLider ? kpis.topLider.nombre : 'Nadie destaca aún'}
                        icon={Trophy}
                        colorClass="bg-indigo-600"
                        loading={loading}
                    />
                    <KPICard
                        title="Puntos totales"
                        value={kpis.totalPuntos.toLocaleString()}
                        subtitle={`Acumulados entre ${usuarios.length} colaboradores`}
                        icon={Target}
                        colorClass="bg-blue-500"
                        loading={loading}
                    />
                    <KPICard
                        title="Puntos redimidos"
                        value={kpis.totalRedimidos.toLocaleString()}
                        subtitle="Total redimido históricamente"
                        icon={Gift}
                        colorClass="bg-pink-500"
                        loading={loading}
                    />
                    <KPICard
                        title="Con puntos"
                        value={kpis.conPuntos}
                        subtitle={`De ${usuarios.length} colaboradores activos`}
                        icon={Zap}
                        colorClass="bg-amber-500"
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

                    <div className="lg:col-span-8 space-y-8">

                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm min-h-[350px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Distribución de puntos por O.U.
                                </h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {ous.length} unidades
                                </span>
                            </div>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {(() => {
                                        const maxVal = Math.max(...distribucionOU.map(([, v]) => v), 1);
                                        const barColors = [
                                            'bg-indigo-500', 'bg-blue-500', 'bg-pink-500',
                                            'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'
                                        ];
                                        return distribucionOU.map(([ou, pts], i) => (
                                            <div key={ou}>
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-xs font-bold text-slate-600">{ou}</span>
                                                    <span className="text-xs font-black text-slate-800">
                                                        {pts > 0 ? `${pts.toLocaleString()} pts` : '—'}
                                                    </span>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${barColors[i % barColors.length]} transition-all duration-700`}
                                                        style={{ width: pts > 0 ? `${Math.max(2, (pts / maxVal) * 100)}%` : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm min-h-[350px]">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-8">
                                Top 5 colaboradores estrella
                            </h3>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
                                            <div className="flex-1 h-6 bg-slate-100 rounded-lg animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            ) : top5.length === 0 || top5[0].total === 0 ? (
                                <EmptyState
                                    icon={Star}
                                    title="Aún no hay estrellas destacadas"
                                    description="Cuando tus colaboradores comiencen a participar y acumular puntos, los mejores aparecerán aquí."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {top5.map((c, i) => {
                                        const medals = ['🥇', '🥈', '🥉', '4°', '5°'];
                                        const bgColors = [
                                            'bg-amber-50 border-amber-100',
                                            'bg-slate-50 border-slate-100',
                                            'bg-orange-50 border-orange-100',
                                            'bg-white border-slate-100',
                                            'bg-white border-slate-100',
                                        ];
                                        return (
                                            <div key={c.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${bgColors[i]}`}>
                                                <span className="text-2xl w-8 text-center select-none">{medals[i]}</span>
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-sm font-black text-indigo-600 border border-indigo-100 shrink-0">
                                                    {c.nombre.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-800 truncate">{c.nombre}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{c.ou}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm font-black text-amber-500 shrink-0">
                                                    <Zap size={14} fill="currentColor" /> {c.total.toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[34rem] h-full">
                        <div className={`border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>

                            <div className="flex items-center justify-between mb-8">
                                <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Puntaje global</h3>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {usuarios.length} colab.
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar colaborador..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium transition-all outline-none focus:ring-4 ${darkMode
                                            ? 'bg-slate-800 text-white focus:ring-indigo-500/10'
                                            : 'bg-slate-50 text-slate-800 focus:ring-indigo-500/20'
                                            }`}
                                    />
                                </div>

                                <select
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-all appearance-none ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-400 shadow-sm'
                                        }`}
                                >
                                    <option value="">Listado completo</option>
                                    {filteredGlobal.map(c => (
                                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                                <div className="space-y-2">
                                    {loading ? (
                                        <p className="text-center text-xs text-slate-400 animate-pulse">Cargando...</p>
                                    ) : (
                                        filteredGlobal.map((c, i) => (
                                            <div key={c.id ?? i} className={`flex items-center justify-between group p-3 rounded-3xl transition-all cursor-pointer border border-transparent ${darkMode ? 'hover:bg-slate-800/50 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100 shadow-sm shadow-transparent hover:shadow-slate-200/50'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${darkMode ? 'bg-slate-800 text-slate-400 group-hover:bg-slate-700' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                                                        }`}>
                                                        {c.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-xs font-black tracking-tight truncate max-w-[150px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{c.nombre}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{c.ou}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-sm font-black text-amber-500">
                                                            <Zap size={12} fill="currentColor" /> {c.total}
                                                        </div>
                                                        <span className="text-[10px] text-slate-300 font-bold">
                                                            {c.redimidos > 0 ? `${c.redimidos} red.` : '—'}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button className={`w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${darkMode
                                ? 'bg-slate-800 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400'
                                : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}>
                                Descargar reporte completo
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, O.U. o rol..."
                                    value={searchGlobal}
                                    onChange={e => { setSearchGlobal(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3.5 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                                <Filter size={16} /> Filtrar
                            </button>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 border border-indigo-100 px-6 py-3.5 rounded-2xl transition-all shadow-sm"
                        >
                            <Download size={16} /> Descargar reporte
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">#</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">O.U.</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Puesto / Rol</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total disponible</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Redimidos</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Posición</th>
                                    <th className="px-8 py-5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading
                                    ? [...Array(6)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(8)].map((_, j) => (
                                                <td key={j} className="px-8 py-5">
                                                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : paginatedTable.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-8 py-16 text-center">
                                                <EmptyState
                                                    icon={Search}
                                                    title="Sin resultados"
                                                    description="No se encontraron colaboradores con ese criterio de búsqueda."
                                                />
                                            </td>
                                        </tr>
                                    )
                                        : paginatedTable.slice(0, 6).map((row, i) => {
                                            const posicion = (currentPage - 1) * pageSize + i + 1;
                                            const medalEmoji = posicion === 1 ? '🥇' : posicion === 2 ? '🥈' : posicion === 3 ? '🥉' : posicion;
                                            return (
                                                <tr key={row.id ?? i} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 text-sm text-center font-black text-slate-300">{medalEmoji}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100 shrink-0">
                                                                {row.nombre.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 tracking-tight">{row.nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{row.ou}</td>
                                                    <td className="px-8 py-5">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-600">{row.puesto}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{row.rol}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-black text-slate-800 text-center tracking-tighter">
                                                        {row.total.toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-black text-slate-800 text-center tracking-tighter">
                                                        {row.redimidos.toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-5 text-xs font-black text-slate-300 text-center tracking-widest">
                                                        {posicion}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {filteredTable.length === 0
                                    ? '0 resultados'
                                    : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredTable.length)} de ${filteredTable.length}`
                                }
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 bg-slate-50 text-slate-300 rounded-xl disabled:opacity-30 border border-slate-100 hover:bg-white hover:text-indigo-600 transition-all"
                                >
                                    <ChevronDown size={20} className="rotate-90" />
                                </button>

                                <div className="flex items-center px-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <span className="text-xs font-black text-indigo-600">{currentPage}</span>
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-3 bg-white text-slate-600 hover:text-indigo-600 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30"
                                >
                                    <ChevronDown size={20} className="-rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GamificacionPanel;
import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    SlidersHorizontal,
    Loader2,
    Map,
    Book,
    Play
} from 'lucide-react';
import { FilterSection } from '../../components/explorador_components/FilterSection';
import { CheckboxItem, CourseCard } from '../../components/explorador_components/ExploradorComponents';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { FilterSelect } from '../../components/diseño_perfil/DiseñoPerfil';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ExplorerPage() {
    const navigate = useNavigate();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('cursos');

    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [rutas, setRutas] = useState([]);
    const [loadingRutas, setLoadingRutas] = useState(true);
    const [errorRutas, setErrorRutas] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('all');
    const location = useLocation();
    const [temas, setTemas] = useState([]);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const res = await serviceApiNet.Usuario.getMe();
                const data = res.data?.data ?? res.data;
                setUsuarioActual(data);
            } catch (err) {
                console.error('Error al cargar usuario:', err);
            }
        };
        fetchUsuario();
    }, []);

    useEffect(() => {
        const fetchTemas = async () => {
            try {
                const response = await serviceApiNet.Temas.list();
                const lista = response.data?.data || response.data || [];
                setTemas(Array.isArray(lista) ? lista : []);
            } catch (err) {
                console.error('Error al cargar temas:', err);
            }
        };
        fetchTemas();
    }, []);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, []);

    const usuarioPuedeVerCurso = (visibilidadJSON) => {
        if (!visibilidadJSON || !usuarioActual) return true;
        try {
            const visibilidad = typeof visibilidadJSON === 'string'
                ? JSON.parse(visibilidadJSON)
                : visibilidadJSON;

            if (!visibilidad || visibilidad.length === 0) return true;

            return visibilidad.some(v => {
                if (v.tipoGrupo === 'ROL') return v.grupoId === usuarioActual.rolId;
                if (v.tipoGrupo === 'OU') return v.grupoId === usuarioActual.organizacionalesId;
                return false;
            });
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                setLoading(true);
                const response = await serviceApiNet.GestionCursos.list();
                const listaGestion = response.data?.data || response.data;
                if (listaGestion && Array.isArray(listaGestion)) {
                    setCursos(listaGestion.map(g => ({
                        id: g.cursoId,
                        gestionId: g.gestionCursoId,
                        title: g.nombreCurso,
                        description: g.descripcionCurso || 'Sin descripción',
                        rating: "5.0 reviews",
                        duration: `${g.duracionCurso || 0} Horas`,
                        type: g.privacidad,
                        image: g.imagenPortadaPath || `https://picsum.photos/seed/${g.cursoId}/400/225`,
                        visibilidadJSON: g.visibilidadJSON,
                        estaPublicado: g.estaPublicado,
                        inscripcionAutomatica: g.inscripcionAutomatica,
                        permitirDesinscripcion: g.permitirDesinscripcion,
                        gamificacion: g.gamificacion,
                        creadoPor: g.creadoPor,
                        temas: g.temas || [],
                        participantes: g.participantes || [],
                        evaluadores: g.evaluadores || [],
                        criterios: g.criterios || [],
                        visibilidad: g.visibilidad || null,
                    })));
                }
            } catch (err) {
                console.error('Error al cargar cursos gestionados:', err);
                setError('No se pudieron cargar los cursos');
            } finally {
                setLoading(false);
            }
        };
        fetchCursos();
    }, []);

    useEffect(() => {
        const fetchRutas = async () => {
            try {
                setLoadingRutas(true);
                const response = await serviceApiNet.RutaAprendizaje.list();
                const listaRutas = response.data?.data || response.data || [];
                setRutas(Array.isArray(listaRutas) ? listaRutas : []);
            } catch (err) {
                console.error('Error al cargar rutas:', err);
                setErrorRutas('No se pudieron cargar las rutas');
            } finally {
                setLoadingRutas(false);
            }
        };
        fetchRutas();
    }, []);

    const cursosFiltrados = cursos
        .filter(c => c.estaPublicado)
        .filter(c => usuarioPuedeVerCurso(c.visibilidadJSON))
        .filter(c => c.title?.toLowerCase().includes(searchText.toLowerCase()))
        .sort((a, b) => sortBy === 'recent' ? b.id - a.id : 0);

    const rutasFiltradas = rutas
        .filter(r => r.nombreRuta?.toLowerCase().includes(searchText.toLowerCase()))
        .sort((a, b) => sortBy === 'recent' ? b.rutaId - a.rutaId : 0);

    return (
        <div className="flex min-h-screen bg-transparent">
            {mobileFiltersOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setMobileFiltersOpen(false)}
                />
            )}

            <aside
                className={`
                    bg-transparent border-gray-100
                    flex flex-col h-screen sticky top-0
                    transition-all duration-500 ease-in-out
                    ${filtersOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0'}
                    ${mobileFiltersOpen ? 'fixed inset-y-0 left-0 z-50 w-[280px] opacity-100' : 'hidden lg:flex'}
                `}
                style={{
                    transform: filtersOpen || mobileFiltersOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
            >
                <div
                    className="transition-opacity duration-300"
                    style={{
                        opacity: filtersOpen || mobileFiltersOpen ? 1 : 0,
                        transitionDelay: filtersOpen || mobileFiltersOpen ? '100ms' : '0ms'
                    }}
                >
                    <div className="p-6 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
                        <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest">Explorador</h2>
                        <button
                            onClick={() => { setFiltersOpen(false); setMobileFiltersOpen(false); }}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                        <div className="mb-6">
                            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-3">Filtros</span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={activeTab === 'cursos' ? 'Buscar curso' : 'Buscar ruta'}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                                <Search className="absolute left-3.5 top-3 text-gray-300 w-4 h-4" />
                            </div>
                        </div>

                        <FilterSection title="Creador">
                            <CheckboxItem label="Universidad Confia" />
                        </FilterSection>

                        <FilterSection title="Duración">
                            <div className="space-y-3">
                                <CheckboxItem label="1 hora o menos" />
                                <CheckboxItem label="2 horas o menos" />
                                <CheckboxItem label="2 a 4 horas" />
                                <CheckboxItem label="Más de 4 horas" />
                            </div>
                        </FilterSection>

                        <FilterSection title="Temas">
                            <div className="relative mb-3">
                                <input type="text" placeholder="Buscar tema"
                                    className="w-full pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[12px]" />
                                <Search className="absolute left-2.5 top-2 text-gray-300 w-3.5 h-3.5" />
                            </div>
                            <CheckboxItem label="Aprendizaje" />
                        </FilterSection>

                        <FilterSection title="Subtemas">
                            <div className="relative mb-3">
                                <input type="text" placeholder="Buscar subtema"
                                    className="w-full pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[12px]" />
                                <Search className="absolute left-2.5 top-2 text-gray-300 w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-3">
                                <CheckboxItem label="Conocimiento" />
                                <CheckboxItem label="Políticas" />
                            </div>
                        </FilterSection>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
                <div className="max-w-8xl mx-auto p-6 lg:p-3">

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {!filtersOpen && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setFiltersOpen(true); }}
                                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm active:scale-95 cursor-pointer select-none relative z-20"
                                >
                                    <div className="flex items-center gap-2 pointer-events-none">
                                        <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Filtros</span>
                                    </div>
                                </button>
                            )}
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm active:scale-95"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="text-sm font-medium">Filtros</span>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">Mi Explorador</h1>
                        </div>
                    </div>


                    <div className="flex items-center justify-between border-b border-gray-100 mb-6">
                        <div className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('cursos')}
                                className={`pb-4 text-sm font-bold px-1 transition-colors border-b-2 flex items-center gap-2
                ${activeTab === 'cursos'
                                        ? 'text-emerald-600 border-emerald-600'
                                        : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                            >
                                <Book size={15} />
                                Cursos
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black
                ${activeTab === 'cursos' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {cursosFiltrados.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('rutas')}
                                className={`pb-4 text-sm font-bold px-1 transition-colors border-b-2 flex items-center gap-2
                ${activeTab === 'rutas'
                                        ? 'text-emerald-600 border-emerald-600'
                                        : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                            >
                                <Map size={15} />
                                Rutas de aprendizaje
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black
                ${activeTab === 'rutas' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {rutasFiltradas.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flcol sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="text-sm text-gray-500 font-medium">
                            Mostrando: <span className="text-gray-900 font-bold">
                                {activeTab === 'cursos' ? cursosFiltrados.length : rutasFiltradas.length} Resultados
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Ordenar por:</span>
                            <FilterSelect
                                value={sortBy}
                                onChange={(value) => setSortBy(value)}
                                options={[
                                    { label: 'Todos', value: 'all' },
                                    { label: 'Favoritos', value: 'favorites' },
                                    { label: 'Recomendados', value: 'recommended' },
                                    { label: 'Más recientes', value: 'recent' }
                                ]}
                            />
                        </div>
                    </div>

                    {activeTab === 'cursos' && (
                        <>
                            {(loading || !usuarioActual) && (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                                    <p className="text-gray-400 font-medium">Cargando cursos...</p>
                                </div>
                            )}
                            {error && (
                                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-medium">{error}</p>
                                </div>
                            )}
                            {!loading && !error && usuarioActual && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {cursosFiltrados.length > 0 ? (
                                        cursosFiltrados.map(course => (
                                            <CourseCard key={course.id} course={course} temas={temas} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-24">
                                            <p className="text-gray-400 font-medium">No hay cursos disponibles para tu perfil</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'rutas' && (
                        <>
                            {loadingRutas && (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <Loader2 className="animate-spin text-emerald-500" size={48} />
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-tighter">Cargando rutas...</p>
                                </div>
                            )}

                            {errorRutas && (
                                <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-tighter">{errorRutas}</p>
                                </div>
                            )}

                            {!loadingRutas && !errorRutas && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                    {rutasFiltradas.length > 0 ? (
                                        rutasFiltradas.map((ruta) => (
                                            <div key={ruta.rutaId}
                                                onClick={() => navigate(`/rutas_aprendizaje_inscrito/${ruta.rutaId}`)}
                                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer">

                                                <div className="relative h-44 overflow-hidden">
                                                    <img
                                                        src={ruta.imagenPortada || `https://picsum.photos/seed/${ruta.rutaId + 200}/600/400`}
                                                        alt={ruta.nombreRuta}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${ruta.rutaId + 200}/600/400`; }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md border
                                        ${ruta.nombrePrivacidad === 'Privado'
                                                                ? 'bg-slate-900/60 border-white/10 text-slate-300'
                                                                : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'}`}>
                                                            {ruta.nombrePrivacidad}
                                                        </span>
                                                        <span className="bg-emerald-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30">
                                                            Ruta
                                                        </span>
                                                    </div>

                                                    <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
                                                        <Map size={18} className="text-emerald-300" />
                                                    </div>

                                                    {ruta.fechaLimite && ruta.asignarFecha && (
                                                        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white border border-white/10">
                                                            📅 {new Date(ruta.asignarFecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6 space-y-4">
                                                    <h3 className="font-black text-sm text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight">
                                                        {ruta.nombreRuta}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-400 line-clamp-2 font-medium">
                                                        {ruta.descripcion || 'Sin descripción disponible'}
                                                    </p>

                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100">
                                                            <Book size={12} className="text-emerald-500" /> {ruta.totalRecursos} recursos
                                                        </span>
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100">
                                                            <Map size={12} className="text-emerald-500" /> {ruta.totalSecciones} secciones
                                                        </span>
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-600 border border-emerald-100">
                                                            👥 {ruta.totalParticipantes}
                                                        </span>
                                                        <span className="px-3 py-1.5 bg-amber-50 rounded-xl text-[10px] font-black text-amber-600 border border-amber-100">
                                                            ★ {ruta.criterioAprobacion}%
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                        {ruta.nombreCertificado ? (
                                                            <span className="text-[10px] font-black text-amber-600 flex items-center gap-1.5 uppercase tracking-tighter">
                                                                🎓 {ruta.nombreCertificado}
                                                            </span>
                                                        ) : <span />}

                                                        <div className="bg-emerald-500 text-white p-2.5 rounded-2xl group-hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/40 group-hover:scale-110 duration-300">
                                                            <Play size={14} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                            <Map size={48} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No hay rutas disponibles en este momento</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
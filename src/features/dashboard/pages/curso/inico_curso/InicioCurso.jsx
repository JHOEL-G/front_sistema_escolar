import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, FileText, Video, Menu, Clock,
    ChevronDown, X, BookOpen, Download, MessageSquare, PenTool,
    Monitor, Calendar, Code, ClipboardList, MapPin, ExternalLink, AlertCircle, Dices
} from 'lucide-react';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { useParams, useNavigate } from 'react-router-dom';
import VideoInteractivoPlayer from './video_preguntas/VideoInteractivoPlayer';
import EvaluacionPlayer from './evaluacion/EvaluacionPlayer';
import { Hash } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { ForoPlayer } from './foro/ForoPlayer';
import { TareaPlayer } from './tarea/TareaPlayer';
import EncuestaPlayer from './encuesta/EncuestaPlayer';
import { CheckCircle } from 'lucide-react';
import ScormPlayer from './scrom/ScormPlayer';
import Toast from '../../../../../components/gestor_documentos/notificaciones/Toast';
import ActividadCard from './card/ActividadCard';
import EvaluacionPresencialPlayer from './evaluacion_precensial/EvaluacionPrecensialPlayer';
import SesionPresencialPlayer from './secion_precensial/SecionPresencialPlayer';
import ZoomPlayer from './zoom/ZoomPlayer';
import LecturaPlayer from './lectura/LecturaPlayer';
import ContenidoEmbebidoPlayer from './endebido/ContenidoEmbebidoPlayer';

const InicioCurso = () => {
    const [cursoData, setCursoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeLessonId, setActiveLessonId] = useState(null);
    const [openModules, setOpenModules] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const [usuarioId, setUsuarioId] = useState(null);
    const [cursoFinalizado, setCursoFinalizado] = useState(false);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [activeTab, setActiveTab] = useState('Descripción');

    const [videoCompleto, setVideoCompleto] = useState(false);
    const [evaluacionCompleta, setEvaluacionCompleta] = useState(false);
    const [encuestaCompleta, setEncuestaCompleta] = useState(false);
    const [toast, setToast] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
        };
    }, []);

    useEffect(() => {
        setVideoCompleto(false);
        setEvaluacionCompleta(false);
        setEncuestaCompleta(false);
        setToast(null);
    }, [activeLessonId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resUsuario = await serviceApiNet.Usuario.getMe();
                const uid = resUsuario.data?.usuarioId
                    || resUsuario.data?.data?.usuarioId
                    || resUsuario.data?.data?.[0]?.usuarioId;

                if (uid) {
                    setUsuarioId(uid);
                    try {
                        const resProgreso = await serviceApiNet.Inscripcion.obtenerProgreso(uid, Number(id));
                        if (resProgreso.data?.success && resProgreso.data?.data?.length > 0) {
                            const idsCompletados = new Set(
                                resProgreso.data.data.map(p => p.moduloRecursoId)
                            );
                            setCompletedLessons(idsCompletados);
                        }
                    } catch (e) {
                        console.error("Error cargando progreso:", e);
                    }
                } else {
                    console.error(">>> No se pudo extraer usuarioId. Estructura:", resUsuario.data);
                }

                const response = await serviceApiNet.Cursos.getById(id);
                if (response.data.success) {
                    const data = response.data.data;
                    setCursoData(data);
                    if (data.recursos?.length > 0 && !activeLessonId) {
                        setActiveLessonId(data.recursos[0].moduloRecursoId);
                    }
                    if (data.modulos?.length > 0) setOpenModules([data.modulos[0].moduloId]);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const mostrarToast = (mensaje) => {
        setToast({ message: mensaje, type: 'error' });
    };

    const estaLeccionBloqueada = () => {
        if (!currentLesson) return false;
        const { recursoId, moduloRecursoId } = currentLesson;

        if (completedLessons.has(moduloRecursoId)) return false;

        if ((recursoId === 4 || recursoId === 12) && !videoCompleto) return true;
        if (recursoId === 1 && !evaluacionCompleta) return true;
        if (recursoId === 9 && !encuestaCompleta) return true;
        return false;
    };

    const mensajeBloqueo = () => {
        if (!currentLesson) return '';
        const { recursoId } = currentLesson;
        if (recursoId === 4) return 'Debes ver el video completo antes de continuar.';
        if (recursoId === 12) return 'Debes ver el video con preguntas completo antes de continuar.';
        if (recursoId === 1) return 'Debes completar la evaluación antes de continuar.';
        if (recursoId === 9) return 'Debes completar la encuesta antes de continuar.';
        return '';
    };

    const handleCalificarAutomatico = async (pct) => {
        if (!usuarioId || !currentLesson) return;
        try {
            await serviceApiNet.Inscripcion.calificarRecurso({
                tipoRecurso: currentLesson.recursoId,
                recursoId: currentLesson.dataJson?.evaluacionId,
                usuarioId: usuarioId,
                cursoId: Number(id),
                calificacion: pct,
                comentario: null,
                calificadoPorId: null
            });
        } catch (e) {
            console.error('>>> Error guardando calificación automática:', e);
        }
    };

    const handleFinalizar = async () => {
        if (estaLeccionBloqueada()) {
            mostrarToast(mensajeBloqueo());
            return;
        }

        if (usuarioId && currentLesson) {
            try {
                await serviceApiNet.Inscripcion.registrarProgreso({
                    usuarioId: usuarioId,
                    cursoId: Number(id),
                    moduloRecursoId: currentLesson.moduloRecursoId
                });
                setCompletedLessons(prev => new Set([...prev, currentLesson.moduloRecursoId]));
            } catch (e) {
                console.error('Error registrando último progreso:', e);
            }
        }
        setCursoFinalizado(true);
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600" />
        </div>
    );

    if (!cursoData) return <div>No se encontró el curso.</div>;

    const modules = cursoData.modulos.map((mod) => ({
        ...mod,
        lessons: cursoData.recursos
            .filter(r => r.moduloId === mod.moduloId)
            .filter((r, idx, arr) =>
                arr.findIndex(x => x.moduloRecursoId === r.moduloRecursoId) === idx
            )
    }));

    const allLessons = cursoData.recursos.filter(
        (r, idx, arr) => arr.findIndex(x => x.moduloRecursoId === r.moduloRecursoId) === idx
    );
    const currentLesson = allLessons.find(l => l.moduloRecursoId === activeLessonId);
    const currentIndex = allLessons.findIndex(l => l.moduloRecursoId === activeLessonId);

    const handleNext = async () => {
        if (estaLeccionBloqueada()) {
            mostrarToast(mensajeBloqueo());
            return;
        }

        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            if (usuarioId && currentLesson) {
                serviceApiNet.Inscripcion.registrarProgreso({
                    usuarioId: usuarioId,
                    cursoId: Number(id),
                    moduloRecursoId: currentLesson.moduloRecursoId
                })
                    .then(() => {
                        setCompletedLessons(prev => new Set([...prev, currentLesson.moduloRecursoId]));
                        setActiveLessonId(nextLesson.moduloRecursoId);
                    })
                    .catch(e => console.error(">>> [API] Error al registrar progreso:", e));
            } else {
                console.warn(">>> [!] Falta usuarioId o currentLesson para registrar progreso");
            }
        }
    };

    const handlePrev = () => { if (currentIndex > 0) setActiveLessonId(allLessons[currentIndex - 1].moduloRecursoId); };
    const toggleModule = (idx) => setOpenModules(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );

    const SIDEBAR_ICONS = {
        1: <ClipboardList size={20} />,
        2: <MessageSquare size={20} />,
        3: <PenTool size={20} />,
        4: <Video size={20} />,
        5: <BookOpen size={20} />,
        6: <Monitor size={20} />,
        7: <Calendar size={20} />,
        8: <Code size={20} />,
        9: <Dices size={20} />,
        10: <ClipboardList size={20} />,
        11: <MapPin size={20} />,
        12: <Video size={20} />,
    };

    const renderContent = () => {
        if (!currentLesson) return null;
        const { recursoId, dataJson, titulo } = currentLesson;

        if (recursoId === 1) return (
            <EvaluacionPlayer
                dataJson={dataJson}
                titulo={titulo}
                usuarioId={usuarioId}
                onCalificar={(pct) => {
                    handleCalificarAutomatico(pct);
                    setEvaluacionCompleta(true);
                }}
            />
        );

        if (recursoId === 2) return (
            <ForoPlayer
                dataJson={dataJson}
                titulo={titulo}
                moduloRecursoId={currentLesson.moduloRecursoId}
                usuarioId={usuarioId}
            />
        );

        if (recursoId === 3) return (
            <TareaPlayer
                dataJson={dataJson}
                titulo={titulo}
                moduloRecursoId={currentLesson.moduloRecursoId}
                usuarioId={usuarioId}
                cursoId={id}
            />
        );


        if (recursoId === 4) {
            const src = dataJson?.VideoPath || dataJson?.VideoLink || dataJson?.videoPath || dataJson?.videoLink;
            const esVertical = dataJson?.isVertical ?? dataJson?.IsVertical ?? false;

            return (
                // ✅ wrapper que da espacio real al video vertical en móvil
                <div className={esVertical
                    ? 'flex justify-center w-full'
                    : 'w-full'
                }>
                    <VideoInteractivoPlayer
                        key={currentLesson.moduloRecursoId}
                        src={src}
                        preguntas={[]}
                        isInteractivo={false}
                        isVertical={esVertical}
                        onComplete={() => {
                            setVideoCompleto(true);
                            setCompletedLessons(prev => new Set([...prev, currentLesson.moduloRecursoId]));
                        }}
                    />
                </div>
            );
        }

        if (recursoId === 5) return (
            <LecturaPlayer dataJson={dataJson} titulo={titulo} />
        );
        if (recursoId === 6) return (
            <ZoomPlayer dataJson={dataJson} titulo={titulo} />
        );

        if (recursoId === 7) return (
            <ContenidoEmbebidoPlayer dataJson={dataJson} titulo={titulo} />
        );

        if (recursoId === 8) return (
            <ScormPlayer dataJson={dataJson} titulo={titulo} />
        );

        if (recursoId === 9) return (
            <EncuestaPlayer
                dataJson={dataJson}
                titulo={titulo}
                moduloRecursoId={currentLesson.moduloRecursoId}
                usuarioId={usuarioId}
                onComplete={() => setEncuestaCompleta(true)}
            />
        );

        if (recursoId === 10) return (
            <SesionPresencialPlayer dataJson={dataJson} titulo={titulo} />
        );

        if (recursoId === 11) return (
            <EvaluacionPresencialPlayer dataJson={dataJson} titulo={titulo} />
        );

        if (recursoId === 12) {
            const src = dataJson?.VideoPath || dataJson?.VideoLink || dataJson?.videoPath || dataJson?.videoLink;
            if (!src) return (
                <ActividadCard icono={Video} colorBg="bg-violet-500" colorText="text-violet-500" colorBorder="border-violet-100" titulo="Video Pregunta" nombre={titulo}>
                    <p className="text-slate-400 text-sm">No se encontró la ruta del video.</p>
                </ActividadCard>
            );
            const preguntas = dataJson?.Preguntas || dataJson?.preguntas || [];
            const esVertical = dataJson?.isVertical ?? dataJson?.IsVertical ?? false;
            return (
                <VideoInteractivoPlayer
                    key={currentLesson.moduloRecursoId}
                    src={src}
                    preguntas={preguntas}
                    isInteractivo={true}
                    isVertical={esVertical}
                    onComplete={() => {
                        setVideoCompleto(true);
                        setCompletedLessons(prev => new Set([...prev, currentLesson.moduloRecursoId]));
                    }}
                />
            );
        }

        return (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <AlertCircle size={36} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">{currentLesson.nombreTipo}</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Este tipo de recurso (ID: {recursoId}) aún no tiene visualizador implementado.
                </p>
            </div>
        );
    };

    if (cursoFinalizado) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 p-8 sm:p-16 flex flex-col items-center w-full max-w-md text-center">
                <div className="w-28 h-28 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-violet-200 mb-8 rotate-3">
                    <Trophy size={52} className="text-white -rotate-3" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                    ¡Curso completado!
                </h1>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed">
                    Has finalizado todos los recursos del curso. ¡Felicitaciones por tu esfuerzo!
                </p>
                <button
                    onClick={() => navigate(`/curso_iniciado/${id}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-xl shadow-violet-200 transition-all hover:-translate-y-0.5 text-sm uppercase tracking-widest"
                >
                    Ver mi progreso <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );

    const bloqueado = estaLeccionBloqueada();

    return (
        <div className="flex h-full w-full font-sans text-slate-800 overflow-hidden relative bg-slate-50">

            {isSidebarOpen && !isFullscreen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {!isSidebarOpen && !isFullscreen && (
                <button onClick={() => setIsSidebarOpen(true)}
                    className="fixed bottom-6 right-6 md:absolute md:bottom-auto md:top-6 md:right-6 z-50 p-3.5 md:p-4 bg-violet-600 text-white rounded-2xl shadow-xl shadow-violet-200 hover:scale-105 transition-all">
                    <Menu size={22} />
                </button>
            )}

            <main className={`flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col items-center transition-all duration-500 ${isSidebarOpen ? 'md:mr-[400px]' : 'mr-0'}`}>
                <div className={`w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 
    ${currentLesson?.dataJson?.isVertical || currentLesson?.dataJson?.IsVertical
                        ? 'max-w-lg'
                        : 'max-w-8xl'
                    } mx-auto`}
                >
                    <div className="flex flex-col gap-2 pr-14 md:pr-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-violet-100 text-violet-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                                Lección {currentIndex + 1} de {allLessons.length}
                            </span>
                            <span className="text-slate-400 text-xs font-bold mb-[2px]">• {currentLesson?.nombreTipo}</span>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                            {currentLesson?.titulo || "Sin título"}
                        </h1>

                        {/* ✅ Descripción visible siempre, antes del contenido */}
                        {(currentLesson?.dataJson?.Descripcion ||
                            currentLesson?.dataJson?.descripcion ||
                            currentLesson?.dataJson?.Instrucciones ||
                            currentLesson?.dataJson?.instrucciones ||
                            cursoData.mensajeBienvenida) && (
                                <p className="text-slate-500 text-sm leading-relaxed mt-1">
                                    {currentLesson?.dataJson?.Descripcion ||
                                        currentLesson?.dataJson?.descripcion ||
                                        currentLesson?.dataJson?.Instrucciones ||
                                        currentLesson?.dataJson?.instrucciones ||
                                        cursoData.mensajeBienvenida}
                                </p>
                            )}
                    </div>
                    <div key={activeLessonId} className="w-full">
                        {renderContent()}
                    </div>

                    <div className="flex flex-col gap-3 bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            {['Descripción', 'Recursos', 'Dudas'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                aria-label="Lección anterior"
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                                <span className="hidden xs:inline sm:inline">Anterior</span>
                            </button>
                            <button
                                onClick={currentIndex === allLessons.length - 1 ? handleFinalizar : handleNext}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-xl shadow-sm font-black text-xs sm:text-sm transition-all border
                ${bloqueado
                                        ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : 'bg-white text-violet-600 hover:bg-violet-50 border-slate-200/50 hover:-translate-y-0.5'
                                    }`}
                            >
                                {bloqueado && <AlertCircle size={14} className="text-slate-400" />}
                                {currentIndex === allLessons.length - 1
                                    ? <><Trophy size={16} className={bloqueado ? 'text-slate-400' : 'text-amber-500'} /><span>Finalizar</span></>
                                    : <><span>Siguiente</span><ChevronRight size={16} /></>
                                }
                            </button>
                        </div>
                    </div>

                    <div className="pb-8 sm:pb-12 bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100">
                        {activeTab === 'Descripción' && (
                            <>
                                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-900">
                                    Sobre esta lección
                                </h3>
                                <p className="text-slate-600 text-base leading-relaxed">
                                    {currentLesson?.dataJson?.Descripcion ||
                                        currentLesson?.dataJson?.descripcion ||
                                        currentLesson?.dataJson?.Instrucciones ||
                                        currentLesson?.dataJson?.instrucciones ||
                                        cursoData.mensajeBienvenida}
                                </p>
                            </>
                        )}

                        {activeTab === 'Recursos' && (
                            <>
                                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-900">
                                    Archivos adjuntos
                                </h3>
                                {currentLesson?.recursoId === 5 && currentLesson?.dataJson?.ArchivosAdjuntos?.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentLesson.dataJson.ArchivosAdjuntos.map((archivo, idx) => (
                                            <a key={idx} href={archivo.RutaArchivo} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-violet-50 transition-colors group">
                                                <FileText size={20} className="text-slate-400 group-hover:text-violet-600" />
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">{archivo.NombreArchivo}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">No hay archivos adjuntos para esta lección.</p>
                                )}
                            </>
                        )}

                        {activeTab === 'Dudas' && (
                            <>
                                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-900">
                                    Dudas
                                </h3>
                                <p className="text-slate-400 text-sm">La sección de dudas estará disponible próximamente.</p>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {!isFullscreen && (
                <aside className={`fixed right-0 top-0 h-full z-40 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-[calc(100%-1rem)] md:h-[calc(100%-2rem)] w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[400px] m-2 md:m-4 bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] rounded-[2rem] md:rounded-[2.5rem] flex flex-col overflow-hidden">
                        <div className="p-5 sm:p-8 flex items-center justify-between relative flex-shrink-0">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] mb-1">Contenido</span>
                                <h3 className="text-xl font-black text-slate-800">Plan de Estudios</h3>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="group p-3 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all duration-300"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-4 pb-10 custom-scrollbar">
                            {modules.map((module) => {
                                const isOpen = openModules.includes(module.moduloId);

                                return (
                                    <div key={module.moduloId} className="group/module">
                                        <button
                                            onClick={() => toggleModule(module.moduloId)}
                                            className="w-full flex items-center gap-4 px-2 py-3 group cursor-pointer"
                                        >
                                            <h4 className={`text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-colors ${isOpen ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {module.moduloTitulo}
                                            </h4>
                                            <div className={`h-[1px] w-full transition-colors ${isOpen ? 'bg-violet-100' : 'bg-slate-100'}`} />
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-violet-500' : 'text-slate-400'}`}
                                            />
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                            <div className="px-2 pb-2">
                                                <div className="flex flex-col">
                                                    {module.lessons.map((lesson, index) => {
                                                        const isActive = activeLessonId === lesson.moduloRecursoId;

                                                        return (
                                                            <div
                                                                key={lesson.moduloRecursoId}
                                                                onClick={() => {
                                                                    setActiveLessonId(lesson.moduloRecursoId);
                                                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                                                }}
                                                                style={{ transitionDelay: `${index * 50}ms` }}
                                                                className={`group relative flex items-center gap-4 p-3.5 rounded-[1.75rem] transition-all duration-300 cursor-pointer mb-1 last:mb-0 ${isActive
                                                                    ? 'bg-white shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)] scale-[1.02] z-10'
                                                                    : completedLessons.has(lesson.moduloRecursoId)
                                                                        ? 'bg-emerald-50/60 hover:bg-emerald-50'
                                                                        : 'hover:bg-white/40'
                                                                    }`}
                                                            >
                                                                <div className={`absolute left-0 rounded-r-full transition-all duration-500 w-1 ${isActive
                                                                    ? 'h-8 bg-violet-500 opacity-100'
                                                                    : completedLessons.has(lesson.moduloRecursoId)
                                                                        ? 'h-8 bg-emerald-400 opacity-100'
                                                                        : 'h-0 opacity-0'
                                                                    }`} />

                                                                <div className={`relative w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 flex-shrink-0 ${isActive
                                                                    ? 'bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 text-white shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] rotate-[6deg]'
                                                                    : completedLessons.has(lesson.moduloRecursoId)
                                                                        ? 'bg-emerald-100 text-emerald-600'
                                                                        : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
                                                                    }`}>
                                                                    {!isActive && completedLessons.has(lesson.moduloRecursoId)
                                                                        ? <CheckCircle size={20} className="text-emerald-500" />
                                                                        : SIDEBAR_ICONS[lesson.recursoId] || <FileText size={20} />
                                                                    }
                                                                    {isActive && (
                                                                        <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full -z-10 animate-pulse" />
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className={`text-[13.5px] font-bold tracking-tight leading-snug truncate transition-colors ${isActive
                                                                        ? 'text-slate-900'
                                                                        : completedLessons.has(lesson.moduloRecursoId)
                                                                            ? 'text-emerald-700'
                                                                            : 'text-slate-500 group-hover:text-slate-700'
                                                                        }`}>
                                                                        {lesson.titulo}
                                                                    </h5>

                                                                    <div className="flex items-center gap-2.5 mt-1.5">
                                                                        <span className={`flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg border transition-all ${isActive
                                                                            ? 'bg-violet-50 text-violet-600 border-violet-100/50'
                                                                            : completedLessons.has(lesson.moduloRecursoId)
                                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                                : 'bg-slate-100/50 text-slate-400 border-transparent'
                                                                            }`}>
                                                                            <span className={`w-1 h-1 rounded-full ${isActive
                                                                                ? 'bg-violet-500 animate-pulse'
                                                                                : completedLessons.has(lesson.moduloRecursoId)
                                                                                    ? 'bg-emerald-500'
                                                                                    : 'bg-slate-300'
                                                                                }`} />
                                                                            {lesson.nombreTipo}
                                                                        </span>

                                                                        <span className="flex items-center gap-1 text-[10px] text-slate-300 font-bold tracking-tighter">
                                                                            <Hash size={10} strokeWidth={3} />
                                                                            {lesson.ordenRecurso}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {isActive ? (
                                                                    <div className="flex items-end gap-[3px] h-3.5 mb-1.5 mr-1">
                                                                        <div className="w-[2.5px] bg-violet-500/80 rounded-full animate-[music_0.8s_ease-in-out_infinite] h-full" />
                                                                        <div className="w-[2.5px] bg-violet-400/80 rounded-full animate-[music_1.1s_ease-in-out_infinite] h-[60%]" />
                                                                        <div className="w-[2.5px] bg-fuchsia-400/80 rounded-full animate-[music_0.9s_ease-in-out_infinite] h-[80%]" />
                                                                    </div>
                                                                ) : completedLessons.has(lesson.moduloRecursoId) ? (
                                                                    <div className="flex items-center justify-center w-6 h-6 bg-emerald-100 rounded-full mr-1">
                                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .prose { color: #334155; }
                .prose h1, .prose h2, .prose h3 { color: #0f172a; font-weight: 700; }
                .prose a { color: #8b5cf6; text-decoration: underline; }
                `
            }} />
        </div>
    );
};

export default InicioCurso;
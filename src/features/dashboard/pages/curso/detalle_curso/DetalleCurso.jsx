import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2, Clock, Globe, BarChart3, FileText, ChevronDown,
    Star, Monitor, PlayCircle, BookOpen, Shield, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';

const DetalleCurso = () => {
    const [curso, setCurso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedModule, setExpandedModule] = useState(null);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { id } = useParams();
    const [mostrarVideo, setMostrarVideo] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [yaInscrito, setYaInscrito] = useState(false);

    useEffect(() => {
        const fetchCurso = async () => {
            try {
                setLoading(true);
                const response = await serviceApiNet.Cursos.getById(id);
                if (response.data?.success) {
                    setCurso(response.data.data);
                } else {
                    setError('No se pudo cargar el curso');
                }
            } catch (err) {
                console.error('Error al cargar curso:', err);
                setError('Error al cargar el curso');
            } finally {
                setLoading(false);
            }
        };
        fetchCurso();
    }, [id]);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await serviceApiNet.Usuario.getMe();
                if (response.data) {
                    setCurrentUser(response.data);
                }
            } catch (err) {
                console.error("Error al obtener usuario de la sesión", err);
            }
        };

        fetchUserData();
    }, []);

    const handleInscribirse = async () => {
        // Si ya sabemos que está inscrito, solo redirigir
        if (yaInscrito) {
            navigate(`/curso_iniciado/${id}`);
            return;
        }

        const idParaInscripcion = currentUser?.usuarioId;

        if (!idParaInscripcion) {
            Swal.fire({
                title: 'Sesión no detectada',
                text: 'No pudimos recuperar tu ID de usuario. Reintenta en un momento.',
                icon: 'warning'
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const datos = { usuarioId: idParaInscripcion, cursoId: parseInt(id) };
            const response = await serviceApiNet.Inscripcion.crear(datos);

            if (response.data.success) {
                Swal.fire({
                    title: '¡Listo!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                }).then(() => navigate(`/curso_iniciado/${id}`));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || '';

            // El backend devuelve 400 cuando ya está inscrito
            if (errorMsg.toLowerCase().includes('ya está inscrito') || errorMsg.toLowerCase().includes('ya inscrito')) {
                setYaInscrito(true);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: '¡Ya estás inscrito en este curso!',
                    text: 'Serás redirigido al curso.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                }).then(() => navigate(`/curso_iniciado/${id}`));
            } else {
                Swal.fire('Error', errorMsg || 'Hubo un problema con la inscripción', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const verificarInscripcion = async () => {
            try {
                const response = await serviceApiNet.Inscripcion.verificar({
                    usuarioId: currentUser?.usuarioId,
                    cursoId: parseInt(id)
                });

                if (response.data?.inscrito) {
                    setYaInscrito(true);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: '¡Ya estás inscrito!',
                        text: 'Puedes continuar desde donde lo dejaste.',
                        showConfirmButton: false,
                        timer: 3500,
                        timerProgressBar: true,
                    });
                } else {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'Curso disponible',
                        text: 'Aún no estás inscrito en este curso.',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            } catch (err) {
                console.error('Error al verificar inscripción:', err);
            }
        };

        if (currentUser?.usuarioId) {
            verificarInscripcion();
        }
    }, [currentUser, id]);
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Loader2 className="absolute w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Preparando tu experiencia...</p>
            </div>
        );
    }

    if (error || !curso) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/60 text-center max-w-md border border-slate-100">
                    <div className="bg-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <Shield className="text-red-500 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Ups! Algo salió mal</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

            <main className="max-w-8xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">

                    <div className="space-y-10">

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                Curso Certificado
                            </div>

                            <h1 className="text-4xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                                {curso.nombreCurso}
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                                {curso.mensajeBienvenida}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-indigo-200 shadow-lg">
                                        {curso.nombreCurso.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Instructor</p>
                                        <p className="text-sm font-bold text-slate-900">Universidad Confía</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-amber-700">5.0</span>
                                    <span className="text-xs text-amber-600/70 font-medium">(128 reseñas)</span>
                                </div>
                            </div>
                        </div>

                        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm shadow-slate-200/50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Objetivos del aprendizaje</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {curso.caracteristicasQueAprendere.split(',').map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:bg-white" />
                                        </div>
                                        <span className="text-slate-600 text-sm leading-relaxed">{item.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm shadow-slate-200/50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Requisitos</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {curso.caracteristicasRequerimientos.split(',').map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:bg-white" />
                                        </div>
                                        <span className="text-slate-600 text-sm leading-relaxed">{item.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-end justify-between mb-8 px-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Contenido del curso</h2>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {curso.modulos.length} módulos • {curso.recursos.length} recursos • {curso.duracionCurso} horas de video bajo demanda
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {curso.modulos.length > 0 ? (
                                    curso.modulos.map((module, index) => {
                                        const recursosDelModulo = curso.recursos.filter(
                                            recurso => recurso.moduloId === module.moduloId
                                        );

                                        return (
                                            <div key={index} className="group bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden hover:border-blue-200 transition-all">
                                                <button
                                                    onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                                                    className="w-full flex items-center justify-between p-6 text-left"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <span className="text-2xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </span>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                                {module.moduloTitulo}
                                                            </h3>
                                                            <p className="text-xs text-slate-400 mt-1 font-medium">
                                                                {recursosDelModulo.length} recursos
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`p-2 rounded-xl transition-all ${expandedModule === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                                        <ChevronDown className="w-5 h-5" />
                                                    </div>
                                                </button>

                                                <div className={`grid transition-all duration-300 ease-in-out ${expandedModule === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="px-8 pb-8 pt-2">
                                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                                    {module.descripcion}
                                                                </p>

                                                                {recursosDelModulo.length > 0 && (
                                                                    <div className="space-y-3 pt-4 border-t border-slate-200">
                                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                                                            Recursos del módulo
                                                                        </h4>
                                                                        {recursosDelModulo.map((recurso, idx) => {
                                                                            const getIconComponent = (iconName) => {
                                                                                const icons = {
                                                                                    'play_circle': PlayCircle,
                                                                                    'menu_book': BookOpen,
                                                                                    'assignment': FileText,
                                                                                    'forum': Monitor,
                                                                                };
                                                                                return icons[iconName] || FileText;
                                                                            };

                                                                            const IconComponent = getIconComponent(recurso.icono);

                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-50 transition-colors group/recurso border border-slate-100"
                                                                                >
                                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${recurso.recursoId === 4 ? 'bg-red-50 text-red-600' :
                                                                                        recurso.recursoId === 5 ? 'bg-blue-50 text-blue-600' :
                                                                                            'bg-slate-50 text-slate-600'
                                                                                        } group-hover/recurso:scale-110 transition-transform`}>
                                                                                        <IconComponent className="w-4 h-4" />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium text-slate-700 truncate">
                                                                                            {recurso.titulo}
                                                                                        </p>
                                                                                        <p className="text-xs text-slate-400 font-medium">
                                                                                            {recurso.nombreTipo}
                                                                                        </p>
                                                                                    </div>
                                                                                    <span className="text-xs font-bold text-slate-300 group-hover/recurso:text-blue-400 transition-colors">
                                                                                        {recurso.ordenRecurso}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <PlayCircle className="w-4 h-4" /> {recursosDelModulo.length} Recursos
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Próximamente disponible</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <h2 className="text-1xl font-bold text-slate-900 mb-2">{curso.descripcionCurso}</h2>
                    </div>

                    <aside className="lg:sticky lg:top-10">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden group">
                            <div className="relative aspect-[16/10] overflow-hidden">
                                {mostrarVideo && curso.videoPromocionalPath ? (
                                    <video
                                        src={curso.videoPromocionalPath}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                    />
                                ) : (
                                    <>
                                        <img
                                            src={curso.imagenPortadaPath}
                                            alt={curso.nombreCurso}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />
                                        {curso.videoPromocionalPath && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button
                                                    onClick={() => setMostrarVideo(true)}
                                                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-all cursor-pointer"
                                                >
                                                    <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 right-4 text-center">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/20 backdrop-blur-sm py-1 px-3 rounded-full">
                                                Vista previa del curso
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-8">
                                <div className="space-y-5 mb-8">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Este curso incluye:</h4>

                                    <div className="grid gap-4">
                                        {[
                                            { icon: Clock, label: 'Duración', val: `${curso.duracionCurso} horas`, color: 'text-blue-600', bg: 'bg-blue-50' },
                                            { icon: BarChart3, label: 'Nivel', val: curso.nombreDificultad, color: 'text-purple-600', bg: 'bg-purple-50' },
                                            { icon: Globe, label: 'Idioma', val: curso.nombreLenguaje, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { icon: Monitor, label: 'Acceso', val: 'De por vida', color: 'text-orange-600', bg: 'bg-orange-50' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 group/item">
                                                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{item.label}</p>
                                                    <p className="text-sm font-bold text-slate-700">{item.val}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        disabled={!curso.activo || isSubmitting}
                                        onClick={handleInscribirse}
                                        className={`w-full py-5 rounded-2xl font-extrabold text-lg transition-all relative overflow-hidden group/btn flex items-center justify-center gap-3 ${curso.activo && !isSubmitting
                                            ? yaInscrito
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 hover:-translate-y-1'
                                                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-blue-100 hover:-translate-y-1'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Procesando...</span>
                                            </>
                                        ) : (
                                            <span className="relative z-10">
                                                {!curso.activo
                                                    ? 'No disponible'
                                                    : yaInscrito
                                                        ? '▶ Continuar ahora'
                                                        : 'Empezar ahora'}
                                            </span>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-slate-400 font-medium">
                                        Garantía de satisfacción de 30 días
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 px-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Habilidades que obtendrás</h4>
                            <div className="flex flex-wrap gap-2">
                                {curso.caracteristicasHabilidades.split(',').map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors cursor-default">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default DetalleCurso;
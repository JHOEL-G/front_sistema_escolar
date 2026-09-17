import { X, Info, ChevronDown, Tags, Video, ChevronRight, Save, Eye, Layout, BookOpen, Target, ShieldCheck } from "lucide-react";
import Stepper from "./Stepper";
import { useState, useEffect } from "react";
import { DIFICULTADES, LENGUAJES } from "./select_formulario/ComboBox";
import TagInput from "./select_formulario/TagInput";
import { useNavigate } from "react-router-dom";
import { useCurso } from "../useCurso";

const LandingPageScreen = ({ onBack }) => {
    const { courseData, updateCourseData, isEditing, id } = useCurso();
    const [showBanner, setShowBanner] = useState(true);

    const [dificultadId, setDificultadId] = useState(courseData?.DificultadID || 1);
    const [lenguajeId, setLenguajeId] = useState(courseData?.LenguajeID || 1);
    const [descripcionCurso, setDescripcionCurso] = useState(courseData?.DescripcionCurso || '');
    const [porQueInscribirme, setPorQueInscribirme] = useState(courseData?.PorQueInscribirme || '');
    const [queAprendere, setQueAprendere] = useState(
        courseData?.Caracteristicas?.find(c => c.tipo === 'aprender')?.descripcion || []
    );
    const [habilidades, setHabilidades] = useState(
        courseData?.Caracteristicas?.find(c => c.tipo === 'habilidad')?.descripcion || []
    );
    const [requerimientos, setRequerimientos] = useState(
        courseData?.Caracteristicas?.find(c => c.tipo === 'requerimiento')?.descripcion || []
    );
    const navigate = useNavigate();
    const [video, setVideo] = useState(courseData?.video || null);
    const [videoPreview, setVideoPreview] = useState(null);
    useEffect(() => {
        if (courseData?.DificultadID) setDificultadId(courseData.DificultadID);
        if (courseData?.LenguajeID) setLenguajeId(courseData.LenguajeID);
        if (courseData?.DescripcionCurso) setDescripcionCurso(courseData.DescripcionCurso);
        if (courseData?.PorQueInscribirme) setPorQueInscribirme(courseData.PorQueInscribirme);

        const aprender = courseData?.Caracteristicas?.find(c => c.tipo === 'aprender')?.descripcion;
        const habilidad = courseData?.Caracteristicas?.find(c => c.tipo === 'habilidad')?.descripcion;
        const requerimiento = courseData?.Caracteristicas?.find(c => c.tipo === 'requerimiento')?.descripcion;

        if (aprender) setQueAprendere(typeof aprender === 'string' ? aprender.split(',').map(s => s.trim()).filter(Boolean) : aprender);
        if (habilidad) setHabilidades(typeof habilidad === 'string' ? habilidad.split(',').map(s => s.trim()).filter(Boolean) : habilidad);
        if (requerimiento) setRequerimientos(typeof requerimiento === 'string' ? requerimiento.split(',').map(s => s.trim()).filter(Boolean) : requerimiento);

    }, [courseData?.DificultadID, courseData?.LenguajeID, courseData?.DescripcionCurso,
    courseData?.PorQueInscribirme, courseData?.Caracteristicas]);

    useEffect(() => {
        if (!video) {
            setVideoPreview(null);
            return;
        }
        if (video instanceof File) {
            const objectUrl = URL.createObjectURL(video);
            setVideoPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof video === 'string') {
            setVideoPreview(video);
        }
    }, [video]);

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 200 * 1024 * 1024) {
                alert("El video es demasiado pesado. Máximo 200MB.");
                return;
            }
            setVideo(file);
        }
    };
    const handleNext = () => {
        if (!queAprendere.length) return alert("¿Qué aprenderé? es obligatorio.");
        if (!habilidades.length) return alert("Las habilidades son obligatorias.");
        if (!requerimientos.length) return alert("Los requerimientos son obligatorios.");

        const caracteristicas = [
            { tipo: 'aprender', descripcion: queAprendere },
            { tipo: 'habilidad', descripcion: habilidades },
            { tipo: 'requerimiento', descripcion: requerimientos }
        ].filter(c => Array.isArray(c.descripcion) ? c.descripcion.length > 0 : c.descripcion.trim() !== '');

        updateCourseData({
            DificultadID: Number(dificultadId),
            LenguajeID: Number(lenguajeId),
            DescripcionCurso: descripcionCurso,
            PorQueInscribirme: porQueInscribirme,
            video,
            Caracteristicas: [
                { tipo: 'aprender', descripcion: queAprendere },
                { tipo: 'habilidad', descripcion: habilidades },
                { tipo: 'requerimiento', descripcion: requerimientos }
            ]
        });
        navigate(isEditing ? `/curso/editar/${id}/course-content` : '/curso/crear/course-content');
    };

    if (!courseData) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-full bg-[#F8FAFC]">
            <main className="max-w-8xl mx-auto py-10 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Cursos</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Landing Page</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Personalizar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Venta</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                            <Save size={18} /> Borrador
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                            <Eye size={18} /> Vista previa
                        </button>
                    </div>
                </div>

                <div className="px-2">
                    <Stepper currentStep={2} type="completo" />
                </div>

                {showBanner && (
                    <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden mx-2 shadow-2xl shadow-slate-200">
                        <div className="absolute top-0 right-0 p-6">
                            <button onClick={() => setShowBanner(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
                                <Info className="text-indigo-400" size={32} />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-white font-bold text-lg mb-1">Paso opcional: Optimiza tu conversión</h4>
                                <p className="text-slate-400 text-sm">Una Landing Page bien detallada aumenta hasta un <span className="text-indigo-400 font-bold">40% la tasa de inscripción</span>.</p>
                            </div>
                            <div className="flex gap-4 pr-7">
                                <button onClick={handleNext} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">Saltar paso</button>
                                <button onClick={() => setShowBanner(false)} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">Configurar ahora</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="p-8 lg:p-12 space-y-12">

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <Layout className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Contenido de la Landing Page</h3>
                                <p className="text-sm text-slate-500 font-medium">Atrae a tus estudiantes con información detallada.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Dificultad
                                </label>
                                <div className="relative">
                                    <select
                                        value={dificultadId}
                                        onChange={(e) => setDificultadId(e.target.value)}
                                        className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50/30 font-semibold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all"
                                    >
                                        {DIFICULTADES.map((dificultad) => (
                                            <option key={dificultad.id} value={dificultad.id}>
                                                {dificultad.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Lenguaje
                                </label>
                                <div className="relative">
                                    <select
                                        value={lenguajeId}
                                        onChange={(e) => setLenguajeId(e.target.value)}
                                        className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50/30 font-semibold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all"
                                    >
                                        {LENGUAJES.map((lenguaje) => (
                                            <option key={lenguaje.id} value={lenguaje.id}>
                                                {lenguaje.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descripción del curso</label>
                                <textarea rows="4" value={descripcionCurso} onChange={(e) => setDescripcionCurso(e.target.value)} className="w-full p-5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-700 placeholder:text-slate-300" placeholder="Escribe una breve descripción" />
                                <div className="text-[10px] font-bold text-slate-400">{descripcionCurso.length}/650</div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">¿Por qué inscribirme en el curso?</label>
                                <textarea rows="3" value={porQueInscribirme} onChange={(e) => setPorQueInscribirme(e.target.value)} className="w-full p-5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-700 placeholder:text-slate-300" placeholder="Escribe algo..." />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Características
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-slate-600">¿Qué voy a aprender?</label>
                                    <TagInput
                                        tags={queAprendere}
                                        setTags={setQueAprendere}
                                        placeholder="Ej. Diseño, Empatía..."
                                        icon={BookOpen}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-slate-600">Habilidades</label>
                                    <TagInput
                                        tags={habilidades}
                                        setTags={setHabilidades}
                                        placeholder="Ej. Figma, Research..."
                                        icon={Target}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-slate-600">Requerimientos</label>
                                    <TagInput
                                        tags={requerimientos}
                                        setTags={setRequerimientos}
                                        placeholder="Ej. Internet, Laptop..."
                                        icon={ShieldCheck}
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Video Promocional</label>
                            {videoPreview ? (
                                <div className="relative max-w-2xl mx-auto">
                                    <video src={videoPreview} controls className="w-full rounded-3xl border border-slate-100 shadow-lg" />
                                    <button onClick={() => setVideo(null)} className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-all"><X size={16} /></button>
                                </div>
                            ) : (
                                <div onClick={() => document.getElementById('videoInput').click()} className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer group">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Video className="text-indigo-600" size={28} />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">Arrastra y suelta un archivo o súbelo <span className="text-indigo-600 font-bold">aquí</span></p>
                                    <p className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-tighter">Tamaño máximo: 200mb</p>
                                    <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">Agregar enlace de video</button>
                                    <input id="videoInput" type="file" className="hidden" accept="video/*" onChange={handleVideoChange} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4">
                    <button onClick={() => {
                        updateCourseData({
                            DificultadID: Number(dificultadId),
                            LenguajeID: Number(lenguajeId),
                            DescripcionCurso: descripcionCurso,
                            PorQueInscribirme: porQueInscribirme,
                            Caracteristicas: [
                                { tipo: 'aprender', descripcion: queAprendere },
                                { tipo: 'habilidad', descripcion: habilidades },
                                { tipo: 'requerimiento', descripcion: requerimientos }
                            ]
                        });
                        navigate(isEditing ? `/curso/editar/${id}/basic-info` : '/curso/crear/basic-info');
                    }} className="text-indigo-600 font-bold text-sm hover:underline">Atrás</button>
                    <button onClick={handleNext} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm">
                        Siguiente
                    </button>
                </div>
            </main>
        </div>
    );
};

export default LandingPageScreen;
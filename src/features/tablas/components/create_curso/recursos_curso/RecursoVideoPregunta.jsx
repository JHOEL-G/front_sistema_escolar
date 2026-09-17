import React, { useState, useRef, useEffect } from "react";
import { X, Video, Link, Upload, Info, Plus, Trash2, CheckCircle2, Clock, Pencil, Check, Sparkles, Eye } from "lucide-react";

const getYouTubeId = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

const getVimeoId = (url) => {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
};

const detectarPlataforma = (url) => {
    if (!url) return null;
    if (getYouTubeId(url)) return 'youtube';
    if (getVimeoId(url)) return 'vimeo';
    if (url.includes('wistia')) return 'wistia';
    return null;
};

const getEmbedUrl = (url) => {
    const ytId = getYouTubeId(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}`;
    const vimeoId = getVimeoId(url);
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
    return null;
};

const PLATAFORMA_LABEL = { youtube: 'YouTube', vimeo: 'Vimeo', wistia: 'Wistia' };

const RecursoVideoPregunta = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || "",
        tipoSubida: cfg.TipoSubida || cfg.tipoSubida || "archivo",
        archivoVideo: null,
        hacerVisibleDashboard: cfg.HacerVisibleDashboard ?? cfg.hacerVisibleDashboard ?? true,
        preguntas: (() => {
            const raw = cfg.Preguntas || cfg.preguntas || [];
            return raw.map(p => ({
                idTemp: Date.now() + Math.random(),
                preguntaVideoId: p.PreguntaVideoId || 0,
                textoPregunta: p.TextoPregunta || "",
                segundoMarca: p.SegundoMarca || 0,
                minutosInput: Math.floor((p.SegundoMarca || 0) / 60),
                segundosInput: (p.SegundoMarca || 0) % 60,
                tipoPreguntaId: p.TipoPreguntaId || 1,
                puntosValor: p.PuntosValor || 1,
                opciones: (p.Opciones || []).map(o => ({
                    textoOpcion: o.TextoOpcion || "",
                    esCorrecta: o.EsCorrecta || false
                }))
            }));
        })()
    });

    const [linkInput, setLinkInput] = useState(
        cfg.VideoLink || cfg.videoLink || ""
    );
    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [duracionVideo, setDuracionVideo] = useState(
        cfg.DuracionSegundos || cfg.duracionSegundos || 0
    );
    const [embedUrl, setEmbedUrl] = useState('');
    const [plataforma, setPlataforma] = useState(null);
    const tituloInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) {
            tituloInputRef.current.focus();
            tituloInputRef.current.select();
        }
    }, [editandoTitulo]);

    useEffect(() => {
        const plat = detectarPlataforma(linkInput);
        setPlataforma(plat);
        setEmbedUrl(plat ? (getEmbedUrl(linkInput) || '') : '');
    }, [linkInput]);

    useEffect(() => {
        if (cfg.VideoLink) {
            setLinkInput(cfg.VideoLink);
        }
    }, []);

    const handleInputChange = (field, value) => {
        if (field === "archivoVideo" && value instanceof File) {
            if (value.size > 500 * 1024 * 1024) {
                alert('El archivo excede el tamaño máximo de 500MB');
                return;
            }
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === "archivoVideo") {
            if (value instanceof File) obtenerDuracionArchivo(value);
            else setDuracionVideo(0);
        }
    };

    const formatearDuracion = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const minSegASegundos = (min, seg) => (parseInt(min) || 0) * 60 + (parseInt(seg) || 0);

    const agregarPregunta = () => setFormData(prev => ({
        ...prev,
        preguntas: [...prev.preguntas, {
            idTemp: Date.now(),
            preguntaVideoId: 0,
            textoPregunta: "",
            segundoMarca: 0,
            minutosInput: 0,
            segundosInput: 0,
            tipoPreguntaId: 1,
            puntosValor: 1,
            opciones: [{ textoOpcion: "", esCorrecta: false }, { textoOpcion: "", esCorrecta: false }]
        }]
    }));

    const eliminarPregunta = (id) => setFormData(prev => ({ ...prev, preguntas: prev.preguntas.filter(p => p.idTemp !== id) }));

    const actualizarPregunta = (id, field, value) => setFormData(prev => ({
        ...prev,
        preguntas: prev.preguntas.map(p => p.idTemp === id ? { ...p, [field]: value } : p)
    }));

    const actualizarOpcion = (pId, oIdx, field, value) => setFormData(prev => ({
        ...prev,
        preguntas: prev.preguntas.map(p => {
            if (p.idTemp !== pId) return p;
            return {
                ...p,
                opciones: p.opciones.map((opt, i) => {
                    if (i !== oIdx) return field === "esCorrecta" && value ? { ...opt, esCorrecta: false } : opt;
                    return { ...opt, [field]: value };
                })
            };
        })
    }));

    useEffect(() => {
        if (formData.archivoVideo instanceof File) {
            const url = URL.createObjectURL(formData.archivoVideo);
            setVideoSrc(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setVideoSrc(null);
        }
    }, [formData.archivoVideo]);

    const obtenerDuracionArchivo = (file) => {
        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.onloadedmetadata = () => { window.URL.revokeObjectURL(vid.src); setDuracionVideo(Math.floor(vid.duration)); };
        vid.src = URL.createObjectURL(file);
    };

    const nombreVideoGuardado = cfg.VideoPath || null;
    const tieneArchivoGuardado = !formData.archivoVideo && nombreVideoGuardado && formData.tipoSubida === "archivo";

    const handleGuardar = () => {
        if (!formData.tituloSesion.trim()) return alert("El título es obligatorio");
        if (formData.tipoSubida === "archivo" && !formData.archivoVideo && !nombreVideoGuardado) return alert("Selecciona un video");
        if (formData.tipoSubida === "link" && !linkInput.trim()) return alert("Ingresa un enlace de video");
        const validas = formData.preguntas.every(p => p.textoPregunta.trim() !== "" && p.opciones.some(o => o.esCorrecta));
        if (formData.preguntas.length > 0 && !validas) return alert("Todas las preguntas deben tener texto y una opción correcta.");

        onSave({
            titulo: formData.tituloSesion,
            descripcion: formData.descripcionSesion,
            tipoId: 12,
            configuracion: {
                VideoPath: formData.tipoSubida === "archivo" ? (formData.archivoVideo?.name || nombreVideoGuardado) : null,
                VideoLink: formData.tipoSubida === "link" ? linkInput : null,
                TipoSubida: formData.tipoSubida,
                Plataforma: plataforma || null,
                HacerVisibleDashboard: !!formData.hacerVisibleDashboard,
                DuracionSegundos: duracionVideo || 0,
                Preguntas: formData.preguntas.map(p => ({
                    PreguntaVideoId: typeof p.preguntaVideoId === 'number' ? p.preguntaVideoId : 0,
                    TextoPregunta: String(p.textoPregunta || ""),
                    SegundoMarca: Number(p.segundoMarca) || 0,
                    TipoPreguntaId: Number(p.tipoPreguntaId) || 1,
                    PuntosValor: Number(p.puntosValor) || 0,
                    Activo: true,
                    Opciones: p.opciones.map(o => ({ TextoOpcion: String(o.textoOpcion || ""), EsCorrecta: !!o.esCorrecta }))
                }))
            },
            archivoReal: formData.tipoSubida === "archivo" ? formData.archivoVideo : null
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">

            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-violet-500 shadow-lg shadow-violet-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Video className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            {editandoTitulo ? (
                                <div className="flex items-center gap-2">
                                    <input ref={tituloInputRef} type="text" value={formData.tituloSesion}
                                        onChange={(e) => handleInputChange("tituloSesion", e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditandoTitulo(false); }}
                                        onBlur={() => setEditandoTitulo(false)}
                                        placeholder="Nombre del video interactivo..."
                                        className="text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-400 outline-none placeholder:text-slate-300 w-full min-w-[280px]"
                                    />
                                    <button onMouseDown={(e) => { e.preventDefault(); setEditandoTitulo(false); }}
                                        className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all flex-shrink-0">
                                        <Check size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/titulo">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {formData.tituloSesion
                                            ? <span className="text-indigo-600">{formData.tituloSesion}</span>
                                            : <><span className="text-slate-300">Video </span><span className="text-violet-500">Interactivo</span></>}
                                    </h2>
                                    <button onClick={() => setEditandoTitulo(true)}
                                        className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0">
                                        <Pencil size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}
                            <p className="text-slate-500 font-medium text-sm mt-0.5">Agrega preguntas que detengan el video</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="px-10 py-8 space-y-10">

                <section className="space-y-5">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Archivo de video</h3>
                        <p className="text-xs text-slate-400">Sube un archivo o pega un enlace externo</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        {[{ key: "archivo", label: "Archivo local", Icon: Upload }, { key: "link", label: "Enlace externo", Icon: Link }].map(({ key, label, Icon }) => (
                            <button key={key} onClick={() => handleInputChange("tipoSubida", key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${formData.tipoSubida === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Icon size={15} strokeWidth={2.5} /> {label}
                            </button>
                        ))}
                    </div>

                    {formData.tipoSubida === "archivo" ? (
                        <>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setDragging(false); handleInputChange("archivoVideo", e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300
                                    ${dragging ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                                        : formData.archivoVideo ? 'border-emerald-300 bg-emerald-50'
                                            : tieneArchivoGuardado ? 'border-blue-300 bg-blue-50'
                                                : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                                    ${formData.archivoVideo ? 'bg-emerald-400 shadow-emerald-200'
                                        : tieneArchivoGuardado ? 'bg-blue-400 shadow-blue-200'
                                            : dragging ? 'bg-indigo-400 shadow-indigo-200' : 'bg-slate-200 shadow-slate-100'}`}>
                                    <Video className={`w-6 h-6 ${formData.archivoVideo || tieneArchivoGuardado || dragging ? 'text-white' : 'text-slate-400'}`} strokeWidth={2.5} />
                                </div>
                                {formData.archivoVideo ? (
                                    <div className="text-center">
                                        <p className="font-black text-sm text-emerald-700">{formData.archivoVideo.name}</p>
                                        <p className="text-xs text-emerald-500 font-medium mt-1">{(formData.archivoVideo.size / (1024 * 1024)).toFixed(2)} MB · listo para subir</p>
                                        <button onClick={(e) => { e.stopPropagation(); handleInputChange("archivoVideo", null); }} className="mt-3 text-[11px] font-bold text-rose-400 hover:text-rose-600 transition-colors block mx-auto">
                                            Cambiar archivo
                                        </button>
                                    </div>
                                ) : tieneArchivoGuardado ? (
                                    <div className="text-center">
                                        <p className="font-black text-sm text-blue-700">
                                            {nombreVideoGuardado.split('/').pop()?.split('?')[0] || 'Video guardado'}
                                        </p>
                                        <p className="text-xs text-blue-500 font-medium mt-1">Video guardado · haz clic para reemplazar</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-500">Arrastra tu video o <span className="text-indigo-500">haz clic para buscar</span></p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">MP4, MOV, WebM · máx. 500 MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="video/*" onChange={(e) => handleInputChange("archivoVideo", e.target.files[0])} className="hidden" />
                            </div>

                            {(formData.archivoVideo || tieneArchivoGuardado) && (
                                <div className="rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-xl">
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 bg-rose-400 rounded-full" />
                                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Vista previa · {formData.archivoVideo
                                                ? formData.archivoVideo.name
                                                : (nombreVideoGuardado.split('/').pop()?.split('?')[0] || 'Video guardado')}
                                        </span>
                                        <div className="w-16" />
                                    </div>
                                    <video
                                        key={formData.archivoVideo?.name || nombreVideoGuardado}
                                        controls
                                        className="w-full bg-black max-h-[360px]"
                                        src={formData.archivoVideo ? videoSrc : nombreVideoGuardado}
                                    />
                                </div>
                            )}

                            {duracionVideo > 0 && (
                                <div className="flex items-center gap-4 p-5 bg-violet-50 border-2 border-violet-100 rounded-2xl">
                                    <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-200">
                                        <Clock size={20} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Duración detectada</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-violet-700">{duracionVideo}</span>
                                            <span className="text-sm font-bold text-violet-400">segundos</span>
                                            <span className="text-xs text-violet-300">·</span>
                                            <span className="text-sm font-bold text-violet-500">{formatearDuracion(duracionVideo)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                                <input
                                    type="url"
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                                />
                            </div>

                            {plataforma && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-emerald-600">{PLATAFORMA_LABEL[plataforma]} detectado ✓</span>
                                </div>
                            )}

                            {embedUrl && (
                                <div className="rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-xl">
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 bg-rose-400 rounded-full" />
                                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista previa · {PLATAFORMA_LABEL[plataforma]}</span>
                                        <div className="w-16" />
                                    </div>
                                    <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                                        <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video preview" />
                                    </div>
                                </div>
                            )}

                            {plataforma && (
                                <div className="flex items-center gap-4 p-5 bg-violet-50 border-2 border-violet-100 rounded-2xl">
                                    <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-200">
                                        <Clock size={20} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Duración del video</p>
                                        <p className="text-[10px] text-violet-300 font-medium mb-2">Ingresa manualmente los segundos totales del video</p>
                                        <div className="flex items-center gap-3">
                                            <input type="number" min="0" value={duracionVideo || ''} onChange={(e) => setDuracionVideo(Number(e.target.value))} placeholder="Ej: 225"
                                                className="w-28 bg-white border-2 border-violet-200 text-violet-700 font-black text-lg px-3 py-1.5 rounded-xl outline-none focus:border-violet-400 transition-all" />
                                            {duracionVideo > 0 && <span className="text-sm font-bold text-violet-500">= {formatearDuracion(duracionVideo)}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!plataforma && linkInput.length < 5 && (
                                <div className="flex gap-3 p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                                    <Info size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                    <p className="text-xs text-indigo-600 font-medium leading-relaxed">Soportamos <span className="font-black">YouTube, Vimeo y Wistia</span>. El video se incrustará automáticamente al pegar el enlace.</p>
                                </div>
                            )}

                            {linkInput.length > 5 && !plataforma && (
                                <div className="flex gap-3 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl">
                                    <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">No reconocemos esta URL. Solo soportamos <span className="font-black">YouTube, Vimeo y Wistia</span>.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                Preguntas durante el video
                                {formData.preguntas.length > 0 && (
                                    <span className="ml-2 normal-case font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">{formData.preguntas.length}</span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-400">El video se pausará en cada pregunta configurada</p>
                        </div>
                        <button onClick={agregarPregunta} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-2xl hover:bg-indigo-50 transition-all">
                            <Plus size={14} strokeWidth={2.5} /> Añadir pregunta
                        </button>
                    </div>

                    {formData.preguntas.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-10 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Info size={22} className="text-slate-300" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Sin preguntas interactivas aún</p>
                            <p className="text-xs text-slate-300 mt-1">Añade preguntas que aparezcan en momentos específicos del video</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                            {formData.preguntas.map((pregunta, pIndex) => (
                                <div key={pregunta.idTemp} className="group border-2 border-slate-100 hover:border-indigo-200 bg-white rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)] overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Pregunta <span className="text-indigo-500">{pIndex + 1}</span></span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                                className="flex items-center gap-1.5 bg-white border-2 border-slate-100 px-3 py-1 rounded-xl">
                                                <Clock size={11} className="text-slate-400" strokeWidth={2.5} />

                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-10 text-xs font-black text-slate-700 bg-transparent outline-none text-center"
                                                    placeholder="0"
                                                    value={pregunta.minutosInput ?? Math.floor(pregunta.segundoMarca / 60)}
                                                    onChange={(e) => {
                                                        const min = parseInt(e.target.value) || 0;
                                                        const seg = pregunta.segundosInput ?? pregunta.segundoMarca % 60;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            preguntas: prev.preguntas.map(p =>
                                                                p.idTemp !== pregunta.idTemp ? p : {
                                                                    ...p,
                                                                    minutosInput: min,
                                                                    segundoMarca: min * 60 + seg
                                                                }
                                                            )
                                                        }));
                                                    }}
                                                />
                                                <span className="text-[10px] text-slate-400 font-bold">min</span>

                                                <span className="text-slate-300 text-xs font-bold">:</span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    className="w-10 text-xs font-black text-slate-700 bg-transparent outline-none text-center"
                                                    placeholder="0"
                                                    value={pregunta.segundosInput ?? pregunta.segundoMarca % 60}
                                                    onChange={(e) => {
                                                        const seg = Math.min(59, parseInt(e.target.value) || 0);
                                                        const min = pregunta.minutosInput ?? Math.floor(pregunta.segundoMarca / 60);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            preguntas: prev.preguntas.map(p =>
                                                                p.idTemp !== pregunta.idTemp ? p : {
                                                                    ...p,
                                                                    segundosInput: seg,
                                                                    segundoMarca: min * 60 + seg
                                                                }
                                                            )
                                                        }));
                                                    }}
                                                />
                                                <span className="text-[10px] text-slate-400 font-bold">seg</span>
                                            </div>
                                            {duracionVideo > 0 && pregunta.segundoMarca > duracionVideo && (
                                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">⚠ supera duración</span>
                                            )}
                                        </div>
                                        <button onClick={() => eliminarPregunta(pregunta.idTemp)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <input placeholder="Escribe el enunciado de la pregunta..."
                                            className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-bold placeholder:text-slate-300 text-sm"
                                            value={pregunta.textoPregunta}
                                            onChange={(e) => actualizarPregunta(pregunta.idTemp, "textoPregunta", e.target.value)} />
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Opciones de respuesta</p>
                                            {pregunta.opciones.map((opcion, oIndex) => (
                                                <div key={oIndex} className={`flex items-center gap-3 p-3 border-2 rounded-2xl transition-all duration-200 ${opcion.esCorrecta ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                                                    <button onClick={() => actualizarOpcion(pregunta.idTemp, oIndex, "esCorrecta", !opcion.esCorrecta)} className="flex-shrink-0 transition-all">
                                                        <CheckCircle2 size={20} strokeWidth={2.5} className={opcion.esCorrecta ? 'text-emerald-500' : 'text-slate-200'} />
                                                    </button>
                                                    <input placeholder={`Opción ${oIndex + 1}...`}
                                                        className={`flex-1 text-sm font-medium bg-transparent outline-none transition-colors ${opcion.esCorrecta ? 'text-emerald-700 placeholder:text-emerald-300' : 'text-slate-700 placeholder:text-slate-300'}`}
                                                        value={opcion.textoOpcion}
                                                        onChange={(e) => actualizarOpcion(pregunta.idTemp, oIndex, "textoOpcion", e.target.value)} />
                                                    {pregunta.opciones.length > 2 && (
                                                        <button onClick={() => actualizarPregunta(pregunta.idTemp, "opciones", pregunta.opciones.filter((_, i) => i !== oIndex))} className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0">
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={() => actualizarPregunta(pregunta.idTemp, "opciones", [...pregunta.opciones, { textoOpcion: "", esCorrecta: false }])} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all">
                                                <Plus size={12} /> Añadir otra opción
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="mb-5">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Configuración</h3>
                        <p className="text-xs text-slate-400">Opciones de visibilidad</p>
                    </div>
                    <button type="button" onClick={() => handleInputChange("hacerVisibleDashboard", !formData.hacerVisibleDashboard)}
                        className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left w-full ${formData.hacerVisibleDashboard ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${formData.hacerVisibleDashboard ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}>
                            <Eye size={20} className={formData.hacerVisibleDashboard ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className={`font-bold text-sm transition-colors ${formData.hacerVisibleDashboard ? 'text-indigo-700' : 'text-slate-800'}`}>Visible en dashboard</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Mostrar en el panel principal</p>
                        </div>
                        {formData.hacerVisibleDashboard && (
                            <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Sparkles size={12} className="text-indigo-400" />
                                </div>
                            </div>
                        )}
                    </button>
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">
                    Cancelar
                </button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                    <Sparkles size={14} />
                    Guardar todo
                </button>
            </div>
        </div>
    );
};

export default RecursoVideoPregunta;
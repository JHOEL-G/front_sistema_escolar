import React, { useState, useRef, useEffect } from "react";
import { X, Video, Link, Upload, Info, Eye, Pencil, Check, Sparkles } from "lucide-react";

const RecursoVideo = ({ recursoData, onSave, onCancel }) => {
    const cfg = recursoData?.configuracion || {};

    const [formData, setFormData] = useState({
        tituloSesion: recursoData?.tituloSesion || "",
        descripcionSesion: recursoData?.descripcionSesion || cfg.Descripcion || cfg.descripcion || "",
        tipoSubida: cfg.TipoSubida || cfg.tipoSubida || "archivo",
        archivoVideo: recursoData?.archivoReal || null,
        linkVideo: cfg.VideoLink || cfg.videoLink || "",
        hacerVisibleDashboard: cfg.HacerVisibleDashboard ?? cfg.hacerVisibleDashboard ?? true
    });
    const nombreVideoGuardado = cfg.VideoPath || cfg.videoPath || null;

    const [editandoTitulo, setEditandoTitulo] = useState(false);
    const [dragging, setDragging] = useState(false);
    const tituloInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoObjectUrl = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        if (editandoTitulo && tituloInputRef.current) { tituloInputRef.current.focus(); tituloInputRef.current.select(); }
    }, [editandoTitulo]);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const processVideo = (file) => {
        if (!file) return;
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validTypes.includes(file.type)) { alert('Solo se permiten archivos de video (MP4, WebM, OGG, MOV)'); return; }
        if (file.size > 500 * 1024 * 1024) { alert('El archivo excede el tamaño máximo de 500MB'); return; }
        setFormData(prev => ({ ...prev, archivoVideo: file, linkVideo: "" }));
    };

    const handleGuardar = () => {
        if (!formData.tituloSesion.trim()) return alert("El título es obligatorio");
        if (formData.tipoSubida === "archivo" && !formData.archivoVideo && !nombreVideoGuardado) return alert("Debes seleccionar un archivo de video");
        if (formData.tipoSubida === "link" && !formData.linkVideo.trim()) return alert("Debes proporcionar un enlace de video");
        onSave({
            titulo: formData.tituloSesion,
            descripcion: formData.descripcionSesion,
            tipoId: 4,
            configuracion: {
                VideoPath: formData.tipoSubida === "archivo" ? (formData.archivoVideo?.name || nombreVideoGuardado) : null,
                VideoLink: formData.tipoSubida === "link" ? formData.linkVideo : null,
                TipoSubida: formData.tipoSubida,
                HacerVisibleDashboard: formData.hacerVisibleDashboard,
                Descripcion: formData.descripcionSesion || null,
            },
            duracion: "00:00",
            archivoReal: formData.tipoSubida === "archivo" ? formData.archivoVideo : null
        });
    };

    const archivoActivo = formData.archivoVideo;
    const tieneArchivoGuardado = !archivoActivo && nombreVideoGuardado && formData.tipoSubida === "archivo";

    const getYouTubeId = (url) => {
        const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return m ? m[1] : null;
    };
    const getVimeoId = (url) => {
        const m = url?.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return m ? m[1] : null;
    };
    const getEmbedUrl = (url) => {
        const ytId = getYouTubeId(url);
        if (ytId) return `https://www.youtube.com/embed/${ytId}`;
        const vimeoId = getVimeoId(url);
        if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
        return null;
    };
    const detectarPlataforma = (url) => {
        if (!url) return null;
        if (getYouTubeId(url)) return 'YouTube';
        if (getVimeoId(url)) return 'Vimeo';
        return null;
    };

    useEffect(() => {
        if (archivoActivo instanceof File) {
            if (videoSrc) URL.revokeObjectURL(videoSrc);
            const url = URL.createObjectURL(archivoActivo);
            setVideoSrc(url);
        } else {
            setVideoSrc(null);
        }

        return () => {
            if (videoSrc) URL.revokeObjectURL(videoSrc);
        };
    }, [archivoActivo]);

    const embedUrl = getEmbedUrl(formData.linkVideo);
    const plataforma = detectarPlataforma(formData.linkVideo);

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
            <div className="relative p-10 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-400 shadow-lg shadow-rose-200 rounded-2xl flex items-center justify-center flex-shrink-0"><Video className="w-6 h-6 text-white" strokeWidth={2.5} /></div>
                        <div>
                            {editandoTitulo ? (
                                <div className="flex items-center gap-2">
                                    <input ref={tituloInputRef} type="text" value={formData.tituloSesion} onChange={(e) => handleInputChange("tituloSesion", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditandoTitulo(false); }} onBlur={() => setEditandoTitulo(false)} placeholder="Nombre del video..." className="text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-400 outline-none placeholder:text-slate-300 w-full min-w-[280px]" />
                                    <button onMouseDown={(e) => { e.preventDefault(); setEditandoTitulo(false); }} className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all flex-shrink-0"><Check size={16} strokeWidth={2.5} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/titulo">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{formData.tituloSesion ? <span className="text-indigo-600">{formData.tituloSesion}</span> : <><span className="text-slate-300">Configuración </span><span className="text-rose-400">Video</span></>}</h2>
                                    <button onClick={() => setEditandoTitulo(true)} className="p-1.5 opacity-0 group-hover/titulo:opacity-100 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-all flex-shrink-0"><Pencil size={14} strokeWidth={2.5} /></button>
                                </div>
                            )}
                            <p className="text-slate-500 font-medium text-sm mt-0.5">Configura todos los detalles del recurso</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0"><X size={20} /></button>
                </div>
            </div>

            <div className="px-10 py-8 space-y-10">
                <section>
                    <div className="mb-5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Información básica</h3><p className="text-xs text-slate-400">Datos generales del video</p></div>
                    <textarea value={formData.descripcionSesion} onChange={(e) => handleInputChange("descripcionSesion", e.target.value)} placeholder="¿De qué trata este video?" className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none resize-none transition-all text-slate-800 font-medium placeholder:text-slate-300" rows={2} />
                </section>

                <section>
                    <div className="mb-5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tipo de subida</h3><p className="text-xs text-slate-400">Elige cómo quieres agregar el video</p></div>
                    <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                        {[{ key: "archivo", label: "Archivo local", Icon: Upload }, { key: "link", label: "Enlace externo", Icon: Link }].map(({ key, label, Icon }) => (
                            <button key={key} onClick={() => handleInputChange("tipoSubida", key)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${formData.tipoSubida === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Icon size={15} strokeWidth={2.5} /> {label}
                            </button>
                        ))}
                    </div>

                    {formData.tipoSubida === "archivo" && (
                        <>
                            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); processVideo(e.dataTransfer.files?.[0]); }} onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 ${dragging ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' : archivoActivo ? 'border-emerald-300 bg-emerald-50' : tieneArchivoGuardado ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${archivoActivo ? 'bg-emerald-400 shadow-emerald-200' : tieneArchivoGuardado ? 'bg-blue-400 shadow-blue-200' : dragging ? 'bg-indigo-400 shadow-indigo-200' : 'bg-slate-200 shadow-slate-100'}`}>
                                    <Video className={`w-6 h-6 ${archivoActivo || tieneArchivoGuardado || dragging ? 'text-white' : 'text-slate-400'}`} strokeWidth={2.5} />
                                </div>
                                {archivoActivo ? (
                                    <div className="text-center">
                                        <p className="font-black text-sm text-emerald-700">{archivoActivo.name}</p>
                                        <p className="text-xs text-emerald-500 font-medium mt-1">{(archivoActivo.size / (1024 * 1024)).toFixed(2)} MB · listo para subir</p>
                                        <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, archivoVideo: null })); }} className="mt-3 text-[11px] font-bold text-rose-400 hover:text-rose-600 transition-colors">Cambiar archivo</button>
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
                                <input ref={fileInputRef} type="file" accept="video/*" onChange={(e) => processVideo(e.target.files?.[0])} className="hidden" />
                            </div>
                            {(archivoActivo || tieneArchivoGuardado) && (
                                <div className="rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-xl mt-4">
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 bg-rose-400 rounded-full" />
                                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Vista previa · {archivoActivo
                                                ? archivoActivo.name
                                                : (nombreVideoGuardado.split('/').pop()?.split('?')[0] || 'Video guardado')}
                                        </span>
                                        <div className="w-16" />
                                    </div>
                                    <video
                                        key={archivoActivo?.name || nombreVideoGuardado}
                                        controls
                                        className="w-full bg-black max-h-[360px]"
                                        src={archivoActivo ? videoSrc : nombreVideoGuardado}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {formData.tipoSubida === "link" && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                                <input type="url" value={formData.linkVideo} onChange={(e) => handleInputChange("linkVideo", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full pl-11 pr-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300" />
                            </div>

                            {plataforma && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-emerald-600">{plataforma} detectado ✓</span>
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
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista previa · {plataforma}</span>
                                        <div className="w-16" />
                                    </div>
                                    <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                                        <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video preview" />
                                    </div>
                                </div>
                            )}

                            {!plataforma && (
                                <div className="flex gap-3 p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                                    <Info size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                    <p className="text-xs text-indigo-600 font-medium leading-relaxed">Soportamos enlaces de <span className="font-black">YouTube, Vimeo y Wistia</span>.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <section>
                    <div className="mb-5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Configuración</h3><p className="text-xs text-slate-400">Opciones de visibilidad</p></div>
                    <button type="button" onClick={() => handleInputChange("hacerVisibleDashboard", !formData.hacerVisibleDashboard)} className={`group relative flex items-center gap-4 p-5 border-2 rounded-[1.5rem] transition-all duration-300 text-left w-full ${formData.hacerVisibleDashboard ? 'border-indigo-200 bg-indigo-50 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${formData.hacerVisibleDashboard ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 shadow-slate-100'}`}><Eye size={20} className={formData.hacerVisibleDashboard ? 'text-white' : 'text-slate-400'} strokeWidth={2.5} /></div>
                        <div><p className={`font-bold text-sm transition-colors ${formData.hacerVisibleDashboard ? 'text-indigo-700' : 'text-slate-800'}`}>Visible en dashboard</p><p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Mostrar en el panel principal</p></div>
                        {formData.hacerVisibleDashboard && <div className="absolute top-4 right-4"><div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center"><Sparkles size={12} className="text-indigo-400" /></div></div>}
                    </button>
                </section>
            </div>

            <div className="p-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={handleGuardar} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"><Sparkles size={14} /> Guardar video</button>
            </div>
        </div>
    );
};

export default RecursoVideo;
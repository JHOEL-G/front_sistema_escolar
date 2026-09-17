import {
    FileText,
    ChevronDown,
    ChevronUp,
    Download,
    MessageSquare,
    Check,
    FileSpreadsheet,
    File,
    ChevronLeft,
    ChevronRight,
    Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import serviceApiNet from "../../../../../../lib/api/serviceApiNet";
import { CarruselArchivos } from "../card/ArchivoCard";

export const ForoPlayer = ({ dataJson, titulo, moduloRecursoId, usuarioId }) => {
    const [tituloParticipacion, setTituloParticipacion] = useState('');
    const [contenidoParticipacion, setContenidoParticipacion] = useState('');
    const [instruccionesOpen, setInstruccionesOpen] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [publicaciones, setPublicaciones] = useState([]);
    const [yaParticipo, setYaParticipo] = useState(false);
    const foroId = dataJson?.ForoId;

    const archivos = (() => {
        if (Array.isArray(dataJson?.Archivos) && dataJson.Archivos.length > 0) {
            return dataJson.Archivos;
        }
        if (dataJson?.ArchivoPath) {
            return [{ ArchivoPath: dataJson.ArchivoPath, NombreArchivo: 'Archivo adjunto', TipoArchivo: '', Orden: 1 }];
        }
        return [];
    })();

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await serviceApiNet.Foro.getPublicaciones(foroId);
                if (res.data?.success) {
                    const data = res.data.data || [];
                    const publicacionesValidas = data.filter(p =>
                        p.publicacionId != null || p.contenido != null
                    );
                    setPublicaciones(publicacionesValidas);
                    const yaPublico = usuarioId != null &&
                        publicacionesValidas.some(p => Number(p.usuarioId) === Number(usuarioId));
                    setYaParticipo(yaPublico);
                }
            } catch (e) { console.error(e); }
        };
        if (foroId) cargar();
    }, [foroId, usuarioId]);

    const handlePublicar = async () => {
        if (!tituloParticipacion.trim() || !contenidoParticipacion.trim()) return;
        setEnviando(true);
        try {
            const res = await serviceApiNet.Foro.publicar({
                foroId,
                usuarioId,
                titulo: tituloParticipacion,
                contenido: contenidoParticipacion,
            });
            if (res.data?.success) {
                setPublicaciones(prev => [...prev, {
                    publicacionId: Date.now(),
                    usuarioId,
                    contenido: `${tituloParticipacion} | ${contenidoParticipacion}`,
                    fechaPublicacion: new Date().toISOString()
                }]);
                setTituloParticipacion('');
                setContenidoParticipacion('');
                setYaParticipo(true);
                setEnviado(true);
                setTimeout(() => setEnviado(false), 3000);
            } else {
                const msg = res.data?.message || '';
                if (msg.includes('Ya existe')) setYaParticipo(true);
                console.warn('No se publicó:', msg);
            }
        } catch (e) {
            console.error('Error publicando en foro:', e);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-sky-100 max-w-full mx-auto">
            <div className="h-2 w-full bg-sky-500" />
            <div className="p-6 md:p-10">

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 shrink-0">
                        <MessageSquare size={26} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mb-1">Foro de discusión</p>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate">{dataJson?.NombreForo || titulo}</h3>
                    </div>
                </div>

                {(dataJson?.Instrucciones || archivos.length > 0) && (
                    <div className="mb-10">
                        <button
                            onClick={() => setInstruccionesOpen(p => !p)}
                            className="w-full flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-sky-500 rounded-full" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Información y Recursos</span>
                            </div>
                            <div className="p-1 bg-white rounded-lg shadow-sm">
                                {instruccionesOpen
                                    ? <ChevronUp size={18} className="text-slate-400 group-hover:text-sky-500" />
                                    : <ChevronDown size={18} className="text-slate-400 group-hover:text-sky-500" />}
                            </div>
                        </button>

                        {instruccionesOpen && (
                            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                                {dataJson?.Instrucciones && (
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {dataJson.Instrucciones}
                                        </p>
                                    </div>
                                )}

                                {archivos.length > 0 && (
                                    <div className="pt-4 border-t border-slate-200/60">
                                        <CarruselArchivos archivos={archivos} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {yaParticipo ? (
                    <div className="flex flex-col items-center py-10 bg-sky-50 border border-sky-100 rounded-[2rem] text-center px-4">
                        <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-200">
                            <Check size={28} className="text-white" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">¡Ya participaste!</h4>
                        <p className="text-xs text-slate-500 max-w-xs">Tu aporte ha sido registrado con éxito. Gracias por colaborar.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                            <div className="w-1 h-1 bg-sky-500 rounded-full" />
                            Tu participación
                        </h4>
                        <div className="space-y-4">
                            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50 transition-all">
                                <input
                                    type="text"
                                    value={tituloParticipacion}
                                    onChange={e => setTituloParticipacion(e.target.value)}
                                    placeholder="Título de tu mensaje"
                                    className="w-full px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none bg-transparent"
                                />
                            </div>
                            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50 transition-all">
                                <textarea
                                    value={contenidoParticipacion}
                                    onChange={e => setContenidoParticipacion(e.target.value)}
                                    placeholder="Escribe aquí tu comentario o respuesta..."
                                    rows={5}
                                    className="w-full px-6 py-4 text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none bg-transparent"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handlePublicar}
                                    disabled={enviando || !tituloParticipacion.trim() || !contenidoParticipacion.trim()}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all hover:-translate-y-1 shadow-xl shadow-sky-200 text-xs uppercase tracking-widest active:scale-95">
                                    {enviando
                                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                                        : enviado
                                            ? <><Check size={18} /> ¡Listo!</>
                                            : <><MessageSquare size={18} /> Publicar ahora</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {(() => {
                    const misPublicaciones = publicaciones.filter(p => Number(p.usuarioId) === Number(usuarioId));
                    if (misPublicaciones.length === 0) return null;
                    return (
                        <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lo que publicaste anteriormente</p>
                            {misPublicaciones.map(p => {
                                const partes = p.contenido?.split(' | ');
                                const tit = partes?.length > 1 ? partes[0].trim() : null;
                                const body = partes?.length > 1 ? partes.slice(1).join(' | ').trim() : p.contenido;
                                return (
                                    <div key={p.publicacionId} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {tit && <p className="text-sm font-black text-slate-800 mb-2">{tit}</p>}
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{body}</p>
                                        <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-bold">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            {p.fechaPublicacion ? new Date(p.fechaPublicacion).toLocaleString('es-PE') : '-'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
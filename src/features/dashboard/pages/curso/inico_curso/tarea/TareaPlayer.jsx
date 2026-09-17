import {
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  X,
  PenTool,
  FileSpreadsheet,
  File,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import serviceApiNet from "../../../../../../lib/api/serviceApiNet";
import { CarruselArchivos } from "../card/ArchivoCard";

export const TareaPlayer = ({ dataJson, titulo, usuarioId }) => {
  const [tituloEntrega, setTituloEntrega] = useState("");
  const [contenidoEntrega, setContenidoEntrega] = useState("");
  const [archivoLocal, setArchivoLocal] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [entregaExistente, setEntregaExistente] = useState(null);
  const [instruccionesOpen, setInstruccionesOpen] = useState(true);
  const fileInputRef = useRef(null);
  const [imagenesPegadas, setImagenesPegadas] = useState([]);
  const tareaId = dataJson?.TareaId;

  const archivosRecurso = (() => {
    if (Array.isArray(dataJson?.Archivos) && dataJson.Archivos.length > 0) {
      return dataJson.Archivos;
    }
    if (dataJson?.ArchivoPath) {
      return [
        {
          ArchivoPath: dataJson.ArchivoPath,
          NombreArchivo: "Archivo de la tarea",
          TipoArchivo: "",
          Orden: 1,
        },
      ];
    }
    return [];
  })();

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await serviceApiNet.Tarea.getEntrega(tareaId, usuarioId);
        if (res.data?.success && res.data?.data)
          setEntregaExistente(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    if (tareaId && usuarioId) cargar();
  }, [tareaId, usuarioId]);

  const handleEnviar = async () => {
    if (!tituloEntrega.trim() || !contenidoEntrega.trim()) return;
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("tareaId", tareaId);
      formData.append("usuarioId", usuarioId);
      formData.append("titulo", tituloEntrega);
      formData.append("comentario", contenidoEntrega);
      if (archivoLocal) formData.append("archivo", archivoLocal);

      const res = await serviceApiNet.Tarea.entregar(formData);
      if (res.data?.success) {
        setEntregaExistente({
          Comentario: contenidoEntrega,
          FechaEntrega: new Date().toISOString(),
        });
        setEnviado(true);
      }
    } catch (e) {
      console.error("Error enviando tarea:", e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-emerald-100 max-w-full mx-auto">
      <div className="h-2 w-full bg-emerald-500" />
      <div className="p-6 md:p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
            <PenTool size={26} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">
              Actividad Calificada
            </p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate">
              {titulo}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Evaluación
            </p>
            <p className="text-xs text-slate-500 leading-tight">
              {entregaExistente?.Calificacion != null
                ? "Completada"
                : "Pendiente de revisión"}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Calificado el
            </p>
            <p className="text-xs font-bold text-slate-700">
              {entregaExistente?.FechaCalificacion
                ? new Date(
                    entregaExistente.FechaCalificacion,
                  ).toLocaleDateString("es-PE")
                : "-"}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Estado
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  entregaExistente?.Calificacion != null
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : entregaExistente
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                {entregaExistente?.Calificacion != null
                  ? `Nota: ${entregaExistente.Calificacion}`
                  : entregaExistente
                    ? "Entregado"
                    : "Sin entregar"}
              </span>
            </div>
          </div>
        </div>

        {(dataJson?.Instrucciones || archivosRecurso.length > 0) && (
          <div className="mb-10">
            <button
              onClick={() => setInstruccionesOpen((p) => !p)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  Instrucciones y Materiales
                </span>
              </div>
              <div className="p-1 bg-white rounded-lg shadow-sm">
                {instruccionesOpen ? (
                  <ChevronUp
                    size={18}
                    className="text-slate-400 group-hover:text-emerald-500"
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    className="text-slate-400 group-hover:text-emerald-500"
                  />
                )}
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

                {archivosRecurso.length > 0 && (
                  <div className="pt-4 border-t border-slate-200/60">
                    <CarruselArchivos archivos={archivosRecurso} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {enviado || entregaExistente ? (
          <div className="flex flex-col items-center py-10 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-center px-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
              <Check size={28} className="text-white" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-1">
              ¡Tarea enviada con éxito!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Tu entrega ha sido registrada. Puedes ver los detalles a
              continuación.
            </p>

            {entregaExistente?.FechaEntrega && (
              <div className="px-4 py-2 bg-white rounded-full border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Enviada el{" "}
                {new Date(entregaExistente.FechaEntrega).toLocaleString(
                  "es-PE",
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
              Realizar mi entrega
            </h4>

            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
                <input
                  type="text"
                  value={tituloEntrega}
                  onChange={(e) => setTituloEntrega(e.target.value)}
                  placeholder="Título de la entrega (Ej: Tarea 01 - Mi Apellido)"
                  className="w-full px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none bg-transparent"
                />
              </div>

              <div
                className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition-all"
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (const item of items) {
                    if (item.type.startsWith("image/")) {
                      e.preventDefault();
                      const file = item.getAsFile();
                      if (file) setImagenesPegadas((prev) => [...prev, file]);
                    }
                  }
                }}
              >
                <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex-wrap">
                  {[
                    ["B", "font-black"],
                    ["I", "italic"],
                    ["U", "underline"],
                  ].map(([l, cls]) => (
                    <button
                      key={l}
                      className={`w-8 h-8 flex items-center justify-center text-xs text-slate-500 hover:bg-white hover:text-emerald-600 rounded-lg transition-all ${cls}`}
                    >
                      {l}
                    </button>
                  ))}
                  <div className="w-px h-5 bg-slate-200 mx-1" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-all uppercase tracking-widest"
                  >
                    <Download size={14} className="rotate-180" />
                    Adjuntar Archivo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setArchivoLocal(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <textarea
                  value={contenidoEntrega}
                  onChange={(e) => setContenidoEntrega(e.target.value)}
                  placeholder="Escribe aquí tus comentarios o respuestas sobre la tarea..."
                  rows={6}
                  className="w-full px-6 py-4 text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none bg-transparent"
                />
              </div>

              {archivoLocal && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                        {archivoLocal.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Listo para enviar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setArchivoLocal(null)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {imagenesPegadas.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imagenesPegadas.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Imagen ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-2xl border border-emerald-100"
                      />
                      <button
                        onClick={() =>
                          setImagenesPegadas((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleEnviar}
                  disabled={
                    enviando ||
                    !tituloEntrega.trim() ||
                    !contenidoEntrega.trim()
                  }
                  className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all hover:-translate-y-1 shadow-xl shadow-emerald-200 text-xs uppercase tracking-widest active:scale-95"
                >
                  {enviando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Procesando...
                    </>
                  ) : (
                    <>
                      <PenTool size={18} />{" "}
                      {entregaExistente
                        ? "Actualizar Entrega"
                        : "Enviar Tarea Ahora"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

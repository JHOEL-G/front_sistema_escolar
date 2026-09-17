import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Trophy,
  Clock,
  Users,
  RefreshCw,
  PencilLine,
  X,
  Save,
  Eye,
  FileText,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import serviceApiNet from "../../../../../lib/api/serviceApiNet";
import { ChevronLeft } from "lucide-react";

const TIPO_BADGE = {
  1: {
    label: "Evaluación",
    cls: "bg-indigo-50  text-indigo-600  border-indigo-100",
  },
  2: { label: "Foro", cls: "bg-teal-50    text-teal-600    border-teal-100" },
  3: { label: "Tarea", cls: "bg-amber-50   text-amber-600   border-amber-100" },
  4: { label: "Video", cls: "bg-blue-50    text-blue-600    border-blue-100" },
  5: {
    label: "Lectura",
    cls: "bg-orange-50  text-orange-600  border-orange-100",
  },
  6: { label: "Zoom", cls: "bg-sky-50     text-sky-600     border-sky-100" },
  7: {
    label: "Embebido",
    cls: "bg-violet-50  text-violet-600  border-violet-100",
  },
  8: { label: "SCORM", cls: "bg-slate-50   text-slate-600   border-slate-200" },
  9: {
    label: "Encuesta",
    cls: "bg-pink-50    text-pink-600    border-pink-100",
  },
  10: {
    label: "Sesión",
    cls: "bg-cyan-50    text-cyan-600    border-cyan-100",
  },
  11: {
    label: "Ev. Presencial",
    cls: "bg-purple-50  text-purple-600  border-purple-100",
  },
  12: {
    label: "Video Interactivo",
    cls: "bg-rose-50    text-rose-600    border-rose-100",
  },
};

function DetalleModal({ open, onClose, recurso, usuario, cursoRecursos }) {
  const [loading, setLoading] = useState(false);
  const [respuestasEval, setRespuestasEval] = useState([]);
  const [entregaTarea, setEntregaTarea] = useState(null);
  const [participacionForo, setParticipacionForo] = useState(null);

  const dataJson = useMemo(() => {
    if (!cursoRecursos || !recurso) return null;
    const encontrado = cursoRecursos.find(
      (r) => r.moduloRecursoId === recurso.moduloRecursoId,
    );
    return encontrado?.dataJson || null;
  }, [cursoRecursos, recurso]);

  const evaluacionId = useMemo(() => {
    if (recurso?.tipoRecurso !== 1) return null;
    return dataJson?.evaluacionId ?? recurso?.recursoId;
  }, [dataJson, recurso]);

  useEffect(() => {
    if (!open || !recurso || !usuario) return;
    setRespuestasEval([]);
    setEntregaTarea(null);
    setParticipacionForo(null);

    const cargar = async () => {
      setLoading(true);
      try {
        if (recurso.tipoRecurso === 1 && evaluacionId) {
          const res = await serviceApiNet.Evaluacion.getRespuestasAlumno(
            evaluacionId,
            usuario.usuarioId,
          );
          if (res.data?.success) setRespuestasEval(res.data.data || []);
        }
        if (recurso.tipoRecurso === 3) {
          const res = await serviceApiNet.Tarea.getEntrega(
            recurso.recursoId,
            usuario.usuarioId,
          );
          if (res.data?.success && res.data?.data)
            setEntregaTarea(res.data.data);
        }
        if (recurso.tipoRecurso === 2) {
          const res = await serviceApiNet.Foro.getPublicaciones(
            recurso.recursoId,
          );
          if (res.data?.success) {
            const pubs = Array.isArray(res.data.data) ? res.data.data : [];
            setParticipacionForo(
              pubs.find((p) => p.usuarioId === usuario.usuarioId) || null,
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [open, recurso, usuario, evaluacionId]);

  if (!open) return null;

  const badge = TIPO_BADGE[recurso?.tipoRecurso] || TIPO_BADGE[1];

  // Render archivo genérico (tarea)
  const renderArchivo = (url) => {
    if (!url) return null;
    const ext = url.split("?")[0].split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
      return (
        <img
          src={url}
          alt="Entrega"
          className="w-full max-h-64 object-contain rounded-xl border border-slate-100 bg-slate-900 mt-2"
        />
      );
    if (ext === "pdf")
      return (
        <iframe
          src={url}
          className="w-full rounded-xl border border-slate-100 mt-2"
          style={{ height: 320 }}
          title="PDF"
        />
      );
    if (["mp4", "webm", "mov", "avi"].includes(ext))
      return (
        <video
          controls
          className="w-full rounded-xl bg-black mt-2"
          style={{ maxHeight: 240 }}
        >
          <source src={url} />
        </video>
      );
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 mt-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 transition"
      >
        <FileText size={18} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600 truncate">
          {url.split("/").pop().split("?")[0]}
        </span>
      </a>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.cls}`}
            >
              {badge.label}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {recurso?.nombreRecurso}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {usuario?.nombre} {usuario?.apeLLido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-xl text-slate-400 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm font-medium">Cargando detalle...</p>
            </div>
          ) : (
            <>
              {/* ── EVALUACIÓN ─────────────────────────────────── */}
              {recurso?.tipoRecurso === 1 && (
                <>
                  {/* Instrucciones y preguntas del recurso */}
                  {dataJson && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Instrucciones de la evaluación
                      </p>
                      {(dataJson.instrucciones || dataJson.Instrucciones) && (
                        <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed">
                          {dataJson.instrucciones || dataJson.Instrucciones}
                        </div>
                      )}
                      {dataJson.preguntas?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Preguntas ({dataJson.preguntas.length})
                          </p>
                          {dataJson.preguntas.map((preg, i) => (
                            <div
                              key={preg.EvaluacionPreguntaId}
                              className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-black text-indigo-400 mt-0.5 shrink-0">
                                  P{i + 1}
                                </span>
                                <p
                                  className="text-sm font-semibold text-slate-700"
                                  dangerouslySetInnerHTML={{
                                    __html: preg.TextoPregunta,
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5 pl-5">
                                {preg.Opciones?.map((op) => (
                                  <div
                                    key={op.OpcionId}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border
                                                                            ${op.EsCorrecta ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"}`}
                                  >
                                    {op.EsCorrecta ? (
                                      <CheckCircle2
                                        size={12}
                                        className="text-emerald-500 shrink-0"
                                      />
                                    ) : (
                                      <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                                    )}
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: op.TextoOpcion,
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Trophy size={10} /> {preg.PuntosValor} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  {dataJson && respuestasEval.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        Respuestas del alumno
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                  )}

                  {/* Respuestas del alumno */}
                  {respuestasEval.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Respuestas — Intento {respuestasEval[0]?.intento}
                        <span className="ml-2 text-slate-300">·</span>
                        <span className="ml-2 text-slate-400 normal-case font-semibold">
                          {new Date(
                            respuestasEval[0]?.fechaRespuesta,
                          ).toLocaleString("es-PE")}
                        </span>
                      </p>
                      {respuestasEval.map((r, i) => (
                        <div
                          key={r.respuestaId}
                          className={`rounded-xl border p-4 space-y-2
                                                        ${r.esCorrecta ? "bg-emerald-50/60 border-emerald-100" : "bg-rose-50/60 border-rose-100"}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-black text-slate-400 mt-0.5 shrink-0">
                              P{i + 1}
                            </span>
                            <p className="text-sm font-semibold text-slate-700">
                              {r.textoPregunta}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                                                        ${r.esCorrecta ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                          >
                            {r.esCorrecta ? (
                              <CheckCircle2 size={14} className="shrink-0" />
                            ) : (
                              <AlertCircle size={14} className="shrink-0" />
                            )}
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  r.textoOpcionSeleccionada ||
                                  "(Sin respuesta)",
                              }}
                            />
                          </div>
                          <div className="flex justify-end text-[10px] font-bold text-slate-400 gap-1">
                            <Trophy size={10} /> {r.puntosObtenidos} /{" "}
                            {r.puntosValor} pts
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 rounded-xl">
                        <span className="text-xs font-bold text-slate-600">
                          Total obtenido
                        </span>
                        <span className="text-sm font-black text-slate-800">
                          {respuestasEval
                            .reduce((a, r) => a + (r.puntosObtenidos || 0), 0)
                            .toFixed(2)}{" "}
                          pts
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                      <AlertCircle size={22} className="text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium">
                        Este alumno aún no ha respondido la evaluación.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── TAREA ──────────────────────────────────────── */}
              {recurso?.tipoRecurso === 3 && (
                <>
                  {/* Instrucciones */}
                  {dataJson &&
                    (dataJson.Instrucciones || dataJson.instrucciones) && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Instrucciones
                        </p>
                        <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed whitespace-pre-wrap">
                          {dataJson.Instrucciones || dataJson.instrucciones}
                        </div>
                        {dataJson.ArchivoPath &&
                          renderArchivo(dataJson.ArchivoPath)}
                      </div>
                    )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Entrega del alumno
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {entregaTarea ? (
                    <div className="space-y-3">
                      {(entregaTarea.Comentario || entregaTarea.comentario) && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {entregaTarea.Comentario || entregaTarea.comentario}
                          </p>
                        </div>
                      )}
                      {(entregaTarea.ArchivoPath || entregaTarea.archivoPath) &&
                        renderArchivo(
                          entregaTarea.ArchivoPath || entregaTarea.archivoPath,
                        )}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-1">
                        <Clock size={11} />
                        Entregado:{" "}
                        {entregaTarea.FechaEntrega || entregaTarea.fechaEntrega
                          ? new Date(
                              entregaTarea.FechaEntrega ||
                                entregaTarea.fechaEntrega,
                            ).toLocaleString("es-PE")
                          : "—"}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                      <FileText size={22} className="text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium">
                        Este alumno aún no ha entregado la tarea.
                      </p>
                    </div>
                  )}
                </>
              )}

              {recurso?.tipoRecurso === 2 && (
                <>
                  {dataJson &&
                    (dataJson.Instrucciones || dataJson.instrucciones) && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Instrucciones del foro
                        </p>
                        <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed">
                          {dataJson.Instrucciones || dataJson.instrucciones}
                        </div>
                        {dataJson.ArchivoPath &&
                          renderArchivo(dataJson.ArchivoPath)}
                      </div>
                    )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Participación del alumno
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {participacionForo ? (
                    (() => {
                      const texto = participacionForo.contenido || "";
                      const partes = texto.split(" | ");
                      const tit = partes.length > 1 ? partes[0] : null;
                      const body =
                        partes.length > 1 ? partes.slice(1).join(" | ") : texto;
                      return (
                        <div className="space-y-3">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                            {tit && (
                              <p className="text-xs font-black text-slate-700">
                                {tit}
                              </p>
                            )}
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {body}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <Clock size={11} />
                            Publicado:{" "}
                            {participacionForo.fechaPublicacion
                              ? new Date(
                                  participacionForo.fechaPublicacion,
                                ).toLocaleString("es-PE")
                              : "—"}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                      <MessageSquare
                        size={22}
                        className="text-slate-300 mb-2"
                      />
                      <p className="text-sm text-slate-400 font-medium">
                        Este alumno aún no ha participado en el foro.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function CalificacionAutomatica() {
  const { cursoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nombreRecurso, tipoRecursoNombre } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [instructorId, setInstructorId] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  const [overrides, setOverrides] = useState({});
  const [cursoRecursos, setCursoRecursos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado]);
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm]);

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    recurso: null,
    usuario: null,
  });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleExpandir = (uid) =>
    setExpandidos((prev) => ({ ...prev, [uid]: !prev[uid] }));

  useEffect(() => {
    serviceApiNet.Usuario.getMe()
      .then((r) => {
        if (r.data?.success) setInstructorId(r.data.data.usuarioId);
      })
      .catch(console.warn);
  }, []);

  // Cargar recursos del curso para obtener dataJson (instrucciones/preguntas)
  useEffect(() => {
    if (!cursoId) return;
    serviceApiNet.Cursos.getById(cursoId)
      .then((res) => {
        if (res.data?.success) setCursoRecursos(res.data.data?.recursos || []);
      })
      .catch(console.warn);
  }, [cursoId]);

  const cargarParticipantes = async (signal) => {
    if (!cursoId) return;
    setLoading(true);
    try {
      const res = await serviceApiNet.Inscripcion.getParticipantesConRecursos(
        cursoId,
        signal,
      );
      setParticipantes(res.data?.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    cargarParticipantes(controller.signal);
    return () => controller.abort();
  }, [cursoId]);

  const handleGuardar = async (usuario, recurso) => {
    const key = `${usuario.usuarioId}-${recurso.recursoId}`;
    const nuevaNota = overrides[key]?.valor;
    if (!nuevaNota) return;

    const gradeNum = Number(nuevaNota);
    if (gradeNum < 0 || gradeNum > 100) {
      showToast("error", "La calificación debe estar entre 0 y 100");
      return;
    }

    setSaving(key);
    try {
      const res = await serviceApiNet.Inscripcion.calificarRecurso({
        tipoRecurso: recurso.tipoRecurso,
        recursoId: recurso.recursoId,
        usuarioId: usuario.usuarioId,
        cursoId: Number(cursoId),
        calificacion: gradeNum,
        comentario: "Corrección manual por instructor",
        calificadoPorId: instructorId,
      });

      if (res.data?.success) {
        showToast("success", `✓ ${recurso.nombreRecurso} → ${gradeNum} pts`);
        setParticipantes((prev) =>
          prev.map((p) => {
            if (p.usuarioId !== usuario.usuarioId) return p;
            return {
              ...p,
              recursos: p.recursos.map((r) =>
                r.recursoId === recurso.recursoId &&
                r.tipoRecurso === recurso.tipoRecurso
                  ? { ...r, calificacion: gradeNum }
                  : r,
              ),
            };
          }),
        );
        setOverrides((prev) => ({
          ...prev,
          [key]: { editando: false, valor: "" },
        }));
      } else {
        showToast("error", res.data?.message || "Error al guardar");
      }
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setSaving(null);
    }
  };

  const filtered = useMemo(() => {
    return participantes.filter((p) => {
      const low = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        `${p.nombre} ${p.apeLLido}`.toLowerCase().includes(low) ||
        p.correo?.toLowerCase().includes(low);

      const tieneEval = p.recursos?.some((r) => r.tipoRecurso === 1);
      const completoEval = p.recursos?.some(
        (r) => r.tipoRecurso === 1 && r.calificacion != null,
      );

      const matchEstado =
        filtroEstado === "Todos"
          ? true
          : filtroEstado === "Completaron evaluación"
            ? completoEval
            : filtroEstado === "Pendiente evaluación"
              ? tieneEval && !completoEval
              : filtroEstado === "Aprobados"
                ? p.esCompletado
                : filtroEstado === "Desaprobados"
                  ? !p.esCompletado && p.calificacionFinal > 0
                  : true;

      return matchSearch && matchEstado;
    });
  }, [participantes, searchTerm, filtroEstado]);

  const total = participantes.length;
  const aprobados = participantes.filter((p) => p.esCompletado).length;
  const pendientes = total - aprobados;
  const promedio =
    total > 0
      ? (
          participantes.reduce((a, p) => a + (p.calificacionFinal || 0), 0) /
          total
        ).toFixed(1)
      : "—";

  // Solo mostrar "Ver detalle" en tipos que tienen contenido
  const tieneDetalle = (tipoRecurso) => [1, 2, 3].includes(tipoRecurso);

  const totalPaginas = Math.ceil(filtered.length / ITEMS_POR_PAGINA);
  const paginado = filtered.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA,
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans text-gray-800">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold
                    ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Modal detalle */}
      <DetalleModal
        open={modal.open}
        onClose={() => setModal({ open: false, recurso: null, usuario: null })}
        recurso={modal.recurso}
        usuario={modal.usuario}
        cursoRecursos={cursoRecursos}
      />

      <div className="max-w-8xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
              {nombreRecurso || "Calificaciones del curso"}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Expande cada alumno para calificar sus recursos individuales
            </p>
          </div>
          {tipoRecursoNombre && (
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-amber-50 text-amber-600 border border-amber-100">
              {tipoRecursoNombre}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total inscritos",
              value: total,
              icon: Users,
              color: "bg-slate-50  text-slate-600",
              iconBg: "bg-slate-100",
            },
            {
              label: "Aprobados",
              value: aprobados,
              icon: CheckCircle2,
              color: "bg-emerald-50 text-emerald-700",
              iconBg: "bg-emerald-100",
            },
            {
              label: "Pendientes",
              value: pendientes,
              icon: Clock,
              color: "bg-amber-50  text-amber-700",
              iconBg: "bg-amber-100",
            },
            {
              label: "Promedio grupo",
              value: promedio,
              icon: BarChart2,
              color: "bg-purple-50 text-purple-700",
              iconBg: "bg-purple-100",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.color} rounded-2xl p-5 border border-white shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {s.label}
                </span>
                <div className={`${s.iconBg} p-2 rounded-xl`}>
                  <s.icon size={16} />
                </div>
              </div>
              <div className="text-3xl font-black">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-black text-xs flex-shrink-0 mt-0.5">
            i
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">
              Calificación por recurso
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Haz clic en <strong>Ver detalle</strong> para revisar las
              instrucciones, preguntas y respuestas del alumno antes de
              calificar.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar participante..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => cargarParticipantes()}
              className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-2">
            {[
              "Todos",
              "Completaron evaluación",
              "Pendiente evaluación",
              "Aprobados",
              "Desaprobados",
            ].map((opcion) => (
              <button
                key={opcion}
                onClick={() => setFiltroEstado(opcion)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition
                    ${
                      filtroEstado === opcion
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
              >
                {opcion}
                {opcion !== "Todos" && (
                  <span className="ml-1.5 opacity-70">
                    (
                    {opcion === "Completaron evaluación"
                      ? participantes.filter((p) =>
                          p.recursos?.some(
                            (r) =>
                              r.tipoRecurso === 1 && r.calificacion != null,
                          ),
                        ).length
                      : opcion === "Pendiente evaluación"
                        ? participantes.filter((p) =>
                            p.recursos?.some(
                              (r) =>
                                r.tipoRecurso === 1 && r.calificacion == null,
                            ),
                          ).length
                        : opcion === "Aprobados"
                          ? participantes.filter((p) => p.esCompletado).length
                          : participantes.filter(
                              (p) => !p.esCompletado && p.calificacionFinal > 0,
                            ).length}
                    )
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Cargando participantes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Sin participantes registrados
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginado.map((user) => {
                const expandido = !!expandidos[user.usuarioId];
                const recursos = user.recursos || [];
                const calificados = recursos.filter(
                  (r) => r.calificacion != null,
                ).length;

                return (
                  <div key={user.inscripcionId}>
                    <div
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition"
                      onClick={() => toggleExpandir(user.usuarioId)}
                    >
                      <div className="text-slate-400 flex-shrink-0">
                        {expandido ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                          <img
                            src={
                              user.imagenPortada ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`
                            }
                            alt={user.nombre}
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`;
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 uppercase">
                            {user.nombre} {user.apeLLido}
                          </p>
                          <p className="text-[10px] text-purple-500 font-medium">
                            {user.correo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-36">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${user.progreso >= 80 ? "bg-purple-500" : user.progreso > 0 ? "bg-amber-400" : "bg-slate-200"}`}
                            style={{ width: `${user.progreso}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${user.progreso >= 80 ? "text-slate-500" : user.progreso > 0 ? "text-amber-500" : "text-slate-300"}`}
                        >
                          {user.progreso}%
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-bold w-32 text-center">
                        <span className="text-purple-600">{calificados}</span>/
                        {recursos.length} recursos
                      </div>

                      <div className="w-28 text-center">
                        {user.calificacionFinal > 0 ? (
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-black
                                                        ${
                                                          user.calificacionFinal >=
                                                          60
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                            : "bg-rose-50 text-rose-600 border border-rose-100"
                                                        }`}
                          >
                            {user.calificacionFinal} pts
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold">
                            Sin nota final
                          </span>
                        )}
                      </div>

                      <div className="w-24 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border
                                                    ${
                                                      user.esCompletado
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                                    }`}
                        >
                          {user.esCompletado ? "✓ Aprobado" : "Pendiente"}
                        </span>
                      </div>
                    </div>

                    {expandido && (
                      <div className="bg-slate-50/70 border-t border-slate-100 px-8 py-3 space-y-2">
                        {recursos.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            Sin recursos asignados
                          </p>
                        ) : (
                          recursos.map((recurso) => {
                            const key = `${user.usuarioId}-${recurso.recursoId}`;
                            const ov = overrides[key];
                            const isEdit = !!ov?.editando;
                            const isSave = saving === key;
                            const badge =
                              TIPO_BADGE[recurso.tipoRecurso] || TIPO_BADGE[1];

                            return (
                              <div
                                key={key}
                                className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3 border border-slate-100 shadow-sm"
                              >
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.cls} w-24 text-center flex-shrink-0`}
                                >
                                  {badge.label}
                                </span>

                                <span className="text-sm font-semibold text-slate-700 flex-1 truncate">
                                  {recurso.nombreRecurso || "—"}
                                </span>

                                <span className="text-[10px] text-slate-400 font-bold w-16 text-center">
                                  {recurso.ponderacion}%
                                </span>

                                <div className="w-24 text-center">
                                  {recurso.esPresencial ? (
                                    <span
                                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${recurso.tieneAsistencia ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                                    >
                                      {recurso.tieneAsistencia
                                        ? "✓ Asistió"
                                        : "Sin asistencia"}
                                    </span>
                                  ) : recurso.esScorm ? (
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      Auto SCORM
                                    </span>
                                  ) : recurso.calificacion != null ? (
                                    <span
                                      className={`text-sm font-black px-3 py-1 rounded-xl
                                                                        ${recurso.calificacion >= 60 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
                                    >
                                      {recurso.calificacion}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-bold">
                                      Sin nota
                                    </span>
                                  )}
                                </div>

                                {tieneDetalle(recurso.tipoRecurso) && (
                                  <button
                                    onClick={() =>
                                      setModal({
                                        open: true,
                                        recurso,
                                        usuario: user,
                                      })
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition"
                                  >
                                    <Eye size={12} /> Ver detalle
                                  </button>
                                )}

                                {!recurso.esPresencial && !recurso.esScorm && (
                                  <div className="flex items-center gap-2">
                                    {isEdit ? (
                                      <>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          autoFocus
                                          value={ov?.valor || ""}
                                          onChange={(e) =>
                                            setOverrides((prev) => ({
                                              ...prev,
                                              [key]: {
                                                editando: true,
                                                valor: e.target.value,
                                              },
                                            }))
                                          }
                                          placeholder="0-100"
                                          className="w-20 px-3 py-1.5 border-2 border-purple-300 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-purple-400 font-bold"
                                        />
                                        <button
                                          onClick={() =>
                                            handleGuardar(user, recurso)
                                          }
                                          disabled={isSave}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                                        >
                                          {isSave ? (
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                          ) : (
                                            <Save size={12} />
                                          )}
                                          Guardar
                                        </button>
                                        <button
                                          onClick={() =>
                                            setOverrides((prev) => ({
                                              ...prev,
                                              [key]: {
                                                editando: false,
                                                valor: "",
                                              },
                                            }))
                                          }
                                          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition"
                                        >
                                          <X size={14} />
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          setOverrides((prev) => ({
                                            ...prev,
                                            [key]: {
                                              editando: true,
                                              valor: "",
                                            },
                                          }))
                                        }
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-600 border border-slate-200 rounded-xl text-xs font-bold transition"
                                      >
                                        <PencilLine size={12} /> Editar
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        <div className="flex justify-end pt-1 pb-1">
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm">
                            <Trophy size={14} className="text-amber-500" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                              Calificación final:
                            </span>
                            <span
                              className={`text-lg font-black ${user.calificacionFinal >= 60 ? "text-emerald-600" : user.calificacionFinal > 0 ? "text-rose-500" : "text-slate-300"}`}
                            >
                              {user.calificacionFinal > 0
                                ? `${user.calificacionFinal} pts`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 mt-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Mostrando{" "}
            <span className="text-purple-600">
              {Math.min(
                (paginaActual - 1) * ITEMS_POR_PAGINA + 1,
                filtered.length,
              )}
              –{Math.min(paginaActual * ITEMS_POR_PAGINA, filtered.length)}
            </span>{" "}
            de <span className="text-purple-600">{filtered.length}</span>{" "}
            participantes · Aprobados:{" "}
            <span className="text-emerald-600">{aprobados}</span> · Pendientes:{" "}
            <span className="text-amber-500">{pendientes}</span>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition"
              >
                «
              </button>
              <button
                onClick={() => setPaginaActual((p) => p - 1)}
                disabled={paginaActual === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(
                  (n) =>
                    n === 1 ||
                    n === totalPaginas ||
                    Math.abs(n - paginaActual) <= 1,
                )
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs font-bold"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPaginaActual(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl border text-xs font-bold transition
                                ${
                                  paginaActual === item
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPaginaActual((p) => p + 1)}
                disabled={paginaActual === totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition"
              >
                »
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

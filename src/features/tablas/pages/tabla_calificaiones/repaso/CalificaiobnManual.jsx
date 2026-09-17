import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Undo,
  Redo,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  BarChart2,
  Trophy,
  Clock,
  Users,
  RefreshCw,
  Save,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import serviceApiNet from "../../../../../lib/api/serviceApiNet";
import { Check } from "lucide-react";

export default function CalificacionManual() {
  const { cursoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [entregaOpen, setEntregaOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [respuestasEvaluacion, setRespuestasEvaluacion] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 15;

  const stateData =
    location.state ||
    (() => {
      try {
        const saved = sessionStorage.getItem(`calificacion_${cursoId}`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    })();

  const {
    tipoRecurso,
    recursoId,
    tipoCalificacion,
    nombreRecurso,
    tipoRecursoNombre,
  } = stateData;

  useEffect(() => {
    if (location.state) {
      sessionStorage.setItem(
        `calificacion_${cursoId}`,
        JSON.stringify(location.state),
      );
    }
  }, [location.state, cursoId]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grade, setGrade] = useState("");
  const [comentario, setComentario] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [instructorId, setInstructorId] = useState(null);
  const [entregaAlumno, setEntregaAlumno] = useState(null);
  const [loadingEntrega, setLoadingEntrega] = useState(false);
  const [recursoData, setRecursoData] = useState(null);
  const [instruccionesOpen, setInstruccionesOpen] = useState(true);

  useEffect(() => {
    setPaginaActual(1);
  }, [statusFilter]);
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm]);

  const filteredData = participantes.filter((item) => {
    const nombreCompleto =
      `${item.nombre || ""} ${item.apeLLido || ""}`.toLowerCase();
    const matchesSearch =
      nombreCompleto.includes(searchTerm.toLowerCase()) ||
      (item.correo || "").toLowerCase().includes(searchTerm.toLowerCase()); // también busca por correo

    let matchesStatus = true;
    if (statusFilter === "Pendiente") {
      matchesStatus = !item.calificacionFinal || item.calificacionFinal === 0;
    } else if (statusFilter === "Completado") {
      matchesStatus = item.calificacionFinal > 0;
    } else if (statusFilter === "Participación pendiente") {
      matchesStatus = !item.esCompletado; // sin progreso/participación
    }

    return matchesSearch && matchesStatus;
  });

  const totalPaginas = Math.ceil(filteredData.length / ITEMS_POR_PAGINA);
  const paginadoData = filteredData.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA,
  );

  useEffect(() => {
    if (!selectedStudent || !recursoId) return;
    const cargar = async () => {
      setLoadingEntrega(true);
      setEntregaAlumno(null);
      try {
        if (tipoRecurso === 1) {
          const res = await serviceApiNet.Evaluacion.getRespuestasAlumno(
            recursoId,
            selectedStudent.usuarioId,
          );
          if (res.data?.success) {
            const data = res.data.data || [];
            setRespuestasEvaluacion(data);
            setEntregaAlumno(data.length > 0 ? { tipo: "evaluacion" } : null);
          }
        }
        if (tipoRecurso === 3) {
          const res = await serviceApiNet.Tarea.getEntrega(
            recursoId,
            selectedStudent.usuarioId,
          );
          if (res.data?.success && res.data?.data) {
            setEntregaAlumno(res.data.data);
          }
        } else if (tipoRecurso === 2) {
          const res = await serviceApiNet.Foro.getPublicaciones(recursoId);
          if (res.data?.success) {
            const publicaciones = Array.isArray(res.data.data)
              ? res.data.data
              : [];
            const publicacion = publicaciones.find(
              (p) => p.usuarioId === selectedStudent.usuarioId,
            );
            setEntregaAlumno(publicacion || null);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingEntrega(false);
      }
    };
    cargar();
  }, [selectedStudent, recursoId, tipoRecurso]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await serviceApiNet.Usuario.getMe();
        if (res.data?.success) setInstructorId(res.data.data.usuarioId);
      } catch (e) {
        console.warn(e);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (!cursoId) return;
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resParticipantes, resCurso] = await Promise.all([
          serviceApiNet.Inscripcion.getParticipantes(
            cursoId,
            controller.signal,
          ),
          serviceApiNet.Cursos.getById(cursoId, controller.signal),
        ]);
        const data = resParticipantes.data?.data || [];
        setParticipantes(data);
        if (data.length > 0) setSelectedStudent(data[0]);
        if (resCurso.data?.success) {
          const recursos = resCurso.data.data?.recursos || [];
          const recursoEncontrado = recursos.find((r) => {
            if (tipoRecurso === 1)
              return r.dataJson?.evaluacionId === recursoId;
            if (tipoRecurso === 3) return r.dataJson?.TareaId === recursoId;
            if (tipoRecurso === 2) return r.dataJson?.ForoId === recursoId;
            return false;
          });
          setRecursoData(recursoEncontrado?.dataJson || null);
        }
      } catch (err) {
        if (err.name !== "CanceledError") console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [cursoId, recursoId, tipoRecurso]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCalificar = async () => {
    if (!grade || !selectedStudent || !recursoId) return;
    const gradeNum = Number(grade);
    if (gradeNum < 0 || gradeNum > 100) {
      showToast("error", "La calificación debe ser entre 0 y 100");
      return;
    }
    setSaving(true);
    try {
      const res = await serviceApiNet.Inscripcion.calificarRecurso({
        tipoRecurso,
        recursoId,
        usuarioId: selectedStudent.usuarioId,
        cursoId: Number(cursoId),
        calificacion: gradeNum,
        comentario,
        calificadoPorId: instructorId,
      });
      if (res.data?.success) {
        showToast(
          "success",
          `✓ ${selectedStudent.nombre} ${selectedStudent.apeLLido} calificado con ${gradeNum}`,
        );
        setGrade("");
        setComentario("");
        setParticipantes((prev) =>
          prev.map((p) =>
            p.usuarioId === selectedStudent.usuarioId
              ? {
                  ...p,
                  calificacionFinal: gradeNum,
                  esCompletado: gradeNum >= 60,
                }
              : p,
          ),
        );
      } else {
        showToast("error", res.data?.message || "Error al calificar");
      }
    } catch (e) {
      showToast("error", "Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const calificados = participantes.filter(
    (p) => p.calificacionFinal > 0,
  ).length;
  const pendientes = participantes.length - calificados;
  const promedio =
    calificados > 0
      ? (
          participantes.reduce(
            (acc, p) => acc + (p.calificacionFinal || 0),
            0,
          ) / calificados
        ).toFixed(1)
      : "—";
  const aprobados = participantes.filter(
    (p) => p.calificacionFinal >= 60,
  ).length;

  const getBadgeColor = () =>
    ({
      2: "bg-sky-50 text-sky-600 border-sky-100",
      3: "bg-emerald-50 text-emerald-600 border-emerald-100",
      7: "bg-orange-50 text-orange-600 border-orange-100",
      1: "bg-amber-50 text-amber-600 border-amber-100",
    })[tipoRecurso] || "bg-purple-50 text-purple-600 border-purple-100";

  const renderArchivoInstrucciones = () => {
    if (!recursoData?.ArchivoPath) return null;
    const ext = recursoData.ArchivoPath.split("?")[0]
      .split(".")
      .pop()
      .toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return (
        <img
          src={recursoData.ArchivoPath}
          alt="Instrucción"
          className="w-full max-h-[280px] object-contain rounded-xl border border-gray-100 bg-slate-900 mt-3"
        />
      );
    if (ext === "pdf")
      return (
        <iframe
          src={recursoData.ArchivoPath}
          className="w-full rounded-xl border border-gray-100 mt-3"
          style={{ height: "350px" }}
          title="PDF"
        />
      );
    if (["mp4", "webm", "mov"].includes(ext))
      return (
        <video
          controls
          className="w-full rounded-xl border border-gray-100 bg-black mt-3"
          style={{ maxHeight: "280px" }}
        >
          <source src={recursoData.ArchivoPath} />
        </video>
      );
    return (
      <a
        href={recursoData.ArchivoPath}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-all"
      >
        📎 Ver archivo adjunto
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-2 duration-300
                ${
                  toast.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <AlertCircle size={18} className="text-rose-500" />
          )}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <div className="max-w-full mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {tipoRecursoNombre && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wide border ${getBadgeColor()}`}
                  >
                    {tipoRecursoNombre}
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                  Calificación manual
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {nombreRecurso || "Calificación Manual"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Revisa cada entrega y asigna una calificación al alumno
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
            Exportar actividades
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                <h2 className="text-sm font-bold text-slate-800">
                  Detalle de actividad
                </h2>
              </div>
              <span
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium uppercase border ${getBadgeColor()}`}
              >
                {tipoRecursoNombre || "Recurso"}
              </span>
            </div>

            <div className="border-b border-slate-100">
              <button
                onClick={() => setInstruccionesOpen((p) => !p)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors focus:outline-none"
              >
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Instrucciones de la tarea
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-300 ${instruccionesOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${instruccionesOpen ? "max-h-[420px] pb-5 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="overflow-y-auto max-h-[380px] pr-1">
                  <div className="px-6">
                    {recursoData ? (
                      <>
                        {/* Descripción / instrucciones generales */}
                        {(recursoData.instrucciones ||
                          recursoData.Instrucciones) && (
                          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/80 rounded-xl p-5 border border-slate-100/80 mb-4">
                            {recursoData.instrucciones ||
                              recursoData.Instrucciones}
                          </div>
                        )}

                        {/* Preguntas de la evaluación */}
                        {tipoRecurso === 1 &&
                          recursoData.preguntas?.length > 0 && (
                            <div className="space-y-3 mt-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Preguntas de la evaluación (
                                {recursoData.preguntas.length})
                              </p>
                              {recursoData.preguntas.map((preg, i) => (
                                <div
                                  key={preg.EvaluacionPreguntaId}
                                  className="bg-white border border-slate-100 rounded-xl p-4 space-y-2 shadow-sm"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-[10px] font-black text-indigo-400 mt-0.5 shrink-0">
                                      P{i + 1}
                                    </span>
                                    <p
                                      className="text-sm font-semibold text-slate-700 leading-snug"
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
                                            ${
                                              op.EsCorrecta
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                                : "bg-slate-50 border-slate-100 text-slate-500"
                                            }`}
                                      >
                                        {op.EsCorrecta ? (
                                          <CheckCircle2
                                            size={12}
                                            className="shrink-0 text-emerald-500"
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
                                      <Trophy size={10} /> {preg.PuntosValor}{" "}
                                      pts
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        {!recursoData.instrucciones &&
                          !recursoData.Instrucciones &&
                          !recursoData.preguntas?.length && (
                            <p className="text-sm text-slate-400 italic">
                              No hay instrucciones detalladas para esta
                              actividad.
                            </p>
                          )}

                        {renderArchivoInstrucciones()}
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        No hay instrucciones disponibles.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/20">
              {selectedStudent ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md shrink-0 bg-slate-100">
                      <img
                        src={
                          selectedStudent.imagenPortada ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.nombre}`
                        }
                        alt={selectedStudent.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.nombre}`;
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {selectedStudent.nombre} {selectedStudent.apeLLido}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedStudent.correo}{" "}
                        <span className="mx-1.5 opacity-50">•</span> Inscrito:{" "}
                        {new Date(
                          selectedStudent.fechaInscripcion,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                      {selectedStudent.progreso}% avance
                    </span>
                    {selectedStudent.calificacionFinal > 0 && (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-md border shadow-sm ${selectedStudent.calificacionFinal >= 60 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
                      >
                        Nota: {selectedStudent.calificacionFinal}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <User size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    Selecciona un alumno del panel para calificar
                  </p>
                </div>
              )}
            </div>

            <div className="border-b border-slate-100">
              <button
                onClick={() => setEntregaOpen((p) => !p)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {tipoRecurso === 2
                      ? "Participación del alumno"
                      : "Entrega del alumno"}
                  </span>
                  {entregaAlumno && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-300 transition-transform duration-300 ${entregaOpen ? "rotate-180" : ""}`}
                />
              </button>

              {entregaOpen && (
                <div className="px-6 pb-5 space-y-4">
                  {loadingEntrega ? (
                    <div className="flex items-center justify-center py-8 gap-3 text-sm text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-purple-400 rounded-full animate-spin" />
                      Obteniendo entrega...
                    </div>
                  ) : entregaAlumno ? (
                    <>
                      {(entregaAlumno.contenido ||
                        entregaAlumno.Contenido ||
                        entregaAlumno.Comentario ||
                        entregaAlumno.comentario ||
                        entregaAlumno.EntregaId) &&
                        (() => {
                          const texto =
                            entregaAlumno.contenido ||
                            entregaAlumno.Contenido ||
                            entregaAlumno.Comentario ||
                            entregaAlumno.comentario ||
                            "";
                          const partes = texto.split(" | ");
                          const tituloEntrega =
                            partes.length > 1 ? partes[0].trim() : null;
                          const cuerpoEntrega =
                            partes.length > 1
                              ? partes.slice(1).join(" | ").trim()
                              : texto;
                          return (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                              {texto ? (
                                <>
                                  {tituloEntrega && (
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">
                                      {tituloEntrega}
                                    </p>
                                  )}
                                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {cuerpoEntrega}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-slate-400 italic">
                                  El alumno entregó sin comentario.
                                </p>
                              )}
                              <div className="text-xs text-slate-400 flex gap-3 pt-1 border-t border-slate-100 mt-2">
                                <span>
                                  📋 Entrega #{entregaAlumno.EntregaId}
                                </span>
                                {entregaAlumno.Calificacion > 0 && (
                                  <span>
                                    🏆 Nota previa: {entregaAlumno.Calificacion}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                      {(tipoRecurso === 3 || tipoRecurso === 2) &&
                        (entregaAlumno.ArchivoPath ||
                          entregaAlumno.archivoPath) &&
                        (() => {
                          const url =
                            entregaAlumno.ArchivoPath ||
                            entregaAlumno.archivoPath;
                          const ext = url
                            .split("?")[0]
                            .split(".")
                            .pop()
                            .toLowerCase();

                          if (
                            [
                              "jpg",
                              "jpeg",
                              "png",
                              "gif",
                              "webp",
                              "svg",
                            ].includes(ext)
                          ) {
                            return (
                              <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-900">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Imagen adjunta
                                  </span>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition"
                                  >
                                    Abrir original ↗
                                  </a>
                                </div>
                                <img
                                  src={url}
                                  alt="Entrega"
                                  className="w-full max-h-72 object-contain"
                                />
                              </div>
                            );
                          }

                          if (ext === "pdf") {
                            return (
                              <div className="rounded-2xl overflow-hidden border border-slate-100">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    PDF adjunto
                                  </span>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition"
                                  >
                                    Abrir en nueva pestaña ↗
                                  </a>
                                </div>
                                <iframe
                                  src={url}
                                  className="w-full"
                                  style={{ height: "380px" }}
                                  title="PDF entrega"
                                />
                              </div>
                            );
                          }

                          if (["mp4", "webm", "mov", "avi"].includes(ext)) {
                            return (
                              <div className="rounded-2xl overflow-hidden border border-slate-100 bg-black">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Video adjunto
                                  </span>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition"
                                  >
                                    Abrir original ↗
                                  </a>
                                </div>
                                <video
                                  controls
                                  className="w-full"
                                  style={{ maxHeight: "280px" }}
                                >
                                  <source src={url} />
                                </video>
                              </div>
                            );
                          }

                          return (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-purple-50 hover:border-purple-100 transition group"
                            >
                              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:border-purple-200 transition">
                                📎
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover:text-purple-700 transition">
                                  {url.split("/").pop().split("?")[0]}
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">
                                  {ext} · Clic para descargar
                                </p>
                              </div>
                            </a>
                          );
                        })()}

                      {tipoRecurso === 1 &&
                        (respuestasEvaluacion.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              Respuestas del alumno — Intento{" "}
                              {respuestasEvaluacion[0]?.intento}
                            </p>
                            {respuestasEvaluacion.map((r, i) => (
                              <div
                                key={r.respuestaId}
                                className={`rounded-2xl border p-4 space-y-2 ${
                                  r.esCorrecta
                                    ? "bg-emerald-50/60 border-emerald-100"
                                    : "bg-rose-50/60 border-rose-100"
                                }`}
                              >
                                {/* Pregunta */}
                                <div className="flex items-start gap-2">
                                  <span className="text-[10px] font-black text-slate-400 mt-0.5 shrink-0">
                                    P{i + 1}
                                  </span>
                                  <p className="text-sm font-semibold text-slate-700 leading-snug">
                                    {r.textoPregunta}
                                  </p>
                                </div>

                                {/* Respuesta seleccionada */}
                                <div
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                                    r.esCorrecta
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {r.esCorrecta ? (
                                    <CheckCircle2
                                      size={14}
                                      className="shrink-0"
                                    />
                                  ) : (
                                    <AlertCircle
                                      size={14}
                                      className="shrink-0"
                                    />
                                  )}
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        r.textoOpcionSeleccionada ||
                                        r.textoRespuesta ||
                                        "(Sin respuesta)",
                                    }}
                                  />
                                </div>

                                {/* Puntos */}
                                <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-slate-400">
                                  <Trophy size={11} />
                                  {r.puntosObtenidos} / {r.puntosValor} pts
                                </div>
                              </div>
                            ))}

                            {/* Resumen */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 rounded-2xl mt-2">
                              <span className="text-xs font-bold text-slate-600">
                                Total obtenido
                              </span>
                              <span className="text-sm font-black text-slate-800">
                                {respuestasEvaluacion
                                  .reduce(
                                    (acc, r) => acc + (r.puntosObtenidos || 0),
                                    0,
                                  )
                                  .toFixed(2)}{" "}
                                pts
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                            <AlertCircle
                              size={24}
                              className="text-slate-300 mb-2"
                            />
                            <p className="text-sm text-slate-400 font-medium text-center">
                              Este alumno aún no ha respondido la evaluación.
                            </p>
                          </div>
                        ))}

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock size={12} />
                        {tipoRecurso === 1
                          ? `Respondido: ${
                              respuestasEvaluacion[0]?.fechaRespuesta
                                ? new Date(
                                    respuestasEvaluacion[0].fechaRespuesta,
                                  ).toLocaleString("es-PE")
                                : "—"
                            }`
                          : tipoRecurso === 3
                            ? `Entregado: ${
                                entregaAlumno?.FechaEntrega ||
                                entregaAlumno?.fechaEntrega
                                  ? new Date(
                                      entregaAlumno.FechaEntrega ||
                                        entregaAlumno.fechaEntrega,
                                    ).toLocaleString("es-PE")
                                  : "—"
                              }`
                            : `Publicado: ${
                                entregaAlumno?.fechaPublicacion ||
                                entregaAlumno?.FechaPublicacion
                                  ? new Date(
                                      entregaAlumno.fechaPublicacion ||
                                        entregaAlumno.FechaPublicacion,
                                    ).toLocaleString("es-PE")
                                  : "—"
                              }`}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <AlertCircle size={24} className="text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium text-center">
                        {selectedStudent
                          ? "Este alumno aún no ha registrado una entrega."
                          : "Selecciona un alumno para ver su trabajo."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                  ✍️
                </span>
                Retroalimentación del docente
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all bg-white">
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1">
                  {[Bold, Italic, Underline].map((Icon, i) => (
                    <button
                      key={i}
                      className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <div className="flex gap-1">
                    {[Undo, Redo].map((Icon, i) => (
                      <button
                        key={i}
                        className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder={
                    selectedStudent
                      ? `Escribe un comentario constructivo para ${selectedStudent.nombre}...`
                      : "Escribe tu retroalimentación aquí..."
                  }
                  className="w-full p-4 min-h-[120px] text-sm text-slate-700 leading-relaxed outline-none resize-y placeholder:text-slate-400 bg-transparent"
                />
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <div className="min-w-[120px]">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nota Actual
                  </p>
                  <div className="text-3xl font-black tracking-tight">
                    {selectedStudent?.calificacionFinal > 0 ? (
                      <span
                        className={
                          selectedStudent.calificacionFinal >= 60
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }
                      >
                        {selectedStudent.calificacionFinal}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full max-w-sm">
                  <label
                    htmlFor="grade-input"
                    className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
                  >
                    Asignar Calificación (0–100)
                  </label>
                  <div className="relative">
                    <input
                      id="grade-input"
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Ej: 85"
                      className="w-full pl-4 pr-12 py-2.5 border border-slate-300 rounded-lg text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400 bg-white"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                      /100
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCalificar}
                  disabled={!grade || !selectedStudent || saving || !recursoId}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 h-[46px] ${
                    grade && selectedStudent && !saving && recursoId
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:-translate-y-0.5 active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Guardando
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Publicar Nota
                    </>
                  )}
                </button>
              </div>

              {!recursoId && (
                <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertCircle size={16} />
                  <span className="font-medium">
                    Atención: No se recibió el ID del recurso para calificar.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className="lg:col-span-5 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden flex flex-col"
            style={{ height: "780px" }}
          >
            <div className="px-5 pt-5 pb-4 space-y-4 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                  <h2 className="text-sm font-bold text-slate-800">
                    Directorio de Alumnos
                  </h2>
                </div>
                <button
                  onClick={() => setLoading(true)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                  title="Actualizar lista"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin text-indigo-600" : ""}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {participantes.length}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Inscritos
                    </span>
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
                    {calificados}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Revisados
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, correo..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span className="text-slate-800">Filtro:</span>
                    {statusFilter}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${showStatusMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showStatusMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowStatusMenu(false)}
                      ></div>

                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-20 overflow-hidden py-2 border border-slate-200">
                        {[
                          {
                            label: "Todos",
                            count: participantes.length,
                          },
                          {
                            label: "Participación pendiente",
                            count: participantes.filter((p) => !p.esCompletado)
                              .length,
                          },
                          {
                            label: "Pendiente",
                            count: participantes.filter(
                              (p) =>
                                !p.calificacionFinal ||
                                p.calificacionFinal === 0,
                            ).length,
                          },
                          {
                            label: "Completado",
                            count: participantes.filter(
                              (p) => p.calificacionFinal > 0,
                            ).length,
                          },
                        ].map(({ label, count }) => (
                          <button
                            key={label}
                            onClick={() => {
                              setStatusFilter(label);
                              setShowStatusMenu(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors hover:bg-slate-50"
                          >
                            <span
                              className={
                                statusFilter === label
                                  ? "text-black font-medium"
                                  : "text-slate-600"
                              }
                            >
                              {label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                  ${
                    label === "Completado"
                      ? "bg-emerald-50 text-emerald-600"
                      : label === "Pendiente"
                        ? "bg-amber-50 text-amber-600"
                        : label === "Participación pendiente"
                          ? "bg-rose-50 text-rose-500"
                          : "bg-slate-100 text-slate-500"
                  }`}
                              >
                                {count}
                              </span>
                              {statusFilter === label && (
                                <Check size={14} className="text-indigo-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-sm font-medium">
                    Cargando alumnos...
                  </span>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <User size={24} className="text-slate-300" />
                  </div>
                  <span className="text-sm font-medium">
                    No se encontraron resultados
                  </span>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {paginadoData.map((p) => {
                    const isSelected =
                      selectedStudent?.inscripcionId === p.inscripcionId;
                    return (
                      <li
                        key={p.inscripcionId}
                        onClick={() => {
                          setSelectedStudent(p);
                          setGrade("");
                          setComentario("");
                          setRespuestasEvaluacion([]);
                        }}
                        className={`flex items-center justify-between p-4 cursor-pointer transition-all ${isSelected ? "bg-indigo-50/60 relative" : "hover:bg-slate-50"}`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                        )}

                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${isSelected ? "ring-2 ring-indigo-300 ring-offset-1" : "border border-slate-200"}`}
                            >
                              <img
                                src={
                                  p.imagenPortada ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nombre}`
                                }
                                alt={p.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nombre}`;
                                }}
                              />
                            </div>
                            {p.esCompletado && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                <CheckCircle2
                                  size={10}
                                  className="text-white"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <p
                              className={`text-sm font-bold ${isSelected ? "text-indigo-900" : "text-slate-800"}`}
                            >
                              {p.nombre} {p.apeLLido}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[170px] mt-0.5">
                              {p.correo}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {p.calificacionFinal > 0 ? (
                            <div
                              className={`flex items-center justify-center min-w-[36px] px-2 py-1 rounded-md text-sm font-bold ${p.calificacionFinal >= 60 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}
                            >
                              {p.calificacionFinal}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-sm font-bold px-2 py-1">
                              —
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Mostrando{" "}
                  <span className="text-indigo-600">
                    {filteredData.length === 0
                      ? 0
                      : Math.min(
                          (paginaActual - 1) * ITEMS_POR_PAGINA + 1,
                          filteredData.length,
                        )}
                    –
                    {Math.min(
                      paginaActual * ITEMS_POR_PAGINA,
                      filteredData.length,
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="text-indigo-600">{filteredData.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {totalPaginas <= 5 ? (
                    Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          onClick={() => setPaginaActual(n)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors shadow-sm
                            ${
                              paginaActual === n
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                        >
                          {n}
                        </button>
                      ),
                    )
                  ) : (
                    <>
                      {paginaActual > 2 && (
                        <span className="text-[10px] text-slate-300 font-bold px-1">
                          …
                        </span>
                      )}
                      {[paginaActual - 1, paginaActual, paginaActual + 1]
                        .filter((n) => n >= 1 && n <= totalPaginas)
                        .map((n) => (
                          <button
                            key={n}
                            onClick={() => setPaginaActual(n)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors shadow-sm
                                    ${
                                      paginaActual === n
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                    }`}
                          >
                            {n}
                          </button>
                        ))}
                      {paginaActual < totalPaginas - 1 && (
                        <span className="text-[10px] text-slate-300 font-bold px-1">
                          …
                        </span>
                      )}
                    </>
                  )}

                  <button
                    onClick={() =>
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={
                      paginaActual === totalPaginas || totalPaginas === 0
                    }
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Contadores rápidos */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  {
                    label: "Todos",
                    count: participantes.length,
                    color: "text-slate-500 border-slate-200",
                  },
                  {
                    label: "Pendiente",
                    count: participantes.filter(
                      (p) => !p.calificacionFinal || p.calificacionFinal === 0,
                    ).length,
                    color: "text-amber-600 border-amber-100",
                  },
                  {
                    label: "Completado",
                    count: participantes.filter((p) => p.calificacionFinal > 0)
                      .length,
                    color: "text-emerald-600 border-emerald-100",
                  },
                ].map(({ label, count, color }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setStatusFilter(label);
                      setShowStatusMenu(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all
                    ${
                      statusFilter === label
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : `bg-white ${color} hover:border-indigo-300 hover:text-indigo-600`
                    }`}
                  >
                    {label}
                    <span
                      className={`${statusFilter === label ? "opacity-80" : "opacity-60"}`}
                    >
                      ({count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

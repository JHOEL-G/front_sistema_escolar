import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ChevronDown,
  Loader2,
  AlertCircle,
  Map,
  Award,
  Users,
  BookMarked,
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  Layout,
  PlayCircle,
  FileText,
  Video,
  File,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import { useImpersonation } from "../../../../components/perstectiva/ImpersonationProviderr";
import { useDarkMode } from "../../../../components/darkMode_context/DarkModeContext";
import { Zap } from "lucide-react";
import { Info } from "lucide-react";
import { Shield } from "lucide-react";
import { Calendar } from "lucide-react";

const PageRutaAprendizaje = () => {
  const { darkMode } = useDarkMode();
  const { impersonatedUser } = useImpersonation();
  const { rutaId } = useParams();
  const navigate = useNavigate();
  const [rutaActiva, setRutaActiva] = useState(null);
  const [progresoUsuario, setProgresoUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSeccion, setExpandedSeccion] = useState(null);
  const [modalRequisitos, setModalRequisitos] = useState(false);
  const [activeTab, setActiveTab] = useState("contenido");
  const [inscrito, setInscrito] = useState(null);
  const [verCertificadores, setVerCertificadores] = useState(false);

  useEffect(() => {
    if (!rutaId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();

    const fetchRuta = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resDetalle, resMe] = await Promise.allSettled([
          serviceApiNet.RutaAprendizaje.getById(rutaId, controller.signal),
          serviceApiNet.Usuario.getMe(controller.signal),
        ]);

        let dataRuta = null;
        if (resDetalle.status === "fulfilled") {
          dataRuta = resDetalle.value?.data?.data ?? resDetalle.value?.data;
        }

        if (resMe.status === "fulfilled") {
          const usuario = resMe.value?.data?.data ?? resMe.value?.data;
          if (usuario?.usuarioId) {
            const resRutas = await serviceApiNet.RutaAprendizaje.getByUsuario(
              usuario.usuarioId,
              controller.signal,
            );

            // ⬇️ Soporta tanto array plano como objeto con rutas+cursosProgreso
            const payload = resRutas?.data?.data ?? resRutas?.data;
            const rutasUsuario = Array.isArray(payload)
              ? payload
              : (payload?.rutas ?? []);
            const cursosProgreso = Array.isArray(payload)
              ? []
              : (payload?.cursosProgreso ?? []);

            const miRuta = rutasUsuario.find(
              (r) => String(r.rutaId) === String(rutaId),
            );

            if (miRuta) {
              setInscrito(true);
              setProgresoUsuario({
                progreso: Number(miRuta.progreso ?? 0),
                completado: Boolean(miRuta.completado),
                calificacionFinal: miRuta.calificacionFinal ?? null,
                cursosCompletados: miRuta.cursosCompletados ?? 0,
                totalCursos: miRuta.totalCursos ?? 0,
              });

              // ✅ Cruzar progreso por curso si hay data del segundo result set
              if (dataRuta?.secciones && cursosProgreso.length > 0) {
                const seccionesConProgreso = dataRuta.secciones.map((sec) => ({
                  ...sec,
                  cursos: (sec.cursos ?? []).map((curso) => {
                    const cp = cursosProgreso.find(
                      (c) =>
                        String(c.cursoId) === String(curso.cursoId) &&
                        String(c.seccionId) === String(sec.seccionId),
                    );
                    return {
                      ...curso,
                      progreso: cp ? Number(cp.progreso) : 0,
                      completado: cp ? Boolean(cp.esCompletado) : false,
                    };
                  }),
                }));
                setRutaActiva({ ...dataRuta, secciones: seccionesConProgreso });
              } else {
                if (dataRuta) setRutaActiva(dataRuta);
              }
            } else {
              setInscrito(false);
              if (dataRuta) setRutaActiva(dataRuta);
            }
          } else {
            if (dataRuta) setRutaActiva(dataRuta);
          }
        } else {
          if (dataRuta) setRutaActiva(dataRuta);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        if (err.response?.status === 404) setRutaActiva(null);
        else setError("No se pudo cargar la ruta de aprendizaje.");
      } finally {
        setLoading(false);
      }
    };

    fetchRuta();
    return () => controller.abort();
  }, [rutaId]);

  const secciones = rutaActiva?.secciones ?? [];
  const totalSecciones =
    secciones.length > 0 ? secciones.length : (rutaActiva?.totalSecciones ?? 0);
  const progreso = progresoUsuario?.progreso ?? 0;
  const circumference = 351.8;
  const offset = circumference - (circumference * progreso) / 100;

  const totalCursos =
    progresoUsuario?.totalCursos ?? rutaActiva?.totalCursos ?? 0;
  const cursosCompletados = progresoUsuario?.cursosCompletados ?? 0;

  const estadoLabel =
    progreso === 0
      ? "Sin comenzar"
      : progreso === 100
        ? "Completado"
        : "En progreso";
  const estadoColor =
    progreso === 0
      ? "bg-slate-200 text-slate-600"
      : progreso === 100
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
        : "bg-violet-600 text-white shadow-lg shadow-violet-500/20";

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#0a0a0c]" : "bg-slate-50"}`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
            <div className="absolute inset-0 blur-xl opacity-30 bg-violet-500 animate-pulse rounded-full" />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
            Cargando ruta...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#0a0a0c]" : "bg-slate-50"}`}
      >
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );

  if (!rutaActiva)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#0a0a0c]" : "bg-slate-50"}`}
      >
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Map className="w-16 h-16 text-slate-200" />
          <h4 className="text-lg font-bold">Ruta no encontrada</h4>
        </div>
      </div>
    );

  const palabras = rutaActiva.nombreRuta?.split(" ") ?? [];

  if (!loading && inscrito === false)
    return (
      <div
        className={`min-h-full flex items-center justify-center mt-[200px] ${darkMode ? "bg-[#0a0a0c]" : "bg-slate-50"}`}
      >
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Map className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              {rutaActiva?.nombreRuta ?? "Ruta de aprendizaje"}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {rutaActiva?.descripcion || "No tienes acceso a esta ruta."}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full">
            <p className="text-sm font-semibold text-amber-700">
              ⚠️ No estás inscrito en esta ruta. Contacta a tu administrador
              para obtener acceso.
            </p>
          </div>
          <button
            onClick={() =>
              !impersonatedUser &&
              navigate("/explorador", { state: { tab: "rutas" } })
            }
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 active:scale-95"
          >
            <ChevronLeft size={18} />
            Volver al explorador
          </button>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-300 ${darkMode ? "bg-[#0a0a0c] text-slate-200" : "bg-slate-50 text-slate-900"}`}
    >
      {modalRequisitos && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <button
              onClick={() => setModalRequisitos(false)}
              className={`absolute top-6 right-6 p-2 rounded-full transition-all duration-300 hover:rotate-90 ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <Trophy className="w-7 h-7 text-violet-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {rutaActiva.nombreCertificado || "Certificación"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Requisitos para aprobación
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className={`flex items-center justify-between p-5 rounded-3xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"}`}
              >
                <span className="text-sm font-medium text-slate-500">
                  Puntaje mínimo
                </span>
                <span className="text-2xl font-black text-violet-500">
                  {rutaActiva.criterioAprobacion}%
                </span>
              </div>
              {rutaActiva.condicionAvanceCurso && (
                <div
                  className={`flex items-start gap-4 p-4 rounded-2xl ${darkMode ? "bg-blue-500/5" : "bg-blue-50/50"}`}
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 leading-snug">
                    Flujo de cursos estrictamente secuencial.
                  </p>
                </div>
              )}
              {rutaActiva.condicionAvanceSeccion && (
                <div
                  className={`flex items-start gap-4 p-4 rounded-2xl ${darkMode ? "bg-indigo-500/5" : "bg-indigo-50/50"}`}
                >
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 leading-snug">
                    Debes completar cada sección antes de avanzar.
                  </p>
                </div>
              )}
              {rutaActiva.fechaLimite && rutaActiva.asignarFecha && (
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl ${darkMode ? "bg-amber-500/5" : "bg-amber-50/50"}`}
                >
                  <span className="text-sm font-bold text-amber-600">
                    Fecha límite
                  </span>
                  <span className="text-sm font-black text-amber-600">
                    {rutaActiva.asignarDia} ·{" "}
                    {new Date(rutaActiva.asignarFecha).toLocaleDateString(
                      "es-ES",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                </div>
              )}
              {rutaActiva.nombreCertificado && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl ${darkMode ? "bg-emerald-500/5" : "bg-emerald-50/50"}`}
                >
                  <Award className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Obtendrás:{" "}
                    <span className="font-black">
                      {rutaActiva.nombreCertificado}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-full mx-auto px-4 md:px-6 py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-6">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/10 to-transparent" />
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-6 md:p-8 flex items-center justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wide mb-3">
                {rutaActiva.nombrePrivacidad || "Ruta de Aprendizaje"}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                {palabras.slice(0, 4).join(" ")}{" "}
                <span className="text-violet-400">
                  {palabras.slice(4).join(" ")}
                </span>
              </h1>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed max-w-2xl">
                {rutaActiva.descripcion ||
                  "Inicia tu camino hacia la maestría profesional."}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={!!impersonatedUser}
                  onClick={() => {
                    const primerCurso = secciones[0]?.cursos?.[0];
                    if (!impersonatedUser && primerCurso) {
                      navigate(`/curso_iniciado/${primerCurso.cursoId}`);
                    }
                  }}
                  className="group flex items-center gap-3 bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-violet-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {progreso > 0 ? "Continuar ruta" : "Comenzar ahora"}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  onClick={() => setModalRequisitos(true)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition-colors"
                >
                  <Award className="w-4 h-4 text-violet-400" />
                  Condiciones de grado
                </button>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                {
                  icon: BookMarked,
                  label: "Etapas",
                  val: rutaActiva.totalSecciones,
                },
                {
                  icon: BookOpen,
                  label: "Cursos",
                  val: rutaActiva.totalCursos,
                },
                {
                  icon: Users,
                  label: "Alumnos",
                  val: rutaActiva.totalParticipantes,
                },
                {
                  icon: Sparkles,
                  label: "Nivel",
                  val: rutaActiva.nombrePrivacidad ?? "Pro",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 p-5 rounded-[1.5rem] hover:bg-white/10 transition-colors group"
                >
                  <s.icon className="w-5 h-5 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {s.label}
                  </p>
                  <p className="text-xl font-black text-white">{s.val ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-4">
            <div
              className={`p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden border ${darkMode ? "bg-[#1e293b] border-slate-800" : "bg-[#1e293b] border-slate-700"} text-white`}
            >
              <span className="text-[10px] font-bold uppercase mb-5 text-slate-400 tracking-widest">
                Progreso General
              </span>

              <div className="relative mb-5">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="#334155"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke={progreso === 100 ? "#10b981" : "#8b5cf6"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * progreso) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{progreso}%</span>
                </div>
              </div>

              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase mb-6 ${
                  progreso === 100
                    ? "bg-emerald-500/20 text-emerald-400"
                    : progreso > 0
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-slate-800 text-slate-300"
                }`}
              >
                {progreso === 100
                  ? "✓ Completado"
                  : progreso > 0
                    ? "En progreso"
                    : "Sin iniciar"}
              </span>

              <div className="w-full space-y-3">
                <div className="bg-slate-800/50 p-3 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={13} className="text-emerald-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Cursos
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      {cursosCompletados}/{totalCursos}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          totalCursos > 0
                            ? `${(cursosCompletados / totalCursos) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <BookMarked size={13} className="text-violet-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Secciones
                      </span>
                    </div>
                    <span className="text-xs font-black text-violet-400">
                      {totalSecciones}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: progreso > 0 ? "100%" : "0%" }}
                    />
                  </div>
                </div>

                {progresoUsuario?.calificacionFinal != null && (
                  <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={13} className="text-amber-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Calificación
                      </span>
                    </div>
                    <span className="text-xs font-black text-amber-400">
                      {Number(progresoUsuario.calificacionFinal).toFixed(1)}
                    </span>
                  </div>
                )}

                <div className="bg-slate-800/50 p-3 rounded-2xl">
                  <button
                    onClick={() => setVerCertificadores((v) => !v)}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Certificadores
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Avatares apilados siempre visibles */}
                      <div className="flex -space-x-1.5">
                        {(rutaActiva.certificadores ?? [])
                          .slice(0, 3)
                          .map((c, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 border border-slate-700 flex items-center justify-center text-[7px] font-black text-white"
                            >
                              {c.iniciales ??
                                c.nombreCompleto?.slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                        {(rutaActiva.certificadores?.length ?? 0) > 3 && (
                          <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[7px] font-black text-slate-400">
                            +{rutaActiva.certificadores.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-slate-500 transition-transform duration-300 ${verCertificadores ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Panel desplegable */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${verCertificadores ? "max-h-[300px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}
                  >
                    <div
                      className={`rounded-xl border border-slate-700/50 overflow-hidden`}
                    >
                      {(rutaActiva.certificadores ?? []).map((c, i) => (
                        <div
                          key={c.certificadorRutaId ?? i}
                          className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-700/40
                        ${i !== 0 ? "border-t border-slate-700/50" : ""}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                            {c.iniciales ??
                              c.nombreCompleto?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-200 truncate capitalize">
                              {c.nombreCompleto?.toLowerCase()}
                            </p>
                            <p className="text-[9px] text-slate-500 truncate">
                              {c.area}
                            </p>
                          </div>
                          {c.activo && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div
              className={`flex gap-8 border-b text-sm font-bold mb-6 ${darkMode ? "border-slate-800" : "border-slate-200"}`}
            >
              {[
                { key: "contenido", label: "Contenido" },
                { key: "info", label: "Información" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 relative transition-all ${activeTab === tab.key ? "text-violet-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "contenido" && (
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-black">Contenido de la ruta</h2>
                  <span className={`text-xs font-bold text-slate-400`}>
                    {totalSecciones} secciones · {rutaActiva.totalCursos ?? 0}{" "}
                    cursos
                  </span>
                </div>

                <div className="space-y-4">
                  {secciones.length > 0
                    ? secciones.map((seccion, idx) => {
                        const seccionId =
                          seccion.seccionId ?? seccion.id ?? idx;
                        const isOpen = expandedSeccion === seccionId;
                        const cursos = seccion.cursos ?? [];

                        return (
                          <div
                            key={seccionId}
                            className={`border rounded-3xl transition-all duration-300 overflow-hidden ${
                              isOpen
                                ? `${darkMode ? "bg-slate-900 border-violet-500/30" : "bg-white border-violet-100"} shadow-xl shadow-slate-200/50`
                                : `${darkMode ? "bg-slate-900/50 border-slate-800 hover:border-slate-700" : "bg-white border-slate-100 hover:border-slate-200"}`
                            }`}
                          >
                            <div
                              className="p-6 cursor-pointer flex items-center justify-between"
                              onClick={() =>
                                setExpandedSeccion(isOpen ? null : seccionId)
                              }
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                    isOpen
                                      ? "bg-violet-600 text-white"
                                      : darkMode
                                        ? "bg-slate-800 text-slate-400"
                                        : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {seccion.completado ? (
                                    <CheckCircle2 size={22} />
                                  ) : (
                                    <span className="font-bold text-lg">
                                      {idx + 1}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h4
                                    className={`font-bold transition-colors ${isOpen ? (darkMode ? "text-slate-100" : "text-slate-900") : "text-slate-600"}`}
                                  >
                                    {seccion.nombreSeccion ??
                                      `Sección ${idx + 1}`}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-violet-500 uppercase">
                                      Etapa {idx + 1}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                      {cursos.length} cursos
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div
                                  className={`hidden sm:block px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                    seccion.completado
                                      ? "bg-emerald-100 text-emerald-600"
                                      : darkMode
                                        ? "bg-slate-800 text-slate-400"
                                        : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {seccion.completado
                                    ? "✓ Finalizado"
                                    : "Pendiente"}
                                </div>
                                <div
                                  className={`p-2 rounded-full transition-transform duration-300 ${
                                    isOpen
                                      ? "rotate-180 bg-violet-50 text-violet-600"
                                      : darkMode
                                        ? "bg-slate-800 text-slate-400"
                                        : "bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  <ChevronDown size={20} />
                                </div>
                              </div>
                            </div>

                            <div
                              className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                            >
                              <div
                                className={`px-6 pb-6 pt-2 border-t ${darkMode ? "border-slate-800" : "border-slate-50"}`}
                              >
                                {cursos.length > 0 ? (
                                  <div className="space-y-2">
                                    {cursos.map((curso, cIdx) => (
                                      <div
                                        key={curso.cursoId ?? cIdx}
                                        onClick={() => {
                                          if (!impersonatedUser)
                                            navigate(
                                              `/curso_iniciado/${curso.cursoId ?? curso.id}`,
                                            );
                                        }}
                                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all border cursor-pointer ${
                                          curso.progreso >= 100
                                            ? darkMode
                                              ? "border-emerald-500/30 bg-emerald-500/5"
                                              : "border-emerald-200 bg-emerald-50/50"
                                            : curso.progreso > 0
                                              ? darkMode
                                                ? "border-violet-500/20 bg-violet-500/5"
                                                : "border-violet-100 bg-violet-50/30"
                                              : `border-transparent ${darkMode ? "hover:bg-violet-500/10 hover:border-violet-500/20" : "hover:bg-violet-50 hover:border-violet-100"}`
                                        }`}
                                      >
                                        <div className="flex items-center gap-4 flex-1">
                                          <div className="relative w-10 h-10 shrink-0">
                                            <svg
                                              className="w-10 h-10 -rotate-90"
                                              viewBox="0 0 40 40"
                                            >
                                              <circle
                                                cx="20"
                                                cy="20"
                                                r="16"
                                                stroke={
                                                  darkMode
                                                    ? "#1e293b"
                                                    : "#e2e8f0"
                                                }
                                                strokeWidth="3"
                                                fill="transparent"
                                              />
                                              <circle
                                                cx="20"
                                                cy="20"
                                                r="16"
                                                stroke={
                                                  curso.progreso >= 100
                                                    ? "#10b981"
                                                    : "#8b5cf6"
                                                }
                                                strokeWidth="3"
                                                fill="transparent"
                                                strokeDasharray="100.5"
                                                strokeDashoffset={
                                                  100.5 -
                                                  (100.5 *
                                                    (Number(curso.progreso) ||
                                                      0)) /
                                                    100
                                                }
                                                strokeLinecap="round"
                                                className="transition-all duration-700"
                                              />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              {curso.progreso >= 100 ? (
                                                <CheckCircle2
                                                  size={14}
                                                  className="text-emerald-500"
                                                />
                                              ) : (
                                                <BookOpen
                                                  size={12}
                                                  className={
                                                    curso.progreso > 0
                                                      ? "text-violet-400"
                                                      : darkMode
                                                        ? "text-slate-500"
                                                        : "text-slate-400"
                                                  }
                                                />
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <p
                                              className={`text-sm font-bold truncate transition-colors group-hover:text-violet-600 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                                            >
                                              {curso.nombreCurso ?? "Curso"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <span
                                                className={`text-[10px] font-bold uppercase tracking-wide ${
                                                  curso.progreso >= 100
                                                    ? "text-emerald-500"
                                                    : curso.progreso > 0
                                                      ? "text-violet-400"
                                                      : "text-slate-400"
                                                }`}
                                              >
                                                {curso.progreso >= 100
                                                  ? "✓ Completado"
                                                  : curso.progreso > 0
                                                    ? `${Number(curso.progreso).toFixed(0)}% completado`
                                                    : "Pendiente"}
                                              </span>
                                            </div>

                                            {curso.progreso > 0 &&
                                              curso.progreso < 100 && (
                                                <div
                                                  className={`mt-1.5 w-full h-1 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
                                                >
                                                  <div
                                                    className="h-full rounded-full bg-violet-500 transition-all duration-700"
                                                    style={{
                                                      width: `${Number(curso.progreso)}%`,
                                                    }}
                                                  />
                                                </div>
                                              )}
                                          </div>
                                        </div>

                                        <ChevronRight
                                          size={18}
                                          className={`transition-all shrink-0 ${darkMode ? "text-slate-600" : "text-slate-300"} group-hover:text-violet-600 group-hover:translate-x-1`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-slate-400">
                                    <BookOpen
                                      size={28}
                                      className="mx-auto mb-2 opacity-40"
                                    />
                                    <p className="text-sm font-medium">
                                      Sin cursos disponibles
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : Array.from({ length: totalSecciones }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`border rounded-3xl p-6 flex items-center gap-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-400"}`}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-500">
                              Sección {idx + 1}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Cargando contenido...
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}
            {activeTab === "info" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {rutaActiva.mensajeBienvenida && (
                  <div
                    className={`relative overflow-hidden p-6 rounded-[2rem] border-0 shadow-xl ${
                      darkMode
                        ? "bg-slate-900/50 backdrop-blur-md"
                        : "bg-white shadow-slate-200/50"
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-2xl ${darkMode ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"}`}
                      >
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-500 mb-1">
                          Introduction
                        </p>
                        <p
                          className={`text-sm leading-relaxed font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                        >
                          {rutaActiva.mensajeBienvenida}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`grid grid-cols-2 gap-4 p-2 rounded-[2.5rem] ${darkMode ? "bg-slate-950/40" : "bg-slate-100/50"}`}
                >
                  {[
                    {
                      label: "Privacidad",
                      val: rutaActiva.nombrePrivacidad,
                      icon: <Shield size={14} />,
                      color: "text-blue-500",
                    },
                    {
                      label: "Recompensa",
                      val: rutaActiva.gamificacion
                        ? `${rutaActiva.gamificacion} XP`
                        : "0 XP",
                      icon: <Zap size={14} />,
                      color: "text-amber-500",
                    },
                    {
                      label: "Lanzamiento",
                      val: rutaActiva.fechaCreacion
                        ? new Date(rutaActiva.fechaCreacion).toLocaleDateString(
                            "es-ES",
                          )
                        : "—",
                      icon: <Calendar size={14} />,
                      color: "text-emerald-500",
                    },
                    {
                      label: "Estado",
                      val: rutaActiva.permiteDesinscripcion
                        ? "Flexible"
                        : "Obligatorio",
                      icon: <Info size={14} />,
                      color: "text-rose-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`group p-4 rounded-[1.8rem] transition-all duration-300 hover:scale-[1.02] ${
                        darkMode
                          ? "bg-slate-900 border border-slate-800/50 shadow-2xl"
                          : "bg-white border border-transparent shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`${item.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                        >
                          {item.icon}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {item.label}
                        </p>
                      </div>
                      <p
                        className={`text-[13px] font-bold ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        {item.val ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-2">
                  <h3
                    className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] mb-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    <div className="h-px flex-1 bg-current opacity-20" />
                    Certificación y Metas
                    <div className="h-px flex-1 bg-current opacity-20" />
                  </h3>

                  <div className="grid gap-3">
                    <div
                      className={`group flex items-center justify-between p-4 rounded-3xl transition-all ${
                        darkMode
                          ? "bg-slate-900/40 hover:bg-slate-900"
                          : "bg-white border border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
                          <div className="relative bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <Trophy size={18} strokeWidth={2.5} />
                          </div>
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                          >
                            Puntaje de aprobación
                          </p>
                          <p className="text-xs text-slate-500">
                            Mínimo requerido para completar
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-sm">
                        {rutaActiva.criterioAprobacion ?? "0"}%
                      </div>
                    </div>

                    {rutaActiva.nombreCertificado && (
                      <div
                        className={`group flex items-center justify-between p-4 rounded-3xl transition-all ${
                          darkMode
                            ? "bg-slate-900/40 hover:bg-slate-900"
                            : "bg-white border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-violet-500/20 blur-lg rounded-full" />
                            <div className="relative bg-violet-600 text-white p-2.5 rounded-2xl shadow-lg shadow-violet-500/20">
                              <Award size={18} strokeWidth={2.5} />
                            </div>
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                            >
                              Título del Certificado
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[180px]">
                              {rutaActiva.nombreCertificado}
                            </p>
                          </div>
                        </div>
                        <div className="p-2 text-slate-400 group-hover:text-violet-500 transition-colors">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageRutaAprendizaje;

import {
  BookOpen,
  BarChart3,
  AlertCircle,
  Clock,
  Award,
  TrendingUp,
  Map,
} from "lucide-react";
import { useDarkMode } from "../../../../components/darkMode_context/DarkModeContext";
import keycloak from "../../../auth/services/keycloakConfig";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import useGroqMotivation from "./ia_interactiva/useGroqMotivation ";
import Toast from "../../../../components/gestor_documentos/notificaciones/Toast";
import { useImpersonation } from "../../../../components/perstectiva/ImpersonationProviderr";
import { ChevronLeft } from "lucide-react";
import { Check } from "lucide-react";

let toastMostradoEnSesion = false;

export default function ModernDashboard() {
  const { darkMode } = useDarkMode();
  const { impersonatedUser } = useImpersonation();

  const [cursos, setCursos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [tabActiva, setTabActiva] = useState("cursos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [idxCursos, setIdxCursos] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [idxRutas, setIdxRutas] = useState(0);

  const usuarioId = impersonatedUser
    ? (impersonatedUser.keycloakId ??
      impersonatedUser.usuarioId ??
      impersonatedUser.id ??
      "")
    : (keycloak.tokenParsed?.sub ?? "");

  const userName =
    impersonatedUser?.nombre ?? keycloak.tokenParsed?.given_name ?? "Usuario";
  const userLastName =
    impersonatedUser?.apeLLido ?? keycloak.tokenParsed?.family_name ?? "";
  const userEmail =
    impersonatedUser?.correo ?? keycloak.tokenParsed?.email ?? "";
  const rol =
    impersonatedUser?.permisoNombre ?? userProfile?.permisoNombre ?? "Usuario";
  const {
    mensajesIA,
    loading: loadingIA,
    getFallbackMessage,
    avatarUrl,
    detectarGeneroYAvatar,
    resumenIA,
    generarResumen,
  } = useGroqMotivation(cursos);
  const imagenPortada =
    impersonatedUser?.imagenPortada ||
    userProfile?.imagenPortada ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  useEffect(() => {
    if (!usuarioId) return;

    const fetchUserProfile = async () => {
      try {
        let perfil;

        if (impersonatedUser) {
          perfil = impersonatedUser;
        } else {
          const response = await serviceApiNet.Usuario.getMe();
          perfil = response.data?.data || response.data;
        }

        if (perfil) {
          setUserProfile(perfil);
          const idParaRutas = perfil.usuarioId ?? perfil.id;
          if (idParaRutas) {
            const rutasRes =
              await serviceApiNet.RutaAprendizaje.getByUsuario(idParaRutas);

            const payload = rutasRes.data?.data ?? rutasRes.data;
            const rutasArray = Array.isArray(payload)
              ? payload
              : (payload?.rutas ?? []);

            setRutas(rutasArray);
          }
        }
      } catch (err) {
        console.error("Error cargando perfil o rutas:", err);
      }
    };

    fetchUserProfile();
  }, [usuarioId, impersonatedUser]);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setCursos([]);
    setRutas([]);

    const fetchCursos = async () => {
      try {
        setError(null);
        const response = await serviceApiNet.Inscripcion.getById(usuarioId);
        if (response.success) {
          setCursos(response.data);
          if (!impersonatedUser && !toastMostradoEnSesion) {
            toastMostradoEnSesion = true;
            mostrarToast(
              response.data.length === 0
                ? "No tienes cursos inscritos aún."
                : `Tienes ${response.data.length} curso(s) disponibles.`,
              response.data.length === 0 ? "info" : "success",
            );
          }
        }
      } catch (error) {
        const mensaje = error.response?.data;
        if (
          error.response?.status === 404 &&
          mensaje === "El usuario no tiene cursos inscritos."
        ) {
          setCursos([]);
        } else {
          if (!impersonatedUser)
            mostrarToast("Error al conectar con el servidor.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [usuarioId, impersonatedUser]);

  useEffect(() => {
    if (userName && userName !== "Usuario") {
      detectarGeneroYAvatar(userName);
    }
  }, [userName]);

  const mostrarToast = (message, type) => setToast({ message, type });

  const generateImageUrl = (curso, index) => {
    if (curso.imagenPortadaPath) return curso.imagenPortadaPath;
    const hash = `${curso.cursoId}-${curso.nombreCurso}-${index}`
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${hash}/400/225`;
  };

  const generateFallbackUrl = (curso, index) => {
    const styles = ["shapes", "identicon", "bottts", "rings", "avataaars"];
    const styleIndex = ((curso.cursoId || 0) + index) % styles.length;
    return `https://api.dicebear.com/7.x/${styles[styleIndex]}/svg?seed=${encodeURIComponent(curso.nombreCurso)}-${index}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleVerRutas = () => {
    if (impersonatedUser) return;

    const rolesAdmin = ["Administrador"];

    if (rolesAdmin.includes(rol)) {
      navigate("/ruta_aprendizaje");
    } else {
      navigate("/explorador", { state: { tab: "rutas" } });
    }
  };

  return (
    <div
      className={`transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}
    >
      <div className="max-w-8xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {impersonatedUser ? (
              <>
                Perfil de{" "}
                <span className="text-amber-500">
                  {userName} {userLastName}
                </span>
              </>
            ) : (
              <>
                ¡Bienvenido de nuevo,{" "}
                <span className="text-emerald-600">
                  {userName} {userLastName}
                </span>{" "}
                👋
              </>
            )}
          </h1>
          <p
            className={`text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            {impersonatedUser
              ? "Vista simulada — estás navegando como este usuario"
              : "Aquí tienes un resumen de tu actividad hoy."}
          </p>
        </header>

        {error && (
          <div
            className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${darkMode ? "bg-red-900/20 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-700"}`}
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div
            className={`p-8 rounded-[2.5rem] border transition-all ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-24 h-24 rounded-full bg-slate-100 mb-4 p-1 border-2 ${impersonatedUser ? "border-amber-300" : "border-emerald-100"}`}
              >
                <img
                  src={
                    imagenPortada ||
                    avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
                  }
                  className="w-full h-full object-cover rounded-full"
                  alt="Profile"
                />
              </div>

              <h2 className="font-bold text-xl uppercase tracking-tight">
                {userName} {userLastName}
              </h2>

              <span
                className={`text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 ${
                  impersonatedUser
                    ? "text-amber-600 bg-amber-50 border border-amber-100"
                    : "text-emerald-600 bg-emerald-50 border border-emerald-100"
                }`}
              >
                {rol}
              </span>

              <div
                className={`w-full border-t mt-6 pt-6 ${darkMode ? "border-slate-800" : "border-slate-50"}`}
              >
                <p className="text-[11px] text-slate-400 break-all font-medium">
                  {userEmail}
                </p>
              </div>

              <div className="w-full mt-6">
                {resumenIA ? (
                  <div
                    className={`p-4 rounded-2xl border relative overflow-hidden ${darkMode ? "bg-slate-800 border-slate-700" : "bg-emerald-50/40 border-emerald-100"}`}
                  >
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl" />

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white">
                        <span className="text-[9px]">✦</span>
                      </div>
                      <p
                        className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
                      >
                        {resumenIA.titulo}
                      </p>
                    </div>

                    <p
                      className={`text-[11px] font-medium leading-relaxed text-left ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {resumenIA.resumen}
                    </p>

                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        darkMode
                          ? "bg-slate-700 text-emerald-400"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {resumenIA.estado}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`h-24 rounded-2xl animate-pulse ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            className={`lg:col-span-2 p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-xl"}`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h3
                  className={`text-xl font-black tracking-tight ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                >
                  {cursos.length > 0
                    ? `${cursos.length} actividades por completar`
                    : "Tu progreso"}
                </h3>
                {loadingIA && (
                  <Sparkles
                    size={18}
                    className="text-emerald-500 animate-pulse"
                  />
                )}
              </div>
              <div
                className={`p-2 rounded-xl ${darkMode ? "bg-slate-800 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
              >
                <BarChart3 size={20} />
              </div>
            </div>

            {cursos.length > 0 ? (
              <div className="relative">
                <div className="space-y-4 overflow-y-auto max-h-[340px] pr-2 scrollbar-hide snap-y snap-mandatory scroll-smooth scroll-py-2">
                  {cursos.map((curso, index) => {
                    const contenido =
                      mensajesIA[curso.inscripcionId] ||
                      getFallbackMessage(curso.progreso, index);
                    return (
                      <div
                        key={curso.inscripcionId}
                        className={`snap-start group p-5 rounded-[1.8rem] border transition-all duration-300 ${impersonatedUser ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:scale-[1.01]"} ${darkMode ? "bg-slate-800/40 border-slate-700 hover:border-emerald-500/50" : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200"}`}
                        onClick={() =>
                          !impersonatedUser &&
                          navigate(`/curso_iniciado/${curso.cursoId}`)
                        }
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-2xl ${darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-50 text-slate-400"}`}
                          >
                            <BookOpen size={22} />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-bold text-sm mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                            >
                              {contenido.h}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {contenido.p}{" "}
                              <span className="text-emerald-500 font-semibold italic">
                                "{curso.nombreCurso}"
                              </span>
                              .
                            </p>
                          </div>
                          {!impersonatedUser && (
                            <ChevronRight
                              size={20}
                              className="self-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="h-12 w-full" />
                </div>

                {cursos.length > 3 && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t ${darkMode ? "from-slate-900" : "from-white"} to-transparent z-10`}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center flex-grow">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-200"}`}
                >
                  <BarChart3 size={40} />
                </div>
                <h4 className="text-lg font-bold">Sin tareas pendientes</h4>
                <p className="text-slate-400 text-sm max-w-[250px] mt-3">
                  ¡Buen trabajo! Estás al día con todas las lecciones.
                </p>
              </div>
            )}

            {cursos.length > 0 && !impersonatedUser && (
              <div className="mt-auto pt-4 relative z-20">
                <button
                  onClick={() => navigate("/explorador")}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 flex items-center justify-end w-full gap-2 transition-all"
                >
                  Ver todas las tareas ({cursos.length}){" "}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          <div
            className={`lg:col-span-3 p-4 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-500 ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-xl"}`}
          >
            <div className="flex flex-col gap-4 mb-6 sm:mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
                <div
                  className={`p-3 sm:p-4 rounded-2xl shadow-inner self-start transition-colors duration-300 ${darkMode ? "bg-slate-800 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
                >
                  {tabActiva === "cursos" ? (
                    <BookOpen
                      size={24}
                      strokeWidth={2.5}
                      className={
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }
                    />
                  ) : (
                    <Map
                      size={24}
                      strokeWidth={2.5}
                      className={
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="italic font-black text-xl sm:text-2xl tracking-tight">
                    Aprendizaje reciente
                  </h3>
                  {tabActiva === "cursos" && cursos.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {cursos.length}{" "}
                        {cursos.length === 1
                          ? "curso activo"
                          : "cursos activos"}
                      </p>
                    </div>
                  )}
                  {tabActiva === "rutas" && rutas.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {rutas.length}{" "}
                        {rutas.length === 1
                          ? "ruta asignada"
                          : "rutas asignadas"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div
                  className={`flex p-1 rounded-2xl gap-1 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                >
                  <button
                    onClick={() => setTabActiva("cursos")}
                    className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                      tabActiva === "cursos"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : darkMode
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <BookOpen size={14} />
                    Cursos
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        tabActiva === "cursos"
                          ? "bg-white/20 text-white"
                          : darkMode
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {cursos.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setTabActiva("rutas")}
                    className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                      tabActiva === "rutas"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : darkMode
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <Map size={14} />
                    Rutas
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        tabActiva === "rutas"
                          ? "bg-white/20 text-white"
                          : darkMode
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {rutas.length}
                    </span>
                  </button>
                </div>

                {tabActiva === "cursos" && (
                  <button
                    disabled={!!impersonatedUser}
                    onClick={() => !impersonatedUser && navigate("/explorador")}
                    className={`group flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg ${
                      impersonatedUser
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95"
                    }`}
                  >
                    Ver detalle
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                )}

                {tabActiva === "rutas" && (
                  <button
                    disabled={!!impersonatedUser}
                    onClick={handleVerRutas}
                    className={`group flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg ${
                      impersonatedUser
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95"
                    }`}
                  >
                    Ver todas
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                )}
              </div>
            </div>

            {tabActiva === "cursos" &&
              (loading ? (
                <div className="flex flex-col items-center py-16 sm:py-24 animate-pulse">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-500/10 border-t-emerald-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-full" />
                    </div>
                  </div>
                  <p className="mt-6 text-emerald-600/60 text-xs font-black uppercase tracking-[0.2em]">
                    Sincronizando academia
                  </p>
                </div>
              ) : cursos.length > 0 ? (
                (() => {
                  const VISIBLE =
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? 1
                      : window.innerWidth < 1024
                        ? 2
                        : 3;
                  const maxIdx = Math.max(0, cursos.length - VISIBLE);

                  return (
                    <div className="relative group/container">
                      {idxCursos > 0 && (
                        <button
                          onClick={() =>
                            setIdxCursos((i) => Math.max(0, i - 1))
                          }
                          className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-white text-emerald-600 border border-slate-100"}`}
                        >
                          <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                      )}

                      {idxCursos < maxIdx && (
                        <button
                          onClick={() =>
                            setIdxCursos((i) => Math.min(maxIdx, i + 1))
                          }
                          className={`absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-white text-emerald-600 border border-slate-100"}`}
                        >
                          <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                      )}

                      <div
                        className="overflow-hidden px-1 sm:px-2 py-4"
                        onMouseDown={(e) => {
                          setIsDragging(true);
                          setDragStartX(e.clientX);
                        }}
                        onMouseUp={(e) => {
                          if (!isDragging) return;
                          setIsDragging(false);
                          const diff = dragStartX - e.clientX;
                          if (diff > 50)
                            setIdxCursos((i) => Math.min(maxIdx, i + 1));
                          else if (diff < -50)
                            setIdxCursos((i) => Math.max(0, i - 1));
                        }}
                        onMouseLeave={() => setIsDragging(false)}
                        onTouchStart={(e) =>
                          setDragStartX(e.touches[0].clientX)
                        }
                        onTouchEnd={(e) => {
                          const diff = dragStartX - e.changedTouches[0].clientX;
                          if (diff > 40)
                            setIdxCursos((i) => Math.min(maxIdx, i + 1));
                          else if (diff < -40)
                            setIdxCursos((i) => Math.max(0, i - 1));
                        }}
                        style={{ cursor: isDragging ? "grabbing" : "grab" }}
                      >
                        <div
                          className="flex gap-4 sm:gap-6 transition-transform duration-700"
                          style={{
                            transform: `translateX(calc(-${idxCursos} * (100% / ${VISIBLE} + ${(VISIBLE > 1 ? 24 : 16) / VISIBLE}px)))`,
                          }}
                        >
                          {cursos.map((curso, index) => (
                            <div
                              key={curso.inscripcionId || index}
                              className={`group relative flex flex-col flex-shrink-0 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${impersonatedUser ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:-translate-y-2"} ${darkMode ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/50" : "bg-white border-slate-100 hover:border-emerald-200"}`}
                              style={{
                                width: `calc(${100 / VISIBLE}% - ${((VISIBLE - 1) * (VISIBLE > 1 ? 24 : 16)) / VISIBLE}px)`,
                              }}
                              onClick={() =>
                                !impersonatedUser &&
                                !isDragging &&
                                navigate(`/curso_iniciado/${curso.cursoId}`)
                              }
                            >
                              <div className="relative h-40 sm:h-52 m-2 sm:m-3 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                                <img
                                  src={generateImageUrl(curso, index)}
                                  alt={curso.nombreCurso}
                                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.src = generateFallbackUrl(
                                      curso,
                                      index,
                                    );
                                  }}
                                />
                                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                  {curso.esCompletado ? (
                                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black uppercase shadow-lg shadow-emerald-500/40">
                                      <Award size={12} /> Completado
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black uppercase border border-white/30">
                                      En curso
                                    </span>
                                  )}
                                  <div
                                    className={`px-2 py-1 rounded-lg flex items-center justify-center text-xs font-black backdrop-blur-md border ${darkMode ? "bg-slate-900/80 border-slate-700 text-emerald-400" : "bg-white/90 border-emerald-100 text-emerald-600"}`}
                                  >
                                    {Math.round(curso.progreso)}%
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 sm:p-6 pt-2 flex flex-col flex-grow">
                                <h4
                                  className={`font-black text-base sm:text-xl leading-tight mb-2 sm:mb-3 line-clamp-2 transition-colors ${darkMode ? "text-white group-hover:text-emerald-400" : "text-slate-800 group-hover:text-emerald-600"}`}
                                >
                                  {curso.nombreCurso || "Módulo de formación"}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                  {curso.descripcionCurso}
                                </p>

                                <div className="space-y-1.5 mb-4 mt-2">
                                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Progreso</span>
                                    <span>{Math.round(curso.progreso)}%</span>
                                  </div>
                                  <div
                                    className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                                  >
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                                      style={{ width: `${curso.progreso}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="mt-auto pt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`p-1 sm:p-1.5 rounded-lg ${darkMode ? "bg-slate-800" : "bg-emerald-50"}`}
                                    >
                                      <Clock
                                        size={12}
                                        className="text-emerald-500"
                                      />
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                                      {curso.fechaInscripcion
                                        ? formatearFecha(curso.fechaInscripcion)
                                        : "Reciente"}
                                    </span>
                                  </div>
                                  {curso.calificacionFinal > 0 && (
                                    <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] sm:text-xs font-black border border-emerald-500/20">
                                      <TrendingUp size={12} />
                                      {Number(curso.calificacionFinal).toFixed(
                                        1,
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {cursos.length > VISIBLE && (
                        <div className="flex justify-center items-center gap-2 mt-2">
                          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setIdxCursos(i)}
                              className={`transition-all duration-500 rounded-full ${
                                i === idxCursos
                                  ? "w-6 sm:w-8 h-2 bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                  : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-emerald-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div
                  className={`flex flex-col items-center py-14 sm:py-20 border-2 border-dashed rounded-[2.5rem] sm:rounded-[3.5rem] transition-colors ${darkMode ? "border-slate-800 bg-slate-900/20" : "border-slate-200 bg-slate-50/50"}`}
                >
                  <div
                    className={`w-16 h-16 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 rotate-12 ${darkMode ? "bg-slate-800 text-emerald-900/30" : "bg-white text-emerald-100 shadow-sm"}`}
                  >
                    <BookOpen size={36} strokeWidth={1.5} />
                  </div>
                  <h4
                    className={`text-lg sm:text-xl font-black ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Tu biblioteca está vacía
                  </h4>
                  <p className="text-sm text-slate-400 mt-2 max-w-[240px] sm:max-w-[280px] text-center font-medium">
                    {impersonatedUser
                      ? "Este usuario no tiene cursos inscritos actualmente."
                      : "¿Listo para aprender algo nuevo? Tus cursos aparecerán aquí."}
                  </p>
                </div>
              ))}

            {tabActiva === "rutas" &&
              (rutas.length > 0 ? (
                (() => {
                  const VISIBLE =
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? 1
                      : window.innerWidth < 1024
                        ? 2
                        : 3;
                  const maxIdx = Math.max(0, rutas.length - VISIBLE);

                  return (
                    <div className="relative group/container">
                      {idxRutas > 0 && (
                        <button
                          onClick={() => setIdxRutas((i) => Math.max(0, i - 1))}
                          className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-white text-emerald-600 border border-slate-100"}`}
                        >
                          <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                      )}

                      {idxRutas < maxIdx && (
                        <button
                          onClick={() =>
                            setIdxRutas((i) => Math.min(maxIdx, i + 1))
                          }
                          className={`absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-white text-emerald-600 border border-slate-100"}`}
                        >
                          <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                      )}

                      <div className="overflow-hidden px-1 sm:px-2 py-4">
                        <div
                          className="flex gap-4 sm:gap-6 transition-transform duration-700"
                          style={{
                            transform: `translateX(calc(-${idxRutas} * (100% / ${VISIBLE} + ${(VISIBLE > 1 ? 24 : 16) / VISIBLE}px)))`,
                          }}
                        >
                          {rutas.map((ruta, index) => (
                            <div
                              key={ruta.rutaId}
                              className={`group relative flex flex-col flex-shrink-0 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden
                    ${impersonatedUser ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.2)] hover:-translate-y-2"}
                    ${darkMode ? "bg-slate-900/40 border-slate-800 hover:border-emerald-500/50" : "bg-white border-slate-100 hover:border-emerald-200"}`}
                              style={{
                                width: `calc(${100 / VISIBLE}% - ${((VISIBLE - 1) * (VISIBLE > 1 ? 24 : 16)) / VISIBLE}px)`,
                              }}
                              onClick={() =>
                                !impersonatedUser &&
                                navigate(
                                  `/rutas_aprendizaje_inscrito/${ruta.rutaId}`,
                                )
                              }
                            >
                              <div className="relative h-40 sm:h-52 m-2 sm:m-3 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                                <img
                                  src={
                                    ruta.imagenPortada ||
                                    `https://picsum.photos/seed/${ruta.rutaId}/400/225`
                                  }
                                  alt={ruta.nombreRuta}
                                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://picsum.photos/seed/${ruta.rutaId}/400/225`;
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                                {/* Badge + % encima de la imagen */}
                                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black uppercase shadow-lg border border-emerald-400/30">
                                    <Map size={12} /> Ruta
                                  </span>
                                  <div
                                    className={`px-2 py-1 rounded-lg text-xs font-black backdrop-blur-md border ${darkMode ? "bg-slate-900/80 border-slate-700 text-emerald-400" : "bg-white/90 border-emerald-100 text-emerald-600"}`}
                                  >
                                    {Math.round(ruta.progreso ?? 0)}%
                                  </div>
                                </div>

                                {/* Nombre encima de la imagen abajo */}
                                <div className="absolute bottom-3 left-3 right-3">
                                  <h4 className="font-black text-base sm:text-lg text-white leading-tight line-clamp-2 drop-shadow-lg">
                                    {ruta.nombreRuta}
                                  </h4>
                                </div>
                              </div>

                              <div className="p-4 sm:p-5 pt-2 flex flex-col flex-grow">
                                <p
                                  className={`text-xs mb-3 line-clamp-2 font-medium leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                                >
                                  {ruta.descripcion ||
                                    "Sigue esta ruta estructurada para alcanzar tus objetivos profesionales."}
                                </p>

                                <div className="mt-auto space-y-2">
                                  {/* Barra de progreso */}
                                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Progreso</span>
                                    <span>
                                      {Math.round(ruta.progreso ?? 0)}%
                                    </span>
                                  </div>
                                  <div
                                    className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                                  >
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                                      style={{
                                        width: `${ruta.progreso ?? 0}%`,
                                      }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-1.5">
                                      <div
                                        className={`p-1 rounded-lg ${darkMode ? "bg-emerald-500/10" : "bg-emerald-50"}`}
                                      >
                                        <Clock
                                          size={11}
                                          className="text-emerald-500"
                                        />
                                      </div>
                                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {ruta.fechaInscripcion
                                          ? `Desde ${formatearFecha(ruta.fechaInscripcion)}`
                                          : "Reciente"}
                                      </span>
                                    </div>
                                    {ruta.completado && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase shadow-md shadow-emerald-500/20">
                                        <Award size={11} /> Finalizada
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dots */}
                      {rutas.length > VISIBLE && (
                        <div className="flex justify-center items-center gap-2 mt-2">
                          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setIdxRutas(i)}
                              className={`transition-all duration-500 rounded-full ${i === idxRutas ? "w-6 sm:w-8 h-2 bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-emerald-300"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div
                  className={`flex flex-col items-center py-16 sm:py-24 border-2 border-dashed rounded-[3rem] sm:rounded-[4rem] transition-all ${darkMode ? "border-slate-800 bg-slate-900/20" : "border-slate-200 bg-slate-50/50"}`}
                >
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center mb-6 sm:mb-8 group">
                    <div
                      className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] rotate-12 transition-transform group-hover:rotate-0 ${darkMode ? "bg-slate-800" : "bg-white shadow-xl"}`}
                    />
                    <Map
                      size={40}
                      className={`relative z-10 ${darkMode ? "text-emerald-900/40" : "text-emerald-100"}`}
                    />
                    <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-full animate-pulse flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <h4
                    className={`text-xl sm:text-2xl font-black mb-2 sm:mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Tu hoja de ruta está lista
                  </h4>
                  <p className="text-sm text-slate-400 max-w-[260px] sm:max-w-[320px] text-center font-medium leading-relaxed">
                    {impersonatedUser
                      ? "Este usuario no cuenta con rutas de crecimiento asignadas por el momento."
                      : "Pronto verás aquí los caminos de aprendizaje que te ayudarán a subir de nivel."}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

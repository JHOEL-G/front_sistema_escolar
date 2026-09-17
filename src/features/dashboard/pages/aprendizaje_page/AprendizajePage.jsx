import React, { useState, useEffect } from "react";
import {
  Book,
  Flame,
  ChevronLeft,
  ChevronRight,
  Play,
  Map,
} from "lucide-react";
import { useDarkMode } from "../../../../components/darkMode_context/DarkModeContext";
import keycloak from "../../../auth/services/keycloakConfig";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useImpersonation } from "../../../../components/perstectiva/ImpersonationProviderr";

export default function AprendizajePage() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(true);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const { impersonatedUser } = useImpersonation();
  const scrollRutasRef = useRef(null);
  const [mesActual, setMesActual] = useState(new Date());

  const usuarioId =
    impersonatedUser?.keycloakId || keycloak.tokenParsed?.sub || "";
  const usuarioIdNumerico = impersonatedUser?.usuarioId || null;
  const nombreMostrado = impersonatedUser
    ? `${impersonatedUser.nombre ?? ""} ${impersonatedUser.apeLLido ?? ""}`.trim()
    : `${keycloak.tokenParsed?.given_name || "Usuario"} ${keycloak.tokenParsed?.family_name || ""}`;

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await serviceApiNet.Inscripcion.getById(usuarioId);
        if (response.success) {
          const cursosEnProgreso = response.data.filter(
            (curso) => curso.progreso >= 0,
          );
          setCursos(cursosEnProgreso);
        }
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) fetchCursos();
    else setLoading(false);
  }, [usuarioId]);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        let perfilUsuarioId = usuarioIdNumerico;

        if (!perfilUsuarioId) {
          const meRes = await serviceApiNet.Usuario.getMe();
          const perfil = meRes.data?.data || meRes.data;
          perfilUsuarioId = perfil?.usuarioId;
        }

        if (perfilUsuarioId) {
          const rutasRes =
            await serviceApiNet.RutaAprendizaje.getByUsuario(perfilUsuarioId);
          const payload = rutasRes.data?.data ?? rutasRes.data;
          const rutasArray = Array.isArray(payload)
            ? payload
            : (payload?.rutas ?? []);

          setRutas(rutasArray);
        }
      } catch (error) {
        console.error("Error al cargar rutas:", error);
      } finally {
        setLoadingRutas(false);
      }
    };

    if (usuarioId) fetchRutas();
    else setLoadingRutas(false);
  }, [usuarioId, usuarioIdNumerico]);

  const handleExplorarCursos = () => navigate("/explorador");
  const handleContinuarCurso = (cursoId) =>
    navigate(`/curso_iniciado/${cursoId}`);
  const handleVerRuta = (rutaId) =>
    navigate(`/rutas_aprendizaje_inscrito/${rutaId}`);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth / 2;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const calcularSemanasActivas = () => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const ultimoDiaMes = new Date(year, month + 1, 0);
    const semanasEnMes = Math.ceil(ultimoDiaMes.getDate() / 7);
    const semanasConActividad = new Set();

    cursos.forEach((curso) => {
      if (curso.fechaInscripcion) {
        const fechaInscripcion = new Date(curso.fechaInscripcion);
        if (
          fechaInscripcion.getFullYear() === year &&
          fechaInscripcion.getMonth() === month
        ) {
          semanasConActividad.add(Math.ceil(fechaInscripcion.getDate() / 7));
        }
      }
    });

    return { semanasEnMes, semanasConActividad };
  };

  const cambiarMes = (direccion) => {
    setMesActual((prevMes) => {
      const nuevaFecha = new Date(prevMes);
      nuevaFecha.setMonth(prevMes.getMonth() + direccion);
      return nuevaFecha;
    });
  };

  const nombreMes = mesActual
    .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
  const { semanasEnMes, semanasConActividad } = calcularSemanasActivas();

  return (
    <div
      className={`transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}
    >
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          Bienvenido de nuevo,{" "}
          <span className="text-emerald-600">{nombreMostrado}</span> ✌️
        </h1>
        <p
          className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Aquí tienes un resumen de tu progreso en el estudio esta semana.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-10 mb-8 text-white shadow-xl shadow-emerald-200/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="relative z-10 max-w-none">
          <h2 className="text-3xl font-black mb-3 tracking-tight italic">
            Potencia tu conocimiento al instante ✨
          </h2>
          <p className="text-emerald-50/80 text-sm mb-8 font-medium leading-relaxed">
            Descubre contenidos que potencian tu aprendizaje, cuando tú decidas.
          </p>
          <button
            className="bg-white text-emerald-700 px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all shadow-lg hover:scale-105 active:scale-95"
            onClick={handleExplorarCursos}
          >
            Explorar cursos
          </button>
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-6 opacity-90">
          <div className="bg-white/20 backdrop-blur-xl p-5 rounded-[2rem] rotate-12 border border-white/30 shadow-2xl">
            <div className="bg-white rounded-xl p-2.5 shadow-inner">
              <div className="w-14 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <div className="w-8 h-5 bg-emerald-500 rounded-md shadow-sm"></div>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-xl p-8 rounded-[2.5rem] -rotate-12 translate-y-6 border border-white/30 shadow-2xl">
            <Book size={64} className="text-emerald-100 fill-white/20" />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h2 className="text-xl font-black tracking-tight italic">
              Continúa aprendiendo
            </h2>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Retoma tus estudios justo donde los dejaste
            </p>
          </div>

          {cursos.length > 3 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll(scrollRef, "left")}
                className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm ${
                  darkMode
                    ? "border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50"
                    : "border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200"
                }`}
              >
                <ChevronLeft
                  size={20}
                  className={darkMode ? "text-slate-400" : "text-slate-600"}
                />
              </button>

              <button
                onClick={() => scroll(scrollRef, "right")}
                className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm ${
                  darkMode
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-100/50"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cursos.map((curso, index) => {
              const generateImageSeed = () => {
                if (curso.imagenPortadaPath) return curso.imagenPortadaPath;
                const hashBase = `${curso.cursoId}-${curso.nombreCurso}-${index}`;
                const hash = hashBase
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                return `https://picsum.photos/seed/${hash}/600/400`;
              };
              const generateFallback = () => {
                const styles = [
                  "shapes",
                  "identicon",
                  "bottts",
                  "rings",
                  "avataaars",
                ];
                return `https://api.dicebear.com/7.x/${styles[(curso.cursoId + index) % styles.length]}/svg?seed=${encodeURIComponent(curso.nombreCurso)}-${index}`;
              };

              return (
                <div
                  key={curso.inscripcionId}
                  onClick={() => handleContinuarCurso(curso.cursoId)}
                  className="group/card relative h-52 min-w-[90%] md:min-w-[45%] lg:min-w-[calc(33.333%-1.05rem)] rounded-[2.2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20 snap-start flex-shrink-0 border border-transparent hover:border-white/20"
                >
                  <div className="absolute inset-0">
                    <img
                      src={generateImageSeed()}
                      alt={curso.nombreCurso}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = generateFallback();
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-black/20 to-transparent" />
                  </div>

                  <div className="relative h-full p-6 flex flex-col justify-between text-white z-10">
                    <div className="flex justify-between items-start">
                      <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                        <Book size={18} className="text-emerald-300" />
                      </div>
                      <div
                        className={`backdrop-blur-md px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                          curso.esCompletado
                            ? "bg-emerald-500/40 border-emerald-400/50 text-white"
                            : "bg-white/10 border-white/20 text-emerald-100"
                        }`}
                      >
                        {curso.esCompletado
                          ? "✓ Completado"
                          : curso.progreso > 0
                            ? "En curso"
                            : "Sin iniciar"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover/card:text-emerald-200 transition-colors">
                        {curso.nombreCurso}
                      </h3>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] mb-1.5 text-emerald-300/80 font-bold">
                            <span>PROGRESO</span>
                            <span>{Math.round(curso.progreso)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-1000"
                              style={{ width: `${curso.progreso}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-white text-emerald-950 p-2.5 rounded-xl group-hover/card:bg-emerald-500 group-hover/card:text-white transition-all shadow-lg shadow-black/20">
                          <Play size={16} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div
          className={`lg:col-span-3 p-8 rounded-[2rem] border transition-all ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${darkMode ? "bg-slate-800 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
              >
                <Map size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Rutas de aprendizaje
                </h2>
                {rutas.length > 0 && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {rutas.length}{" "}
                      {rutas.length === 1 ? "ruta activa" : "rutas activas"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {rutas.length > 3 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(scrollRutasRef, "left")}
                  className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm ${
                    darkMode
                      ? "border-slate-700 hover:bg-slate-800"
                      : "border-slate-200 hover:bg-emerald-50 hover:border-emerald-100"
                  }`}
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <button
                  onClick={() => scroll(scrollRutasRef, "right")}
                  className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm ${
                    darkMode
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {loadingRutas ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
              <p className="mt-3 text-slate-400 text-sm font-bold uppercase tracking-tighter">
                Cargando rutas...
              </p>
            </div>
          ) : rutas.length > 0 ? (
            <div
              ref={scrollRutasRef}
              className="flex overflow-x-auto gap-6 pb-2 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {rutas.map((ruta) => (
                <div
                  key={ruta.rutaId}
                  onClick={() => handleVerRuta(ruta.rutaId)}
                  className="group/ruta relative min-w-[90%] md:min-w-[45%] lg:min-w-[calc(33.333%-1.05rem)] rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-xl snap-start flex-shrink-0"
                >
                  <div className="relative h-45 overflow-hidden">
                    <img
                      src={
                        ruta.imagenPortada ||
                        `https://picsum.photos/seed/${ruta.rutaId + 100}/600/400`
                      }
                      alt={ruta.nombreRuta}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/ruta:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${ruta.rutaId + 100}/600/400`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 right-3">
                      <div
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border
                            ${
                              ruta.completado
                                ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                                : "bg-emerald-500/10 border-white/20 text-white"
                            }`}
                      >
                        {ruta.completado ? "✓ Completada" : "En progreso"}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                      <Map size={16} className="text-emerald-300" />
                    </div>
                  </div>

                  <div
                    className={`p-5 space-y-4 border border-t-0 rounded-b-[2rem] transition-colors
                    ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                  >
                    <h3
                      className={`font-bold text-sm leading-tight line-clamp-2 group-hover/ruta:text-emerald-500 transition-colors
                        ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {ruta.nombreRuta}
                    </h3>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold
                            ${darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-50 text-slate-600"}`}
                      >
                        <Book size={11} />
                        {ruta.totalCursos} cursos
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold
                            ${darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-50 text-slate-600"}`}
                      >
                        <Map size={11} />
                        {ruta.totalSecciones} secciones
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div
                        className={`text-[10px] font-bold flex justify-between
                            ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        <span>
                          {ruta.cursosCompletados} de {ruta.totalCursos}{" "}
                          completados
                        </span>
                        <span className="text-emerald-500">
                          {Math.round(ruta.progreso ?? 0)}%
                        </span>
                      </div>
                      <div
                        className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}
                      >
                        <div
                          className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000"
                          style={{ width: `${ruta.progreso ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {ruta.nombreCertificado ? (
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1
                                ${darkMode ? "text-amber-400" : "text-amber-600"}`}
                        >
                          🎓 {ruta.nombreCertificado}
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover/ruta:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                        <Play size={14} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-50 text-slate-300"}`}
              >
                <Map size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Ups, aún no tienes rutas activas disponibles
              </h3>
              <p className="text-slate-400 text-sm text-center max-w-md mb-8">
                Estamos preparando nuevas rutas para ti.
              </p>
              <button
                className={`px-8 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                  darkMode
                    ? "border-slate-700 hover:bg-slate-800"
                    : "border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                }`}
                onClick={handleExplorarCursos}
              >
                Explorar rutas
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider ml-2">
            Tus rachas semanales
          </h3>
          <div
            className={`p-8 rounded-[2.5rem] border transition-all ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-between items-center px-2 mb-6">
                <button
                  onClick={() => cambiarMes(-1)}
                  className="text-slate-400 hover:text-emerald-500 p-1.5 rounded-xl hover:bg-emerald-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  {nombreMes}
                </span>
                <button
                  onClick={() => cambiarMes(1)}
                  className="text-slate-400 hover:text-emerald-500 p-1.5 rounded-xl hover:bg-emerald-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex justify-between gap-1 mb-8">
                {Array.from({ length: semanasEnMes }, (_, i) => i + 1).map(
                  (semana) => (
                    <div
                      key={semana}
                      className="flex flex-col items-center gap-3"
                    >
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                        Sem {semana}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                          semanasConActividad.has(semana)
                            ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200/50 scale-110"
                            : darkMode
                              ? "border-slate-800 bg-slate-800/50"
                              : "border-slate-100 bg-slate-50/50"
                        }`}
                      >
                        {semanasConActividad.has(semana) && (
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div
                className={`pt-6 border-t ${darkMode ? "border-slate-800" : "border-slate-50"}`}
              >
                <div className="flex gap-4 text-left items-start">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner">
                    <Flame
                      size={20}
                      fill="currentColor"
                      className="animate-bounce"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Tu{" "}
                      <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                        racha
                      </span>{" "}
                      muestra cuántas semanas seguidas llevas practicando sin
                      detenerte.
                    </p>
                    {semanasConActividad.size > 0 && (
                      <span className="block mt-2 font-black text-emerald-600 text-[12px] uppercase tracking-wide">
                        ¡{semanasConActividad.size}{" "}
                        {semanasConActividad.size === 1
                          ? "semana activa"
                          : "semanas activas"}{" "}
                        este mes! 🚀
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Loader2,
  FileEdit,
  Plus,
  Clock,
  User,
  Bell,
  BookOpen,
} from "lucide-react";
import { useDarkMode } from "../../../../../components/darkMode_context/DarkModeContext";
import { useNavigate } from "react-router-dom";
import serviceApiNet from "../../../../../lib/api/serviceApiNet";
import {
  RegistroPrevioCard,
  CursoCard,
} from "../../../components/diseño_curso/DiseñoCurso";

const CursoPage = () => {
  const { darkMode } = useDarkMode();
  const [activeSubTab, setActiveSubTab] = useState("cursos");
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gestionesMap, setGestionesMap] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;
  const cursosArchivados = cursos.filter((c) => !c.activo);
  const [registrosPrevios, setRegistrosPrevios] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchCursos = async () => {
      try {
        setLoading(true);
        const response = await serviceApiNet.Cursos.listAll(controller.signal);
        const listaCursos = response.data?.data || response.data;

        if (isMounted && listaCursos && Array.isArray(listaCursos)) {
          const dataMapeada = listaCursos.map((item) => ({
            id: item.cursoId,
            title: item.nombreCurso || "CURSO SIN TÍTULO",
            image: item.imagenPortadaPath,
            descripcion: item.descripcionCurso,
            duracionCurso: item.duracionCurso,
            avance: item.avance,
            mensajeBienvenida: item.mensajeBienvenida,
            fechaCreacion: item.fechaCreacion,
            activo: item.activo,
            estaPublicado: item.estaPublicado,
            reacreditacion: item.reacreditacion,
            nombreDificultad: item.nombreDificultad,
            nombreLenguaje: item.nombreLenguaje,
            dificultadId: item.dificultadId,
            lenguajeId: item.lenguajeId,
            nombreRetro: item.nombreRetro,
            retroalimentacionId: item.retroalimentacionId,
            caracteristicasQueAprendere: item.caracteristicasQueAprendere,
            caracteristicasHabilidades: item.caracteristicasHabilidades,
            caracteristicasRequerimientos: item.caracteristicasRequerimientos,
            tags: [
              ...(item.caracteristicasQueAprendere
                ?.split(",")
                .filter(Boolean) || []),
            ].slice(0, 3),
            instructorId: item.instructorId,
            nombreInstructor: item.nombreInstructor,
            instructoresParsed: item.instructoresParsed || [],
            modulosParsed: item.modulosParsed || [],
            totalModulos: item.totalModulos ?? 0,
            totalInscritos: item.totalInscritos ?? 0,
            totalCompletados: item.totalCompletados ?? 0,
            totalRecursos: item.totalRecursos ?? 0,
            progresoPromedio: item.progresoPromedio ?? 0,
            calificacionPromedio: item.calificacionPromedio ?? 0,
            totalInstructores: item.totalInstructores ?? 0,
            gestionesActivas: item.gestionesActivas ?? 0,
            isNew:
              new Date(item.fechaCreacion) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          }));
          setCursos(dataMapeada);
        }
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Error al cargar cursos:", error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCursos();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const cargarGestiones = async () => {
      try {
        const res = await serviceApiNet.GestionCursos.list();
        const gestiones = res.data?.data || [];
        const map = {};
        gestiones.forEach((g) => {
          map[g.cursoId] = g.gestionCursoId;
        });
        setGestionesMap(map);
      } catch (err) {
        console.error("Error cargando gestiones:", err);
      }
    };
    cargarGestiones();
  }, []);

  useEffect(() => {
    if (activeSubTab !== "previos") return;
    const controller = new AbortController();

    const fetchRegistros = async () => {
      try {
        setLoadingRegistros(true);
        const res = await serviceApiNet.RegistroPrevio.list(controller.signal);
        const data = res.data?.data || res.data || [];
        setRegistrosPrevios(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Error cargando registros previos:", err);
        }
      } finally {
        setLoadingRegistros(false);
      }
    };

    fetchRegistros();
    return () => controller.abort();
  }, [activeSubTab]);

  const esBorrador = (curso) => !curso.estaPublicado;

  const handleCursoArchivado = (cursoId) => {
    setCursos((prev) => prev.filter((c) => c.id !== cursoId));
  };

  const handleCursoEliminado = (cursoId) => {
    setCursos((prev) => prev.filter((c) => c.id !== cursoId));
  };

  const cursosFiltrados = cursos.filter((curso) => {
    const coincideBusqueda = curso.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (activeSubTab === "cursos")
      return coincideBusqueda && curso.activo && curso.estaPublicado;

    if (activeSubTab === "borradores")
      return coincideBusqueda && curso.activo && !curso.estaPublicado;

    if (activeSubTab === "archivados") return coincideBusqueda && !curso.activo;

    if (activeSubTab === "previos") return coincideBusqueda;

    return coincideBusqueda;
  });

  const totalPages = Math.ceil(cursosFiltrados.length / PAGE_SIZE);
  const cursosPaginados = cursosFiltrados.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const registrosFiltrados = registrosPrevios.filter((r) =>
    r.nombreCurso?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const cursosPublicados = cursos.filter((c) => c.activo && c.estaPublicado);
  const cursosBorradores = cursos.filter((c) => c.activo && !c.estaPublicado);

  const tabs = [
    {
      key: "cursos",
      label: `Publicados`,
      count: cursosPublicados.length,
      activeColor: "border-emerald-600 text-emerald-600",
      badgeColor: "bg-emerald-100 text-emerald-600",
    },
    {
      key: "previos",
      label: `Reg. Previos`,
      count: registrosPrevios.length,
      activeColor: "border-emerald-500 text-emerald-500",
      badgeColor: "bg-emerald-50 text-emerald-500",
    },
    {
      key: "borradores",
      label: `Borradores`,
      count: cursosBorradores.length,
      activeColor: "border-slate-600 text-slate-600",
      badgeColor: "bg-slate-100 text-slate-600",
    },
    {
      key: "archivados",
      label: "Archivados",
      count: cursosArchivados.length,
      activeColor: "border-gray-500 text-gray-500",
      badgeColor: "bg-gray-100 text-gray-500",
    },
  ];

  return (
    <div
      className={`min-h-full font-sans ${darkMode ? "text-white" : "bg-slate-50 text-slate-900"}`}
    >
      <div className="max-w-full mx-auto px-6 pb-4 flex justify-between items-center">
        <h1
          className={`
    text-3xl italic font-black uppercase tracking-tighter
    bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 
    bg-clip-text text-transparent
    transition-all duration-500
`}
        >
          Centro de creación
        </h1>
      </div>
      <button
        className="fixed bottom-8 right-8 z-50 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-full text-sm font-black shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.5)] active:scale-95 flex items-center gap-2 transition-all duration-300 border border-emerald-400/20"
        onClick={() => navigate("/curso/crear")}
      >
        <Plus size={20} strokeWidth={3} />
        <span className="tracking-wide">Crear curso</span>
      </button>

      <div className="max-w-8xl mx-auto px-10 mb-4 flex gap-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveSubTab(tab.key);
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeSubTab === tab.key ? tab.activeColor : "border-transparent text-gray-400"}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="max-w-8xl mx-auto px-6 mb-6">
        <div
          className={`p-2 rounded-xl border flex items-center gap-3 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <Filter size={18} className="text-gray-400 ml-2" />
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
            <input
              type="text"
              placeholder={`Buscar en ${
                activeSubTab === "cursos"
                  ? "publicados"
                  : activeSubTab === "borradores"
                    ? "borradores"
                    : activeSubTab === "archivados"
                      ? "archivados"
                      : "registros previos"
              }...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none border-none placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 pb-20">
        {activeSubTab === "previos" ? (
          loadingRegistros ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={48} />
              <p className="text-gray-400 font-medium animate-pulse">
                Cargando registros previos...
              </p>
            </div>
          ) : registrosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {registrosFiltrados.map((registro) => (
                <RegistroPrevioCard
                  key={registro.previoId}
                  registro={registro}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-gray-300" size={30} />
              </div>
              <p className="text-gray-400 font-medium">
                No hay registros previos
              </p>
            </div>
          )
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-gray-400 font-medium animate-pulse">
              Cargando catálogo...
            </p>
          </div>
        ) : cursosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {cursosPaginados.map((course) => (
              <CursoCard
                key={course.id}
                data={{ ...course, gestionId: gestionesMap[course.id] }}
                esBorrador={esBorrador(course)}
                onClick={() =>
                  navigate(`/curso_iniciado/${course.id}`, {
                    state: { modoAdmin: true },
                  })
                }
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onArchivar={handleCursoArchivado}
                onEliminar={handleCursoEliminado}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeSubTab === "borradores" ? (
                <FileEdit className="text-gray-300" size={30} />
              ) : (
                <Search className="text-gray-300" size={30} />
              )}
            </div>
            <p className="text-gray-400 font-medium">
              {activeSubTab === "borradores"
                ? "No tienes borradores guardados"
                : activeSubTab === "archivados"
                  ? "No hay cursos archivados"
                  : "No se encontraron cursos."}
            </p>
          </div>
        )}

        {activeSubTab !== "previos" &&
          !loading &&
          cursosFiltrados.length > 0 && (
            <div className="mt-[25vh] flex items-center justify-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:text-indigo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "hover:text-indigo-600"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="hover:text-indigo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default CursoPage;

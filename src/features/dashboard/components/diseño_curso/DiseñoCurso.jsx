import {
  ChevronRight,
  MoreVertical,
  Edit,
  Copy,
  History,
  Trash2,
  Share2,
  Users,
  BookOpen,
  Trophy,
  Clock,
  Star,
  TrendingUp,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../components/gestor_documentos/notificaciones/Toast";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import { Bell } from "lucide-react";
import { User } from "lucide-react";
import { Info } from "lucide-react";
import ActionDropdown from "../../../../components/acciones/UserActions";
import { Layers } from "lucide-react";
import GestionContenidoCurso from "./gestion_curso/GestionContenidoCurso";
import Modal from "../../../../components/modal/PageModal";

export const CursoCard = ({
  data,
  esBorrador,
  onClick,
  onArchivar,
  onEliminar,
}) => {
  const [showIcons, setShowIcons] = useState(false);
  const navigate = useNavigate();
  const [duplicating, setDuplicating] = useState(false);
  const [toast, setToast] = useState(null);
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
  const [modalArchivarAbierto, setModalArchivarAbierto] = useState(false);
  const [archivando, setArchivando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  const instructores = data.instructoresParsed || [];
  const instructorPrincipal =
    instructores.find((i) => i.esInstructorPrincipal) || instructores[0];
  const otrosInstructores = instructores.filter(
    (i) => !i.esInstructorPrincipal,
  );

  const tags = [
    ...(data.caracteristicasQueAprendere?.split(",").slice(0, 2) || []),
    data.nombreDificultad,
    data.nombreLenguaje,
  ]
    .filter(Boolean)
    .slice(0, 3);

  const pctCompletados =
    data.totalInscritos > 0
      ? Math.round((data.totalCompletados / data.totalInscritos) * 100)
      : 0;

  const handleMouseEnter = () => setShowIcons(true);
  const handleMouseLeave = () => setShowIcons(false);

  const handleMenuItemClick = (e, action) => {
    e.stopPropagation();
    setShowIcons(false);
    switch (action) {
      case "settings":
        if (data.gestionId) {
          navigate(`/curso/${data.id}/gestion/${data.gestionId}/editar`);
        } else {
          navigate(`/gestion_curso/${data.id}`);
        }
        break;
      case "preview":
        navigate(`/calificaciones/${data.id}`);
        break;
      case "edit":
        navigate(`/curso/editar/${data.id}`);
        break;
      case "duplicate":
        handleDuplicar(e);
        break;
      case "share":
        handleCompartir(e);
        break;
      case "history":
        navigate(`/gestion_curso/${data.id}`);
        break;
      default:
        break;
    }
  };

  const accentColor = esBorrador ? "#F59E0B" : "#10B981";
  const accentLight = esBorrador ? "#FEF3C7" : "#ECFDF5";
  const accentText = esBorrador ? "#92400E" : "#065F46";

  const handleDuplicar = async (e) => {
    e.stopPropagation();
    setDuplicating(true);
    try {
      await serviceApiNet.Cursos.duplicate(data.id);
      showToast("Curso duplicado correctamente", "success");
    } catch {
      showToast("Error al duplicar el curso", "error");
    } finally {
      setDuplicating(false);
    }
  };

  const handleCompartir = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/intro_curso/${data.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => showToast("Enlace copiado al portapapeles", "success"))
      .catch(() => showToast("No se pudo copiar el enlace", "error"));
  };

  const handleArchivar = async (e) => {
    e?.stopPropagation();
    setArchivando(true);
    try {
      await serviceApiNet.Cursos.cambiarEstado(data.id, {
        adminId: 1, // reemplaza con el id del admin desde contexto/auth
        accion: "ARCHIVAR",
        motivo: "Archivado desde panel",
      });
      showToast("Curso archivado correctamente", "success");
      onArchivar?.(data.id); // notifica al padre para removerlo de la lista
    } catch {
      showToast("Error al archivar el curso", "error");
    } finally {
      setArchivando(false);
    }
  };

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await serviceApiNet.Cursos.eliminar(data.id, {
        adminId: 1,
        motivo: "Eliminado desde panel",
      });
      showToast("Curso eliminado correctamente", "success");
      setModalEliminarAbierto(false);
      onEliminar?.(data.id);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Error al eliminar el curso",
        "error",
      );
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative bg-white rounded-2xl overflow-visible flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${showIcons ? "z-40" : ""}`}
        style={{
          border: `1.5px solid ${esBorrador ? "#FDE68A" : "#D1FAE5"}`,
          boxShadow: showIcons
            ? `0 20px 40px -8px ${accentColor}30`
            : "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div className="relative aspect-video bg-slate-100 overflow-hidden rounded-t-2xl">
          <img
            src={data.image || `https://picsum.photos/seed/${data.id}/400/225`}
            alt={data.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${showIcons ? "brightness-50" : ""}`}
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${data.id}x/400/225`;
            }}
          />

          {showIcons && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 z-10">
              <button
                onClick={(e) => handleMenuItemClick(e, "preview")}
                className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                title="Ver calificaciones"
              >
                <svg
                  className="w-4 h-4 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => handleMenuItemClick(e, "settings")}
                className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                title={data.gestionId ? "Editar gestión" : "Crear gestión"}
              >
                <svg
                  className="w-4 h-4 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGestionAbierta(true);
                }}
                className="w-10 h-10 rounded-full bg-amber-400/95 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                title="Agregar recursos"
              >
                <Layers className="w-4 h-4 text-white" />
              </button>
              <ActionDropdown
                variant="card"
                title="Acciones"
                options={[
                  {
                    icon: <Layers className="w-4 h-4" />,
                    label: "Agregar recursos",
                    onClick: () => setGestionAbierta(true),
                  },
                  {
                    icon: <Edit className="w-4 h-4" />,
                    label: "Editar",
                    onClick: () => navigate(`/curso/editar/${data.id}`),
                  },
                  {
                    icon: duplicating ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    ),
                    label: duplicating ? "Duplicando..." : "Duplicar",
                    onClick: () =>
                      handleDuplicar({ stopPropagation: () => {} }),
                  },
                  {
                    icon: <History className="w-4 h-4" />,
                    label: "Ver historial",
                    onClick: () => navigate(`/gestion_curso/${data.id}`),
                  },
                  {
                    icon: <Share2 className="w-4 h-4" />,
                    label: "Compartir",
                    onClick: () =>
                      handleCompartir({ stopPropagation: () => {} }),
                  },
                  {
                    icon: archivando ? (
                      <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"
                        />
                      </svg>
                    ),
                    label: archivando ? (
                      "Archivando..."
                    ) : (
                      <span className="flex items-center gap-2">
                        Archivar
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wide">
                          Recomendado
                        </span>
                      </span>
                    ),
                    onClick: () => setModalArchivarAbierto(true),
                    className: "text-amber-600",
                  },
                  {
                    icon: <Trash2 className="w-4 h-4" />,
                    label: "Eliminar",
                    onClick: (e) => {
                      e?.stopPropagation?.();
                      setModalEliminarAbierto(true);
                    },
                    className: "text-red-500",
                  },
                ]}
              />
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {data.isNew && (
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow">
                NUEVO
              </span>
            )}
            {esBorrador && (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                <FileEdit size={9} /> BORRADOR
              </span>
            )}
            {data.reacreditacion && (
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow">
                REACRED.
              </span>
            )}
          </div>

          {data.nombreDificultad && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                {data.nombreDificultad}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {data.nombreLenguaje || "Español"}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {data.duracionCurso ? `${data.duracionCurso}h` : "—"}
              </span>
            </div>
            <h3 className="text-[11px] font-black leading-snug line-clamp-2 uppercase text-slate-800 tracking-tight">
              {data.title}
            </h3>
          </div>

          {instructorPrincipal && (
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black flex-shrink-0"
                style={{ background: accentColor }}
              >
                {instructorPrincipal.nombreInstructor?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-700 truncate leading-none">
                  {instructorPrincipal.nombreInstructor}
                </p>
                {otrosInstructores.length > 0 && (
                  <p className="text-[8px] text-slate-400 leading-none mt-0.5">
                    +{otrosInstructores.length} instructor
                    {otrosInstructores.length > 1 ? "es" : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            <StatPill
              icon={<Users size={9} />}
              value={data.totalInscritos ?? 0}
              label="Inscritos"
              color={accentColor}
            />
            <StatPill
              icon={<CheckCircle2 size={9} />}
              value={data.totalCompletados ?? 0}
              label="Completados"
              color="#10B981"
            />
            <StatPill
              icon={<BookOpen size={9} />}
              value={data.totalRecursos ?? 0}
              label="Recursos"
              color="#8B5CF6"
            />
            <StatPill
              icon={<Trophy size={9} />}
              value={
                data.calificacionPromedio != null
                  ? `${parseFloat(data.calificacionPromedio).toFixed(0)}`
                  : "—"
              }
              label="Cal. prom."
              color="#F59E0B"
            />
          </div>

          {data.totalInscritos > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  Completado
                </span>
                <span
                  className="text-[8px] font-black"
                  style={{ color: accentColor }}
                >
                  {pctCompletados}%
                </span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pctCompletados}%`,
                    background: accentColor,
                  }}
                />
              </div>
            </div>
          )}

          {data.progresoPromedio != null && data.progresoPromedio > 0 && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: accentLight }}
            >
              <TrendingUp size={10} style={{ color: accentColor }} />
              <span
                className="text-[9px] font-bold"
                style={{ color: accentText }}
              >
                {parseFloat(data.progresoPromedio).toFixed(1)}% avance promedio
              </span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-400 rounded uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {data.modulosParsed?.length > 0 && (
            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <BookOpen size={9} />
              <span className="font-bold">
                {data.modulosParsed.length} módulo
                {data.modulosParsed.length > 1 ? "s" : ""}:
              </span>
              <span className="truncate">
                {data.modulosParsed[0]?.moduloTitulo}
              </span>
            </div>
          )}

          <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {data.gestionesActivas > 0 && (
                <span className="flex items-center gap-0.5 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <Star size={7} className="fill-emerald-500" />
                  ACTIVO
                </span>
              )}
              {data.totalModulos > 0 && (
                <span className="text-[8px] font-bold text-slate-400">
                  {data.totalModulos} mód.
                </span>
              )}
            </div>
            <span
              className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
              style={{ color: accentColor }}
            >
              {esBorrador ? "EDITAR" : "VER"}
              <ChevronRight size={12} />
            </span>
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
      {modalEliminarAbierto && (
        <Modal
          isOpen={modalEliminarAbierto}
          onClose={() => !eliminando && setModalEliminarAbierto(false)}
          title="Eliminar curso"
          confirmText={eliminando ? "Eliminando..." : "Sí, eliminar"}
          cancelText="Cancelar"
          onConfirm={data.totalInscritos > 0 ? null : handleEliminar}
          showConfirm={data.totalInscritos === 0}
          variant="danger"
        >
          {data.totalInscritos > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-red-700">
                    No puedes eliminar este curso
                  </p>
                  <p className="text-[11px] text-red-500 mt-0.5">
                    Tiene{" "}
                    <span className="font-black">
                      {data.totalInscritos} alumno
                      {data.totalInscritos > 1 ? "s" : ""}
                    </span>{" "}
                    inscrito{data.totalInscritos > 1 ? "s" : ""}. Eliminar
                    podría perder su historial de progreso.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight">
                  {data.title}
                </p>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-xl">⭐</span>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-amber-700 uppercase tracking-wide">
                    Te recomendamos archivar
                  </p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    El curso quedará inactivo pero conservarás todo el historial
                    de tus alumnos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setModalEliminarAbierto(false);
                  setModalArchivarAbierto(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"
                  />
                </svg>
                Archivar en su lugar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-slate-700 font-bold text-sm">
                ¿Estás seguro de que deseas eliminar este curso?
              </p>
              <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight">
                  {data.title}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                <Trash2 size={13} className="text-red-500 shrink-0" />
                <p className="text-[11px] text-red-500 font-medium">
                  Esta acción es irreversible y no se puede deshacer.
                </p>
              </div>
            </div>
          )}
        </Modal>
      )}
      {modalArchivarAbierto && (
        <Modal
          isOpen={modalArchivarAbierto}
          onClose={() => !archivando && setModalArchivarAbierto(false)}
          title="Archivar curso"
          confirmText={archivando ? "Archivando..." : "Sí, archivar"}
          cancelText="Cancelar"
          onConfirm={async () => {
            await handleArchivar({ stopPropagation: () => {} });
            setModalArchivarAbierto(false);
          }}
          variant="success"
        >
          <div className="flex flex-col gap-4">
            {/* Badge recomendado */}
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-sm font-black text-amber-700 uppercase tracking-wide">
                  Opción recomendada
                </p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Archivar es reversible y conserva todo el historial de los
                  alumnos.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight">
                {data.title}
              </p>
            </div>

            {/* Comparación archivar vs eliminar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-700 uppercase mb-2 flex items-center gap-1">
                  ✓ Archivar
                </p>
                <ul className="space-y-1">
                  {[
                    "Reversible",
                    "Conserva historial",
                    "Alumnos protegidos",
                    "Sin pérdida de datos",
                  ].map((t) => (
                    <li
                      key={t}
                      className="text-[10px] text-emerald-700 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-2xl bg-red-50 border border-red-100">
                <p className="text-[10px] font-black text-red-700 uppercase mb-2 flex items-center gap-1">
                  ✗ Eliminar
                </p>
                <ul className="space-y-1">
                  {[
                    "Irreversible",
                    "Pierde historial",
                    "Puede fallar si hay inscritos",
                    "Sin recuperación",
                  ].map((t) => (
                    <li
                      key={t}
                      className="text-[10px] text-red-600 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              El curso quedará inactivo y podrás restaurarlo cuando lo
              necesites.
            </p>
          </div>
        </Modal>
      )}
      {gestionAbierta && (
        <GestionContenidoCurso
          cursoId={data.id}
          cursoNombre={data.title}
          modulos={data.modulosParsed || []}
          onClose={() => setGestionAbierta(false)}
        />
      )}
    </>
  );
};

const StatPill = ({ icon, value, label, color }) => (
  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
    <span style={{ color }}>{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-700 leading-none">
        {value}
      </p>
      <p className="text-[8px] text-slate-400 leading-none mt-0.5 truncate">
        {label}
      </p>
    </div>
  </div>
);

export const RegistroPrevioCard = ({ registro, onClick }) => {
  const imageUrl = registro.imagenPath
    ? registro.imagenPath
    : `https://picsum.photos/seed/reg${registro.previoId}/400/225`;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        border: "1.5px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={registro.nombreCurso}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/error${registro.previoId}/400/225`;
          }}
        />

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow">
            REGISTRO EXTERNO
          </span>
          {registro.recordatorio && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-1">
              <Bell size={9} /> RECORDATORIO
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
            <FileEdit size={10} /> Certificación
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {registro.duracionCurso ? "Carga Horaria" : "Registro"}
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              {registro.duracionCurso ? `${registro.duracionCurso}h` : "—"}
            </span>
          </div>
          <h3 className="text-[11px] font-black leading-snug line-clamp-2 uppercase text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
            {registro.nombreCurso}
          </h3>
        </div>

        {registro.descripcion && (
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
            {registro.descripcion}
          </p>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <User size={9} className="text-emerald-600" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-700 leading-none">
                {registro.instructorId ? `ID: ${registro.instructorId}` : "—"}
              </p>
              <p className="text-[8px] text-slate-400 leading-none mt-0.5 truncate">
                Instructor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <BookOpen size={9} className="text-blue-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-700 leading-none">
                Externo
              </p>
              <p className="text-[8px] text-slate-400 leading-none mt-0.5">
                Origen
              </p>
            </div>
          </div>
        </div>

        {registro.mensajeBienvenida && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
            <Info size={10} className="text-emerald-600" />
            <span className="text-[9px] font-bold text-emerald-800 truncate">
              "{registro.mensajeBienvenida}"
            </span>
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-0.5 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              REGISTRADO
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-emerald-600">
            DETALLES
            <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
};

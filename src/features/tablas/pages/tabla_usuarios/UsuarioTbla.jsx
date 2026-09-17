import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Hash,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info,
  List,
  LayoutGrid,
  RefreshCcw,
  MoreVertical,
  Users,
  UserCheck,
  UserMinus,
  FileUp,
  Download,
  Columns,
} from "lucide-react";
import { UserPlus } from "lucide-react";
import { FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateUsuario from "../../components/create_usuario/CreateUsuario";
import { getPaginationRange } from "../../components/tabla_usuarios_diseño/TablaUsuarioDiseño";
import ImportUsuarios from "./importar_usuario/ImportUsuarios ";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import UserActions from "../../../../components/acciones/UserActions";
import { Eye } from "lucide-react";
import { PencilLine } from "lucide-react";
import { KeyRound } from "lucide-react";
import { UserX } from "lucide-react";
import EditUsuario from "../../components/create_usuario/editar_usuario/EditUsuario";
import { EyeOff } from "lucide-react";
import Modal from "../../../../components/modal/PageModal";
import useGroqMotivation from "../../../dashboard/pages/interface_principal/ia_interactiva/useGroqMotivation ";

const columns = [
  { key: "name", label: "Usuario", icon: Users },
  { key: "role", label: "Rol", icon: UserCheck },
  { key: "ou", label: "Puesto", icon: Columns },
  { key: "permissions", label: "Permisos", icon: Info },
  { key: "leader", label: "Jefe", icon: UserMinus },
  { key: "status", label: "Estado", icon: RefreshCcw },
  { key: "razonSocial", label: "Empresa", icon: Hash },
];

const UsuarioTbla = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Todos");
  const itemsPerPage = 8;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const { avatarUrl, detectarGeneroYAvatar } = useGroqMotivation([]);
  const [avatarMap, setAvatarMap] = useState({});
  const [seleccionados, setSeleccionados] = useState([]);
  const [eliminandoLote, setEliminandoLote] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [resUsuarios, resRoles] = await Promise.all([
        serviceApiNet.Usuario.list(),
        serviceApiNet.Roles.list(),
      ]);

      const rawUsuarios =
        resUsuarios.data?.data ||
        resUsuarios.data?.$values ||
        resUsuarios.data ||
        [];
      const rawRoles =
        resRoles.data?.data || resRoles.data?.$values || resRoles.data || [];

      const rolesMap = {};
      rawRoles.forEach((rol) => {
        rolesMap[rol.rolId] = rol.nombreRol;
      });

      const datosFormateados = rawUsuarios.map((u) => ({
        id: u.usuarioId,
        avatar: u.imagenPortada,
        name: `${u.nombre || ""} ${u.apeLLido || ""}`.trim(),
        email: u.correo,
        razonSocial: u.razonSocial || "Sin empresa",
        role: u.rolId ? rolesMap[u.rolId] || `Rol #${u.rolId}` : "Sin Rol",
        ou: u.puesto || "Sin puesto",
        permissions: u.permisoNombre || "Sin permiso",
        leader: u.nombre_Jefe || "Sin jefe",
        status: u.activo ? "Activo" : "Desactivado",
        fecha: u.fechaCreacion,
      }));

      setData(datosFormateados);
    } catch (error) {
      console.error("Error al sincronizar usuarios y roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const generarAvatares = async () => {
      const nuevoMap = {};
      for (const user of data) {
        const nombre = user.name.split(" ")[0];
        if (nombre) {
          nuevoMap[user.id] =
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`;
        }
      }
      setAvatarMap(nuevoMap);
    };

    generarAvatares();
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = [...data];

    if (activeTab !== "Todos") {
      const statusTarget = activeTab === "Activos" ? "Activo" : "Desactivado";
      filtered = filtered.filter((user) => user.status === statusTarget);
    }

    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        [
          item.name,
          item.email,
          item.role,
          item.ou,
          item.permissions,
          item.leader,
        ].some((val) => String(val).toLowerCase().includes(low)),
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig, activeTab]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(firstPageIndex, firstPageIndex + itemsPerPage);
  }, [currentPage, processedData]);

  const handleView = (usuario) => {
    navigate(`/usuarios/${usuario.id}`);
  };

  const handleEdit = (usuario) => {
    setEditandoId(usuario.id);
  };

  const handleReset = (usuario) => {
    setConfirmModal({ tipo: "reset", usuario });
  };

  const handleDeactivate = (usuario) => {
    setConfirmModal({ tipo: "deactivate", usuario });
  };

  const handleDelete = (usuario) => {
    setConfirmModal({ tipo: "delete", usuario });
  };

  const getRowOptions = (usuario) => [
    {
      label: "Vista previa",
      icon: <Eye size={16} />,
      onClick: () => handleView(usuario),
    },
    {
      label: "Editar usuario",
      icon: <PencilLine size={16} />,
      onClick: () => handleEdit(usuario),
    },
    {
      label: "Restablecer contraseña",
      icon: <KeyRound size={16} />,
      onClick: () => handleReset(usuario),
    },
    {
      label:
        usuario.status === "Activo" ? "Desactivar usuario" : "Activar usuario",
      icon: <UserX size={16} />,
      className:
        usuario.status === "Activo"
          ? "text-red-600 hover:bg-red-50 border-t border-slate-100"
          : "text-emerald-600 hover:bg-emerald-50 border-t border-slate-100",
      onClick: () => handleDeactivate(usuario),
    },
    {
      label: "Eliminar usuario",
      icon: <UserX size={16} />,
      className: "text-rose-600 hover:bg-rose-50 border-t border-slate-100",
      onClick: () => handleDelete(usuario),
    },
  ];

  const ejecutarAccion = async () => {
    const { tipo, usuario, nuevaPassword } = confirmModal;

    try {
      if (tipo === "deleteLote") {
        await Promise.all(
          confirmModal.ids.map((id) => serviceApiNet.Usuario.delete(id)),
        );
        setSeleccionados([]);
        setConfirmModal(null);
        fetchData();
        return;
      }
      if (tipo === "reset") {
        const passwordAEnviar =
          nuevaPassword || `Temp${Math.random().toString(36).slice(-6)}#2026`;

        await serviceApiNet.Usuario.resetPassword(usuario.id, passwordAEnviar);

        alert(
          `✅ ¡Éxito!\nLa contraseña de ${usuario.name} ha sido actualizada.\n\nNueva clave: ${passwordAEnviar}`,
        );
      } else if (tipo === "deactivate") {
        await serviceApiNet.Usuario.toggleStatus(usuario.id);
        alert(`✅ Estado actualizado correctamente.`);
        fetchData();
      } else if (tipo === "delete") {
        await serviceApiNet.Usuario.delete(usuario.id);
        alert(`✅ Usuario eliminado correctamente.`);
        fetchData();
      }
    } catch (error) {
      const msg =
        error.response?.data?.mensaje || "Error al procesar la solicitud";
      alert(`❌ ${msg}`);
    } finally {
      setConfirmModal(null);
    }
  };

  const toggleSeleccion = (id) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const toggleSeleccionarTodos = () => {
    const idsPaginaActual = currentData.map((u) => u.id);
    const todosPaginaSeleccionados = idsPaginaActual.every((id) =>
      seleccionados.includes(id),
    );
    if (todosPaginaSeleccionados) {
      // Deselecciona solo los de esta página, conserva los de otras
      setSeleccionados((prev) =>
        prev.filter((id) => !idsPaginaActual.includes(id)),
      );
    } else {
      // Agrega los de esta página que falten, sin tocar los de otras
      setSeleccionados((prev) => [
        ...prev,
        ...idsPaginaActual.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  if (loading)
    return (
      <div className="flex inset-0 h-screen flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center mb-9">
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-indigo-500/10 animate-ping" />
          <div className="absolute h-20 w-20 rounded-full border-t-4 border-b-4 border-indigo-600 animate-[spin_2s_linear_infinite]" />
          <div className="relative p-4 bg-white rounded-full shadow-xl">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] animate-pulse">
            Cargando Usuarios
          </span>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2 text-center">
            Sincronizando con el servidor...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-gray-800">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Usuarios
          </h1>
          <button
            onClick={() => setIsImportOpen(true)}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-600"
          >
            <FileDown size={16} />
            Importar archivo
          </button>

          {isImportOpen && (
            <ImportUsuarios
              onClose={() => setIsImportOpen(false)}
              onImportSuccess={() => {
                fetchData();
              }}
            />
          )}
        </div>

        <div className="flex gap-8 border-b border-slate-200 mb-8">
          {[
            { name: "Todos", icon: Users, count: data.length },
            {
              name: "Activos",
              icon: UserCheck,
              count: data.filter((u) => u.status === "Activo").length,
            },
            {
              name: "Desactivados",
              icon: UserMinus,
              count: data.filter((u) => u.status === "Desactivado").length,
            },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setCurrentPage(1);
              }}
              className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
                activeTab === tab.name
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.name} ({tab.count})
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, rol, jefe o permisos..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <div className="bg-white border border-slate-200 p-1 rounded-2xl flex shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 rounded-xl transition ${viewMode === "table" ? "bg-slate-100 text-indigo-600 shadow-inner" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition ${viewMode === "grid" ? "bg-slate-100 text-indigo-600 shadow-inner" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
            <button
              onClick={fetchData}
              className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-pink-100">
              <FileUp size={20} />
              Exportar
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-[#E91E63] text-white rounded-2xl text-sm font-bold hover:bg-red-800 transition-all shadow-lg shadow-pink-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <UserPlus size={20} />
              Crear usuario
            </button>
            {isSidebarOpen && (
              <CreateUsuario
                onClose={() => setIsSidebarOpen(false)}
                onSuccess={() => {
                  fetchData();
                  setIsSidebarOpen(false);
                }}
              />
            )}
          </div>
        </div>

        {seleccionados.length > 0 && (
          <div className="flex items-center justify-between gap-4 px-5 py-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                {seleccionados.length}
              </div>
              <span className="text-sm font-bold text-indigo-800">
                {seleccionados.length === 1
                  ? "usuario seleccionado"
                  : "usuarios seleccionados"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSeleccionados([])}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-white border border-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  setConfirmModal({ tipo: "deleteLote", ids: seleccionados })
                }
                disabled={eliminandoLote}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {eliminandoLote ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <UserX size={14} /> Eliminar {seleccionados.length}{" "}
                    {seleccionados.length === 1 ? "usuario" : "usuarios"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {viewMode === "table" ? (
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 w-10">
                      <input
                        type="checkbox"
                        checked={
                          currentData.length > 0 &&
                          currentData.every((u) => seleccionados.includes(u.id))
                        }
                        onChange={toggleSeleccionarTodos}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
                      />
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() =>
                          setSortConfig({
                            key: col.key,
                            direction:
                              sortConfig.key === col.key &&
                              sortConfig.direction === "ascending"
                                ? "descending"
                                : "ascending",
                          })
                        }
                        className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition group"
                      >
                        <div className="flex items-center gap-2">
                          <col.icon size={14} className="opacity-50" />
                          {col.label}
                          {sortConfig.key === col.key &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            ))}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.map((user) => (
                    <tr
                      key={user.id}
                      className={`transition group ${seleccionados.includes(user.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/50"}`}
                    >
                      <td
                        className="px-6 py-5 w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(user.id)}
                          onChange={() => toggleSeleccion(user.id)}
                          className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-indigo-600"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                            <img
                              src={
                                user.avatar ||
                                avatarMap[user.id] ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                              }
                              alt={user.name}
                              onError={(e) => {
                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-indigo-500 font-medium">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.role === "Sin Rol"
                              ? "bg-slate-100 text-slate-400"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {user.ou === "Sin puesto" ? (
                          <span className="text-slate-300 italic text-xs">
                            Sin puesto
                          </span>
                        ) : (
                          user.ou
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.permissions === "Sin permiso"
                              ? "bg-slate-100 text-slate-400"
                              : user.permissions === "Administrador"
                                ? "bg-rose-50 text-rose-600"
                                : user.permissions === "Instructor"
                                  ? "bg-amber-50 text-amber-600"
                                  : user.permissions === "Colaborador"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user.permissions}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {user.leader === "Sin jefe" ? (
                          <span className="text-slate-300 italic text-xs">
                            Sin jefe
                          </span>
                        ) : (
                          <span className="text-slate-600">{user.leader}</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${
                            user.status === "Activo"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {user.razonSocial}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <UserActions
                          options={getRowOptions(user)}
                          title="Gestión"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentData.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt=""
                    />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      user.status === "Activo"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">
                  {user.name}
                </h3>
                <p className="text-[11px] text-indigo-500 font-medium mb-4 truncate">
                  {user.email}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Rol
                    </span>
                    <span
                      className={`text-xs font-semibold ${user.role === "Sin Rol" ? "text-slate-300 italic" : "text-slate-700"}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Permiso
                    </span>
                    <span
                      className={`text-xs font-semibold ${user.permissions === "Sin permiso" ? "text-slate-300 italic" : "text-slate-700"}`}
                    >
                      {user.permissions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Jefe
                    </span>
                    <span
                      className={`text-xs font-semibold ${user.leader === "Sin jefe" ? "text-slate-300 italic" : "text-slate-700"}`}
                    >
                      {user.leader}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-slate-50 hover:bg-indigo-600 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white border border-slate-100">
                  Ver Perfil
                </button>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Total:{" "}
            <span className="text-indigo-600">{processedData.length}</span>{" "}
            Usuarios encontrados
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((c) => c - 1)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm text-slate-600"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex gap-1">
              {getPaginationRange(currentPage, totalPages).map((page, i) => (
                <button
                  key={i}
                  onClick={() => page !== "..." && setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((c) => c + 1)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition shadow-sm text-slate-600"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </footer>
        {editandoId && (
          <EditUsuario
            usuarioId={editandoId}
            onClose={() => setEditandoId(null)}
            onSuccess={() => {
              setEditandoId(null);
              fetchData();
            }}
          />
        )}

        {confirmModal && (
          <Modal
            isOpen={!!confirmModal}
            onClose={() => setConfirmModal(null)}
            title={
              confirmModal.tipo === "deleteLote"
                ? `Eliminar ${confirmModal.ids?.length} usuarios`
                : confirmModal.tipo === "reset"
                  ? "Restablecer contraseña"
                  : confirmModal.tipo === "delete"
                    ? "Eliminar usuario"
                    : confirmModal.usuario?.status === "Activo"
                      ? "Desactivar usuario"
                      : "Activar usuario"
            }
            confirmText={
              confirmModal.tipo === "deleteLote"
                ? "Sí, eliminar todos"
                : confirmModal.tipo === "reset"
                  ? "Actualizar"
                  : confirmModal.tipo === "delete"
                    ? "Eliminar"
                    : confirmModal.usuario?.status === "Activo"
                      ? "Desactivar"
                      : "Activar"
            }
            onConfirm={ejecutarAccion}
            showConfirm={
              confirmModal.tipo === "reset"
                ? confirmModal.nuevaPassword?.length >= 8
                : true
            }
            variant={
              confirmModal.tipo === "deleteLote"
                ? "danger"
                : confirmModal.tipo === "reset"
                  ? "primary"
                  : confirmModal.tipo === "delete"
                    ? "danger"
                    : confirmModal.usuario?.status === "Activo"
                      ? "danger"
                      : "success"
            }
          >
            <div className="space-y-4">
              {confirmModal.tipo === "deleteLote" ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
                    <UserX className="text-rose-600" size={26} />
                  </div>
                  <p className="text-sm text-slate-500">
                    Estás a punto de eliminar permanentemente{" "}
                    <span className="font-bold text-rose-600">
                      {confirmModal.ids?.length} usuarios
                    </span>
                    . Esta acción no se puede deshacer.
                  </p>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                      ⚠ Acción irreversible
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      confirmModal.tipo === "reset"
                        ? "bg-amber-100"
                        : confirmModal.usuario?.status === "Activo"
                          ? "bg-rose-100"
                          : "bg-emerald-100"
                    }`}
                  >
                    {confirmModal.tipo === "reset" ? (
                      <KeyRound className="text-amber-600" size={26} />
                    ) : confirmModal.usuario?.status === "Activo" ? (
                      <UserX className="text-rose-600" size={26} />
                    ) : (
                      <UserCheck className="text-emerald-600" size={26} />
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    {confirmModal.tipo === "reset"
                      ? "Ingresa la nueva credencial para:"
                      : confirmModal.usuario?.status === "Activo"
                        ? "El usuario perderá acceso al sistema:"
                        : "El usuario recuperará acceso al sistema:"}
                  </p>

                  {confirmModal.tipo === "reset" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Nueva Contraseña
                          <span className="text-rose-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            autoFocus
                            autoComplete="new-password"
                            name="nueva-password-reset"
                            className={`w-full px-4 py-3 pr-24 border-2 rounded-xl outline-none transition-all duration-200 ${
                              confirmModal.touched &&
                              (!confirmModal.nuevaPassword ||
                                confirmModal.nuevaPassword.length < 8)
                                ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-rose-50/30"
                                : "border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            }`}
                            type={
                              confirmModal.showPassword ? "text" : "password"
                            }
                            value={confirmModal.nuevaPassword || ""}
                            onChange={(e) =>
                              setConfirmModal({
                                ...confirmModal,
                                nuevaPassword: e.target.value,
                                touched: true,
                              })
                            }
                            placeholder="Mínimo 8 caracteres"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const pass =
                                  Math.random().toString(36).slice(-8) +
                                  Math.random()
                                    .toString(36)
                                    .toUpperCase()
                                    .slice(-2) +
                                  "!";
                                setConfirmModal({
                                  ...confirmModal,
                                  nuevaPassword: pass,
                                  touched: true,
                                  showPassword: true,
                                });
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-500"
                              title="Generar automáticamente"
                            >
                              <RefreshCcw size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  ...confirmModal,
                                  showPassword: !confirmModal.showPassword,
                                })
                              }
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-500"
                            >
                              {confirmModal.showPassword ? (
                                <Eye size={16} />
                              ) : (
                                <EyeOff size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        {confirmModal.touched &&
                        (!confirmModal.nuevaPassword ||
                          confirmModal.nuevaPassword.length < 8) ? (
                          <div className="flex items-center gap-2 text-rose-600 text-xs font-medium animate-in fade-in">
                            <Info size={14} />
                            <span>Debe tener al menos 8 caracteres</span>
                          </div>
                        ) : confirmModal.nuevaPassword ? (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium animate-in fade-in">
                            <UserCheck size={14} />
                            <span>Contraseña lista para actualizar</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 ring-2 ring-white">
                        <img
                          src={
                            confirmModal.usuario?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${confirmModal.usuario?.name}`
                          }
                          alt="avatar"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {confirmModal.usuario?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {confirmModal.usuario?.email}
                        </p>
                      </div>
                      <span
                        className={`ml-auto px-2 py-1 rounded-lg text-[10px] font-bold ${
                          confirmModal.usuario?.status === "Activo"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {confirmModal.usuario?.status}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UsuarioTbla;

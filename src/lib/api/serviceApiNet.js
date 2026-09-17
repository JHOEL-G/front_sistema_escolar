import axios from "axios";
import keycloak from "../../features/auth/services/keycloakConfig";
import { getImpersonationState } from "../../components/perstectiva/ImpersonationProviderr";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiRequest.interceptors.request.use(
  async (config) => {
    try {
      await keycloak.updateToken(30);
      const token = keycloak.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const impersonatedUser = getImpersonationState();
      if (impersonatedUser?.keycloakId) {
        config.headers["X-Impersonate-User"] = impersonatedUser.keycloakId;
      }
    } catch (error) {
      console.error("❌ Error actualizando token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Error de respuesta:", error.response.data);
    } else if (error.request) {
      console.error("Sin respuesta del servidor");
    }
    return Promise.reject(error);
  },
);

const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const serviceApiNet = {
  Usuario: {
    getMe: async (signal) => {
      return apiRequest.get("/Usuario/me", { signal });
    },

    list: async (activo = null, signal) => {
      const params = activo !== null ? { activo } : {};
      return apiRequest.get("/Usuario", { params, signal });
    },

    getById: async (id, signal) => {
      return apiRequest.get(`/Usuario/${id}`, { signal });
    },

    create: async (usuarioData, signal) => {
      return apiRequest.post("/Usuario", usuarioData, { signal });
    },

    update: async (id, usuarioData, signal) => {
      if (usuarioData instanceof FormData) {
        return apiRequest.put(`/Usuario/${id}`, usuarioData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal,
        });
      }

      const formData = new FormData();
      const { nuevaImagen, ...datosUsuario } = usuarioData;
      formData.append("UsuarioData", JSON.stringify(datosUsuario));
      if (nuevaImagen && nuevaImagen instanceof File) {
        formData.append("imagen", nuevaImagen);
      }
      return apiRequest.put(`/Usuario/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      });
    },

    delete: async (id, signal) => {
      return apiRequest.delete(`/Usuario/${id}`, { signal });
    },
    toggleStatus: async (id, signal) => {
      return apiRequest.patch(`/Usuario/${id}/status`, {}, { signal });
    },
    resetPassword: async (id, nuevaPassword) => {
      return apiRequest.patch(`/Usuario/${id}/reset-password`, {
        nuevaPassword,
      });
    },
  },

  Puestos: {
    list: async (signal) => apiRequest.get("/Usuario/puestos", { signal }),
  },

  Jefes: {
    list: async (signal) => apiRequest.get("/Usuario/jefes", { signal }),
  },

  Keycloak: {
    getUsuarios: async (signal) => {
      return apiRequest.get("/Keycloak/usuarios", { signal });
    },

    getEstudiantesPorGrado: async (grado, grupo = null, signal) => {
      const params = grupo ? { grupo } : {};
      return apiRequest.get(`/Keycloak/estudiantes/${grado}`, {
        params,
        signal,
      });
    },

    getProfesoresPorDepartamento: async (departamento, signal) => {
      return apiRequest.get(`/Keycloak/profesores/${departamento}`, { signal });
    },

    buscarUsuarios: async (filtros, signal) => {
      return apiRequest.get("/Keycloak/buscar", {
        params: filtros,
        signal,
      });
    },
    syncFromKeycloak: async (signal) => {
      return apiRequest.post("/Keycloak/sincronizar", {}, { signal });
    },
    createUsuarioKeycloak: async (formData, signal) => {
      return apiRequest.post("/keycloak", formData, {
        signal,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },

  Roles: {
    list: async (signal) => {
      return apiRequest.get("/Rol", { signal });
    },

    getById: async (id, signal) => {
      return apiRequest.get(`/Rol/${id}`, { signal });
    },

    create: async (rolData, signal) => {
      return apiRequest.post("/Rol", rolData, { signal });
    },

    update: async (id, rolData, signal) => {
      return apiRequest.put(`/Rol/${id}`, rolData, { signal });
    },
  },

  Ous: {
    list: async (signal) => {
      return apiRequest.get("/Ou", { signal });
    },

    getById: async (id, signal) => {
      return apiRequest.get(`/Ou/${id}`, { signal });
    },

    create: async (ouData, signal) => {
      return apiRequest.post("/Ou", ouData, { signal });
    },

    update: async (id, ouData, signal) => {
      return apiRequest.put(`/Ou/${id}`, ouData, { signal });
    },
  },

  Propiedades: {
    list: async (signal) => apiRequest.get("/Propiedad", { signal }),
    getById: async (id, signal) =>
      apiRequest.get(`/Propiedad/${id}`, { signal }),
    create: async (propiedadData, signal) =>
      apiRequest.post("/Propiedad", propiedadData, { signal }),
    update: async (id, propiedadData, signal) =>
      apiRequest.put(`/Propiedad/${id}`, propiedadData, { signal }),
  },

  Cursos: {
    list: async (signal) => apiRequest.get("/Curso", { signal }),
    listAll: async (signal) =>
      apiRequest.get("/Curso?soloActivos=false", { signal }),
    getById: async (id, signal) => apiRequest.get(`/Curso/${id}`, { signal }),

    create: async (formData, signal) => {
      return apiRequest.post("/Curso", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
      });
    },

    update: async (id, cursoData, signal) => {
      return apiRequest.put(`/Curso/${id}`, cursoData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      });
    },
    duplicate: async (id, signal) =>
      apiRequest.post(`/Curso/${id}/duplicar`, {}, { signal }),
    agregarRecursos: async (
      cursoId,
      modulos,
      recursos,
      archivos = [],
      signal,
    ) => {
      const formData = new FormData();

      formData.append("modulosData", JSON.stringify(modulos));
      formData.append("recursosData", JSON.stringify(recursos));

      archivos.forEach((archivo) => {
        formData.append("archivosRecursos", archivo);
      });

      return apiRequest.post(`/Curso/${cursoId}/recursos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      });
    },

    actualizarPonderacion: async (
      cursoId,
      ponderaciones,
      calificacion = null,
      requisitoAvance = null,
      signal,
    ) => {
      return apiRequest.put(
        `/Curso/${cursoId}/ponderacion`,
        {
          ponderaciones,
          calificacion,
          requisitoAvance,
        },
        { signal },
      );
    },

    cambiarEstado: async (id, body, signal) =>
      apiRequest.patch(`/Curso/${id}/estado`, body, { signal }),

    eliminar: async (id, body, signal) =>
      apiRequest.delete(`/Curso/${id}`, { data: body, signal }),
  },

  RegistroPrevio: {
    list: async (signal) => {
      return apiRequest.get("/RegistroPrevio", { signal });
    },

    getById: async (id, signal) => {
      return apiRequest.get(`/RegistroPrevio/${id}`, { signal });
    },

    create: async (registroData, imagenFile, signal) => {
      const formData = new FormData();

      formData.append(
        "registroData",
        JSON.stringify({
          nombreCurso: registroData.nombreCurso,
          descripcion: registroData.descripcion,
          duracionCurso: registroData.duracionCurso,
          mensajeBienvenida: registroData.mensajeBienvenida,
          instructorId: registroData.instructorId,
          recordatorio: registroData.recordatorio,
        }),
      );

      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }

      return apiRequest.post("/RegistroPrevio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
      });
    },
  },

  Temas: {
    list: async (signal) => {
      return apiRequest.get("/Tema", { signal });
    },
    getById: async (id, signal) => {
      return apiRequest.get(`/Tema/${id}`, { signal });
    },
    create: async (temaData, signal) => {
      const formData = new FormData();

      formData.append(
        "temaData",
        JSON.stringify({
          nombreTema: temaData.nombreTema,
          descripcion: temaData.descripcion,
          creacionSubtema: temaData.creacionSubtema,
        }),
      );

      if (temaData.imagenPortada && temaData.imagenPortada instanceof File) {
        formData.append("imagen", temaData.imagenPortada);
      }

      return apiRequest.post("/Tema", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
      });
    },
    update: async (temaData, signal) => {
      const formData = new FormData();

      formData.append(
        "temaData",
        JSON.stringify({
          temaId: temaData.temaId,
          nombreTema: temaData.nombreTema,
          descripcion: temaData.descripcion,
          creacionSubtema: temaData.creacionSubtema,
          imagenPortada: temaData.imagenPortada,
        }),
      );

      if (temaData.nuevaImagen && temaData.nuevaImagen instanceof File) {
        formData.append("imagen", temaData.nuevaImagen);
      }

      return apiRequest.put("/Tema", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      });
    },
  },

  Recursos: {
    create: async (tipo, recursoData, signal) => {
      return apiRequest.post(`/RecursoModulo/${tipo}`, recursoData, { signal });
    },
  },

  Inscripcion: {
    crear: async (datos, signal) => {
      return apiRequest.post("/Inscripcion", datos, { signal });
    },
    getById: async (id) => {
      try {
        const response = await apiRequest.get(`/Inscripcion/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error en getById:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Error al obtener cursos",
          data: [],
        };
      }
    },
    getParticipantes: async (cursoId, filtros = {}, signal) => {
      return apiRequest.get(`/Inscripcion/participantes/${cursoId}`, {
        params: filtros,
        signal,
      });
    },
    getParticipantesConRecursos: async (cursoId, signal) => {
      return apiRequest.get(`/Inscripcion/participantes-recursos/${cursoId}`, {
        signal,
      });
    },
    registrarProgreso: async (datos, signal) => {
      return apiRequest.post("/Inscripcion/progreso", datos, { signal });
    },
    calificarRecurso: async (datos, signal) => {
      return apiRequest.post("/Inscripcion/calificar", datos, { signal });
    },
    getCalificaciones: async (cursoId, signal) => {
      return apiRequest.get(`/Inscripcion/calificaciones/${cursoId}`, {
        signal,
      });
    },
    obtenerProgreso: async (usuarioId, cursoId, signal) => {
      return apiRequest.get(`/Inscripcion/progreso/${usuarioId}/${cursoId}`, {
        signal,
      });
    },
    guardarRespuestas: async (datos, signal) => {
      try {
        const response = await apiRequest.post(
          "/Inscripcion/guardar-respuestas",
          datos,
          { signal },
        );
        return response.data;
      } catch (error) {
        console.error("Error en guardarRespuestas:", error);
        return {
          success: false,
          message: error.response?.data || "Error al guardar las respuestas",
        };
      }
    },
    verificar: (params) =>
      apiRequest.get(
        `/Inscripcion/verificar/${params.usuarioId}/${params.cursoId}`,
      ),
  },

  Preguntas: {
    crear: async (datos, signal) => {
      return apiRequest.post("/Pregunta", datos, { signal });
    },
    listar: async (signal) => {
      return apiRequest.get("/Pregunta", { signal });
    },
    listarPorBanco: async (bancoId, signal) => {
      return apiRequest.get(`/Pregunta/banco/${bancoId}`, { signal });
    },
    update: async (id, preguntaData, signal) => {
      return apiRequest.put(`/Pregunta/${id}`, preguntaData, { signal });
    },
  },

  GestionCursos: {
    CrearCurso: async (datos, signal) => {
      return apiRequest.post("/GestionCurso", datos, { signal });
    },
    list: async (signal) => {
      return apiRequest.get("/GestionCurso", { signal });
    },
    getById: async (id, signal) => {
      return apiRequest.get(`/GestionCurso/${id}`, { signal });
    },
    update: async (id, cursoData, signal) => {
      return apiRequest.put(
        "/GestionCurso",
        { ...cursoData, gestionCursoId: id },
        { signal },
      );
    },
  },

  RutaAprendizaje: {
    CrearRutaAprendizaje: async (datos, imagenFile, signal) => {
      const formData = new FormData();

      formData.append("rutaAprendizajeData", JSON.stringify(datos));

      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }

      return apiRequest.post("/RutaAprendizaje", formData, {
        signal,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    list: async (signal) => {
      return apiRequest.get("/RutaAprendizaje", { signal });
    },
    getParticipantes: async (rutaId, signal) => {
      return apiRequest.get(`/RutaAprendizaje/${rutaId}/participantes`, {
        signal,
      });
    },
    getByUsuario: async (usuarioId, signal) => {
      return apiRequest.get(`/RutaAprendizaje/usuario/${usuarioId}`, {
        signal,
      });
    },
    getById: async (id, signal) => {
      return apiRequest.get(`/RutaAprendizaje/${id}`, { signal });
    },
    update: async (id, datos, imagenFile, signal) => {
      const formData = new FormData();
      formData.append("rutaAprendizajeData", JSON.stringify(datos));
      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }
      return apiRequest.put(`/RutaAprendizaje/${id}`, formData, {
        signal,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },

  Documentos: {
    listPorCarpeta: async (exploradorId, signal) => {
      return apiRequest.get(`/Documento/${exploradorId}`, { signal });
    },
    create: async (documentoData, signal) => {
      return apiRequest.post("/Documento", documentoData, {
        signal,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    update: async (id, documentoData, signal) => {
      return apiRequest.put(`/Documento/${id}`, documentoData, { signal });
    },
    delete: async (id, signal) => {
      return apiRequest.delete(`/Documento/${id}`, { signal });
    },
  },

  Carpetas: {
    list: async (signal) => {
      return apiRequest.get("/GestionDocumento", { signal });
    },
    create: async (carpetaData, signal) => {
      return apiRequest.post("/GestionDocumento", carpetaData, { signal });
    },
    update: async (id, carpetaData, signal) => {
      return apiRequest.put(`/GestionDocumento/${id}`, carpetaData, { signal });
    },
    delete: async (id, signal) => {
      return apiRequest.delete(`/GestionDocumento/${id}`, { signal });
    },
  },

  Configuracion: {
    listarPorCategoria: async (categoria, signal) => {
      return apiRequest.get(`/ConfiguracionNotificaiones/${categoria}`, {
        signal,
      });
    },
    toggle: async (dto, signal) => {
      return apiRequest.put("/ConfiguracionNotificaiones/toggle", dto, {
        signal,
      });
    },
  },

  Formulario: {
    listar: async (signal) => {
      return apiRequest.get("/FormularioPlantilla", { signal });
    },
    crear: async (datos, signal) => {
      return apiRequest.post("/FormularioPlantilla", datos, { signal });
    },
    modificar: async (id, datos, signal) => {
      return apiRequest.put(`/FormularioPlantilla/${id}`, datos, { signal });
    },
    publicar: async (id, publicar = true, signal) => {
      return apiRequest.patch(
        `/FormularioPlantilla/${id}/publicar?publicar=${publicar}`,
        {},
        { signal },
      );
    },
    obtenerPorId: async (id, signal) => {
      return apiRequest.get(`/FormularioPlantilla/${id}`, { signal });
    },
    obtenerPorPublicId: async (uuid, signal) => {
      return apiRequest.get(`/FormularioPlantilla/public/${uuid}`, { signal });
    },
    guardarRespuestas: async (id, datos, signal) => {
      return apiRequest.post(`/FormularioPlantilla/${id}/respuestas`, datos, {
        signal,
      });
    },
    obtenerRespuestas: async (id, signal) => {
      return apiRequest.get(`/FormularioPlantilla/${id}/respuestas`, {
        signal,
      });
    },
    listarConRespuestas: async (signal) => {
      return apiRequest.get("/FormularioPlantilla/con-respuestas", { signal });
    },
    obtenerPorPublicId: async (uuid, signal) => {
      return apiPublic.get(`/FormularioPlantilla/public/${uuid}`, { signal });
    },
    guardarRespuestas: async (id, datos, signal) => {
      return apiPublic.post(`/FormularioPlantilla/${id}/respuestas`, datos, {
        signal,
      });
    },
  },

  Foro: {
    publicar: async (data, signal) =>
      apiRequest.post("/RecursoModulo/foro/publicar", data, { signal }),

    getPublicaciones: async (foroId, signal) =>
      apiRequest.get(`/RecursoModulo/foro/${foroId}/publicaciones`, { signal }),
  },

  Tarea: {
    entregar: async (formData, signal) =>
      apiRequest.post("/RecursoModulo/tarea/entregar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      }),

    getEntrega: async (tareaId, usuarioId, signal) =>
      apiRequest.get(`/RecursoModulo/tarea/${tareaId}/entrega/${usuarioId}`, {
        signal,
      }),
  },

  Evaluacion: {
    getRespuestasAlumno: async (evaluacionId, usuarioId, signal) =>
      apiRequest.get(
        `/Inscripcion/respuestas-alumno/${evaluacionId}/${usuarioId}`,
        { signal },
      ),
  },

  Notificaciones: {
    getMias: async (signal) => {
      return apiRequest.get("/Notificaciones/me", { signal });
    },
    marcarLeida: async (id, signal) => {
      return apiRequest.patch(`/Notificaciones/${id}/leer`, {}, { signal });
    },
    vaciar: async (signal) =>
      apiRequest.delete("/Notificaciones/vaciar", { signal }),
  },

  ModulosRecursos: {
    agregarModulosRecursos: async (cursoId, modulos, recursos, signal) => {
      return apiRequest.post(
        `/ModulosRecursos/agregar`,
        {
          cursoId,
          modulos,
          recursos,
        },
        { signal },
      );
    },
  },
};

export default serviceApiNet;

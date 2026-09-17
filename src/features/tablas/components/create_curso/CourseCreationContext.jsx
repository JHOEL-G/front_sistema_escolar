import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

const CourseCreationContext = createContext();

const ESTADO_INICIAL = {
    NombreCurso: '',
    HabilitarFechas: false,
    DificultadID: 'Básico',
    LenguajeID: 'Español',
    DescripcionCurso: '',
    PorQueInscribirme: '',
    RequisitoAvance: 100,
    TipoRetroalimentacion: 'Mostrar siempre',
    DuracionHoras: 0,
    MensajeBienvenida: '',
    UsarMensajePredeterminado: false,
    HabilitarReacreditacion: false,
    VigenciaMeses: 0,
    AutorId: 1,
    Caracteristicas: [],
    Modulos: [],
    Sesiones: [],
    instructorIds: [],
    imagen: null,
    video: null,
    Calificacion: null,
    CursoReacreditacionId: null,
    PeriodoVigencia: null,
};

const STORAGE_KEY = 'course_creation_data';
const CAMPOS_NO_SERIALIZABLES = ['imagen', 'video'];

export const sanitizeDataJson = (dataJson, recursoTipoId = null) => {
    if (!dataJson || typeof dataJson !== 'object') return {};
    const sanitized = {};
    for (const [key, value] of Object.entries(dataJson)) {

        if (recursoTipoId === 11 && (key === "Rubricas" || key === "Criterios" || key === "Calificaciones")) {
            sanitized[key] = value;
            continue;
        }

        if (recursoTipoId === 1 && key === "Preguntas" && Array.isArray(value)) {
            const validas = value.filter(p =>
                (p.TextoPregunta || "").trim() !== "" || (p.Opciones || []).length > 0
            );
            if (validas.length === 0) continue;
            sanitized[key] = validas.map(p => ({
                PreguntaVideoId: Number(p.PreguntaVideoId) || 0,
                TextoPregunta: String(p.TextoPregunta || ""),
                ImagenPregunta: p.ImagenPregunta || null,
                SegundoMarca: Math.floor(Number(p.SegundoMarca)) || 0,
                TipoPreguntaId: Number(p.TipoPreguntaId) || 1,
                PuntosValor: Number(p.PuntosValor) || 1,
                Activo: true,
                Opciones: (p.Opciones || []).map(o => ({
                    TextoOpcion: String(o.TextoOpcion || ""),
                    EsCorrecta: !!o.EsCorrecta,
                    ExplicacionORelacion: String(o.ExplicacionORelacion || ""),
                    ImagenOpcion: o.ImagenOpcion || null,
                }))
            }));
            continue;
        }

        if (recursoTipoId === 1 && key === "preguntas" && Array.isArray(value)) {
            if (sanitized["Preguntas"]) continue;
            const validas = value.filter(p =>
                (p.TextoPregunta || p.textoPregunta || "").trim() !== "" ||
                (p.Opciones || p.opciones || []).length > 0
            );
            if (validas.length === 0) continue;
            sanitized["Preguntas"] = validas.map(p => ({
                PreguntaVideoId: Number(p.PreguntaVideoId) || 0,
                TextoPregunta: String(p.TextoPregunta || p.textoPregunta || ""),
                ImagenPregunta: p.ImagenPregunta || p.imagenPregunta || null,
                SegundoMarca: 0,
                TipoPreguntaId: Number(p.TipoPreguntaId || p.tipoPreguntaId) || 1,
                PuntosValor: Number(p.PuntosValor || p.puntosValor) || 1,
                Activo: true,
                Opciones: (p.Opciones || p.opciones || []).map(o => ({
                    TextoOpcion: String(o.TextoOpcion || o.textoOpcion || ""),
                    EsCorrecta: !!(o.EsCorrecta ?? o.esCorrecta),
                    ExplicacionORelacion: String(o.ExplicacionORelacion || o.explicacionORelacion || ""),
                    ImagenOpcion: o.ImagenOpcion || o.imagenOpcion || null,
                }))
            }));
            continue;
        }

        if (key === "BancasPreguntas" && Array.isArray(value)) {
            sanitized[key] = value.map(b => ({
                bancaId: Number(b.bancaId || b.BancaId) || 0,
                cantidad: Number(b.cantidad || b.Cantidad) || 0,
            }));
            continue;
        }

        if (key === "Preguntas" && Array.isArray(value)) {
            if (recursoTipoId === 9) {
                sanitized[key] = value.map((p, pIdx) => ({
                    TextoPregunta: String(p.TextoPregunta || ""),
                    TipoPregunta: String(p.TipoPregunta || "OpcionMultiple"),
                    OrdenPregunta: Number(p.OrdenPregunta) || pIdx + 1,
                    LimiteRespuestas: Number(p.LimiteRespuestas) || 1,
                    Opciones: (p.Opciones || []).map((o, oIdx) => ({
                        TituloOpcion: String(o.TituloOpcion || ""),
                        TextoOpcion: String(o.TextoOpcion || ""),
                        OrdenOpcion: Number(o.OrdenOpcion) || oIdx + 1
                    }))
                }));
                continue;
            }
            sanitized[key] = value.map(p => ({
                PreguntaVideoId: Number(p.PreguntaVideoId) || 0,
                TextoPregunta: String(p.TextoPregunta || ""),
                ImagenPregunta: p.ImagenPregunta || null,
                SegundoMarca: Math.floor(Number(p.SegundoMarca)) || 0,
                TipoPreguntaId: Number(p.TipoPreguntaId) || 1,
                PuntosValor: Number(p.PuntosValor) || 1,
                Activo: true,
                Opciones: (p.Opciones || []).map(o => ({
                    TextoOpcion: String(o.TextoOpcion || ""),
                    EsCorrecta: !!o.EsCorrecta,
                    ExplicacionORelacion: String(o.ExplicacionORelacion || ""),
                    ImagenOpcion: o.ImagenOpcion || null,
                }))
            }));
            continue;
        }

        if (key === "AgregarPonderacion" || key === "PreguntasAleatorias") {
            sanitized[key] = value === 1 || value === true || value === "true";
            continue;
        }

        if (typeof value === "boolean") sanitized[key] = value;
        else if (typeof value === "string" && (value.toLowerCase() === "true" || value.toLowerCase() === "false"))
            sanitized[key] = value.toLowerCase() === "true";
        else if (Array.isArray(value))
            sanitized[key] = value.map(item => typeof item === 'object' && item !== null ? sanitizeDataJson(item, recursoTipoId) : item);
        else if (value !== null && typeof value === "object")
            sanitized[key] = sanitizeDataJson(value, recursoTipoId);
        else sanitized[key] = value;
    }
    return sanitized;
};

export function CourseCreationProvider({ children }) {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [courseData, setCourseData] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return ESTADO_INICIAL;
    });

    const [previaCourseData, setPreviaCourseData] = useState({
        courseName: '',
        courseDescription: '',
        coverImage: null,
        duracionHoras: null,
        mensajeBienvenida: '',
        instructorIds: [],
        habilitarReacreditacion: false
    });

    const limpiarBorrador = () => {
        localStorage.removeItem(STORAGE_KEY);
        setCourseData(ESTADO_INICIAL);
    };

    const updateCourseData = (newData) => {
        setCourseData(prev => {
            const updated = { ...prev, ...newData };
            try {
                const paraGuardar = { ...updated };
                CAMPOS_NO_SERIALIZABLES.forEach(campo => delete paraGuardar[campo]);
                paraGuardar.Modulos = (paraGuardar.Modulos || []).map(modulo => ({
                    ...modulo,
                    sesiones: (modulo.sesiones || []).map(sesion => ({
                        ...sesion,
                        archivoReal: null,
                        archivosImagenes: []
                    }))
                }));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(paraGuardar));
            } catch (e) { }
            return updated;
        });
    };

    const updatePreviaCourseData = (newData) => {
        setPreviaCourseData(prev => ({ ...prev, ...newData }));
    };

    const handleGuardarCursoCompleto = async (finalData) => {
        setIsSaving(true);
        try {
            const completeCourseData = { ...courseData, ...finalData };

            const queAprendere = completeCourseData.Caracteristicas?.find(c => c.tipo === 'aprender')?.descripcion || "";
            const habilidades = completeCourseData.Caracteristicas?.find(c => c.tipo === 'habilidad')?.descripcion || "";
            const requerimientos = completeCourseData.Caracteristicas?.find(c => c.tipo === 'requerimiento')?.descripcion || "";

            const formData = new FormData();

            const modulosMapeados = (completeCourseData.Modulos || []).map((modulo, idx) => ({
                orden: idx + 1,
                moduloTitulo: modulo.tituloModulo || 'Sin título',
                descripcion: modulo.descripcionModulo || 'Sin descripción',
            }));

            const recursosMapeados = [];
            (completeCourseData.Modulos || []).forEach((modulo, modIdx) => {
                (modulo.sesiones || []).forEach((recurso, recIdx) => {
                    const configuracionLimpia = sanitizeDataJson(recurso.configuracion || {}, recurso.tipoId);
                    if (recurso.tipoId === 2 && !configuracionLimpia.NombreForo)
                        configuracionLimpia.NombreForo = `Foro - ${modulo.tituloModulo || 'General'}`;
                    recursosMapeados.push({
                        moduloId: modIdx + 1,
                        recursoId: recurso.tipoId,
                        ordenRecurso: recIdx + 1,
                        titulo: recurso.tituloSesion || '',
                        descripcion: recurso.tituloSesion || '',
                        dataJson: configuracionLimpia,
                        moduloRecursoId: 0,
                        ponderacion: Number(recurso.ponderacion) || 0
                    });
                });
            });

            const cursoDTO = {
                nombreCurso: completeCourseData.NombreCurso || '',
                habilitarFechaCurso: !!completeCourseData.HabilitarFechas,
                dificultadId: Number(completeCourseData.DificultadID) || 1,
                lenguajeId: Number(completeCourseData.LenguajeID) || 1,
                descripcionCurso: completeCourseData.DescripcionCurso || '',
                caracteristicasQueAprendere: queAprendere || completeCourseData.PorQueInscribirme || '',
                caracteristicasHabilidades: habilidades || '',
                caracteristicasRequerimientos: requerimientos || '',
                avance: String(completeCourseData.RequisitoAvance || "100"),
                retroalimentacionId: 1,
                duracionCurso: String(completeCourseData.DuracionHoras || "0"),
                mensajeBienvenida: completeCourseData.MensajeBienvenida || '',
                instructorId: completeCourseData.instructorIds?.[0] || 1,
                instructorIds: completeCourseData.instructorIds || [1],
                reacreditacion: !!completeCourseData.HabilitarReacreditacion,
                estaPublicado: false,
                modulos: modulosMapeados,
                recursos: recursosMapeados,
                porQueInscribirmeCurso: completeCourseData.PorQueInscribirme || '',
                calificacion: completeCourseData.Calificacion || null,
                cursoReacreditacionId: completeCourseData.CursoReacreditacionId || null,
                periodoVigencia: completeCourseData.PeriodoVigencia ? Number(completeCourseData.PeriodoVigencia) : null,
            };

            formData.append('cursoData', JSON.stringify(cursoDTO));
            if (completeCourseData.imagen) formData.append('imagen', completeCourseData.imagen);
            if (completeCourseData.video) formData.append('video', completeCourseData.video);

            (completeCourseData.Modulos || []).forEach((modulo) => {
                modulo.sesiones?.forEach((sesion) => {
                    if (sesion.archivoReal instanceof File)
                        formData.append('archivoRecurso', sesion.archivoReal);
                    (sesion.archivosImagenes || []).forEach((file) => {
                        if (file instanceof File) formData.append('archivoRecurso', file);
                    });
                    (sesion.archivosReales || []).forEach((file) => {
                        if (file instanceof File) formData.append('archivoRecurso', file);
                    });
                });
            });

            const response = await serviceApiNet.Cursos.create(formData);

            if (response.data?.success) {
                limpiarBorrador();
                alert('✅ Curso creado');
                navigate('/curso/crear');
            } else {
                throw new Error(response.data?.message || 'Error al crear el curso');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGuardarRegistroPrevio = async (finalData) => {
        setIsSaving(true);
        try {
            const completePreviaData = { ...previaCourseData, ...finalData };
            const registroData = {
                nombreCurso: completePreviaData.courseName || '',
                descripcion: completePreviaData.courseDescription || '',
                duracionCurso: completePreviaData.duracionHoras ? String(completePreviaData.duracionHoras) : '',
                mensajeBienvenida: completePreviaData.mensajeBienvenida || '',
                instructorId: completePreviaData.instructorIds?.[0] ? Number(completePreviaData.instructorIds[0]) : 1,
                recordatorio: !!completePreviaData.habilitarReacreditacion
            };

            const response = await serviceApiNet.RegistroPrevio.create(registroData, completePreviaData.coverImage);
            if (response.data?.success) {
                alert('✅ ¡Registro previo creado exitosamente!');
                setPreviaCourseData({
                    courseName: '', courseDescription: '', coverImage: null,
                    duracionHoras: null, mensajeBienvenida: '', instructorIds: [],
                    habilitarReacreditacion: false
                });
                navigate('/curso/crear');
            } else {
                throw new Error(response.data?.message || 'Error al crear el registro');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CourseCreationContext.Provider value={{
            courseData,
            updateCourseData,
            previaCourseData,
            updatePreviaCourseData,
            isSaving,
            isEditing: false,
            limpiarBorrador,
            handleGuardarCursoCompleto,
            handleGuardarRegistroPrevio
        }}>
            {children}
        </CourseCreationContext.Provider>
    );
}

export const useCourseCreation = () => useContext(CourseCreationContext);
export { CourseCreationContext };
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { sanitizeDataJson } from './CourseCreationContext';

const CourseEditContext = createContext();

export function CourseEditProvider({ children }) {
    const navigate = useNavigate();
    const match = useMatch("/curso/editar/:id/*");
    const id = match?.params?.id;
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchCurso = async () => {
            setLoading(true);
            try {
                const response = await serviceApiNet.Cursos.getById(id);
                if (response.data?.success) {
                    const curso = response.data.data;

                    const modulosMapeados = await Promise.all(
                        (curso.modulos || []).map(async (modulo) => {
                            const sesiones = await Promise.all(
                                (curso.recursos || [])
                                    .filter(r => r.moduloId === modulo.moduloId)
                                    .sort((a, b) => a.ordenRecurso - b.ordenRecurso)
                                    .map(async (r) => {
                                        const cfg = r.dataJson || {};

                                        const cfgNormalizado = {
                                            ...cfg,
                                            Instrucciones: cfg.Instrucciones || cfg.instrucciones || null,
                                            Descripcion: cfg.Descripcion || cfg.descripcion || null,
                                            AgregarPonderacion: cfg.AgregarPonderacion ?? cfg.agregarPonderacion ?? false,
                                            PreguntasAleatorias: cfg.PreguntasAleatorias ?? cfg.preguntasAleatorias ?? false,
                                            TipoCalificacionId: cfg.TipoCalificacionId || cfg.tipoCalificacionId || 1,
                                            Oportunidades: cfg.Oportunidades ?? cfg.oportunidades ?? 0,
                                            PermitirReinicio: cfg.PermitirReinicio || cfg.permitirReinicio || null,
                                            PreguntasCorrectasAprobar: cfg.PreguntasCorrectasAprobar ?? cfg.preguntasCorrectasAprobar ?? 0,
                                            TiempoHoras: cfg.TiempoHoras ?? cfg.tiempoHoras ?? 0,
                                            TiempoMinutos: cfg.TiempoMinutos ?? cfg.tiempoMinutos ?? 0,
                                            Privacidad: cfg.Privacidad || cfg.privacidad || null,
                                            ArchivoPath: cfg.ArchivoPath || cfg.archivoPath || null,
                                            Preguntas: cfg.Preguntas || cfg.preguntas || [],
                                            BancasPreguntas: cfg.BancasPreguntas || cfg.bancasIds || [],
                                            NombreForo: cfg.NombreForo || cfg.nombreForo || null,
                                            NombreArchivo: cfg.NombreArchivo || cfg.nombreArchivo || null,
                                        };

                                        if (r.recursoId === 1 && cfgNormalizado.BancasPreguntas?.length > 0) {
                                            cfgNormalizado.BancasPreguntas = await Promise.all(
                                                cfgNormalizado.BancasPreguntas.map(async (b) => {
                                                    const bancaId = b.BancaId || b.bancaId;
                                                    let preguntas = [];
                                                    try {
                                                        const res = await serviceApiNet.Preguntas.listarPorBanco(bancaId);
                                                        preguntas = res.data?.data?.preguntas || [];
                                                    } catch (e) {
                                                        console.error(`Error cargando preguntas de banca ${bancaId}:`, e);
                                                    }
                                                    return {
                                                        bancaId,
                                                        cantidad: b.Cantidad || b.cantidad || preguntas.length,
                                                        nombreBanca: b.NombreBanca || b.nombreBanca || "",
                                                        totalPreguntas: preguntas.length,
                                                        preguntas
                                                    };
                                                })
                                            );
                                        }

                                        if (r.recursoId === 11) {
                                            const rubricasRaw = cfg.rubricas || cfg.Rubricas || [];
                                            cfgNormalizado.Rubricas = rubricasRaw.map((rub, rubricaIdx) => ({
                                                Nombre: rub.rubricaNombre || rub.Nombre || rub.nombre || "",
                                                Descripcion: rub.rubricaDescripcion || rub.Descripcion || rub.descripcion || null
                                            }));
                                            cfgNormalizado.Criterios = rubricasRaw.flatMap((rub, rubricaIdx) =>
                                                (rub.Criterios || rub.criterios || []).map((c, criterioIdx) => ({
                                                    RubricaOrden: rubricaIdx,
                                                    TituloCriterio: c.TituloCriterio || c.titulo || "",
                                                    Descripcion: c.criterioDescripcion || c.Descripcion || c.descripcion || null,
                                                    OrdenCriterio: criterioIdx
                                                }))
                                            );
                                            cfgNormalizado.Calificaciones = rubricasRaw.flatMap((rub, rubricaIdx) =>
                                                (rub.Criterios || rub.criterios || []).flatMap((c, criterioIdx) =>
                                                    (c.Calificaciones || c.calificaciones || []).map((cal, calIdx) => ({
                                                        RubricaOrden: rubricaIdx,
                                                        CriterioOrden: criterioIdx,
                                                        Nombre: cal.calificacionNombre || cal.Nombre || cal.nombre || "",
                                                        Puntos: cal.Puntos || cal.puntos || 0,
                                                        OrdenCalificacion: calIdx
                                                    }))
                                                )
                                            );
                                        }

                                        if (r.recursoId === 1) {
                                            const preguntasRaw = cfg.preguntas || cfg.Preguntas || [];
                                            const preguntasValidas = preguntasRaw.filter(p =>
                                                (p.TextoPregunta || p.textoPregunta || "").trim() !== "" ||
                                                (p.Opciones || p.opciones || []).length > 0
                                            );

                                            if (preguntasValidas.length > 0) {
                                                cfgNormalizado.Preguntas = preguntasValidas.map(p => ({
                                                    PreguntaVideoId: 0,
                                                    TextoPregunta: p.TextoPregunta || p.textoPregunta || "",
                                                    ImagenPregunta: p.ImagenPregunta || p.imagenPregunta || null,
                                                    SegundoMarca: 0,
                                                    TipoPreguntaId: p.TipoPreguntaId || p.tipoPreguntaId || 1,
                                                    PuntosValor: p.PuntosValor || p.puntosValor || 1,
                                                    Activo: true,
                                                    Opciones: (p.Opciones || p.opciones || []).map(o => ({
                                                        TextoOpcion: o.TextoOpcion || o.textoOpcion || "",
                                                        EsCorrecta: o.EsCorrecta ?? o.esCorrecta ?? false,
                                                        ExplicacionORelacion: o.ExplicacionORelacion || o.explicacionORelacion || "",
                                                        ImagenOpcion: o.ImagenOpcion || o.imagenOpcion || null,
                                                    }))
                                                }));
                                            } else {
                                                cfgNormalizado.Preguntas = [];
                                            }
                                        }

                                        return {
                                            id: crypto.randomUUID(),
                                            tituloSesion: r.titulo || '',
                                            tipoId: r.recursoId,
                                            configuracion: cfgNormalizado,
                                            duracion: "00:00",
                                            moduloRecursoId: r.moduloRecursoId,
                                            incluirEnPonderacion: cfgNormalizado.AgregarPonderacion ?? false,
                                            ponderacion: r.ponderacion ?? 0
                                        };
                                    })
                            );

                            return {
                                id: crypto.randomUUID(),
                                moduloIdReal: modulo.moduloId,
                                tituloModulo: modulo.moduloTitulo || '',
                                descripcionModulo: modulo.descripcion || '',
                                sesiones
                            };
                        })
                    );

                    setCourseData({
                        ...curso,
                        NombreCurso: curso.nombreCurso || '',
                        HabilitarFechas: !!curso.habilitarFechaCurso,
                        DificultadID: curso.dificultadId || 1,
                        LenguajeID: curso.lenguajeId || 1,
                        DescripcionCurso: curso.descripcionCurso || '',
                        DuracionHoras: curso.duracionCurso || 0,
                        RequisitoAvance: curso.avance || 100,
                        MensajeBienvenida: curso.mensajeBienvenida || '',
                        HabilitarReacreditacion: !!curso.reacreditacion,
                        imagen: curso.imagenPortadaPath,
                        video: curso.videoPromocionalPath,
                        PorQueInscribirme: curso.porQueInscribirmeCurso || '',
                        Calificacion: curso.calificacion || null,
                        CursoReacreditacionId: curso.cursoReacreditacionId || null,
                        PeriodoVigencia: curso.periodoVigencia || null,
                        Caracteristicas: [
                            {
                                tipo: 'aprender',
                                descripcion: typeof curso.caracteristicasQueAprendere === 'string'
                                    ? curso.caracteristicasQueAprendere.split(',').map(s => s.trim()).filter(Boolean)
                                    : curso.caracteristicasQueAprendere || []
                            },
                            {
                                tipo: 'habilidad',
                                descripcion: typeof curso.caracteristicasHabilidades === 'string'
                                    ? curso.caracteristicasHabilidades.split(',').map(s => s.trim()).filter(Boolean)
                                    : curso.caracteristicasHabilidades || []
                            },
                            {
                                tipo: 'requerimiento',
                                descripcion: typeof curso.caracteristicasRequerimientos === 'string'
                                    ? curso.caracteristicasRequerimientos.split(',').map(s => s.trim()).filter(Boolean)
                                    : curso.caracteristicasRequerimientos || []
                            }
                        ],
                        Modulos: modulosMapeados
                    });
                }
            } catch (error) {
                console.error("Error cargando curso:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCurso();
    }, [id]);

    const updateCourseData = (newData) => {
        setCourseData(prev => ({ ...prev, ...newData }));
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
                ...(modulo.moduloIdReal ? { moduloId: modulo.moduloIdReal } : {})
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
                        moduloRecursoId: recurso.moduloRecursoId ?? 0,
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
                estaPublicado: !!completeCourseData.estaPublicado,
                modulos: modulosMapeados,
                recursos: recursosMapeados,
                porQueInscribirmeCurso: completeCourseData.PorQueInscribirme || '',
                calificacion: completeCourseData.Calificacion || null,
                cursoReacreditacionId: completeCourseData.CursoReacreditacionId || null,
                periodoVigencia: completeCourseData.PeriodoVigencia ? Number(completeCourseData.PeriodoVigencia) : null,
            };

            formData.append('cursoData', JSON.stringify(cursoDTO));
            if (completeCourseData.imagen instanceof File)
                formData.append('imagen', completeCourseData.imagen);

            if (completeCourseData.video instanceof File)
                formData.append('video', completeCourseData.video);

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

            const response = await serviceApiNet.Cursos.update(id, formData);

            if (response.data?.success) {
                alert('✅ Curso actualizado');
                navigate('/curso/crear');
            } else {
                throw new Error(response.data?.message || 'Error al actualizar el curso');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CourseEditContext.Provider value={{
            courseData,
            updateCourseData,
            isSaving,
            loading,
            isEditing: true,
            id,
            handleGuardarCursoCompleto
        }}>
            {children}
        </CourseEditContext.Provider>
    );
}

export const useCourseEdit = () => useContext(CourseEditContext);
export { CourseEditContext };

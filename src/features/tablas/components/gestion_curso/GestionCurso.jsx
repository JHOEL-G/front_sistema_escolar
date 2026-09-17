import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import GestionTemas from './crear_gestion_curso/GestionTemas';
import PrivacyScreen from './crear_gestion_curso/PrivacyScreen';
import ParticipantsScreen from './crear_gestion_curso/ParticipantsScreen';
import EvaluadoresScreen from './crear_gestion_curso/EvaluadoresScreen';
import ConfiguracionScreen from './crear_gestion_curso/ConfiguracionScreen';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

export default function GestionCurso() {
    const navigate = useNavigate();
    const { cursoId, gestionId } = useParams();
    const isEditMode = Boolean(gestionId);
    const [dataLoaded, setDataLoaded] = useState(!isEditMode);
    const [screen, setScreen] = useState('temas');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
    const [participantesOriginales, setParticipantesOriginales] = useState([]);

    const [courseData, setCourseData] = useState({
        cursoId: parseInt(cursoId) || 0,
        gestionId: parseInt(gestionId) || 0,
        nombreCurso: '',
        privacidad: 'Privado',
        inscripcionAutomatica: false,
        permitirDesinscripcion: false,
        gamificacion: false,
        creadoPor: 1,
        temas: [],
        participantes: [],
        evaluadores: [],
        criterios: [],
        visibilidad: [],
    });

    useEffect(() => {
        if (!isEditMode) return;

        const cargarGestion = async () => {
            try {
                setIsLoadingEdit(true);
                const response = await serviceApiNet.GestionCursos.getById(gestionId);
                const rawData = response.data?.data || response.data;
                const data = Array.isArray(rawData) ? rawData[0] : rawData;

                const participantesCargados = (data.participantes || []).map((p) =>
                    typeof p === 'object' ? p.usuarioId ?? p : p
                );

                setCourseData({
                    cursoId: data.cursoId ?? parseInt(cursoId) ?? 0,
                    gestionId: parseInt(gestionId),
                    nombreCurso: data.nombreCurso || '',
                    privacidad: data.privacidad || 'Privado',
                    inscripcionAutomatica: data.inscripcionAutomatica ?? false,
                    permitirDesinscripcion: data.permitirDesinscripcion ?? false,
                    gamificacion: data.gamificacion ?? false,
                    creadoPor: data.creadoPor ?? 1,

                    temas: (data.temas || []).map((t) => ({
                        temaId: t.temaId,
                        nombreTema: t.nombreTema || '',
                        orden: t.orden,
                        subtemas: t.subtemas || []
                    })),

                    participantes: participantesCargados,

                    evaluadores: (data.evaluadores || []).map((e) =>
                        typeof e === 'object' ? e.usuarioId ?? e : e
                    ),

                    criterios: (data.criterios || []).map((c) => ({
                        tipoCriterio: c.tipoCriterio,
                        organizationalUnitId: c.organizationalUnitId || null,
                        propiedadId: c.propiedadId || null,
                        valorPropiedad: c.valorPropiedad || null,
                        operadorLogico: c.operadorLogico || 'Y'
                    })),

                    visibilidad: (data.visibilidad || []).map((v) => ({
                        tipoGrupo: v.tipoGrupo,
                        grupoId: v.grupoId
                    })),
                });

                setParticipantesOriginales(participantesCargados);

                setDataLoaded(true);
            } catch (error) {
                console.error('❌ Error al cargar gestión para edición:', error);
                toast.error('No se pudo cargar la gestión. Verifica que existe.');
                navigate('/curso');
            } finally {
                setIsLoadingEdit(false);
            }
        };

        cargarGestion();
    }, [gestionId]);

    const updateCourseData = (newData) => {
        setCourseData((prev) => ({ ...prev, ...newData }));
    };

    const navigateTo = (screenName) => setScreen(screenName);

    const handleGuardarCursoCompleto = async () => {
        setIsSaving(true);
        try {
            if (!courseData.nombreCurso?.trim()) {
                toast.error('El nombre del curso es requerido');
                return;
            }
            if (courseData.temas.length === 0) {
                toast.error('Debe seleccionar al menos un tema');
                return;
            }
            if (courseData.inscripcionAutomatica && courseData.criterios.length === 0) {
                toast.error('Debe definir al menos un criterio para inscripción automática');
                return;
            }

            const datosParaEnviar = {
                cursoId: courseData.cursoId,
                nombreCurso: courseData.nombreCurso,
                privacidad: courseData.privacidad,
                inscripcionAutomatica: courseData.inscripcionAutomatica,
                permitirDesinscripcion: courseData.permitirDesinscripcion,
                gamificacion: courseData.gamificacion,
                creadoPor: courseData.creadoPor,
                temas: courseData.temas.map((t, index) => ({
                    temaId: t.temaId,
                    orden: t.orden ?? index + 1
                })),
                participantes: courseData.participantes,
                evaluadores: courseData.evaluadores,
                criterios: courseData.criterios.map((c) => ({
                    tipoCriterio: c.tipoCriterio,
                    organizationalUnitId: c.organizationalUnitId || null,
                    propiedadId: c.propiedadId || null,
                    valorPropiedad: c.valorPropiedad || null,
                    operadorLogico: c.operadorLogico || 'Y'
                })),
                visibilidad: (courseData.visibilidad || []).map((v) => ({
                    tipoGrupo: v.tipoGrupo,
                    grupoId: v.grupoId
                })),
            };

            let response;
            if (isEditMode) {
                response = await serviceApiNet.GestionCursos.update(gestionId, datosParaEnviar);
            } else {
                response = await serviceApiNet.GestionCursos.CrearCurso(datosParaEnviar);
            }

            const gestionGuardada = response.data?.data;
            const gestionCursoId =
                gestionGuardada?.gestionCursoId ??
                gestionGuardada?.id ??
                (isEditMode ? parseInt(gestionId) : null);

            const participantesAInscribir = isEditMode
                ? courseData.participantes.filter(id => !participantesOriginales.includes(id))
                : courseData.participantes;

            if (participantesAInscribir.length > 0 && gestionCursoId) {
                const resultados = await Promise.allSettled(
                    participantesAInscribir.map(usuarioId =>
                        serviceApiNet.Inscripcion.crear({
                            gestionCursoId,
                            cursoId: courseData.cursoId,
                            usuarioId,
                        })
                    )
                );

                const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
                const fallidos = resultados.filter(r => r.status === 'rejected');
                fallidos.forEach(f => console.warn('⚠️ Inscripción fallida:', f.reason?.response?.data));

                if (fallidos.length > 0) {
                    toast.warning(`Gestión guardada. ${exitosos} inscritos, ${fallidos.length} no pudieron inscribirse.`);
                } else {
                    toast.success(`Gestión guardada. ${exitosos} participante${exitosos !== 1 ? 's' : ''} inscrito${exitosos !== 1 ? 's' : ''} exitosamente.`);
                }
            } else {
                toast.success(response.data?.mensaje || (isEditMode ? 'Gestión actualizada exitosamente' : 'Gestión creada exitosamente'));
            }

            setTimeout(() => navigate('/curso'), 1500);

        } catch (error) {
            console.error('❌ Error al guardar gestión:', error);
            const errorMessage =
                error.response?.data?.mensaje ||
                error.response?.data?.message ||
                (isEditMode ? 'Error al actualizar la gestión del curso' : 'Error al crear la gestión del curso');
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        const mensaje = isEditMode
            ? '¿Estás seguro de cancelar? Los cambios no guardados se perderán.'
            : '¿Estás seguro de cancelar? Se perderán todos los datos.';
        if (window.confirm(mensaje)) navigate('/curso');
    };

    if (isLoadingEdit) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Cargando gestión para edición...
                </p>
            </div>
        );
    }

    switch (screen) {
        case 'temas':
            return (
                <GestionTemas
                    key={dataLoaded ? 'loaded' : 'loading'}
                    initialData={courseData}
                    cursoId={courseData.cursoId}
                    isEditMode={isEditMode}
                    onNext={(data) => { updateCourseData(data); navigateTo('privacidad'); }}
                    onCancel={handleCancel}
                />
            );
        case 'privacidad':
            return (
                <PrivacyScreen
                    key={dataLoaded ? 'loaded' : 'loading'}
                    initialData={courseData}
                    isEditMode={isEditMode}
                    onNext={(data) => { updateCourseData(data); navigateTo('participantes'); }}
                    onBack={() => navigateTo('temas')}
                />
            );
        case 'participantes':
            return (
                <ParticipantsScreen
                    key={dataLoaded ? 'loaded' : 'loading'}
                    initialData={courseData}
                    isEditMode={isEditMode}
                    onNext={(data) => { updateCourseData(data); navigateTo('evaluadores'); }}
                    onBack={() => navigateTo('privacidad')}
                />
            );
        case 'evaluadores':
            return (
                <EvaluadoresScreen
                    key={dataLoaded ? 'loaded' : 'loading'}
                    initialData={courseData}
                    isEditMode={isEditMode}
                    onNext={(data) => { updateCourseData(data); navigateTo('configuracion'); }}
                    onBack={() => navigateTo('participantes')}
                />
            );
        case 'configuracion':
            return (
                <ConfiguracionScreen
                    key={dataLoaded ? 'loaded' : 'loading'}
                    courseData={courseData}
                    updateCourseData={updateCourseData}
                    isEditMode={isEditMode}
                    onBack={() => navigateTo('evaluadores')}
                    onComplete={handleGuardarCursoCompleto}
                    isSaving={isSaving}
                />
            );
        default:
            return (
                <div className="text-center p-4">
                    <p>Pantalla no encontrada</p>
                    <button onClick={() => navigateTo('temas')} className="btn btn-primary mt-4">
                        Volver al inicio
                    </button>
                </div>
            );
    }
}
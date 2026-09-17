import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';

export const EditarRutaContext = createContext(null);

export function useEditarRutaContext() {
    return useContext(EditarRutaContext);
}

export default function EditarRutaAprendizaje() {
    const navigate = useNavigate();
    const { rutaId } = useParams();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [rutaData, setRutaData] = useState({
        nombreRuta: '',
        descripcion: '',
        imagenPortada: null,
        imagenFile: null,
        nombrePrivacidad: 'Privado',
        externo: false,
        uosPrivacidad: [],
        asignarFecha: null,
        asignarDia: null,
        fechaLimite: false,
        secciones: [],
        inscripcionAutomatica: [],
        propiedadesId: null,
        permiteDesinscripcion: false,
        condicionAvanceCurso: false,
        condicionAvanceSeccion: false,
        criterioAprobacion: '80',
        nombreCertificado: '',
        gamificacion: null,
        mensajeBienvenida: '',
        seleccionados: [],
        participantesSeleccionados: [],
        certificadores: [],
    });

    useEffect(() => {
        const fetchRuta = async () => {
            try {
                setIsLoading(true);
                const res = await serviceApiNet.RutaAprendizaje.getById(rutaId);
                const data = res.data?.data;

                if (!data) {
                    toast.error('No se encontró la ruta');
                    navigate('/ruta_aprendizaje');
                    return;
                }

                setRutaData(prev => ({
                    ...prev,
                    nombreRuta: data.nombreRuta || '',
                    descripcion: data.descripcion || '',
                    imagenPortada: data.imagenPortada || null,
                    nombrePrivacidad: data.nombrePrivacidad || 'Privado',
                    externo: data.externo || false,
                    asignarFecha: data.asignarFecha || null,
                    asignarDia: data.asignarDia || null,
                    fechaLimite: data.fechaLimite || false,
                    propiedadesId: data.propiedadesId || null,
                    permiteDesinscripcion: data.permiteDesinscripcion || false,
                    nombreCertificado: data.nombreCertificado || '',
                    condicionAvanceCurso: data.condicionAvanceCurso || false,
                    condicionAvanceSeccion: data.condicionAvanceSeccion || false,
                    criterioAprobacion: data.criterioAprobacion || '80',
                    gamificacion: data.gamificacion || null,
                    mensajeBienvenida: data.mensajeBienvenida || '',

                    secciones: (data.secciones || []).map(s => ({
                        seccionId: s.seccionId,
                        nombreSeccion: s.nombreSeccion,
                        orden: s.orden,
                        cursos: (s.cursos || []).map(c => ({
                            cursoId: c.cursoId,
                            nombreCurso: c.nombreCurso,
                            descripcionCurso: c.descripcionCurso,
                            imagenCurso: c.imagenCurso,
                            ordenCurso: c.ordenCurso
                        }))
                    })),

                    inscripcionAutomatica: [
                        ...(data.uosInscripcionIds?.split(',').filter(Boolean).map(id => ({ id: parseInt(id), tipo: 'ou' })) || []),
                        ...(data.rolesInscripcionIds?.split(',').filter(Boolean).map(id => ({ id: parseInt(id), tipo: 'rol' })) || []),
                    ],
                    seleccionados: [
                        ...(data.uosPrivacidadIds?.split(',').filter(Boolean).map(id => ({ id: parseInt(id), tipo: 'ou' })) || []),
                        ...(data.rolesPrivacidadIds?.split(',').filter(Boolean).map(id => ({ id: parseInt(id), tipo: 'rol' })) || []),
                        ...(data.propiedadesPrivacidadIds?.split(',').filter(Boolean).map(id => ({ id: parseInt(id), tipo: 'propiedad' })) || []),
                    ],
                    certificadores: (data.certificadores || []).map(c => ({
                        id: c.usuarioId,
                        nombre: c.nombreCompleto,
                        area: c.area || 'Sin área',
                        iniciales: c.iniciales || '',
                        email: c.email,
                    })),
                }));
            } catch (error) {
                toast.error('Error al cargar la ruta');
                navigate('/ruta_aprendizaje');
            } finally {
                setIsLoading(false);
            }
        };

        if (rutaId) fetchRuta();
    }, [rutaId]);

    const updateRutaData = (newData) => {
        setRutaData(prev => ({ ...prev, ...newData }));
    };

    const handleGuardarRutaCompleta = async (datosUltimoPaso = {}) => {
        setIsSaving(true);
        try {
            const datosFinales = { ...rutaData, ...datosUltimoPaso };

            if (!datosFinales.nombreRuta?.trim()) {
                toast.error('El nombre de la ruta es requerido');
                return;
            }
            if (!datosFinales.nombreCertificado?.trim()) {
                toast.error('Debe seleccionar un certificado');
                return;
            }

            const rolesSeleccionados = (datosFinales.seleccionados || []).filter(s => s.tipo === 'rol');
            const ousSeleccionadas = (datosFinales.seleccionados || []).filter(s => s.tipo === 'ou');

            const datosParaEnviar = {
                nombreRuta: datosFinales.nombreRuta,
                descripcion: datosFinales.descripcion,
                imagenPortada: datosFinales.imagenPortada,
                nombrePrivacidad: datosFinales.nombrePrivacidad,
                externo: datosFinales.externo,
                uOsPrivacidad: datosFinales.uosPrivacidad || [],
                asignarFecha: datosFinales.asignarFecha,
                asignarDia: datosFinales.asignarDia,
                fechaLimite: datosFinales.fechaLimite,
                secciones: (datosFinales.secciones || []).map(s => ({
                    nombreSeccion: s.nombreSeccion,
                    orden: s.orden,
                    cursoIds: (s.cursos || []).map(c => c.cursoId)
                })),
                seleccionadosPrivacidad: (datosFinales.seleccionados || []).map(s => ({
                    id: s.id,
                    tipo: s.tipo
                })),
                inscripcionAutomatica: (datosFinales.inscripcionAutomatica || []).map(s => ({
                    id: s.id,
                    tipo: s.tipo
                })),
                rolesId: rolesSeleccionados[0]?.id ?? null,
                uoId: ousSeleccionadas[0]?.id ?? null,
                propiedadesId: datosFinales.propiedadesId || null,
                permiteDesinscripcion: datosFinales.permiteDesinscripcion,
                nombreCertificado: datosFinales.nombreCertificado,
                condicionAvanceCurso: datosFinales.condicionAvanceCurso,
                condicionAvanceSeccion: datosFinales.condicionAvanceSeccion,
                criterioAprobacion: String(datosFinales.criterioAprobacion || '80'),
                gamificacion: datosFinales.gamificacion != null ? String(datosFinales.gamificacion) : null,
                mensajeBienvenida: datosFinales.mensajeBienvenida,
                participantes: (datosFinales.participantesSeleccionados || []).map(p => p.id),
                certificadores: (datosFinales.certificadores || []).map(c => c.id),
            };
            const response = await serviceApiNet.RutaAprendizaje.update(
                rutaId,
                datosParaEnviar,
                datosFinales.imagenFile
            );

            toast.success(response.data?.mensaje || 'Ruta actualizada exitosamente');
            setTimeout(() => navigate('/ruta_aprendizaje'), 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.mensaje
                || error.response?.data?.message
                || 'Error al actualizar la ruta';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Estás seguro de cancelar? Se perderán los cambios.')) {
            navigate('/ruta_aprendizaje');
        }
    };

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <EditarRutaContext.Provider value={{
            rutaData,
            updateRutaData,
            isSaving,
            isEditing: true,
            rutaId,
            handleGuardarRutaCompleta,
            handleCancel
        }}>
            <Outlet />
        </EditarRutaContext.Provider>
    );
}
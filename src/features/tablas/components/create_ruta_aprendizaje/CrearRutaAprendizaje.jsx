import React, { createContext, useContext, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

export const RutaContext = createContext(null);

export function useRutaContext() {
    return useContext(RutaContext);
}

export default function CrearRutaAprendizaje() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

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
        participantesSeleccionados: [],
        certificadores: [],
    });

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
            const response = await serviceApiNet.RutaAprendizaje.CrearRutaAprendizaje(
                datosParaEnviar,
                datosFinales.imagenFile
            );

            toast.success(response.data?.mensaje || 'Ruta de aprendizaje creada exitosamente');
            setTimeout(() => navigate('/ruta_aprendizaje'), 1500);
        } catch (error) {
            console.error('❌ Error al crear ruta:', error);
            const errorMessage = error.response?.data?.mensaje
                || error.response?.data?.message
                || 'Error al crear la ruta de aprendizaje';
            toast.error(errorMessage);
            console.error('❌ Error completo:', error);
            console.error('❌ Response data:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            toast.error(
                error.response?.data?.mensaje ||
                error.response?.data?.message ||
                error.message ||
                'Error al crear la ruta de aprendizaje'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Estás seguro de cancelar? Se perderán todos los datos.')) {
            navigate('/ruta_aprendizaje');
        }
    };

    return (
        <RutaContext.Provider value={{
            rutaData,
            updateRutaData,
            isSaving,
            handleGuardarRutaCompleta,
            handleCancel
        }}>
            <Outlet />
        </RutaContext.Provider>
    );
}
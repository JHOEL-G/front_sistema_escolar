import { useMemo, useState, useEffect } from 'react';
import keycloak from '../services/keycloakConfig';
import serviceApiNet from '../../../lib/api/serviceApiNet';
import { useImpersonation } from '../../../components/perstectiva/ImpersonationProviderr';

export const usePermissions = () => {
    const { impersonatedUser, usuarioReal, setUsuarioReal } = useImpersonation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                if (keycloak.authenticated) {
                    const resultado = await serviceApiNet.Usuario.getMe();
                    setUsuarioReal(resultado.data);
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarUsuario();
    }, []);

    const usuario = impersonatedUser ?? usuarioReal;

    const isAdministradorReal = useMemo(() => usuarioReal?.nivelPermisoId === 1, [usuarioReal]);

    const keycloakRoles = useMemo(() => {
        if (!keycloak.authenticated || !keycloak.tokenParsed) return [];
        return keycloak.tokenParsed.realm_access?.roles || [];
    }, []);

    const isAdministrador = useMemo(() => usuario?.nivelPermisoId === 1, [usuario]);
    const isInstructor = useMemo(() => usuario?.nivelPermisoId === 2, [usuario]);
    const isColaborador = useMemo(() => usuario?.nivelPermisoId === 3, [usuario]);
    const isLite = useMemo(() => usuario?.nivelPermisoId === 4, [usuario]);

    const hasAnyPermission = (...permisoIds) => permisoIds.includes(usuario?.nivelPermisoId);
    const hasAllPermissions = (...permisoIds) => permisoIds.every(id => id === usuario?.nivelPermisoId);

    return {
        usuario,
        loading,
        keycloakRoles,
        nivelPermisoId: usuario?.nivelPermisoId,
        permisoNombre: usuario?.permisoNombre,
        isAdministrador,
        isAdministradorReal,
        isInstructor,
        isColaborador,
        isLite,
        hasAnyPermission,
        hasAllPermissions,
    };
};
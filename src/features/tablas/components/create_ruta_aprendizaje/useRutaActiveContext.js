import { useRutaContext } from './CrearRutaAprendizaje';
import { useEditarRutaContext } from './editar_ruta_aprendizaje/EditarRutaAprendizaje';

export function useRutaActiveContext() {
    const crearCtx = useRutaContext();
    const editarCtx = useEditarRutaContext();
    return crearCtx || editarCtx;
}
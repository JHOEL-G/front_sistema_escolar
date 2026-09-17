import { useState, useEffect, useRef, useCallback } from "react";
import serviceApiNet from "../../../lib/api/serviceApiNet";

export const useNotificaciones = (intervaloBackground = 120000) => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [loading, setLoading] = useState(true);
    const [panelAbierto, setPanelAbierto] = useState(false);
    const fetchingRef = useRef(false);

    const fetchNotifs = useCallback(async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            const res = await serviceApiNet.Notificaciones.getMias();
            if (res.data?.success) {
                const data = res.data.data ?? [];
                setNotificaciones(data);
                setNoLeidas(data.filter(n => !n.leida).length);
            }
        } catch (e) {
            if (e?.name !== 'CanceledError') console.error("Error notificaciones:", e);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchNotifs();
        const id = setInterval(fetchNotifs, intervaloBackground);
        return () => clearInterval(id);
    }, [fetchNotifs, intervaloBackground]);

    useEffect(() => {
        if (!panelAbierto) return;
        const id = setInterval(fetchNotifs, 15000);
        return () => clearInterval(id);
    }, [panelAbierto, fetchNotifs]);

    const marcarLeida = async (id) => {
        await serviceApiNet.Notificaciones.marcarLeida(id);
        setNotificaciones(prev =>
            prev.map(n => n.notificacionId === id ? { ...n, leida: true } : n)
        );
        setNoLeidas(prev => Math.max(0, prev - 1));
    };

    const vaciar = async () => {
        try {
            await serviceApiNet.Notificaciones.vaciar();
            setNotificaciones([]);
            setNoLeidas(0);
        } catch (e) {
            console.error("Error al vaciar:", e);
        }
    };

    return { notificaciones, noLeidas, loading, marcarLeida, vaciar, setPanelAbierto };
};
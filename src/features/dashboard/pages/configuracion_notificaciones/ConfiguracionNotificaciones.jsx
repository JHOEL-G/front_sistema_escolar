import React, { useState } from 'react';
import {
    Bell,
    ChevronUp,
    ChevronDown,
    Settings2,
    Globe,
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';
import { useEffect } from 'react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const SettingsSection = ({ title, subtitle, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="mb-8 overflow-hidden bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-[2.5rem] shadow-sm transition-all duration-500 hover:shadow-md">
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-7 cursor-pointer hover:bg-slate-50/40 transition-colors">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-lg shadow-indigo-100 flex items-center justify-center">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100/50">
                                {subtitle}
                            </span>
                        </div>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-200 transition-all">
                    {isOpen ? 'CERRAR' : 'CONFIGURAR'}
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="p-7 pt-2 space-y-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6 opacity-50" />
                    {children}
                </div>
            </div>
        </div>
    );
};

const NotificationToggle = ({ label, description, enabled, onToggle, loading, isMain = false }) => (
    <div className={`flex items-center justify-between p-6 rounded-[1.5rem] transition-all duration-300 ${isMain ? 'bg-slate-50/50 border border-slate-100 mb-4' : 'bg-white border border-slate-50 shadow-sm'
        }`}>
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${isMain ? 'text-slate-900' : 'text-slate-700'}`}>{label}</span>
                {isMain && (
                    <span className="bg-emerald-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Maestro
                    </span>
                )}
            </div>
            {description && <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">{description}</p>}
        </div>

        <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${loading ? 'opacity-20' : 'opacity-100'} ${enabled ? 'text-indigo-600' : 'text-slate-300'}`}>
                {enabled ? 'Activado' : 'Desactivado'}
            </span>
            <button
                onClick={onToggle}
                disabled={loading}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${enabled ? 'bg-indigo-600' : 'bg-slate-200'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
            >
                <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center ${enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                >
                    {loading && <Loader2 size={12} className="animate-spin text-indigo-600" />}
                </span>
            </button>
        </div>
    </div>
);

const ConfiguracionNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);

    useEffect(() => {
        const fetchNotificaciones = async () => {
            try {
                const res = await serviceApiNet.Configuracion.listarPorCategoria('NOTIFICACIONES');
                if (res.data.success) {
                    setNotificaciones(res.data.data);
                }
            } catch (error) {
                console.error("Error al cargar:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotificaciones();
    }, []);

    const handleToggle = async (keyName, estadoActual) => {
        if (updatingKey) return;

        setUpdatingKey(keyName);

        try {
            const res = await serviceApiNet.Configuracion.toggle({
                keyName: keyName,
                nuevoEstado: !estadoActual
            });

            if (res.data.success) {
                setNotificaciones(prev => prev.map(n =>
                    n.keyName === keyName ? { ...n, estado: !estadoActual } : n
                ));
            }
        } catch (error) {
            console.error("Error al guardar toggle:", error);
        } finally {
            setUpdatingKey(null);
        }
    };

    const getConfig = (keyName) => notificaciones.find(n => n.keyName === keyName) || { estado: false, label: keyName, descripcion: '' };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center animate-pulse">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-black text-slate-400 text-xs tracking-widest uppercase">Cargando Sistema...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-full p-6 font-sans text-slate-900">
            <div className="max-w-full mx-auto">
                <header className="mb-12 flex items-center gap-6">
                    <div className="h-16 w-16 bg-white rounded-[4rem] shadow-xl flex items-center justify-center text-indigo-600 border border-slate-100">
                        <Bell size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Configuración de notificaciones</h1>
                        <p className="text-base text-slate-400 font-medium">Gestiona cada alerta de forma individual</p>
                    </div>
                </header>

                <SettingsSection title="Plataforma General" subtitle="Sistema Base" icon={Globe}>
                    <NotificationToggle
                        label={getConfig('NOT_GLOBAL').label}
                        description={getConfig('NOT_GLOBAL').descripcion}
                        enabled={getConfig('NOT_GLOBAL').estado}
                        isMain={true}
                        loading={updatingKey === 'NOT_GLOBAL'}
                        onToggle={() => handleToggle('NOT_GLOBAL', getConfig('NOT_GLOBAL').estado)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {['NOT_ANUNCIOS', 'NOT_CHAT'].map(key => (
                            <NotificationToggle
                                key={key}
                                label={getConfig(key).label}
                                description={getConfig(key).descripcion}
                                enabled={getConfig(key).estado}
                                loading={updatingKey === key}
                                onToggle={() => handleToggle(key, getConfig(key).estado)}
                            />
                        ))}
                    </div>
                </SettingsSection>

                <SettingsSection title="Capacitación" subtitle="Módulos de Aprendizaje" icon={GraduationCap}>
                    <NotificationToggle
                        label={getConfig('NOT_CAPACITACION_MASTER').label}
                        description={getConfig('NOT_CAPACITACION_MASTER').descripcion}
                        enabled={getConfig('NOT_CAPACITACION_MASTER').estado}
                        isMain={true}
                        loading={updatingKey === 'NOT_CAPACITACION_MASTER'}
                        onToggle={() => handleToggle('NOT_CAPACITACION_MASTER', getConfig('NOT_CAPACITACION_MASTER').estado)}
                    />

                    <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-dashed border-slate-200 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['NOT_CERTIFICADOS', 'NOT_RECORDATORIOS', 'NOT_ASIGNACIONES', 'NOT_FEEDBACK'].map(key => (
                            <NotificationToggle
                                key={key}
                                label={getConfig(key).label}
                                description={getConfig(key).descripcion}
                                enabled={getConfig(key).estado}
                                loading={updatingKey === key}
                                onToggle={() => handleToggle(key, getConfig(key).estado)}
                            />
                        ))}
                    </div>
                </SettingsSection>

                <footer className="mt-12 p-10 bg-indigo-900 rounded-[3rem] text-white flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <AlertCircle size={28} className="text-indigo-200" />
                        <div>
                            <h4 className="font-black text-xl">Soporte técnico</h4>
                            <p className="text-indigo-200 text-sm">Los cambios se guardan automáticamente en tu perfil.</p>
                        </div>
                    </div>
                    <button
                        className="px-10 py-4 bg-white text-indigo-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                        onClick={() => window.open('/Guía de Usuario.pdf', '_blank')}
                    >
                        Documentación
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ConfiguracionNotificaciones;
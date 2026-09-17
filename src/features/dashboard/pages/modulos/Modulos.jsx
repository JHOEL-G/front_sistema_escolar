import React, { useState } from 'react';
import {
    Settings2, ChevronUp, ChevronDown, Sparkles,
    Layout, Puzzle, Zap, Bell, ShieldCheck
} from 'lucide-react';
import { useEffect } from 'react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

const SettingsSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-6 overflow-hidden bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-[2rem] shadow-sm transition-all duration-500">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                        <Icon size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                    {isOpen ? 'DEJAR DE VER' : 'VER MÁS'}
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="p-6 pt-0 space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ModuleToggle = ({ label, isNew, description, enabled, onToggle, loading }) => {
    return (
        <div className={`group relative flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300 ${enabled
            ? 'bg-gradient-to-r from-orange-50/50 to-white border-orange-100 shadow-md shadow-orange-100/50'
            : 'bg-white border-slate-100 opacity-60'
            }`}>
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">{label}</span>
                    {isNew && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-[10px] font-black text-white uppercase tracking-tighter rounded-full animate-pulse">
                            <Sparkles size={10} /> Nuevo
                        </span>
                    )}
                </div>
                {description && <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>}
            </div>

            <button
                disabled={loading}
                onClick={onToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 ${enabled ? 'bg-indigo-600' : 'bg-slate-200'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
            </button>
        </div>
    );
};

const Modulos = () => {
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [resMod, resPlan, resSeg] = await Promise.all([
                    serviceApiNet.Configuracion.listarPorCategoria('MODULOS'),
                    serviceApiNet.Configuracion.listarPorCategoria('PLANTILLAS'),
                    serviceApiNet.Configuracion.listarPorCategoria('SEGURIDAD')
                ]);

                const dataCombinada = [
                    ...(resMod.data.data || []),
                    ...(resPlan.data.data || []),
                    ...(resSeg.data.data || [])
                ];

                setModulos(dataCombinada);
            } catch (error) {
                console.error("Error al cargar configuraciones:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const getByCategoria = (cat) => {
        return modulos.filter(m =>
            m.categoria?.trim().toUpperCase() === cat.toUpperCase()
        );
    };

    const handleToggle = async (keyName, estadoActual) => {
        try {
            setUpdatingKey(keyName);
            const res = await serviceApiNet.Configuracion.toggle({
                keyName: keyName,
                nuevoEstado: !estadoActual
            });

            if (res.data.success) {
                setModulos(prev => prev.map(m =>
                    m.keyName === keyName ? { ...m, estado: !estadoActual } : m
                ));
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
        } finally {
            setUpdatingKey(null);
        }
    };

    if (loading) return <div className="p-12 text-slate-400 font-black animate-pulse">CARGANDO ECOSISTEMA...</div>;

    return (
        <div className="min-h-full p-6 lg:p-12 font-sans selection:bg-indigo-100">
            <div className="max-w-full mx-auto">

                <header className="mb-11 flex items-center gap-1">
                    <div className="h-14 w-14 bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-indigo-600 border border-slate-100">
                        <Settings2 size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Configuraciones</h1>
                        <p className="text-sm text-slate-400 font-medium">Gestiona el ecosistema y módulos de tu plataforma</p>
                    </div>
                </header>

                <SettingsSection title="Gestor de módulos principales" icon={Puzzle}>
                    {getByCategoria('MODULOS').map(mod => (
                        <ModuleToggle
                            key={mod.keyName}
                            label={mod.label}
                            isNew={mod.esNuevo}
                            description={mod.descripcion}
                            enabled={mod.estado}
                            loading={updatingKey === mod.keyName}
                            onToggle={() => handleToggle(mod.keyName, mod.estado)}
                        />
                    ))}
                </SettingsSection>

                <SettingsSection title="Plantillas" icon={Layout}>
                    {getByCategoria('PLANTILLAS').map(mod => (
                        <ModuleToggle
                            key={mod.keyName}
                            label={mod.label}
                            description={mod.descripcion}
                            enabled={mod.estado}
                            loading={updatingKey === mod.keyName}
                            onToggle={() => handleToggle(mod.keyName, mod.estado)}
                        />
                    ))}
                </SettingsSection>

                <SettingsSection title="Seguridad y Acceso" icon={ShieldCheck} defaultOpen={false}>
                    {getByCategoria('SEGURIDAD').map(mod => (
                        <ModuleToggle
                            key={mod.keyName}
                            label={mod.label}
                            description={mod.descripcion}
                            enabled={mod.estado}
                            loading={updatingKey === mod.keyName}
                            onToggle={() => handleToggle(mod.keyName, mod.estado)}
                        />
                    ))}
                </SettingsSection>

            </div>
        </div>
    );
};

export default Modulos;
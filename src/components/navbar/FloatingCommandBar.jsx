import { useState, useEffect, useRef } from 'react';
import { Rocket, Bell, HelpCircle } from 'lucide-react';
import { useDarkMode } from '../darkMode_context/DarkModeContext';
import { matchPath, useLocation } from 'react-router-dom';
import serviceApiNet from '../../lib/api/serviceApiNet';
import AvatarMenu from './avatar/AvatarMenu';
import HelpPanel from './help/HelpPanel';
import NotificationsPanel from './notificaciones/NotificationsPanel';
import LaunchPanel from './lunch/LaunchPanel';
import useGroqMotivation from '../../features/dashboard/pages/interface_principal/ia_interactiva/useGroqMotivation ';
import { useNotificaciones } from '../../features/auth/hooks/useNotificaciones';
import { useImpersonation } from '../perstectiva/ImpersonationProviderr';

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
};

export default function FloatingActionsRight() {
    const { darkMode, toggleDarkMode } = useDarkMode();
    const location = useLocation();
    const panelRef = useRef(null);
    const { avatarUrl, detectarGeneroYAvatar } = useGroqMotivation([]);
    const [openPanel, setOpenPanel] = useState(null);
    const { notificaciones, noLeidas, loading, marcarLeida, vaciar, setPanelAbierto } = useNotificaciones(120000);
    const isCourseRoute = matchPath({ path: '/inicio_curso/:id' }, location.pathname);
    const isReportesRoute = matchPath({ path: '/reportes' }, location.pathname);
    const { impersonatedUser } = useImpersonation();
    const [usuarioReal, setUsuarioReal] = useState(null);

    useClickOutside(panelRef, () => {
        setOpenPanel(null);
        setPanelAbierto(false);
    });

    useEffect(() => {
        const controller = new AbortController();
        serviceApiNet.Usuario.getMe(controller.signal)
            .then(res => {
                const u = res.data?.data ?? res.data;
                setUsuarioReal(u);
            })
            .catch(() => { });
        return () => controller.abort();
    }, []);

    const usuario = impersonatedUser ?? usuarioReal;

    useEffect(() => {
        if (usuario?.nombre && usuario.nombre !== 'Usuario') {
            detectarGeneroYAvatar(usuario.nombre);
        }
    }, [usuario]);

    const toggle = (panel) => {
        const next = openPanel === panel ? null : panel;
        setOpenPanel(next);
        if (panel === 'notifications') setPanelAbierto(next === 'notifications');
    };

    if (isCourseRoute || isReportesRoute) return null;

    const nombre = usuario ? `${usuario.nombre ?? ''} ${usuario.apeLLido ?? ''}`.trim() : 'User';
    const imagenPortada = usuario?.imagenPortada || '';

    const navItems = [
        { key: 'launch', icon: Rocket, label: 'Lanzar' },
        { key: 'notifications', icon: Bell, label: 'Notificaciones' },
        { key: 'help', icon: HelpCircle, label: 'Ayuda' },
    ];

    return (
        <div className="fixed top-4 right-6 z-50" ref={panelRef}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border
                ${darkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white/40 border-slate-200/50'}`}>

                <div className="flex items-center gap-1">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = openPanel === item.key;

                        return (
                            <button
                                key={item.key}
                                onClick={() => toggle(item.key)}
                                className={`relative group p-2.5 rounded-full transition-all duration-200 active:scale-90
                                    ${darkMode
                                        ? `text-white hover:bg-white/10 ${isActive ? 'bg-white/15' : ''}`
                                        : `text-slate-900 hover:bg-slate-200/50 ${isActive ? 'bg-slate-300/50' : ''}`
                                    }`}
                            >
                                <Icon size={22} strokeWidth={2} />

                                {item.key === 'notifications' && noLeidas > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {noLeidas > 9 ? '9+' : noLeidas}
                                    </span>
                                )}

                                <span className={`absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded
                                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border
                                    ${darkMode ? 'bg-slate-800 text-white border-white/10' : 'bg-slate-900 text-white border-slate-700'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className={`h-6 w-0.5 ${darkMode ? 'bg-white/20' : 'bg-slate-300/50'}`} />

                <button
                    onClick={() => toggle('avatar')}
                    className={`relative group p-0.5 rounded-full transition-all
                        ${openPanel === 'avatar' ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                >
                    <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all
                        ${darkMode ? 'border-white/20 hover:border-white/40' : 'border-slate-300/50 hover:border-slate-500'}`}>
                        <img
                            src={imagenPortada || avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`}
                            alt={nombre}
                            className="w-full h-full bg-indigo-100"
                        />
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full
                        ${darkMode ? 'border-slate-900' : 'border-white'}`} />
                </button>
            </div>

            {openPanel && (
                <div className="absolute top-16 right-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    {openPanel === 'launch' && (
                        <LaunchPanel darkMode={darkMode} onClose={() => setOpenPanel(null)} />
                    )}
                    {openPanel === 'notifications' && (
                        <NotificationsPanel
                            darkMode={darkMode}
                            onClose={() => {
                                setOpenPanel(null);
                                setPanelAbierto(false);
                            }}
                            notificaciones={notificaciones}
                            noLeidas={noLeidas}
                            loading={loading}
                            onMarcarLeida={marcarLeida}
                            onVaciar={vaciar}
                        />
                    )}
                    {openPanel === 'help' && (
                        <HelpPanel darkMode={darkMode} onClose={() => setOpenPanel(null)} />
                    )}
                    {openPanel === 'avatar' && (
                        <AvatarMenu
                            darkMode={darkMode}
                            toggleDarkMode={toggleDarkMode}
                            onClose={() => setOpenPanel(null)}
                            usuario={usuario}
                            avatarUrl={avatarUrl}
                            imagenPortada={imagenPortada}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
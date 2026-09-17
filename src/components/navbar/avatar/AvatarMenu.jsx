import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Sun, Moon, Eye } from "lucide-react";
import keycloak from "../../../features/auth/services/keycloakConfig";
import { useImpersonation } from "../../perstectiva/ImpersonationProviderr";
import ModalVerComoUsuario from "../../perstectiva/ModalVerComoUsuario";

const AvatarMenu = ({ darkMode, onClose, toggleDarkMode, avatarUrl }) => {
    const navigate = useNavigate();
    const { impersonatedUser, stopImpersonation, usuarioReal } = useImpersonation();
    const [showModal, setShowModal] = useState(false);

    const isAdministradorReal = usuarioReal?.nivelPermisoId === 1;
    const nombreReal = usuarioReal
        ? `${usuarioReal.nombre ?? ''} ${usuarioReal.apeLLido ?? ''}`.trim()
        : '';

    const usuario = impersonatedUser ?? usuarioReal;

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const nombre = usuario ? `${usuario.nombre ?? ''} ${usuario.apeLLido ?? ''}`.trim() : 'Usuario';
    const correo = usuario?.correo ?? '';
    const permiso = usuario?.permisoNombre ?? usuario?.nivelPermiso ?? '';
    const imagenPortada = usuario?.imagenPortada || '';

    return (
        <>
            <div className={`w-72 rounded-3xl border shadow-2xl overflow-hidden
                ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>

                <div className={`px-5 py-5 border-b ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 shrink-0 ring-2 ring-indigo-200">
                            <img
                                src={imagenPortada || avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`}
                                alt={nombre}
                                className="w-full h-full"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black truncate">{nombre}</p>
                            <p className={`text-[11px] truncate ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>{correo}</p>
                            {permiso && (
                                <span className="mt-1 inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                    {permiso}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-3 space-y-1">
                    {isAdministradorReal && (
                        impersonatedUser ? (
                            <button
                                onClick={() => { stopImpersonation(); navigate('/'); onClose(); }}
                                className="w-full flex flex-col px-4 py-3 rounded-2xl transition-all bg-amber-50 text-amber-600 hover:bg-amber-100"
                            >
                                <div className="flex items-center gap-3 text-sm font-semibold">
                                    <Eye size={16} className="text-amber-500" />
                                    Volver a mi vista
                                </div>
                                <span className="text-[10px] text-amber-400 ml-7 mt-0.5">
                                    como {nombreReal}
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowModal(true)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                                    ${darkMode ? 'hover:bg-amber-500/10 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`}
                            >
                                <Eye size={16} className="text-amber-400" />
                                Ver como usuario
                            </button>
                        )
                    )}

                    {[
                        { label: 'Mi perfil', icon: User, action: () => { navigate('/perfil'); onClose(); } },
                        { label: 'Configuración', icon: Settings, action: () => { navigate('/usuarios'); onClose(); } },
                    ].map((opt, i) => (
                        <button key={i} onClick={opt.action}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                                ${darkMode ? 'hover:bg-white/5 text-white/80' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <opt.icon size={16} className="text-slate-400" />
                            {opt.label}
                        </button>
                    ))}

                    <button onClick={toggleDarkMode}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                            ${darkMode ? 'hover:bg-white/5 text-white/80' : 'hover:bg-slate-50 text-slate-700'}`}>
                        {darkMode
                            ? <><Sun size={16} className="text-amber-400" /> Modo claro</>
                            : <><Moon size={16} className="text-slate-400" /> Modo oscuro</>}
                    </button>
                </div>

                <div className={`p-3 border-t ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all">
                        <LogOut size={16} /> Cerrar sesión
                    </button>
                </div>
            </div>

            {showModal && (
                <ModalVerComoUsuario onClose={() => setShowModal(false)} />
            )}
        </>
    );
};

export default AvatarMenu;
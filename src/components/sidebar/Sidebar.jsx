import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Search,
    LogOut,
    Settings,
    Bell,
    GraduationCap,
    ChevronRight,
    Menu,
    Moon,
    Sun,
    Palette,
    User,
    Book,
    Key,
    Layers,
    Building2,
    Activity,
    ClipboardEdit,
    Map,
    BarChart3,
    HelpCircle,
    Gamepad2,
    Gauge,
    UserCheck,
    Compass,
    X,
} from 'lucide-react';
import { ItemsSidebar, Tooltip } from './ItemsSidebar';
import { useDarkMode } from '../darkMode_context/DarkModeContext';
import { Form, useLocation, useNavigate } from "react-router-dom";
import keycloak from '../../features/auth/services/keycloakConfig';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { FormIcon } from 'lucide-react';
import useGroqMotivation from '../../features/dashboard/pages/interface_principal/ia_interactiva/useGroqMotivation ';

const Sidebar = () => {
    const [expanded, setExpanded] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const { darkMode, setDarkMode } = useDarkMode();
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);
    const { avatarUrl, detectarGeneroYAvatar } = useGroqMotivation([]);
    const [searchTerm, setSearchTerm] = useState('');
    const logoRef = useRef(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const isDashboard = location.pathname === "/";
    const isAprendizaje = location.pathname === "/aprendizaje";
    const isExplorador = location.pathname === "/explorador";
    const isPerfil = location.pathname === "/perfil";
    const isCurso = location.pathname === "/curso";
    const isUsuarios = location.pathname === "/usuarios";
    const isRol = location.pathname === "/rol";
    const isOu = location.pathname === "/ou";
    const isPropiedades = location.pathname === "/propiedades";
    const isConfiguracionNotificaciones = location.pathname === "/configuracion_notificaciones";
    const isReporteActivaciones = location.pathname === "/reporte_activaciones";
    const isGamificacion = location.pathname === "/gamificacion";
    const isTema = location.pathname === "/tema";
    const isReportes = location.pathname === "/reportes";
    const isBancoPreguntas = location.pathname === "/banco_preguntas";
    const isGestionCurso = location.pathname === "/gestion_curso";
    const isRutaAprendizaje = location.pathname === "/ruta_aprendizaje";
    const isGestorDocumentos = location.pathname === "/gestor_documentos";
    const isConfiguracion = location.pathname === "/config_gamificacion";
    const isReportesTabla = location.pathname === "/resportes_tabla";
    const isPlantillaFormulario = location.pathname === "/plantilla_formulario";

    const {
        usuario,
        loading,
        isAdministrador,
        isInstructor,
        isColaborador,
        isLite,
        hasAnyPermission
    } = usePermissions();

    const m = (label) => !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

    const allItems = [
        { label: 'Inicio', path: '/', permission: true },
        { label: 'Aprendizaje', path: '/aprendizaje', permission: true },
        { label: 'Perfil', path: '/perfil', permission: true },
        { label: 'Explorador', path: '/explorador', permission: true },
        { label: 'Reportes', path: '/reportes', permission: isAdministrador },
        { label: 'Instructores', path: '/curso', permission: isAdministrador },
        { label: 'Gestor de Documentos', path: '/gestor_documentos', permission: isAdministrador },
        { label: 'Plantilla Formulario', path: '/plantilla_formulario', permission: isAdministrador },
        { label: 'Usuarios', path: '/usuarios', permission: isAdministrador },
        { label: 'Roles', path: '/rol', permission: isAdministrador },
        { label: 'OU', path: '/ou', permission: isAdministrador },
        { label: 'Propiedades', path: '/propiedades', permission: isAdministrador },
        { label: 'Módulos', path: '/modulos', permission: isAdministrador },
        { label: 'Activaciones', path: '/ia', permission: isAdministrador },
        { label: 'Notificaciones', path: '/configuracion_notificaciones', permission: isAdministrador },
        { label: 'Temas', path: '/tema', permission: isAdministrador },
        { label: 'Gestionar Cursos', path: '/gestion_curso', permission: isAdministrador },
        { label: 'Rutas de Aprendizaje', path: '/ruta_aprendizaje', permission: isAdministrador },
        { label: 'Banco de Preguntas', path: '/banco_preguntas', permission: isAdministrador },
        { label: 'Gamificación', path: '/gamificacion', permission: isAdministrador },
        { label: 'Configuración', path: '/config_gamificacion', permission: isAdministrador },
    ];

    const suggestions = searchTerm.trim()
        ? allItems.filter(i => i.permission && i.label.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) setExpanded(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!expanded) {
            setActiveDropdown(null);
            setSearchTerm('');
        }
    }, [expanded]);

    useEffect(() => {
        const nombreCorto = usuario?.nombre.split(' ')[0];
        if (nombreCorto) detectarGeneroYAvatar(nombreCorto);
    }, [usuario]);

    const handleSearchEnter = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, suggestions.slice(0, 6).length - 1));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, -1));
            return;
        }
        if (e.key === 'Escape') {
            setSearchTerm('');
            setShowSuggestions(false);
            setSelectedIndex(-1);
            return;
        }
        if (e.key !== 'Enter' || !searchTerm.trim()) return;

        const match = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
        if (match) {
            navigate(match.path);
            setSearchTerm('');
            setShowSuggestions(false);
            setSelectedIndex(-1);
            if (isMobile) setExpanded(false);
        }
    };

    const navigateTo = (path) => {
        navigate(path);
        if (isMobile) setExpanded(false);
    };

    return (
        <>
            {isMobile && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className={`
                        fixed top-4 left-4 z-50
                        p-2.5 rounded-xl shadow-lg
                        transition-all duration-200 active:scale-95
                        ${darkMode ? "bg-slate-900 text-white border border-slate-700" : "bg-white text-slate-800 border border-slate-200"}
                    `}
                >
                    <Menu size={20} />
                </button>
            )}

            {isMobile && expanded && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setExpanded(false)}
                />
            )}

            <div
                className={`
                    relative shrink-0 h-full
                    transition-all duration-300 ease-out z-50
                    ${isMobile
                        ? 'fixed left-0 top-0 h-full'
                        : 'p-4'
                    }
                `}
                style={{
                    width: isMobile
                        ? (expanded ? 'min(300px, 88vw)' : '0px')
                        : (expanded ? '256px' : '96px'),
                    padding: isMobile ? (expanded ? '16px' : '0px') : undefined,
                    transform: isMobile && !expanded ? 'translateX(-100%)' : 'translateX(0)',
                    visibility: isMobile && !expanded ? 'hidden' : 'visible'
                }}
            >
                <aside className={`
                    h-full flex flex-col rounded-3xl shadow-xl
                    transition-all duration-300
                    ${darkMode
                        ? "bg-slate-900 border border-slate-800"
                        : "bg-white border border-slate-200"
                    }
                `}>

                    <div
                        ref={logoRef}
                        className="px-4 py-4 mb-1 flex items-center gap-2.5 relative"
                        onMouseEnter={() => !expanded && !isMobile && setHoveredItem('logo')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <div className="bg-green-600 p-1.5 rounded-xl text-white shrink-0 shadow-lg shadow-green-200">
                            <GraduationCap size={18} />
                        </div>

                        <div
                            className="flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ease-out min-w-0 flex-1"
                            style={{
                                opacity: expanded ? 1 : 0,
                                maxWidth: expanded ? '180px' : '0px',
                                width: expanded ? '180px' : '0px'
                            }}
                        >
                            <span className={`font-bold text-[13px] leading-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                                Universidad Confía
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Dashboard</span>
                        </div>

                        {isMobile && expanded && (
                            <button
                                onClick={() => setExpanded(false)}
                                className={`
                                    ml-auto p-1.5 rounded-xl transition-colors
                                    ${darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}
                                `}
                            >
                                <X size={16} />
                            </button>
                        )}

                        {!isMobile && (
                            <Tooltip
                                text="Universidad Confía"
                                show={hoveredItem === 'logo' && !expanded}
                                darkMode={darkMode}
                                triggerRef={logoRef}
                            />
                        )}
                    </div>

                    {!isMobile && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className={`
                                absolute top-14 -right-3
                                bg-green-600 text-white 
                                p-1.5 rounded-full shadow-lg z-50
                                transition-all duration-300 ease-out
                                hover:bg-green-700 hover:scale-110 active:scale-95
                            `}
                            style={{
                                transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)'
                            }}
                        >
                            <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    )}

                    <div className={`px-4 mb-4 mt-2 ${!expanded ? 'flex justify-center' : ''}`}>
                        <div className="relative">
                            <div className={`
                                relative flex items-center rounded-xl p-2
                                transition-all duration-200
                                ${darkMode ? "bg-slate-800" : "bg-slate-100/50"}
                                ${!expanded ? 'w-10 h-10 justify-center' : 'w-full'}
                            `}>
                                <Search size={18} className={`text-slate-400 shrink-0 transition-all duration-300 ${expanded ? 'ml-1' : ''}`} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); setSelectedIndex(-1); }}
                                    onKeyDown={handleSearchEnter}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    className={`ml-2 bg-transparent border-none outline-none text-xs w-full transition-all duration-300 ease-out
                                        ${darkMode ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"}`}
                                    style={{
                                        opacity: expanded ? 1 : 0,
                                        width: expanded ? 'auto' : '0px',
                                        marginLeft: expanded ? '8px' : '0px',
                                        pointerEvents: expanded ? 'auto' : 'none'
                                    }}
                                />
                                {searchTerm && expanded && (
                                    <button onClick={() => { setSearchTerm(''); setShowSuggestions(false); }}
                                        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {showSuggestions && suggestions.length > 0 && expanded && (
                                <div className={`
                                    absolute top-full left-0 right-0 mt-1 z-50
                                    rounded-xl overflow-hidden shadow-xl
                                    ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}
                                `}>
                                    {suggestions.slice(0, 6).map((item, i) => (
                                        <button
                                            key={i}
                                            onMouseDown={() => {
                                                navigate(item.path);
                                                setSearchTerm('');
                                                setShowSuggestions(false);
                                                setSelectedIndex(-1);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                            className={`
                                                w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                                                ${i === selectedIndex
                                                    ? darkMode ? 'bg-slate-700 text-white' : 'bg-indigo-50 text-indigo-600'
                                                    : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                                }
                                            `}
                                        >
                                            <Search size={11} className="text-slate-400 shrink-0" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden scrollbar-hide space-y-0">
                        {hasAnyPermission(1, 2, 3, 4) && (
                            <>
                                {m('Inicio') &&
                                    <ItemsSidebar icon={LayoutDashboard} label="Inicio" expanded={expanded} active={isDashboard} darkMode={darkMode}
                                        onClick={() => navigateTo('/')} tooltip="Inicio" />
                                }
                                {m('Aprendizaje') &&
                                    <ItemsSidebar id="aprendizaje" icon={BookOpen} label="Aprendizaje" expanded={expanded} active={isAprendizaje} darkMode={darkMode}
                                        onClick={() => navigateTo('/aprendizaje')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} tooltip="Aprendizaje" />
                                }
                                {m('Perfil') &&
                                    <ItemsSidebar id="perfil" icon={User} label="Perfil" expanded={expanded} darkMode={darkMode} active={isPerfil}
                                        onClick={() => navigateTo('/perfil')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} tooltip="Perfil" />
                                }
                                {m('Explorador') &&
                                    <ItemsSidebar icon={Compass} label="Explorador" expanded={expanded} darkMode={darkMode} active={isExplorador}
                                        onClick={() => navigateTo('/explorador')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} tooltip="Explorador" />
                                }
                            </>
                        )}

                        {isAdministrador && (
                            <>
                                {m('Reportes') &&
                                    <ItemsSidebar icon={BarChart3} label="Reportes" expanded={expanded} darkMode={darkMode} active={isReportes} tooltip="Reportes"
                                        onClick={() => navigateTo('/reportes')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
                                }
                                {m('Instructores') &&
                                    <ItemsSidebar icon={UserCheck} label="Instructores" expanded={expanded} darkMode={darkMode} active={isCurso}
                                        onClick={() => navigateTo('/curso')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} tooltip="Instructores" />
                                }
                                {m('Gestor de Documentos') &&
                                    <ItemsSidebar icon={FileText} label="Gestor de Documentos" expanded={expanded} darkMode={darkMode} active={isGestorDocumentos}
                                        onClick={() => navigateTo('/gestor_documentos')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} tooltip="Gestor de Documentos" />
                                }
                                {m('Plantilla Formulario') &&
                                    <ItemsSidebar icon={FormIcon} label="Plantilla Formulario" expanded={expanded} darkMode={darkMode} active={isPlantillaFormulario}
                                        onClick={() => navigateTo('/plantilla_formulario')} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} tooltip="Plantilla Formulario" />
                                }
                            </>
                        )}

                        {isAdministrador && m('Administrador') && (
                            <ItemsSidebar id="administrador" icon={Key} label="Administrador" expanded={expanded} darkMode={darkMode}
                                activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}>

                                <ItemsSidebar id="plataforma" icon={Layers} label="Plataforma" expanded={expanded} darkMode={darkMode}
                                    activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}>

                                    <ItemsSidebar id="organizaciones" icon={Building2} label="Organizaciones" expanded={expanded} darkMode={darkMode}
                                        activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}>
                                        {[
                                            { label: 'Usuarios', path: '/usuarios' },
                                            { label: 'Rol', path: '/rol' },
                                            { label: 'OU', path: '/ou' },
                                            { label: 'Propiedades', path: '/propiedades' },
                                            { label: 'Modulos', path: '/modulos' },
                                            { label: 'Activaciones', path: '/ia' },
                                        ].map(({ label, path }) => (
                                            <button key={path} onClick={() => navigateTo(path)}
                                                className={`w-full text-left py-1.5 px-3 text-xs rounded-lg transition-colors
                                                    ${darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-green-600 hover:bg-green-50"}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </ItemsSidebar>

                                    <ItemsSidebar icon={Bell} label="Notificaciones" expanded={expanded} darkMode={darkMode}
                                        onClick={() => navigateTo('/configuracion_notificaciones')} />
                                    <ItemsSidebar icon={Activity} label="Reportes De Actividades" expanded={expanded} darkMode={darkMode}
                                        onClick={() => navigateTo('/reporte_activaciones')} />
                                </ItemsSidebar>

                                <ItemsSidebar id="aprendizaje-admin" icon={GraduationCap} label="Aprendizaje" expanded={expanded} darkMode={darkMode}
                                    activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}>
                                    <ItemsSidebar icon={Book} label="Temas" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/tema')} />
                                    <ItemsSidebar icon={ClipboardEdit} label="Gestionar Cursos" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/gestion_curso')} />
                                    <ItemsSidebar icon={Map} label="Rutas de Aprendizaje" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/ruta_aprendizaje')} />
                                    <ItemsSidebar icon={BarChart3} label="Reportes de Actividades" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/resportes_tabla')} />
                                    <ItemsSidebar icon={HelpCircle} label="Banco de Preguntas" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/banco_preguntas')} />
                                </ItemsSidebar>

                                <ItemsSidebar id="gamificacion" icon={Gamepad2} label="Gamificación" expanded={expanded} darkMode={darkMode}
                                    activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}>
                                    <ItemsSidebar icon={Gauge} label="Panel de Control" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/gamificacion')} />
                                    <ItemsSidebar icon={Settings} label="Configuración" expanded={expanded} darkMode={darkMode} onClick={() => navigateTo('/config_gamificacion')} />
                                </ItemsSidebar>
                            </ItemsSidebar>
                        )}
                    </nav>

                    <div className="p-3 mt-auto space-y-3">
                        <button onClick={() => setDarkMode(!darkMode)}
                            className={`
                                w-full flex items-center p-2 rounded-2xl cursor-pointer
                                transition-all duration-200
                                ${darkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-100/50 hover:bg-slate-200/50"}
                            `}>
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500 text-white shadow-sm shrink-0">
                                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                            </div>
                            <div className="flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-out"
                                style={{ marginLeft: expanded ? '12px' : '0px', opacity: expanded ? 1 : 0, width: expanded ? 'auto' : '0px' }}>
                                <span className={`text-xs font-semibold flex-1 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    {darkMode ? "Oscuro" : "Claro"}
                                </span>
                                <div className={`w-8 h-4 rounded-full relative p-0.5 ml-2 shrink-0 transition-colors duration-300 ${darkMode ? "bg-indigo-600" : "bg-slate-300"}`}>
                                    <div className="w-3 h-3 bg-white rounded-full transition-transform duration-300"
                                        style={{ transform: darkMode ? 'translateX(16px)' : 'translateX(0px)' }} />
                                </div>
                            </div>
                        </button>

                        <div className={`flex items-center p-2 rounded-2xl transition-all duration-200 ${expanded ? (darkMode ? "bg-slate-800/30" : "bg-slate-50") : ""}`}>
                            <img
                                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${usuario?.nombre}`}
                                alt={usuario?.nombre}
                                className="w-9 h-9 rounded-xl shadow-sm shrink-0"
                            />
                            <div className="flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-out"
                                style={{ marginLeft: expanded ? '12px' : '0px', opacity: expanded ? 1 : 0, width: expanded ? 'auto' : '0px' }}>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {keycloak.tokenParsed?.given_name || "Usuario"} {keycloak.tokenParsed?.family_name || ""}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                                        {keycloak.tokenParsed?.email}
                                    </p>
                                </div>
                                <LogOut size={16}
                                    onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
                                    className="text-slate-400 hover:text-red-500 transition-colors ml-2 cursor-pointer shrink-0" />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}

export default Sidebar;
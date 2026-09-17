import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FlyoutChildren } from "./FlyoutChildren";

export const ItemsSidebar = ({
    icon: Icon,
    label,
    expanded,
    active,
    onClick,
    children,
    id,
    activeDropdown,
    setActiveDropdown,
    level = 0,
    darkMode = false,
    tooltip,
}) => {
    const [localActiveDropdown, setLocalActiveDropdown] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showFlyout, setShowFlyout] = useState(false);
    const [flyoutVisible, setFlyoutVisible] = useState(false);
    const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const flyoutRef = useRef(null);
    const hoverTimeout = useRef(null);
    const closeTimeout = useRef(null);
    const expandedRef = useRef(expanded);

    useEffect(() => {
        expandedRef.current = expanded;
        if (expanded) {
            clearTimeout(hoverTimeout.current);
            clearTimeout(closeTimeout.current);
            setFlyoutVisible(false);
            setShowFlyout(false);
        }
    }, [expanded]);

    const isDropdownOpen = level === 0
        ? activeDropdown === id
        : localActiveDropdown === id;

    const hasChildren = Boolean(children);

    useEffect(() => {
        if (!showFlyout) return;

        const handleMouseMove = (e) => {
            if (expandedRef.current) return;

            const overButton = buttonRef.current?.contains(e.target) || buttonRef.current === e.target;
            const overFlyout = flyoutRef.current?.contains(e.target) || flyoutRef.current === e.target;

            if (!overButton && !overFlyout) {
                clearTimeout(hoverTimeout.current);
                clearTimeout(closeTimeout.current);
                hoverTimeout.current = setTimeout(() => {
                    setFlyoutVisible(false);
                    closeTimeout.current = setTimeout(() => setShowFlyout(false), 180);
                }, 60);
            } else {
                clearTimeout(hoverTimeout.current);
                clearTimeout(closeTimeout.current);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [showFlyout]);

    useEffect(() => {
        return () => {
            clearTimeout(hoverTimeout.current);
            clearTimeout(closeTimeout.current);
            setShowFlyout(false);
            setFlyoutVisible(false);
        };
    }, []);

    const openFlyout = () => {
        if (expandedRef.current || !hasChildren || level !== 0) return;

        clearTimeout(hoverTimeout.current);
        clearTimeout(closeTimeout.current);

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setFlyoutPos({ top: rect.top, left: rect.right + 8 });
        }

        hoverTimeout.current = setTimeout(() => {
            if (expandedRef.current) return;
            setShowFlyout(true);
            setFlyoutVisible(false);
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    if (!expandedRef.current) setFlyoutVisible(true);
                })
            );
        }, 60);
    };

    const closeFlyout = () => {
        clearTimeout(hoverTimeout.current);
        clearTimeout(closeTimeout.current);
        setFlyoutVisible(false);
        setShowFlyout(false);
    };

    const handleClick = () => {
        clearTimeout(hoverTimeout.current);
        clearTimeout(closeTimeout.current);
        setFlyoutVisible(false);
        setShowFlyout(false);

        if (!hasChildren) { onClick?.(); return; }
        if (level === 0) setActiveDropdown(isDropdownOpen ? null : id);
        else setLocalActiveDropdown(isDropdownOpen ? null : id);
    };

    const getIndentation = () => !expanded ? '0px' : `${level * 12}px`;

    const getLevelStyles = () => {
        if (level === 0) return { padding: 'py-1.5 px-3', fontSize: 'text-[13px]', fontWeight: 'font-medium' };
        if (level === 1) return { padding: 'py-1 px-3', fontSize: 'text-[12px]', fontWeight: 'font-medium' };
        return { padding: 'py-1 px-2', fontSize: 'text-[11px]', fontWeight: 'font-normal' };
    };

    const styles = getLevelStyles();

    return (
        <div className="w-full">
            <button
                ref={buttonRef}
                onClick={handleClick}
                onMouseEnter={() => {
                    if (!expanded) setShowTooltip(true);
                    openFlyout();
                }}
                onMouseLeave={() => setShowTooltip(false)}
                className={`
                    flex items-center w-full ${styles.padding} my-1 rounded-xl 
                    transition-all duration-200
                    ${active && !hasChildren
                        ? "bg-green-600 text-white"
                        : darkMode
                            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                            : "text-slate-500 hover:bg-green-50 hover:text-green-600"
                    }
                    ${!expanded && level === 0 && "justify-center px-0"}
                    group relative
                `}
                style={{ marginLeft: getIndentation() }}
            >
                {Icon && (
                    <Icon
                        size={level === 0 ? 15 : 13}
                        className={`
                            transition-colors duration-200 flex-shrink-0
                            ${active && !hasChildren
                                ? "text-white"
                                : darkMode
                                    ? "text-slate-400 group-hover:text-white"
                                    : "text-slate-400 group-hover:text-green-600"
                            }
                        `}
                    />
                )}
                <div
                    className={`
                        flex items-center justify-between overflow-hidden whitespace-nowrap 
                        transition-all duration-300 ease-out ${styles.fontSize} ${styles.fontWeight}
                    `}
                    style={{
                        marginLeft: expanded && Icon ? '12px' : '0px',
                        opacity: expanded ? 1 : 0,
                        width: expanded ? 'auto' : '0px',
                        maxWidth: expanded ? '200px' : '0px'
                    }}
                >
                    <span className="truncate">{label}</span>
                    {hasChildren && (
                        <ChevronDown
                            size={level === 0 ? 14 : 12}
                            className={`transition-transform duration-300 ml-2 flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    )}
                </div>
            </button>

            {tooltip && (
                <Tooltip
                    text={tooltip}
                    show={showTooltip && !expanded}
                    darkMode={darkMode}
                    triggerRef={buttonRef}
                />
            )}

            {!expanded && hasChildren && level === 0 && showFlyout && createPortal(
                <div
                    ref={flyoutRef}
                    className={`
                        fixed z-[99999] min-w-[200px] rounded-xl shadow-2xl py-2 px-2
                        ${darkMode
                            ? 'bg-slate-900 border border-slate-700'
                            : 'bg-white border border-slate-200'
                        }
                    `}
                    style={{
                        top: flyoutPos.top,
                        left: flyoutPos.left,
                        opacity: flyoutVisible ? 1 : 0,
                        transform: flyoutVisible
                            ? 'translateX(0px) scale(1)'
                            : 'translateX(-6px) scale(0.97)',
                        transition: 'opacity 180ms ease, transform 180ms ease',
                        transformOrigin: 'left center',
                    }}
                >
                    <p className={`px-3 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider
                        ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {label}
                    </p>
                    <FlyoutChildren
                        children={children}
                        darkMode={darkMode}
                        onNavigate={closeFlyout}
                    />
                </div>,
                document.body
            )}

            {hasChildren && (
                <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{
                        maxHeight: isDropdownOpen && expanded ? '2000px' : '0px',
                        opacity: isDropdownOpen && expanded ? 1 : 0,
                        marginTop: isDropdownOpen && expanded ? '4px' : '0px',
                        marginBottom: isDropdownOpen && expanded ? '4px' : '0px'
                    }}
                >
                    <div className="flex flex-col gap-1" style={{ paddingLeft: level === 0 ? '0px' : '8px' }}>
                        {Array.isArray(children)
                            ? children.map((child, index) => {
                                if (!child) return null;
                                if (child.type === 'button') {
                                    return (
                                        <div key={index} style={{ marginLeft: expanded ? `${(level + 1) * 12}px` : '0px' }}>
                                            {child}
                                        </div>
                                    );
                                }
                                return {
                                    ...child,
                                    key: child.key || index,
                                    props: {
                                        ...child.props,
                                        level: level + 1,
                                        activeDropdown: localActiveDropdown,
                                        setActiveDropdown: setLocalActiveDropdown,
                                        darkMode
                                    }
                                };
                            })
                            : children && (
                                children.type === 'button'
                                    ? <div style={{ marginLeft: expanded ? `${(level + 1) * 12}px` : '0px' }}>{children}</div>
                                    : {
                                        ...children,
                                        props: {
                                            ...children.props,
                                            level: level + 1,
                                            activeDropdown: localActiveDropdown,
                                            setActiveDropdown: setLocalActiveDropdown,
                                            darkMode
                                        }
                                    }
                            )
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export const Tooltip = ({ text, show, darkMode, triggerRef }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show && triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({ top: rect.top + rect.height / 2, left: rect.right + 12 });
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
        }
    }, [show, triggerRef]);

    if (!show) return null;

    return createPortal(
        <div
            className={`
                fixed -translate-y-1/2 px-2 py-1 rounded-lg text-sm italic
                shadow-2xl whitespace-nowrap z-[99999] pointer-events-none
                transition-opacity duration-150 ease-out
                ${isVisible ? 'opacity-100' : 'opacity-0'}
                ${darkMode
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-gray-900 text-white border border-gray-700'}
            `}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
            {text}
            <div className={`
                absolute left-[-5px] top-1/2 -translate-y-1/2
                border-y-[5px] border-y-transparent border-r-[5px]
                ${darkMode ? 'border-r-slate-700' : 'border-r-gray-900'}
            `} />
        </div>,
        document.body
    );
};
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical } from 'lucide-react';

const ActionDropdown = ({
    options = [],
    icon: Icon = MoreVertical,
    title = "Acciones",
    variant = "table"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleToggle = (e) => {
        e.stopPropagation();
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const dropdownHeight = 220;
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < dropdownHeight;

            setCoords({
                top: openUpward
                    ? rect.top + window.scrollY - dropdownHeight
                    : rect.bottom + window.scrollY,
                left: rect.right + window.scrollX - 224
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", () => setIsOpen(false));
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", () => setIsOpen(false));
        };
    }, [isOpen]);

    const DropdownMenu = (
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 9999,
                transformOrigin: coords.top < triggerRef.current?.getBoundingClientRect().top
                    ? 'bottom right'
                    : 'top right'
            }}
            className="w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200"
        >
            {title && (
                <div className="px-4 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                </div>
            )}

            {options.map((item, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (item.onClick) item.onClick();
                        setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${item.className || 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    {item.icon && <span className="opacity-70">{item.icon}</span>}
                    {item.label}
                </button>
            ))}
        </div>
    );

    return (
        <>
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className={`transition-all outline-none ${variant === "card"
                    ? `w-10 h-10 rounded-full flex items-center justify-center shadow-lg
       ${isOpen ? 'bg-white/95 text-slate-700 scale-110' : 'bg-white/95 text-slate-700 hover:scale-110'}`
                    : `p-2 rounded-xl
       ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`
                    }`}
            >
                <Icon size={18} />
            </button>

            {isOpen && ReactDOM.createPortal(DropdownMenu, document.body)}
        </>
    );
};

export default ActionDropdown;
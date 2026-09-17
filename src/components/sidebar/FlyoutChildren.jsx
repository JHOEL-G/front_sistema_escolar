import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const FlyoutChildren = ({ children, darkMode, onNavigate, depth = 0 }) => {
    const [openSub, setOpenSub] = useState(null);

    const renderChild = (child, index) => {
        if (!child) return null;

        if (child.type === 'button') {
            return (
                <button
                    key={index}
                    onClick={() => { child.props.onClick?.(); onNavigate(); }}
                    className={child.props.className}
                    style={{ paddingLeft: `${12 + depth * 12}px` }}
                >
                    {child.props.children}
                </button>
            );
        }

        if (child.props?.children) {
            const isOpen = openSub === index;
            return (
                <div key={index}>
                    <button
                        onClick={() => setOpenSub(isOpen ? null : index)}
                        className={`w-full text-left py-1.5 px-3 text-xs rounded-lg transition-colors flex items-center justify-between
                    ${darkMode
                                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                                : "text-slate-600 hover:text-green-600 hover:bg-green-50"
                            }`}
                        style={{ paddingLeft: `${12 + depth * 12}px` }}
                    >
                        <span className="flex items-center gap-2">
                            {child.props.icon && <child.props.icon size={12} />}
                            {child.props.label}
                        </span>
                        <ChevronDown
                            size={11}
                            style={{ transition: 'transform 200ms ease' }}
                            className={isOpen ? 'rotate-180' : ''}
                        />
                    </button>

                    <div style={{
                        overflow: 'hidden',
                        maxHeight: isOpen ? '600px' : '0px',
                        opacity: isOpen ? 1 : 0,
                        transition: 'max-height 220ms ease, opacity 180ms ease',
                    }}>
                        <FlyoutChildren
                            children={child.props.children}
                            darkMode={darkMode}
                            onNavigate={onNavigate}
                            depth={depth + 1}
                        />
                    </div>
                </div>
            );
        }

        return (
            <button
                key={index}
                onClick={() => { child.props.onClick?.(); onNavigate(); }}
                className={`w-full text-left py-1.5 px-3 text-xs rounded-lg transition-colors flex items-center gap-2
                    ${darkMode
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-500 hover:text-green-600 hover:bg-green-50"
                    }`}
                style={{ paddingLeft: `${12 + depth * 12}px` }}
            >
                {child.props.icon && <child.props.icon size={12} />}
                {child.props.label}
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-0.5">
            {Array.isArray(children)
                ? children.map((child, i) => renderChild(child, i))
                : renderChild(children, 0)
            }
        </div>
    );
};
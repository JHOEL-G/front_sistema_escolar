import React, { useEffect } from "react";
import { AlertCircle, X, CheckCircle, Info } from "lucide-react";

const TOAST_CONFIG = {
    success: {
        color: 'bg-emerald-600',
        icon: <CheckCircle size={18} />,
        label: 'Éxito'
    },
    error: {
        color: 'bg-rose-600',
        icon: <AlertCircle size={18} />,
        label: 'Error'
    },
    info: {
        color: 'bg-blue-600',
        icon: <Info size={18} />,
        label: 'Información'
    }
};

function Toast({ message, type = 'info', onClose }) {
    const duration = 3500;

    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;

    return (
        <div className="fixed bottom-6 right-6 z-[100] group">
            <div className={`
                flex items-center gap-3 px-5 py-4 rounded-2xl text-white shadow-2xl 
                min-w-[300px] max-w-md transform transition-all duration-500 ease-out
                animate-in slide-in-from-right-10 fade-in
                ${config.color}
            `}>
                <div className="flex-shrink-0 bg-white/20 p-1.5 rounded-lg">
                    {config.icon}
                </div>

                <div className="flex-1 mr-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">
                        {config.label}
                    </p>
                    <p className="text-sm font-bold leading-tight">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors opacity-70 hover:opacity-100"
                    aria-label="Cerrar"
                >
                    <X size={16} />
                </button>

                <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full overflow-hidden rounded-b-2xl">
                    <div
                        className="h-full bg-white/40 animate-progress-shrink"
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Toast;
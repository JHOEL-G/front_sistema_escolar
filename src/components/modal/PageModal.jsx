import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    onConfirm,
    showConfirm = true,
    variant = "primary"
}) => {
    if (!isOpen) return null;

    const variantClasses = {
        primary: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
        danger: "bg-red-600 hover:bg-red-700 shadow-red-200",
        success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-[700px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-b border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8">
                    {children}
                </div>

                <div className="p-8 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    {showConfirm && (
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-4 px-6 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-95 ${variantClasses[variant]}`}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


export default Modal;

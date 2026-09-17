import React from 'react';
import { Check } from "lucide-react";

const Stepper = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Temas' },
        { id: 2, label: 'Privacidad' },
        { id: 3, label: 'Participantes' },
        { id: 4, label: 'Evaluadores' },
        { id: 5, label: 'Configuración' },
    ];

    return (
        <div className="w-full py-1 mb-20">
            <div className="max-w-full mx-auto flex items-center justify-between relative">

                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />

                <div
                    className="absolute top-1/2 left-0 h-[2px] bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 relative
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-110'
                                    : isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white text-slate-400 border-2 border-slate-100'
                                }
                            `}>
                                {isCompleted ? (
                                    <Check size={20} strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-black">{step.id}</span>
                                )}

                                {isActive && (
                                    <div className="absolute inset-0 w-10 h-10 bg-indigo-400 rounded-2xl blur-lg opacity-30 animate-pulse -z-10" />
                                )}
                            </div>

                            <div className="absolute -bottom-14 flex flex-col items-center w-max text-center">
                                <span className={`
                                    text-[9px] uppercase tracking-[0.15em] font-black mb-0.5 transition-colors duration-300
                                    ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-500' : 'text-slate-300'}
                                `}>
                                    {isActive ? 'Actual' : isCompleted ? 'Completado' : 'Espera'}
                                </span>
                                <span className={`
                                    text-xs font-bold transition-all duration-300
                                    ${isActive ? 'text-slate-900 scale-105' : 'text-slate-400'}
                                `}>
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const StepperLayout = ({ currentStep }) => {
    return (
        <div className="w-full">
            <Stepper currentStep={currentStep} />
        </div>
    );
};
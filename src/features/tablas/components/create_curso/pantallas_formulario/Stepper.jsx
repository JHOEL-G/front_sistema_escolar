import { Check } from "lucide-react";

const Stepper = ({ currentStep, type = "completo" }) => {
    const stepsConfig = {
        completo: [
            { id: 1, label: 'Información básica' },
            { id: 2, label: 'Landing page' },
            { id: 3, label: 'Contenido del curso' },
            { id: 4, label: 'Ponderación' },
            { id: 5, label: 'Configuración' },
        ],
        previa: [
            { id: 1, label: 'Información Previa' },
            { id: 2, label: 'Configuración Final' },
        ]
    };

    const steps = stepsConfig[type] || stepsConfig.completo;

    return (
        <div className="w-full mb-20">
            <div className="max-w-[75vw] mx-auto flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0" />

                <div
                    className="absolute top-1/2 left-0 h-[2px] bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center group">
                            <div className={`
                                w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-110'
                                    : isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-slate-400 border-2 border-slate-200'
                                }
                            `}>
                                {isCompleted ? (
                                    <Check size={20} strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-bold">{step.id}</span>
                                )}
                            </div>

                            <div className="absolute -bottom-12 flex flex-col items-center w-max">
                                <span className={`
                                    text-[9px] uppercase tracking-[0.15em] font-black mb-1 transition-colors
                                    ${isActive ? 'text-indigo-600' : 'text-slate-400'}
                                `}>
                                    {isActive ? 'En progreso' : isCompleted ? 'Listo' : 'Espera'}
                                </span>
                                <span className={`
                                    text-xs font-bold transition-all
                                    ${isActive ? 'text-slate-900 scale-105' : 'text-slate-500'}
                                `}>
                                    {step.label}
                                </span>
                            </div>

                            {isActive && (
                                <div className="absolute inset-0 w-10 h-10 bg-indigo-400 rounded-2xl blur-lg opacity-30 animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
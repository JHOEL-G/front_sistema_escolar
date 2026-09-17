import { AlertCircle } from 'lucide-react';
import { X } from 'lucide-react';
import { Search, Check } from 'lucide-react';
import { useState } from 'react';

export const StepItem = ({ label, active, completed, number }) => (
    <div className="flex flex-col items-center z-10">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-[12px] font-bold border-2 transition-colors ${active ? 'border-blue-600 bg-white text-blue-600 shadow-md' : 'border-gray-300 bg-white text-gray-300'}`}>
            {completed ? <Check size={16} strokeWidth={3} /> : number}
        </div>
        <span className={`text-[11px] font-bold ${active ? 'text-blue-700' : 'text-gray-400'}`}>{label}</span>
    </div>
);

export const InputField = ({ label, placeholder, name, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-slate-800">{label}</label>
        <input className="w-full p-3 border border-gray-300 rounded-2xl outline-none focus:border-blue-500 transition-all"
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange} />
    </div>
);

export const SelectField = ({ label, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-slate-800">{label}</label>
        <div className="relative">
            <input className="w-full p-3 border border-gray-300 rounded-2xl pr-10 outline-none focus:border-blue-500 cursor-pointer" placeholder={placeholder} readOnly />
            <Search className="absolute right-4 top-3.5 text-gray-400" size={18} />
        </div>
    </div>
);

export const InputConError = ({ label, name, value, onChange, errors, type = "text", required = false }) => {
    const [inputValue, setInputValue] = useState("");
    const isTagMode = Array.isArray(value);

    const handleKeyDown = (e) => {
        if (!isTagMode) return;

        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            const tag = inputValue.trim();
            if (tag && !value.includes(tag)) {
                onChange({
                    target: {
                        name,
                        value: [...value, tag]
                    }
                });
                setInputValue("");
            }
        }
        else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            const newTags = value.slice(0, -1);
            onChange({ target: { name, value: newTags } });
        }
    };

    const removeTag = (tagToRemove) => {
        onChange({
            target: {
                name,
                value: value.filter(t => t !== tagToRemove)
            }
        });
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
                {label}{required && <span className="text-rose-500 ml-1">*</span>}
            </label>

            <div className={`flex flex-wrap gap-2 w-full px-2 py-2 border-2 rounded-xl transition-all duration-200 min-h-[52px] items-center ${errors && errors[name]
                ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100 bg-rose-50/30'
                : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 bg-white'
                }`}>
                {isTagMode && value.map((tag, index) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 animate-in zoom-in-95">
                        {tag}
                        <X
                            size={14}
                            className="cursor-pointer hover:text-blue-900"
                            onClick={() => removeTag(tag)}
                        />
                    </span>
                ))}

                <input
                    name={name}
                    type={isTagMode ? "text" : type}
                    value={isTagMode ? inputValue : value}
                    onChange={(e) => isTagMode ? setInputValue(e.target.value) : onChange(e)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent outline-none px-2 py-1 text-slate-700 min-w-[120px]"
                    placeholder={isTagMode && value.length > 0 ? "" : `Ingrese ${label.toLowerCase()}`}
                />
            </div>

            {errors && errors[name] && (
                <div className="flex items-center gap-2 text-rose-600 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={14} />
                    <span>{errors[name]}</span>
                </div>
            )}
        </div>
    );
};

export const SelectConError = ({ label, name, value, onChange, options = [], errors = {}, required = false }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
            {label}{required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 bg-white ${errors[name]
                ? 'border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'
                : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
                }`}
        >
            <option value="">Seleccione {label.toLowerCase()}</option>

            {Array.isArray(options) && options.map((option, index) => {
                const isObject = typeof option === 'object' && option !== null;
                const optionValue = isObject ? (option.value ?? option.id) : option;
                const optionLabel = isObject ? (option.label || option.nombre) : option;

                return (
                    <option key={isObject ? (option.id || index) : index} value={optionValue}>
                        {optionLabel}
                    </option>
                );
            })}
        </select>

        {errors[name] && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle size={14} />
                <span>{errors[name]}</span>
            </div>
        )}
    </div>
);
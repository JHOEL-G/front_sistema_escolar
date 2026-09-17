import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left mb-2"
            >
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0
                }}
            >
                <div className="mt-2 space-y-2">{children}</div>
            </div>
        </div>
    );
};
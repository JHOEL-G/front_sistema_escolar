import { X } from "lucide-react";
import { useState } from "react";

const TagInput = ({ tags, setTags, placeholder, icon: Icon }) => {
    const [inputValue, setInputValue] = useState("");

    const currentTags = Array.isArray(tags) ? tags : [];

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const tag = inputValue.trim().replace(/,/g, "");
            if (tag && !currentTags.includes(tag)) {
                setTags([...currentTags, tag]);
                setInputValue("");
            }
        } else if (e.key === "Backspace" && !inputValue && currentTags.length > 0) {
            setTags(currentTags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(currentTags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="relative group">
            <div className="min-h-[120px] p-3 bg-white border border-slate-200 rounded-2xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all flex flex-wrap gap-2 content-start">
                {currentTags.map((tag, index) => (
                    <span
                        key={index}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 group-hover:bg-indigo-100 transition-colors"
                    >
                        {tag}
                        <button
                            onClick={() => removeTag(index)}
                            className="hover:text-indigo-800 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-600 placeholder:text-slate-300 py-1"
                    placeholder={tags.length === 0 ? placeholder : ""}
                />
            </div>
            {Icon && <Icon className="absolute bottom-4 right-4 text-slate-300 pointer-events-none" size={18} />}
        </div>
    );
};

export default TagInput;
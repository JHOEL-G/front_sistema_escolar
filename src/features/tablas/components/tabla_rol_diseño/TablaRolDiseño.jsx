export const getPaginationRange = (current, total) => {
    const delta = 1;
    const range = [];
    if (total <= 7) {
        for (let i = 1; i <= total; i++) range.push(i);
        return range;
    }
    range.push(1);
    if (current > delta + 2) range.push("...");
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
    for (let i = start; i <= end; i++) range.push(i);
    if (current < total - (delta + 1)) range.push("...");
    if (total > 1) range.push(total);
    return range;
};


export const AvatarStack = ({ count }) => {
    const safeCount = Number.isInteger(count) && count > 0 ? count : 0;

    if (safeCount === 0) {
        return <span className="text-slate-300 text-[11px] font-medium italic">Sin usuarios</span>;
    }

    const visualAvatars = Math.min(safeCount, 3);

    return (
        <div className="flex items-center">
            <div className="flex -space-x-3 overflow-hidden">
                {[...Array(visualAvatars)].map((_, i) => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-50 flex-shrink-0">
                        <img
                            className="h-full w-full object-cover rounded-full"
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=RoleUser${i}${safeCount}`}
                            alt="User"
                        />
                    </div>
                ))}
            </div>
            {safeCount > 0 && (
                <span className="ml-3 text-[11px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    +{safeCount}
                </span>
            )}
        </div>
    );
};
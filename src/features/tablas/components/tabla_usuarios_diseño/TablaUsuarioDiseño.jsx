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

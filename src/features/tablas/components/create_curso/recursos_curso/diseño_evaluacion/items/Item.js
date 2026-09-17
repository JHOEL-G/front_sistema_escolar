export const getFileConfig = (nombre) => {
    const ext = (nombre || '').split('.').pop().toLowerCase();
    const configs = {
        pdf: { bg: 'bg-red-50', icon: '📄', label: 'PDF' },
        xlsx: { bg: 'bg-green-50', icon: '📊', label: 'Excel' },
        xls: { bg: 'bg-green-50', icon: '📊', label: 'Excel' },
        doc: { bg: 'bg-blue-50', icon: '📝', label: 'Word' },
        docx: { bg: 'bg-blue-50', icon: '📝', label: 'Word' },
        txt: { bg: 'bg-sky-50', icon: '📃', label: 'TXT' },
        zip: { bg: 'bg-amber-50', icon: '🗜️', label: 'ZIP' },
        png: { bg: 'bg-purple-50', icon: '🖼️', label: 'IMG' },
        jpg: { bg: 'bg-purple-50', icon: '🖼️', label: 'IMG' },
        jpeg: { bg: 'bg-purple-50', icon: '🖼️', label: 'IMG' },
        mp4: { bg: 'bg-indigo-50', icon: '🎬', label: 'VIDEO' },
        mp3: { bg: 'bg-pink-50', icon: '🎵', label: 'AUDIO' },
    };
    return configs[ext] || { bg: 'bg-slate-50', icon: '📎', label: ext.toUpperCase() || 'FILE' };
};


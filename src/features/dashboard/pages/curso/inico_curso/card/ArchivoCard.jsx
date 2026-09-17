import { FileText } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { File } from "lucide-react";
import { Eye } from "lucide-react";
import { FileSpreadsheet } from "lucide-react";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

const ArchivoViewer = ({ archivo, index }) => {
    const [contenidoTxt, setContenidoTxt] = useState("");
    const [cargando, setCargando] = useState(false);

    const urlLimpia = archivo.ArchivoPath?.split('?')[0] || '';
    const ext = urlLimpia.split('.').pop().toLowerCase();
    const nombre = archivo.NombreArchivo || `Archivo ${index + 1}`;

    useEffect(() => {
        if (ext === 'txt' && archivo.ArchivoPath) {
            setCargando(true);
            fetch(archivo.ArchivoPath)
                .then(r => r.text())
                .then(t => setContenidoTxt(t))
                .catch(() => setContenidoTxt("No se pudo cargar el contenido."))
                .finally(() => setCargando(false));
        }
    }, [archivo.ArchivoPath, ext]);

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <img
                    src={archivo.ArchivoPath}
                    alt={nombre}
                    className="w-full max-h-[450px] object-contain rounded-2xl border border-slate-200 shadow-sm bg-white"
                />
            </div>
        );
    }

    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <video controls className="w-full rounded-2xl border border-slate-200 bg-black shadow-lg" style={{ maxHeight: '450px' }}>
                    <source src={archivo.ArchivoPath} type={`video/${ext === 'mov' ? 'mp4' : ext}`} />
                </video>
            </div>
        );
    }

    if (ext === 'txt') {
        return (
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-inner animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenido del archivo</span>
                    <a href={archivo.ArchivoPath} download className="text-sky-400 hover:text-sky-300 transition-colors">
                        <Download size={14} />
                    </a>
                </div>
                <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap max-h-[350px] overflow-y-auto custom-scrollbar">
                    {cargando ? "Cargando contenido..." : contenidoTxt}
                </pre>
            </div>
        );
    }

    if (ext === 'pdf') {
        return (
            <div className="animate-in fade-in duration-300">
                <iframe
                    src={`${archivo.ArchivoPath}#toolbar=0`}
                    className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
                    style={{ height: '500px' }}
                    title={nombre}
                />
            </div>
        );
    }

    const esExcel = ['xlsx', 'xls', 'csv'].includes(ext);
    const esWord = ['doc', 'docx'].includes(ext);

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-center space-y-4 animate-in fade-in duration-300">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm ${esExcel ? 'bg-emerald-50 text-emerald-500' : esWord ? 'bg-blue-50 text-blue-500' : 'bg-sky-50 text-sky-500'}`}>
                {esExcel ? <FileSpreadsheet size={40} /> : esWord ? <FileText size={40} /> : <File size={40} />}
            </div>
            <div>
                <h4 className="text-lg font-bold text-slate-800">Este archivo no se puede previsualizar</h4>
                <p className="text-sm text-slate-500 mt-1">Pero no te preocupes, puedes descargarlo para verlo en tu dispositivo.</p>
            </div>
            <a
                href={archivo.ArchivoPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
                <Download size={18} />
                Descargar {ext.toUpperCase()}
            </a>
        </div>
    );
};

export const CarruselArchivos = ({ archivos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!archivos || archivos.length === 0) return null;

    const next = () => setCurrentIndex((prev) => (prev + 1) % archivos.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + archivos.length) % archivos.length);

    return (
        <div className="relative group">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                        <Eye size={14} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Vista previa de archivos ({currentIndex + 1} de {archivos.length})
                    </span>
                </div>
                <h4 className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                    {archivos[currentIndex].NombreArchivo || `Archivo ${currentIndex + 1}`}
                </h4>
            </div>

            <div className="relative overflow-hidden min-h-[300px] flex flex-col">
                <ArchivoViewer archivo={archivos[currentIndex]} index={currentIndex} />

                {archivos.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur shadow-lg border border-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-sky-500 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur shadow-lg border border-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-sky-500 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {archivos.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-6">
                    {archivos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-sky-500' : 'w-2 bg-slate-200'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
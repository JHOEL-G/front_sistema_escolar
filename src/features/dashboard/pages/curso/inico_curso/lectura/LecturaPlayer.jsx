import React from 'react';
import { BookOpen, Download } from 'lucide-react';

const LecturaPlayer = ({ dataJson, titulo }) => {

    if (dataJson?.ArchivoPDFPath) return (
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{dataJson.NombreArchivoPDF || 'Documento.pdf'}</p>
                        <p className="text-slate-400 text-xs">Documento PDF</p>
                    </div>
                </div>
                <a
                    href={dataJson.ArchivoPDFPath}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                    <Download size={16} /> Descargar
                </a>
            </div>
            <iframe src={dataJson.ArchivoPDFPath} className="w-full h-[650px]" title="PDF Viewer" />
        </div>
    );

    if (dataJson?.ContenidoHTML) return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: dataJson.ContenidoHTML }} />
        </div>
    );

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 text-center">
            <BookOpen size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay contenido disponible para esta lectura.</p>
        </div>
    );
};

export default LecturaPlayer;
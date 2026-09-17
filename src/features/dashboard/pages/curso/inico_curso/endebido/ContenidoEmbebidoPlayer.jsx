import React from 'react';
import { Code } from 'lucide-react';

const ContenidoEmbebidoPlayer = ({ dataJson, titulo }) => {
    const embedUrl = dataJson?.Url || dataJson?.url || dataJson?.Link || dataJson?.link;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
            <div className="h-1.5 w-full bg-gradient-to-r from-slate-600 to-slate-800" />
            <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <Code size={30} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Contenido Embebido</p>
                        <h3 className="text-2xl font-black text-slate-900">{titulo}</h3>
                    </div>
                </div>
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-[650px] rounded-2xl border border-slate-100"
                        title={titulo}
                        allowFullScreen
                    />
                ) : (
                    <p className="text-slate-400 text-sm text-center py-10">No se encontró contenido embebido.</p>
                )}
            </div>
        </div>
    );
};

export default ContenidoEmbebidoPlayer;
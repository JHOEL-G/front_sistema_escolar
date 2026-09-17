import { Monitor, Video, ExternalLink } from 'lucide-react';

const ZoomPlayer = ({ dataJson, titulo }) => {
    const rawLink = dataJson?.enlaceZoom || dataJson?.linkZoom || dataJson?.enlace || dataJson?.link || dataJson?.LinkSesion;
    const link = rawLink && !rawLink.startsWith('http') ? `https://${rawLink}` : rawLink;

    const isJitsi = link?.includes('jit.si');
    const platformName = isJitsi ? 'Jitsi Meet' : 'Zoom';
    const platformColor = isJitsi ? 'from-orange-500 to-red-500' : 'from-blue-500 to-indigo-500';
    const textColor = isJitsi ? 'text-orange-500' : 'text-blue-500';
    const shadowColor = isJitsi ? 'shadow-orange-200' : 'shadow-blue-200';
    const bgColorContainer = isJitsi ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100';

    return (
        <div className={`bg-white rounded-[2.5rem] shadow-sm overflow-hidden border ${isJitsi ? 'border-orange-100' : 'border-blue-100'}`}>
            <div className={`h-1.5 w-full bg-gradient-to-r ${platformColor}`} />
            <div className="p-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${platformColor} rounded-3xl flex items-center justify-center shadow-lg ${shadowColor}`}>
                        <Monitor size={30} className="text-white" />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black ${textColor} uppercase tracking-[0.2em] mb-1`}>
                            Sesión Online · {platformName}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900">{titulo}</h3>
                    </div>
                </div>

                {/* Banner principal */}
                <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${isJitsi ? 'from-slate-900 via-orange-950 to-red-900' : 'from-slate-900 via-blue-950 to-indigo-900'} p-10 mb-6 flex flex-col items-center text-center`}>
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className={`absolute top-4 left-4 w-32 h-32 ${isJitsi ? 'bg-orange-400' : 'bg-blue-400'} rounded-full blur-3xl`} />
                        <div className={`absolute bottom-4 right-4 w-40 h-40 ${isJitsi ? 'bg-red-400' : 'bg-indigo-400'} rounded-full blur-3xl`} />
                    </div>

                    <div className="relative w-24 h-24 mb-6">
                        <div className={`absolute inset-0 ${isJitsi ? 'bg-orange-500/20' : 'bg-blue-500/20'} rounded-full animate-ping`} />
                        <div className={`relative w-24 h-24 bg-gradient-to-br ${platformColor} rounded-full flex items-center justify-center shadow-2xl ${isJitsi ? 'shadow-orange-500/40' : 'shadow-blue-500/40'}`}>
                            <Video size={40} className="text-white" />
                        </div>
                    </div>

                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Sesión en vivo disponible</p>
                    <h4 className="text-white text-xl font-black mb-1">{titulo}</h4>
                    <p className="text-white/40 text-xs font-medium mb-8">Haz clic para unirte a la sesión en tiempo real</p>

                    {link ? (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center gap-3 px-10 py-4 bg-white ${isJitsi ? 'text-orange-700' : 'text-blue-700'} font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all hover:-translate-y-1 text-sm uppercase tracking-widest`}
                        >
                            Unirse a la sesión
                        </a>
                    ) : (
                        <div className="px-8 py-4 bg-white/10 text-white/40 font-black rounded-2xl text-sm uppercase tracking-widest">
                            Enlace no disponible
                        </div>
                    )}
                </div>

                {/* Link de acceso */}
                {link && (
                    <div className={`flex items-center gap-3 p-4 ${bgColorContainer} rounded-2xl`}>
                        <div className={`w-9 h-9 ${isJitsi ? 'bg-orange-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <ExternalLink size={16} className={textColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-[10px] font-black ${isJitsi ? 'text-orange-400' : 'text-blue-400'} uppercase tracking-widest mb-0.5`}>Enlace de acceso</p>
                            <p className={`text-sm ${isJitsi ? 'text-orange-700' : 'text-blue-700'} font-medium truncate`}>{link}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZoomPlayer;
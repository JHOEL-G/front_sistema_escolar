const ActividadCard = ({ icono: Icono, colorBg, colorText, colorBorder, colorLight, titulo, nombre, children }) => (
    <div className={`bg-white rounded-[2.5rem] shadow-sm overflow-hidden border ${colorBorder}`}>
        <div className={`h-1.5 w-full ${colorBg}`} />
        <div className="p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 ${colorBg} rounded-3xl flex items-center justify-center shadow-lg`}>
                    <Icono size={30} className="text-white" />
                </div>
                <div>
                    <p className={`text-[10px] font-black ${colorText} uppercase tracking-[0.2em] mb-1`}>{titulo}</p>
                    <h3 className="text-2xl font-black text-slate-900">{nombre}</h3>
                </div>
            </div>
            {children}
        </div>
    </div>
);

export default ActividadCard;
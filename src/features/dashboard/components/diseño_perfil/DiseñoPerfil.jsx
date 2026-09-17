import { BarChart2 } from "lucide-react";
import { ChevronDown } from "lucide-react";
import keycloak from "../../../auth/services/keycloakConfig";
import { useEffect } from "react";
import { useImpersonation } from "../../../../components/perstectiva/ImpersonationProviderr";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import { useState } from "react";
import useGroqMotivation from "../../pages/interface_principal/ia_interactiva/useGroqMotivation ";

export const UserHeader = ({ darkMode }) => {

    const { impersonatedUser } = useImpersonation();
    const [puesto, setPuesto] = useState('');
    const [nombre, setNombre] = useState('');
    const [imagenPortada, setImagenPortada] = useState('');
    const { avatarUrl, detectarGeneroYAvatar } = useGroqMotivation([]);


    useEffect(() => {
        const cargar = async () => {
            if (impersonatedUser) {
                setPuesto(impersonatedUser.puesto ?? '');
                setNombre(`${impersonatedUser.nombre} ${impersonatedUser.apeLLido}`);
                setImagenPortada(impersonatedUser?.imagenPortada || '');
            } else {
                const res = await serviceApiNet.Usuario.getMe();
                const perfil = res.data?.data || res.data;
                setPuesto(perfil?.puesto ?? '');
                setNombre(`${keycloak.tokenParsed?.given_name || ''} ${keycloak.tokenParsed?.family_name || ''}`);
                setImagenPortada(perfil?.imagenPortada || '');
            }
        };
        cargar();
    }, [impersonatedUser]);

    useEffect(() => {
        const nombreCorto = nombre.split(' ')[0];
        if (nombreCorto) detectarGeneroYAvatar(nombreCorto);
    }, [nombre]);


    return (
        <div className={`rounded-2xl p-4 mb-8 flex items-center justify-between text-white shadow-xl transition-all border ${darkMode
            ? "bg-slate-900/50 border-emerald-500/10 shadow-emerald-900/20 backdrop-blur-md"
            : "bg-slate-900 border-transparent shadow-slate-200"
            }`}>
            <div className="flex items-center space-x-4">
                <div className="relative group cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-slate-800 p-0.5 transition-transform group-hover:scale-105">
                        <img
                            src={imagenPortada || avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`}
                            alt={nombre}
                            className="w-full h-full object-cover rounded-[0.9rem]"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-lg p-1 shadow-lg border-2 border-slate-900">
                        <div className="w-2.5 h-2.5 flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">✎</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-emerald-50">
                        {nombre}
                    </h2>
                    <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-tighter">
                        {puesto}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-8">
                <div className="hidden sm:flex items-center space-x-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Balance actual</span>
                    <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-inner">
                        <div className="w-4 h-4 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-[9px] text-amber-900 font-black shadow-sm">
                            $
                        </div>
                        <span className="text-sm font-black text-emerald-400">0</span>
                    </div>
                </div>

                <button className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 border border-emerald-500/20 flex items-center gap-2 group">
                    <span>Ver mis puntos</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
}

export const FilterButton = ({ label, placeholder }) => (
    <div className="flex flex-col space-y-1 flex-1">
        <label className="text-[11px] font-bold text-gray-400 ml-1">{label}</label>
        <button className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300 transition-all text-left">
            <span className="truncate">{placeholder}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </button>
    </div>
);

export const EmptyState = () => (
    <div className="mt-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
            <BarChart2 className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-gray-800 font-bold text-lg mb-3 italic">¡Ups! No hay resultados.</h3>
        <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            Lo sentimos, no hay resultados para tu búsqueda actual. ¿Quieres intentar con otros términos o ponerte en contacto con nosotros para obtener asistencia?
        </p>
    </div>
);



export const FilterSelect = ({ label, options = [], value, onChange }) => (
    <div className="flex flex-col space-y-1 flex-1 min-w-[150px]">
        <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase tracking-wider">
            {label}
        </label>

        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 
                           hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50/50 
                           transition-all cursor-pointer outline-none pr-10"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
            </div>
        </div>
    </div>
);
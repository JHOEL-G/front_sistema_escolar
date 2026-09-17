import React, { useState, useEffect } from 'react';
import { X, Search, Eye, Loader2, User } from 'lucide-react';
import { useImpersonation } from './ImpersonationProviderr';
import serviceApiNet from '../../lib/api/serviceApiNet';
import { useNavigate } from 'react-router-dom';

const ModalVerComoUsuario = ({ onClose }) => {
    const { startImpersonation } = useImpersonation();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        const fetchUsuarios = async () => {
            try {
                const res = await serviceApiNet.Usuario.list(null, controller.signal);
                const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                setUsuarios(data);
            } catch (e) {
                if (e.name !== 'CanceledError') console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuarios();
        return () => controller.abort();
    }, []);

    const filtrados = usuarios.filter(u => {
        const nombre = `${u.nombre ?? ''} ${u.apeLLido ?? ''}`.toLowerCase();
        const correo = (u.correo ?? '').toLowerCase();
        const q = search.toLowerCase();
        return nombre.includes(q) || correo.includes(q);
    });

    const handleSelect = (usuario) => {
        startImpersonation(usuario);
        navigate('/');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center">
                            <Eye size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Ver como usuario</h2>
                            <p className="text-xs text-slate-400 font-medium">Selecciona un usuario para simular su vista</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-50">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto max-h-96 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-slate-300" size={28} />
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                            <User size={36} />
                            <p className="mt-3 text-sm font-medium">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filtrados.map((u) => {
                                const nombre = `${u.nombre ?? ''} ${u.apeLLido ?? ''}`.trim();
                                const permiso = u.permisoNombre ?? u.nivelPermiso ?? '';

                                return (
                                    <button
                                        key={u.usuarioId ?? u.id ?? u.correo}
                                        onClick={() => handleSelect(u)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-amber-50 hover:border-amber-100 border border-transparent transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-amber-200 transition-all">
                                            <img
                                                src={u.imagenPortada || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`}
                                                alt={nombre}
                                                className="w-full h-full"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{nombre}</p>
                                            <p className="text-xs text-slate-400 truncate">{u.correo}</p>
                                        </div>

                                        {permiso && (
                                            <span className="shrink-0 px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                                                {permiso}
                                            </span>
                                        )}

                                        <Eye size={15} className="text-slate-200 group-hover:text-amber-400 transition-colors shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-50 flex justify-end">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalVerComoUsuario;
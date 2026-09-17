import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, BookOpen, Loader2, Check, Sparkles, LayoutList, Info } from "lucide-react";
import serviceApiNet from "../../../../../lib/api/serviceApiNet";

export const ModalBancaPreguntas = ({ isOpen, onClose, onAceptar, seleccionPrevias = [] }) => {
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [seleccion, setSeleccion] = useState(new Map());

    useEffect(() => {
        if (!isOpen) return;
        const controller = new AbortController();

        const cargar = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await serviceApiNet.Preguntas.listar(controller.signal);
                const listaReal = response.data?.data || [];
                setBancas(listaReal);
            } catch (err) {
                if (err.name !== "AbortError") setError("Error al cargar las bancas.");
            } finally {
                setLoading(false);
            }
        };

        const m = new Map();
        seleccionPrevias.forEach(p => m.set(p.bancaId, { ...p, cantidad: p.cantidad || 0 }));
        setSeleccion(m);
        setBusqueda("");
        cargar();

        return () => controller.abort();
    }, [isOpen]);

    const bancasFiltradas = Array.isArray(bancas)
        ? bancas.filter(b => b.nombreBanca?.toLowerCase().includes(busqueda.toLowerCase()))
        : [];

    const toggleSeleccion = (banca) => {
        setSeleccion(prev => {
            const next = new Map(prev);
            if (next.has(banca.bancaId)) {
                next.delete(banca.bancaId);
            } else {
                next.set(banca.bancaId, { ...banca, cantidad: 0 });
            }
            return next;
        });
    };

    const setCantidad = (id, value) => {
        setSeleccion(prev => {
            const next = new Map(prev);
            const item = next.get(id);
            if (item) next.set(id, { ...item, cantidad: Math.max(0, parseInt(value) || 0) });
            return next;
        });
    };

    const handleAceptar = () => {
        onAceptar(Array.from(seleccion.values()));
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-600/20 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] border border-slate-100 overflow-hidden">

                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                            <BookOpen size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Banca de Preguntas</h2>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs text-slate-500 font-medium italic">Selecciona los bancos para tu evaluación</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-10 pt-6 pb-2">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Filtrar por nombre de banca..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 outline-none focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="mx-10 mt-4 rounded-t-2xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] bg-slate-50/80 px-6 py-3 border border-slate-100 border-b-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información del Banco</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Cantidad</span>
                    </div>
                </div>

                <div className="mx-10 mb-8 overflow-y-auto flex-1 border border-slate-100 divide-y divide-slate-50 bg-white">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="animate-spin mx-auto mb-4 text-violet-500" size={32} />
                            <p className="text-sm font-medium text-slate-500">Sincronizando base de datos...</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 px-6 text-center">
                            <Info className="mx-auto text-amber-500 mb-2" size={24} />
                            <p className="text-sm text-slate-600">{error}</p>
                        </div>
                    ) : bancasFiltradas.length === 0 ? (
                        <div className="py-20 text-center">
                            <LayoutList className="mx-auto mb-4 text-slate-200" size={48} />
                            <p className="text-sm text-slate-400">No se encontraron resultados</p>
                        </div>
                    ) : (
                        bancasFiltradas.map((banca) => {
                            const seleccionado = seleccion.has(banca.bancaId);
                            const countSimples = banca.preguntas?.filter(p => p.tipoPreguntaId === 1).length || 0;

                            return (
                                <div
                                    key={banca.bancaId}
                                    className={`grid grid-cols-[1fr_auto] items-center px-6 py-4 transition-all cursor-pointer ${seleccionado ? "bg-violet-50/30" : "hover:bg-slate-50/50"
                                        }`}
                                    onClick={() => toggleSeleccion(banca)}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${seleccionado
                                            ? "bg-violet-600 border-violet-600 shadow-md shadow-violet-200"
                                            : "border-slate-200 bg-white"
                                            }`}>
                                            {seleccionado && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${seleccionado ? "text-violet-900" : "text-slate-700"}`}>
                                                {banca.nombreBanca}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md">
                                                    {banca.totalPreguntas} Total
                                                </span>
                                                <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-md">
                                                    {countSimples} Simples
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-6" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="number"
                                            min={0}
                                            max={banca.totalPreguntas}
                                            value={seleccion.get(banca.bancaId)?.cantidad ?? 0}
                                            onChange={e => {
                                                if (!seleccionado) toggleSeleccion(banca);
                                                setCantidad(banca.bancaId, e.target.value);
                                            }}
                                            disabled={!seleccionado}
                                            className={`w-20 text-center py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${seleccionado
                                                ? "bg-white border-violet-200 text-violet-700 shadow-sm"
                                                : "bg-slate-50 border-transparent text-slate-400 opacity-50"
                                                }`}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                            {seleccion.size} seleccionados
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {Array.from(seleccion.values()).reduce((acc, curr) => acc + curr.cantidad, 0)} preguntas en total
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-500 font-semibold text-sm hover:text-slate-800 transition-colors"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={handleAceptar}
                            disabled={seleccion.size === 0}
                            className="group flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-xl shadow-slate-200 hover:bg-violet-600 hover:shadow-violet-200 transition-all disabled:opacity-30 disabled:shadow-none"
                        >
                            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                            Confirmar Selección
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
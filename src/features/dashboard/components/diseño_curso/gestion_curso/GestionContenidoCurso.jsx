import React, { useState, useEffect } from "react";
import {
    Plus, Save, ArrowLeft, CheckCircle2, Loader2, AlertCircle,
    Package, Zap
} from "lucide-react";
import serviceApiNet from "../../../../../lib/api/serviceApiNet";
import SelectorRecursos from "../../../../tablas/components/create_curso/recursos_curso/SelectorRecursos ";
import { ModuloCard } from "./DiseñoContenido/DetalleGestion";
import { Layers } from "lucide-react";

const TIPOS_PONDERABLES = [1, 2, 3, 8, 11];

const GestionContenidoCurso = ({ cursoId, cursoNombre, modulos: modulosIniciales = [], onClose }) => {
    const [modulos, setModulos] = useState([]);
    const [modulosNuevos, setModulosNuevos] = useState([]);
    const [cargandoModulos, setCargandoModulos] = useState(true);

    const [selectorAbierto, setSelectorAbierto] = useState(false);
    const [moduloActivo, setModuloActivo] = useState(null);
    const [sesionEditando, setSesionEditando] = useState(null);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(false);
    const [agregandoModulo, setAgregandoModulo] = useState(false);
    const [nombreModuloNuevo, setNombreModuloNuevo] = useState("");

    const totalRecursosNuevos =
        modulos.reduce((acc, m) => acc + m.recursos.filter(r => r.isNew).length, 0) +
        modulosNuevos.reduce((acc, m) => acc + m.recursos.length, 0);

    const hayRecursosPonderables = modulos.some(m =>
        m.recursos.some(r => TIPOS_PONDERABLES.includes(r.tipoId) && r.incluirEnPonderacion)
    );

    const abrirSelector = (moduloId) => {
        setSesionEditando(null);
        setModuloActivo(moduloId);
        setSelectorAbierto(true);
    };

    const abrirEdicion = (moduloId, recurso, e) => {
        e.stopPropagation();
        setSesionEditando({ moduloId, recursoId: recurso.id, datos: recurso });
        setModuloActivo(moduloId);
        setSelectorAbierto(true);
    };

    useEffect(() => {
        if (!cursoId) return;
        const cargar = async () => {
            setCargandoModulos(true);
            try {
                const res = await serviceApiNet.Cursos.getById(cursoId);
                if (res.data?.success) {
                    const data = res.data.data;
                    const modulosRaw = data?.modulos ?? [];
                    const recursosRaw = data?.recursos ?? [];
                    setModulos(modulosRaw.map(m => ({
                        ...m,
                        recursos: recursosRaw
                            .filter(r => r.moduloId === m.moduloId)
                            .map((r, rIdx) => ({
                                id: r.moduloRecursoId ? `${r.moduloRecursoId}-${rIdx}` : crypto.randomUUID(),
                                tituloSesion: r.titulo || 'Recurso',
                                tipoId: r.recursoId,
                                configuracion: r.dataJson ? {
                                    ...r.dataJson,
                                    Descripcion: r.dataJson.Descripcion || r.dataJson.descripcion || null,
                                    Instrucciones: r.dataJson.Instrucciones || r.dataJson.instrucciones || null,
                                    AgregarPonderacion: r.dataJson.AgregarPonderacion ?? r.dataJson.agregarPonderacion ?? false,
                                } : null,
                                incluirEnPonderacion: false,
                                archivoReal: null,
                                archivosImagenes: [],
                                isNew: false,
                            }))
                    })));
                }
            } catch (e) {
                console.error('Error cargando curso:', e);
                setModulos(modulosIniciales.map(m => ({ ...m, recursos: [] })));
            } finally {
                setCargandoModulos(false);
            }
        };
        cargar();
    }, [cursoId]);

    const agregarModuloNuevo = () => {
        if (!nombreModuloNuevo.trim()) return;
        setModulosNuevos(prev => [...prev, {
            moduloId: `nuevo-${crypto.randomUUID()}`,
            moduloTitulo: nombreModuloNuevo.trim(),
            descripcion: "",
            recursos: [],
            isNew: true,
        }]);
        setNombreModuloNuevo("");
        setAgregandoModulo(false);
    };

    const eliminarModuloNuevo = (moduloId) => {
        setModulosNuevos(prev => prev.filter(m => m.moduloId !== moduloId));
    };

    const handleRecursoCreado = (recursoData) => {
        const nuevoRecurso = {
            id: crypto.randomUUID(),
            tituloSesion: recursoData.titulo || "Nuevo recurso",
            tipoId: recursoData.tipoId,
            configuracion: recursoData.configuracion,
            duracion: recursoData.duracion || "00:00",
            incluirEnPonderacion: recursoData.incluirEnPonderacion ?? false,
            archivoReal: recursoData.archivoReal || null,
            archivosImagenes: recursoData.archivosImagenes || [],
            isNew: true,
        };

        if (sesionEditando) {
            setModulos(prev => prev.map(m => {
                if (m.moduloId !== sesionEditando.moduloId) return m;
                return {
                    ...m,
                    recursos: m.recursos.map(r =>
                        r.id === sesionEditando.recursoId
                            ? { ...r, ...recursoData, tipoId: recursoData.tipoId }
                            : r
                    )
                };
            }));
        } else {
            const esModuloExistente = modulos.some(m => m.moduloId === moduloActivo);

            if (esModuloExistente) {
                setModulos(prev => prev.map(m =>
                    m.moduloId !== moduloActivo ? m : {
                        ...m, recursos: [...m.recursos, nuevoRecurso]
                    }
                ));
            } else {
                setModulosNuevos(prev => prev.map(m =>
                    m.moduloId !== moduloActivo ? m : {
                        ...m, recursos: [...m.recursos, nuevoRecurso]
                    }
                ));
            }
        }

        setSelectorAbierto(false);
        setModuloActivo(null);
        setSesionEditando(null);
    };

    const eliminarRecurso = (moduloId, recursoId) => {
        const esExistente = modulos.some(m => m.moduloId === moduloId);
        if (esExistente) {
            setModulos(prev => prev.map(m =>
                m.moduloId === moduloId
                    ? { ...m, recursos: m.recursos.filter(r => r.id !== recursoId) }
                    : m
            ));
        } else {
            setModulosNuevos(prev => prev.map(m =>
                m.moduloId === moduloId
                    ? { ...m, recursos: m.recursos.filter(r => r.id !== recursoId) }
                    : m
            ));
        }
    };

    const handleGuardar = async () => {
        if (totalRecursosNuevos === 0) return;
        setGuardando(true);
        setError(null);

        try {
            const modulosExistentesConNuevos = modulos.filter(m => m.recursos.some(r => r.isNew));
            const todosLosModulosPayload = [
                ...modulosExistentesConNuevos,
                ...modulosNuevos,
            ];

            const modulosPayload = todosLosModulosPayload.map((m, mIdx) => ({
                orden: mIdx + 1,
                moduloTitulo: m.moduloTitulo || m.tituloModulo || `Módulo ${mIdx + 1}`,
                descripcion: m.descripcion || "",
            }));

            const recursosPayload = [];

            todosLosModulosPayload.forEach((modulo, mIdx) => {
                const recursosAEnviar = modulo.isNew
                    ? modulo.recursos
                    : modulo.recursos.filter(r => r.isNew);

                recursosAEnviar.forEach((rec, rIdx) => {
                    recursosPayload.push({
                        moduloId: mIdx + 1,
                        recursoId: rec.tipoId,
                        ordenRecurso: rIdx + 1,
                        titulo: rec.tituloSesion,
                        descripcion: rec.tituloSesion,
                    });
                });
            });

            await serviceApiNet.ModulosRecursos.agregarModulosRecursos(
                cursoId, modulosPayload, recursosPayload
            );

            setExito(true);
            setTimeout(() => { setExito(false); onClose?.(); }, 1800);

        } catch (err) {
            setError(err?.response?.data?.message || "Error al guardar los módulos y recursos.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex">
            <div
                className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                onClick={onClose}
            />

            <div
                className="relative ml-auto w-full max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden"
                style={{
                    background: "linear-gradient(160deg, #051c14 0%, #030f0a 50%, #020c08 100%)",
                    borderLeft: "1px solid rgba(16,185,129,0.12)",
                    animation: "slideInRight 0.35s cubic-bezier(0.2,1,0.2,1)",
                }}
            >
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute -top-32 -right-32 w-80 h-80 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
                            filter: "blur(40px)",
                        }}
                    />
                    <div
                        className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)",
                            filter: "blur(40px)",
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(16,185,129,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.15) 1px,transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                    <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                            background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)",
                        }}
                    />
                </div>
                <div
                    className="relative flex items-center gap-4 px-8 py-6"
                    style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}
                >
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl transition-all duration-200"
                        style={{
                            background: "rgba(16,185,129,0.06)",
                            border: "1px solid rgba(16,185,129,0.12)",
                            color: "rgba(52,211,153,0.6)",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(16,185,129,0.12)";
                            e.currentTarget.style.color = "#34d399";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(16,185,129,0.06)";
                            e.currentTarget.style.color = "rgba(52,211,153,0.6)";
                        }}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-[9px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full"
                                style={{
                                    color: "#34d399",
                                    background: "rgba(16,185,129,0.1)",
                                    border: "1px solid rgba(16,185,129,0.2)",
                                }}
                            >
                                Post-creación
                            </span>
                            <Zap size={11} style={{ color: "#fbbf24" }} />
                        </div>
                        <h2
                            className="text-lg font-black truncate tracking-tight"
                            style={{ color: "#ecfdf5" }}
                        >
                            {cursoNombre || "Gestión de Contenido"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p
                                className="text-[9px] font-black uppercase tracking-wider"
                                style={{ color: "rgba(52,211,153,0.45)" }}
                            >
                                Nuevos
                            </p>
                            <p
                                className="text-2xl font-black leading-none"
                                style={{ color: "#6ee7b7" }}
                            >
                                {totalRecursosNuevos}
                            </p>
                        </div>
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "rgba(16,185,129,0.08)",
                                border: "1px solid rgba(16,185,129,0.18)",
                                boxShadow: "0 0 16px rgba(16,185,129,0.08)",
                            }}
                        >
                            <Package size={18} style={{ color: "#34d399" }} />
                        </div>
                    </div>
                </div>

                <div
                    className="relative mx-6 mt-5 mb-1 px-5 py-3.5 rounded-2xl flex items-center gap-3"
                    style={{
                        background: "rgba(16,185,129,0.05)",
                        border: "1px solid rgba(16,185,129,0.12)",
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                        }}
                    >
                        <Layers size={16} style={{ color: "#34d399" }} />
                    </div>
                    <div>
                        <p
                            className="text-[11px] font-black uppercase tracking-wider"
                            style={{ color: "#6ee7b7" }}
                        >
                            Curso ya publicado
                        </p>
                        <p
                            className="text-[10px] leading-tight"
                            style={{ color: "rgba(52,211,153,0.45)" }}
                        >
                            Puedes agregar recursos a módulos existentes o crear módulos nuevos.
                        </p>
                    </div>
                </div>

                <SelectorRecursos
                    isOpen={selectorAbierto}
                    onClose={() => { setSelectorAbierto(false); setSesionEditando(null); }}
                    onRecursoCreado={handleRecursoCreado}
                    initialData={sesionEditando?.datos ?? null}
                    modoEdicion={!!sesionEditando}
                    tipoIdForzado={sesionEditando?.datos?.tipoId ?? null}
                />

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {cargandoModulos ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 size={24} style={{ color: "#34d399" }} className="animate-spin" />
                            <p
                                className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "rgba(52,211,153,0.4)" }}
                            >
                                Cargando módulos...
                            </p>
                        </div>
                    ) : (
                        <>
                            {modulos.map((modulo, mIdx) => (
                                <ModuloCard
                                    key={modulo.moduloId}
                                    modulo={modulo}
                                    index={mIdx}
                                    onAgregarRecurso={() => abrirSelector(modulo.moduloId)}
                                    onEditarRecurso={(rec, e) => abrirEdicion(modulo.moduloId, rec, e)}
                                    onEliminarRecurso={(recId) => eliminarRecurso(modulo.moduloId, recId)}
                                />
                            ))}

                            {modulosNuevos.map((modulo, mIdx) => (
                                <ModuloCard
                                    key={modulo.moduloId}
                                    modulo={modulo}
                                    index={modulos.length + mIdx}
                                    isNew
                                    onAgregarRecurso={() => abrirSelector(modulo.moduloId)}
                                    onEditarRecurso={(rec, e) => abrirEdicion(modulo.moduloId, rec, e)}
                                    onEliminarRecurso={(recId) => eliminarRecurso(modulo.moduloId, recId)}
                                    onEliminarModulo={() => eliminarModuloNuevo(modulo.moduloId)}
                                />
                            ))}

                            {agregandoModulo ? (
                                <div
                                    className="rounded-2xl p-4 flex gap-2"
                                    style={{
                                        background: "rgba(16,185,129,0.05)",
                                        border: "1px solid rgba(16,185,129,0.2)",
                                    }}
                                >
                                    <input
                                        autoFocus
                                        value={nombreModuloNuevo}
                                        onChange={e => setNombreModuloNuevo(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && agregarModuloNuevo()}
                                        placeholder="Nombre del módulo..."
                                        className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all duration-200"
                                        style={{
                                            background: "rgba(16,185,129,0.06)",
                                            border: "1px solid rgba(16,185,129,0.15)",
                                            color: "#ecfdf5",
                                            caretColor: "#34d399",
                                        }}
                                        onFocus={e => {
                                            e.currentTarget.style.border = "1px solid rgba(16,185,129,0.4)";
                                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)";
                                        }}
                                        onBlur={e => {
                                            e.currentTarget.style.border = "1px solid rgba(16,185,129,0.15)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    />
                                    <button
                                        onClick={agregarModuloNuevo}
                                        className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200"
                                        style={{
                                            background: "linear-gradient(135deg, #059669, #047857)",
                                            color: "#ecfdf5",
                                            boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #10b981, #059669)";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.35)";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #059669, #047857)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.25)";
                                        }}
                                    >
                                        Agregar
                                    </button>
                                    <button
                                        onClick={() => { setAgregandoModulo(false); setNombreModuloNuevo(""); }}
                                        className="px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-200"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            color: "rgba(52,211,153,0.5)",
                                            border: "1px solid rgba(16,185,129,0.1)",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                            e.currentTarget.style.color = "#6ee7b7";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                            e.currentTarget.style.color = "rgba(52,211,153,0.5)";
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAgregandoModulo(true)}
                                    className="group w-full py-4 flex items-center justify-center gap-2 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-200"
                                    style={{
                                        border: "1px dashed rgba(16,185,129,0.2)",
                                        color: "rgba(52,211,153,0.35)",
                                        background: "transparent",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.border = "1px dashed rgba(16,185,129,0.5)";
                                        e.currentTarget.style.color = "#34d399";
                                        e.currentTarget.style.background = "rgba(16,185,129,0.04)";
                                        e.currentTarget.style.boxShadow = "inset 0 0 30px rgba(16,185,129,0.03)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.border = "1px dashed rgba(16,185,129,0.2)";
                                        e.currentTarget.style.color = "rgba(52,211,153,0.35)";
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <Plus size={14} className="transition-transform duration-300 group-hover:rotate-90" />
                                    Nuevo módulo
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div
                    className="relative px-6 py-5"
                    style={{
                        borderTop: "1px solid rgba(16,185,129,0.08)",
                        background: "rgba(2,12,8,0.6)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    {error && (
                        <div
                            className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-xl text-xs font-bold"
                            style={{
                                background: "rgba(248,113,113,0.08)",
                                border: "1px solid rgba(248,113,113,0.2)",
                                color: "#fca5a5",
                            }}
                        >
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(16,185,129,0.1)",
                                color: "rgba(52,211,153,0.5)",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                e.currentTarget.style.color = "#6ee7b7";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                e.currentTarget.style.color = "rgba(52,211,153,0.5)";
                            }}
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleGuardar}
                            disabled={totalRecursosNuevos === 0 || guardando || exito}
                            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-200"
                            style={
                                exito ? {
                                    background: "linear-gradient(135deg, #059669, #047857)",
                                    color: "#ecfdf5",
                                    boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
                                } : totalRecursosNuevos === 0 ? {
                                    background: "rgba(255,255,255,0.03)",
                                    color: "rgba(52,211,153,0.2)",
                                    cursor: "not-allowed",
                                    border: "1px solid rgba(16,185,129,0.06)",
                                } : {
                                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                    color: "#ecfdf5",
                                    boxShadow: "0 4px 20px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(16,185,129,0.3)",
                                }
                            }
                            onMouseEnter={e => {
                                if (totalRecursosNuevos > 0 && !guardando && !exito) {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.15)";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (totalRecursosNuevos > 0 && !guardando && !exito) {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            {exito ? (
                                <><CheckCircle2 size={16} /> ¡Guardado!</>
                            ) : guardando ? (
                                <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                            ) : (
                                <><Save size={16} /> Guardar {totalRecursosNuevos > 0 ? `${totalRecursosNuevos} recurso${totalRecursosNuevos > 1 ? "s" : ""}` : "recursos"}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to   { transform: translateX(0); opacity: 1; }
            }
        `}</style>
        </div>
    );
};

export default GestionContenidoCurso;

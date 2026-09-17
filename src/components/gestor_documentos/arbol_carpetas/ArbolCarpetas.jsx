import React, { useState } from "react";
import {
    Loader2, FileText, Folder, FolderPlus, ChevronRight,
    ChevronDown, FolderOpen, Trash2, Edit3, X, Eye, Info
} from "lucide-react";
import serviceApiNet from "../../../lib/api/serviceApiNet";
import { Check } from "lucide-react";

const TreeNode = ({
    node, selectedFolder, onSelect, onDelete,
    creandoSubcarpetaEn, setCreandoSubcarpetaEn,
    nombreSubcarpeta, setNombreSubcarpeta, onCrearSubcarpeta,
    depth = 0
}) => {
    const [expanded, setExpanded] = useState(false);
    const isSelected = selectedFolder?.exploradorId === node.exploradorId;
    const isCreating = creandoSubcarpetaEn === node.exploradorId;
    const hasChildren = node.children?.length > 0;

    return (
        <div style={{ paddingLeft: depth * 16 }}>
            <div className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5
                ${isSelected ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            >
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="shrink-0 w-4 h-4 flex items-center justify-center"
                >
                    {hasChildren || isCreating
                        ? expanded || isCreating
                            ? <ChevronDown size={12} />
                            : <ChevronRight size={12} />
                        : <span className="w-3" />
                    }
                </button>

                <div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    onClick={() => { onSelect(node); setExpanded(true); }}
                >
                    {expanded || isCreating
                        ? <FolderOpen size={15} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                        : <Folder size={15} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                    }
                    <span className="text-xs font-bold truncate">{node.nombreCarpeta}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            setCreandoSubcarpetaEn(isCreating ? null : node.exploradorId);
                            setNombreSubcarpeta('');
                            setExpanded(true);
                        }}
                        className={`p-1 rounded-lg transition-colors
                            ${isSelected
                                ? 'hover:bg-white/20 text-white'
                                : 'hover:bg-emerald-50 text-emerald-600'}`}
                        title="Nueva subcarpeta"
                    >
                        <FolderPlus size={13} />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(node.exploradorId); }}
                        className={`p-1 rounded-lg transition-colors
                            ${isSelected
                                ? 'hover:bg-white/20 text-rose-200'
                                : 'hover:bg-rose-50 text-rose-400'}`}
                        title="Eliminar carpeta"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {isCreating && (
                <div
                    style={{ paddingLeft: (depth + 1) * 16 }}
                    className="mb-1 animate-in slide-in-from-top-2 duration-150"
                >
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-xl shadow-sm">
                        <Folder size={13} className="text-emerald-400 shrink-0" />
                        <input
                            autoFocus
                            value={nombreSubcarpeta}
                            onChange={e => setNombreSubcarpeta(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') onCrearSubcarpeta(node.exploradorId);
                                if (e.key === 'Escape') { setCreandoSubcarpetaEn(null); setNombreSubcarpeta(''); }
                            }}
                            placeholder="Nombre de subcarpeta..."
                            className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-300"
                        />
                        <button
                            onClick={() => onCrearSubcarpeta(node.exploradorId)}
                            className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Check size={11} />
                        </button>
                        <button
                            onClick={() => { setCreandoSubcarpetaEn(null); setNombreSubcarpeta(''); }}
                            className="p-1 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <X size={11} />
                        </button>
                    </div>
                </div>
            )}

            {(expanded || isCreating) && node.children?.length > 0 && (
                <div>
                    {node.children.map(child => (
                        <TreeNode
                            key={child.exploradorId}
                            node={child}
                            selectedFolder={selectedFolder}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            depth={depth + 1}
                            creandoSubcarpetaEn={creandoSubcarpetaEn}
                            setCreandoSubcarpetaEn={setCreandoSubcarpetaEn}
                            nombreSubcarpeta={nombreSubcarpeta}
                            setNombreSubcarpeta={setNombreSubcarpeta}
                            onCrearSubcarpeta={onCrearSubcarpeta}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function TreeScreen({ carpetas, onRefreshCarpetas, showToast, onEditDoc }) {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creandoSubcarpetaEn, setCreandoSubcarpetaEn] = useState(null);
    const [nombreSubcarpeta, setNombreSubcarpeta] = useState('');

    const handleSelectFolder = async (carpeta) => {
        setSelectedFolder(carpeta);
        setSelectedDoc(null);
        setLoadingDocs(true);
        try {
            const res = await serviceApiNet.Documentos.listPorCarpeta(carpeta.exploradorId);

            const dataExtraida = res?.data?.data || [];

            setDocumentos(dataExtraida);
        } catch (error) {
            console.error("Error al cargar:", error);
            showToast('No se pudieron cargar los documentos', 'error');
            setDocumentos([]);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleCrearSubcarpeta = async (padreId) => {
        if (!nombreSubcarpeta.trim()) return;
        try {
            await serviceApiNet.Carpetas.create({
                nombreCarpeta: nombreSubcarpeta,
                padreId: padreId
            });
            showToast('Subcarpeta creada', 'success');
            setNombreSubcarpeta('');
            setCreandoSubcarpetaEn(null);
            onRefreshCarpetas();
        } catch {
            showToast('Error al crear la subcarpeta', 'error');
        }
    };

    const handleDeleteDoc = async (gestionId) => {
        if (!window.confirm('¿Eliminar este documento?')) return;
        setDeletingId(gestionId);
        try {
            await serviceApiNet.Documentos.delete(gestionId);
            showToast('Documento eliminado', 'success');
            setDocumentos(prev => prev.filter(d => d.gestionId !== gestionId));
            if (selectedDoc?.gestionId === gestionId) setSelectedDoc(null);
        } catch {
            showToast('Error al eliminar el documento', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteCarpeta = async (exploradorId) => {
        if (!window.confirm('¿Eliminar esta carpeta y su contenido?')) return;
        try {
            await serviceApiNet.Carpetas.delete(exploradorId);
            showToast('Carpeta eliminada', 'success');
            onRefreshCarpetas();
            if (selectedFolder?.exploradorId === exploradorId) {
                setSelectedFolder(null);
                setDocumentos([]);
            }
        } catch {
            showToast('Error al eliminar la carpeta', 'error');
        }
    };

    const handleCrearCarpeta = async () => {
        if (!newFolderName.trim()) return;
        try {
            await serviceApiNet.Carpetas.create({ nombreCarpeta: newFolderName, padreId: null });
            showToast('Carpeta creada', 'success');
            setNewFolderName('');
            setShowNewFolderInput(false);
            onRefreshCarpetas();
        } catch {
            showToast('Error al crear la carpeta', 'error');
        }
    };

    const buildTree = (items, padreId = null) =>
        items
            .filter(i => (i.padreId ?? null) === padreId)
            .map(i => ({ ...i, children: buildTree(items, i.exploradorId) }));

    const tree = buildTree(carpetas);

    return (
        <div className="flex flex-col lg:flex-row gap-0 border border-slate-200 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/50 min-h-[700px]">

            <div className="w-full lg:w-80 bg-slate-50/30 border-r border-slate-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Explorador</h3>
                        <p className="text-[10px] text-emerald-500 font-bold">Directorios</p>
                    </div>
                    <button
                        onClick={() => setShowNewFolderInput(v => !v)}
                        className="p-2 bg-white hover:bg-emerald-600 hover:text-white rounded-xl text-emerald-600 transition-all shadow-sm border border-slate-100"
                    >
                        <FolderPlus size={16} />
                    </button>
                </div>

                {showNewFolderInput && (
                    <div className="mb-4 p-3 bg-white rounded-2xl border border-emerald-100 shadow-lg animate-in slide-in-from-top-4">
                        <input
                            autoFocus
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCrearCarpeta()}
                            placeholder="Nueva carpeta..."
                            className="w-full px-3 py-2 text-xs border-none bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 mb-2"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCrearCarpeta} className="flex-1 py-2 bg-emerald-600 text-white text-[10px] rounded-lg font-black hover:bg-emerald-700 transition-colors">CREAR</button>
                            <button onClick={() => setShowNewFolderInput(false)} className="px-3 py-2 bg-slate-100 text-slate-400 text-[10px] rounded-lg font-bold">CANCELAR</button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {tree.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Folder size={24} className="text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-400 font-medium">No hay carpetas</p>
                        </div>
                    ) : (
                        tree.map(c => (
                            <TreeNode
                                key={c.exploradorId}
                                node={c}
                                selectedFolder={selectedFolder}
                                onSelect={handleSelectFolder}
                                onDelete={handleDeleteCarpeta}
                                creandoSubcarpetaEn={creandoSubcarpetaEn}
                                setCreandoSubcarpetaEn={setCreandoSubcarpetaEn}
                                nombreSubcarpeta={nombreSubcarpeta}
                                setNombreSubcarpeta={setNombreSubcarpeta}
                                onCrearSubcarpeta={handleCrearSubcarpeta}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white">
                <div className="p-6 border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    {selectedFolder ? (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <FolderOpen size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-800 text-base">{selectedFolder.nombreCarpeta}</h2>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    {documentos.length} Documentos almacenados
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-12 flex items-center gap-3 text-slate-400 text-xs bg-slate-50 px-4 rounded-2xl border border-dashed border-slate-200">
                            <Info size={16} className="text-emerald-500" /> Selecciona una carpeta para ver su contenido
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
                    {loadingDocs ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando archivos...</p>
                        </div>
                    ) : documentos.length === 0 && selectedFolder ? (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-100 rounded-[3rem] bg-white">
                            <FileText size={48} className="text-slate-100 mb-4" />
                            <p className="text-xs font-black text-slate-300 uppercase tracking-tighter">Esta carpeta está vacía</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {(Array.isArray(documentos) ? documentos : []).map(doc => (
                                <div
                                    key={doc.gestionId}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${selectedDoc?.gestionId === doc.gestionId
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200 -translate-y-1'
                                        : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedDoc?.gestionId === doc.gestionId ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        <FileText size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${selectedDoc?.gestionId === doc.gestionId ? 'text-white' : 'text-slate-700'}`}>
                                            {doc.tituloDocumento}
                                        </h4>
                                        <p className={`text-[10px] truncate font-medium ${selectedDoc?.gestionId === doc.gestionId ? 'text-emerald-100' : 'text-slate-400'}`}>
                                            {doc.descripcion || 'Sin descripción'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={e => { e.stopPropagation(); onEditDoc(doc); }}
                                            className={`p-2 rounded-lg ${selectedDoc?.gestionId === doc.gestionId ? 'bg-white/20 hover:bg-white/40' : 'bg-slate-50 hover:bg-emerald-50 text-emerald-600'}`}
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDeleteDoc(doc.gestionId); }}
                                            className={`p-2 rounded-lg ${selectedDoc?.gestionId === doc.gestionId ? 'bg-rose-500/50 hover:bg-rose-500 text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedDoc && (
                <div className="w-full lg:w-96 bg-white border-l border-slate-100 animate-in slide-in-from-right duration-500 z-20">
                    <div className="p-8 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Detalles</span>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-300 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-100">
                                <FileText size={40} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 leading-tight px-4">{selectedDoc.tituloDocumento}</h3>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Descripción</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    {selectedDoc.descripcion || 'Sin descripción detallada.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Inicio</p>
                                    <p className="text-xs font-black text-slate-700">{selectedDoc.fechaInicio?.split('T')[0]}</p>
                                </div>
                                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <p className="text-[9px] font-bold text-rose-400 uppercase">Expiración</p>
                                    <p className="text-xs font-black text-rose-600">{selectedDoc.fechaExpiracion?.split('T')[0] || '∞'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                                    <span className="font-bold text-slate-400">Rol de Acceso</span>
                                    <span className="font-black text-emerald-600 uppercase">{selectedDoc.roles || 'Admin'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                                    <span className="font-bold text-slate-400">Extensión</span>
                                    <span className="font-black text-slate-700 uppercase">{selectedDoc.formatos || 'PDF'}</span>
                                </div>
                            </div>
                        </div>

                        {selectedDoc.documentoPath && (
                            <a
                                href={selectedDoc.documentoPath}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 active:scale-95"
                            >
                                <Eye size={18} /> Abrir Documento
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
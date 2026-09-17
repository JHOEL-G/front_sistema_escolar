import { Loader2 } from "lucide-react";
import { Plus } from "lucide-react";
import { X } from "lucide-react";
import { Folder } from "lucide-react";
import { useState } from "react";
import serviceApiNet from "../../../lib/api/serviceApiNet";
import React from "react";


function FolderModal({ carpetas, onClose, onSelect, onRefresh, showToast }) {
    const [newFolderName, setNewFolderName] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!newFolderName.trim()) return;
        setCreating(true);
        try {
            await serviceApiNet.Carpetas.create({ nombreCarpeta: newFolderName, padreId: null });
            showToast('Carpeta creada', 'success');
            setNewFolderName('');
            onRefresh();
        } catch {
            showToast('Error al crear carpeta', 'error');
        } finally {
            setCreating(false);
        }
    };

    const buildTree = (items, padreId = null) =>
        items
            .filter(i => (i.padreId ?? null) === padreId)
            .map(i => ({ ...i, children: buildTree(items, i.exploradorId) }));

    const renderNodes = (nodes, depth = 0) =>
        nodes.map(node => (
            <React.Fragment key={node.exploradorId}>
                <div
                    onClick={() => onSelect({ id: node.exploradorId, nombre: node.nombreCarpeta })}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer border border-transparent hover:border-blue-200 transition text-sm"
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                    <Folder size={14} className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                    {node.nombreCarpeta}
                </div>
                {node.children?.length > 0 && renderNodes(node.children, depth + 1)}
            </React.Fragment>
        ));

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-slate-50 px-5 py-4 flex justify-between items-center border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        <Folder size={16} className="text-yellow-500" /> Seleccionar Carpeta
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                        <input
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            placeholder="Nueva carpeta..."
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg font-bold disabled:opacity-50 flex items-center gap-1"
                        >
                            {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                            Crear
                        </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-0.5">
                        {carpetas.length === 0
                            ? <p className="text-center text-slate-400 text-sm py-6">Sin carpetas disponibles</p>
                            : renderNodes(buildTree(carpetas))
                        }
                    </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 font-medium hover:text-slate-700">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FolderModal;

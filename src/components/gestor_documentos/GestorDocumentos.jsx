import React, { useState, useEffect } from 'react';
import serviceApiNet from '../../lib/api/serviceApiNet';
import Toast from './notificaciones/Toast';
import EditScreen from './nuevo_documento/EditScreen';
import TreeScreen from './arbol_carpetas/ArbolCarpetas';
import FolderModal from './modal/FolderModal';
import { FolderTree, LayoutGrid, Sparkles, Plus, Search } from 'lucide-react';

export default function GestorDocumentos() {
    const [activeTab, setActiveTab] = useState('tree');
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState({ id: null, nombre: 'Seleccionar carpeta' });
    const [carpetas, setCarpetas] = useState([]);
    const [toast, setToast] = useState(null);
    const [editingDoc, setEditingDoc] = useState(null);

    const showToast = (message, type = 'info') => setToast({ message, type });

    const loadCarpetas = async () => {
        try {
            const res = await serviceApiNet.Carpetas.list();
            const data = res?.data?.data ?? res?.data ?? res ?? [];
            setCarpetas(Array.isArray(data) ? data : []);
        } catch {
            showToast('No se pudieron cargar las carpetas', 'error');
            setCarpetas([]);
        }
    };

    useEffect(() => { loadCarpetas(); }, []);

    const handleEditDoc = (doc) => {
        setEditingDoc(doc);
        setActiveTab('edit');
    };

    return (
        <div className="gestor-documentos min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-700">
            <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .gestor-doc * { font-family: 'Plus Jakarta Sans', sans-serif; }    
`}</style>
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-full mx-auto p-4 md:p-8">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className={`
                                        text-4xl font-extrabold tracking-tighter italic uppercase
                                        bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 
                                        bg-clip-text text-transparent
                                        transition-all duration-500
                                    `}>
                                Central
                                <span className="font-black not-italic ml-1">
                                    Documentos
                                </span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-500" />
                            Workspace inteligente de documentación
                        </p>
                    </div>

                    <div className="flex items-center bg-white/50 p-1.5 rounded-2xl border border-white shadow-sm backdrop-blur-md mt-3">
                        <button
                            onClick={() => setActiveTab('tree')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'tree' ? 'nav-pill-active' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                }`}
                        >
                            <FolderTree size={16} />
                            Explorar
                        </button>
                        <button
                            onClick={() => { setActiveTab('edit'); setEditingDoc(null); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'edit' ? 'nav-pill-active' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                }`}
                        >
                            <Plus size={16} />
                            Nuevo
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 gap-6">
                    <div className="glass-card rounded-[2.5rem] shadow-2xl shadow-blue-900/5 min-h-[700px] flex flex-col overflow-hidden border border-white/50">

                        <div className="px-8 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/30">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400 font-medium tracking-tight">
                                    {activeTab === 'tree' ? 'Visualizando estructura de archivos' : 'Preparando editor de metadatos'}
                                </span>
                            </div>

                            <div className="hidden md:flex items-center gap-2 bg-slate-200/50 px-3 py-1.5 rounded-full border border-slate-300/30 text-slate-500">
                                <Search size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Global Search</span>
                                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-300">⌘ K</span>
                            </div>
                        </div>

                        <div className="flex-1 p-4 md:p-8 modern-scroll overflow-y-auto overflow-x-hidden">
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                {activeTab === 'edit' ? (
                                    <EditScreen
                                        selectedFolder={selectedFolder}
                                        onOpenFolderModal={() => setShowFolderModal(true)}
                                        carpetas={carpetas}
                                        showToast={showToast}
                                        editingDoc={editingDoc}
                                        onClearEdit={() => setEditingDoc(null)}
                                    />
                                ) : (
                                    <TreeScreen
                                        carpetas={carpetas}
                                        onRefreshCarpetas={loadCarpetas}
                                        showToast={showToast}
                                        onEditDoc={handleEditDoc}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showFolderModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-8">
                        <FolderModal
                            carpetas={carpetas}
                            onClose={() => setShowFolderModal(false)}
                            onSelect={(folder) => {
                                setSelectedFolder(folder);
                                setShowFolderModal(false);
                                showToast(`Carpeta: ${folder.nombre}`, 'success');
                            }}
                            onRefresh={loadCarpetas}
                            showToast={showToast}
                        />
                    </div>
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
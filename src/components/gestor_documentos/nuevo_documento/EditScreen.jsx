import { Calendar, Users, Folder, Save, Edit3, FileText, Loader2, Upload, ChevronDown, X, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import serviceApiNet from "../../../lib/api/serviceApiNet";

function EditScreen({ selectedFolder, onOpenFolderModal, showToast, editingDoc, onClearEdit }) {
    const [form, setForm] = useState({
        tituloDocumento: '',
        descripcion: '',
        fechaInicio: '',
        fechaExpiracion: '',
        activo: true,
        formatos: [],
        roles: [],
    });

    const [rolesAPI, setRolesAPI] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [archivo, setArchivo] = useState(null);
    const [rutaPreview, setRutaPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const fileRef = useRef();

    const FORMATOS = { 'PDF': 1, 'DOCX': 2, 'DOC': 3, 'PPT': 4, 'PPTX': 5 };

    useEffect(() => {
        const fetchRoles = async () => {
            setLoadingRoles(true);
            try {
                const res = await serviceApiNet.Roles.list();
                const listaRoles = res?.data?.data || [];
                setRolesAPI(Array.isArray(listaRoles) ? listaRoles : []);
            } catch (error) {
                setRolesAPI([]);
                showToast('Error al cargar la lista de roles', 'error');
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (editingDoc && rolesAPI.length > 0) {
            const rolesNombres = editingDoc.roles
                ? editingDoc.roles.split(',').map(r => r.trim())
                : [];

            const rolesIds = rolesNombres
                .map(nombre => rolesAPI.find(r => r.nombreRol === nombre)?.rolId)
                .filter(id => id !== undefined);

            setForm({
                tituloDocumento: editingDoc.tituloDocumento || '',
                descripcion: editingDoc.descripcion || '',
                fechaInicio: editingDoc.fechaInicio?.split('T')[0] || '',
                fechaExpiracion: editingDoc.fechaExpiracion?.split('T')[0] || '',
                activo: editingDoc.activo ?? true,
                formatos: editingDoc.formatos
                    ? editingDoc.formatos.split(',').map(f => f.trim())
                    : [],
                roles: rolesIds,
            });
            setRutaPreview(editingDoc.documentoPath || '');
        }
    }, [editingDoc, rolesAPI]);

    const toggleItem = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivo(file);
            setRutaPreview(file.name);
        }
    };

    const handleGuardar = async () => {
        if (!form.tituloDocumento.trim()) return showToast('El título es requerido', 'error');
        if (!selectedFolder.id && !editingDoc) return showToast('Selecciona una carpeta', 'error');

        setLoading(true);
        try {
            const formatosIds = form.formatos.map(nombre => FORMATOS[nombre]);
            const objetoParaBackend = {
                tituloDocumento: form.tituloDocumento,
                descripcion: form.descripcion,
                documentoPath: editingDoc ? rutaPreview : null,
                fechaInicio: form.fechaInicio || null,
                fechaExpiracion: form.fechaExpiracion || null,
                exploradorId: editingDoc ? editingDoc.exploradorId : selectedFolder.id,
                formatos: formatosIds.join(','),
                roles: form.roles.join(',')
            };

            if (editingDoc) {
                await serviceApiNet.Documentos.update(editingDoc.gestionId, {
                    ...objetoParaBackend,
                    gestionId: editingDoc.gestionId,
                    activo: form.activo
                });
                showToast('Documento actualizado', 'success');
                onClearEdit();
            } else {
                const formData = new FormData();
                formData.append('documentoData', JSON.stringify(objetoParaBackend));
                if (archivo) formData.append('archivo', archivo);
                await serviceApiNet.Documentos.create(formData);
                showToast('Documento creado', 'success');
                setForm({ tituloDocumento: '', descripcion: '', fechaInicio: '', fechaExpiracion: '', activo: true, formatos: [], roles: [] });
                setArchivo(null);
                setRutaPreview('');
            }
        } catch (error) {
            showToast('Error al procesar la solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 max-w-full mx-auto pb-12">

            {editingDoc && (
                <div className="relative overflow-hidden group bg-gradient-to-r from-amber-500 to-orange-600 rounded-[2rem] p-6 shadow-xl shadow-amber-200/50 animate-in slide-in-from-top-4 duration-500">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                                <Edit3 size={24} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-lg tracking-tight uppercase italic">Modo Editor Pro</h3>
                                <p className="text-amber-50 text-sm opacity-90 font-medium">Modificando: {editingDoc.tituloDocumento}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClearEdit}
                            className="bg-white/10 hover:bg-white text-white hover:text-amber-600 px-5 py-2.5 rounded-xl text-xs font-black border border-white/20 transition-all backdrop-blur-md flex items-center gap-2"
                        >
                            <X size={16} /> FINALIZAR EDICIÓN
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Información General</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 group-focus-within:text-blue-600 transition-colors">
                                    Título del Documento
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre oficial del archivo..."
                                    value={form.tituloDocumento}
                                    onChange={e => setForm(p => ({ ...p, tituloDocumento: e.target.value }))}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner placeholder:text-slate-300"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 group-focus-within:text-blue-600 transition-colors">
                                    Breve Sinopsis
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="¿De qué trata este documento?"
                                    value={form.descripcion}
                                    onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div
                            onClick={() => fileRef.current.click()}
                            className="relative group cursor-pointer overflow-hidden border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-[2rem] p-8 bg-slate-50/50 hover:bg-blue-50 transition-all duration-300"
                        >
                            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="p-5 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                    <Upload size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                        {rutaPreview ? 'Archivo Listo' : 'Subir nuevo archivo'}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium max-w-[250px] mt-1 italic truncate">
                                        {rutaPreview || 'Arrastra el documento aquí o haz click'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Disponibilidad</label>
                        <button
                            onClick={() => setForm(p => ({ ...p, activo: !p.activo }))}
                            className={`w-full relative p-1 rounded-2xl transition-all duration-500 overflow-hidden shadow-lg ${form.activo ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300 shadow-slate-100'
                                }`}
                        >
                            <div className="flex items-center justify-between px-6 py-3 relative z-10">
                                <span className="text-[10px] font-black text-white tracking-widest uppercase italic">
                                    {form.activo ? 'Online' : 'Offline'}
                                </span>
                                {form.activo ? <CheckCircle2 size={20} className="text-white" /> : <AlertCircle size={20} className="text-white" />}
                            </div>
                            <div className={`absolute top-0 bottom-0 bg-white/20 transition-all duration-500 ${form.activo ? 'left-0 right-0' : 'left-0 right-full'}`} />
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest italic">Formatos</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(FORMATOS).map(f => {
                                const isSelected = form.formatos.includes(f);
                                return (
                                    <button
                                        key={f}
                                        onClick={() => toggleItem('formatos', f)}
                                        className={`px-3 py-3 rounded-xl border text-[10px] font-black transition-all ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-violet-500" />
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest italic">Acceso</h3>
                        </div>
                        <div className="relative group">
                            <select
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase appearance-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none cursor-pointer transition-all disabled:opacity-50"
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val) toggleItem('roles', val);
                                    e.target.value = "";
                                }}
                                disabled={loadingRoles}
                            >
                                <option value="" hidden>{loadingRoles ? "Sincronizando..." : "+ Asignar Rol"}</option>
                                {rolesAPI.filter(r => !form.roles.includes(r.rolId)).map(r => (
                                    <option key={r.rolId} value={r.rolId}>{r.nombreRol}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.roles.map(roleId => {
                                const roleName = rolesAPI.find(r => r.rolId === roleId)?.nombreRol || `ID: ${roleId}`;
                                return (
                                    <span key={roleId} className="group flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-[10px] font-black border border-slate-200 animate-in zoom-in-95 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors">
                                        {roleName}
                                        <X size={12} className="cursor-pointer" onClick={() => toggleItem('roles', roleId)} />
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest italic ml-1">
                            <Calendar size={14} className="text-emerald-500" /> Inicio de Vigencia
                        </label>
                        <input
                            type="date"
                            value={form.fechaInicio}
                            onChange={e => setForm(p => ({ ...p, fechaInicio: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest italic ml-1">
                            <Calendar size={14} className="text-rose-400" /> Expiración Final
                        </label>
                        <input
                            type="date"
                            value={form.fechaExpiracion}
                            onChange={e => setForm(p => ({ ...p, fechaExpiracion: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        {!editingDoc && (
                            <button
                                onClick={onOpenFolderModal}
                                className="flex items-center justify-between w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Folder size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Carpeta Destino</p>
                                        <p className="text-[11px] font-black text-slate-700 uppercase truncate max-w-[150px]">
                                            {selectedFolder.id ? selectedFolder.nombre : "No Seleccionada"}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-all">
                                    <ChevronDown size={14} />
                                </div>
                            </button>
                        )}

                        <button
                            onClick={handleGuardar}
                            disabled={loading}
                            className={`relative overflow-hidden group w-full px-8 py-5 rounded-[1.5rem] font-black text-xs tracking-[0.15em] transition-all active:scale-95 shadow-2xl ${loading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 uppercase">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingDoc ? 'Actualizar Documento' : 'Publicar Documento'}
                            </span>

                            {!loading && (
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PlusIcon = ({ size, className }) => (
    <div className={`w-${size} h-${size} ${className} flex items-center justify-center border-2 border-white rounded-md`}>
        <span className="leading-none text-lg">+</span>
    </div>
);

export default EditScreen;
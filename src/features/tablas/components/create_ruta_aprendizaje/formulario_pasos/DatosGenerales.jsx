import React, { useState, useRef, useEffect } from 'react';
import {
    Upload, ChevronRight, X, Image as ImageIcon,
    Camera, Save, Eye, FileText, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { StepperLayout } from '../../gestion_curso/crear_gestion_curso/stepper_layout/StepperLayout';
import { useNavigate } from 'react-router-dom';
import { useRutaActiveContext } from '../useRutaActiveContext';

const DatosGenerales = () => {
    const navigate = useNavigate();
    const { rutaData, updateRutaData, handleCancel, isEditing, rutaId } = useRutaActiveContext();
    const [formData, setFormData] = useState({
        nombreRuta: rutaData?.nombreRuta || '',
        descripcion: rutaData?.descripcion || '',
        imagenPortada: rutaData?.imagenPortada || null,
        imagenFile: rutaData?.imagenFile || null
    });

    const [imagenPreview, setImagenPreview] = useState(rutaData?.imagenPortada || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isEditing && rutaData?.nombreRuta) {
            setFormData({
                nombreRuta: rutaData.nombreRuta || '',
                descripcion: rutaData.descripcion || '',
                imagenPortada: rutaData.imagenPortada || null,
                imagenFile: null
            });
            setImagenPreview(rutaData.imagenPortada || null);
        }
    }, [rutaData?.nombreRuta, isEditing]);

    const handleImageUpload = (file) => {
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Por favor selecciona una imagen válida (JPG, PNG, GIF, SVG)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagenPreview(reader.result);
            setFormData(prev => ({
                ...prev,
                imagenPortada: reader.result,
                imagenFile: file
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleImageUpload(e.dataTransfer.files[0]);
    };
    const handleFileSelect = (e) => handleImageUpload(e.target.files[0]);

    const handleRemoveImage = () => {
        setImagenPreview(null);
        setFormData(prev => ({ ...prev, imagenPortada: null, imagenFile: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleNext = () => {
        if (!formData.nombreRuta.trim()) {
            toast.error('El nombre de la ruta es obligatorio');
            return;
        }
        updateRutaData(formData);
        if (isEditing) navigate(`/editar_ruta/${rutaId}/privacidad`);
        else navigate('/crear_ruta/privacidad');

    };

    return (
        <div className="min-h-full bg-slate-50/30 selection:bg-indigo-100 font-sans">
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                {isEditing ? 'Editar Ruta' : 'Ruta de Aprendizaje'}
                            </span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {isEditing ? 'Datos Generales' : 'Configuración Inicial'}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            {isEditing ? 'Editando ' : 'Datos '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                {isEditing ? rutaData.nombreRuta || 'Ruta' : 'Generales'}
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                            <Save size={18} /> Borrador
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                            <Eye size={18} /> Vista previa
                        </button>
                    </div>
                </div>

                <StepperLayout currentStep={1} />

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                        <div className="lg:col-span-7 p-8 lg:p-12 border-r border-slate-50 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                    <FileText className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Información Básica</h3>
                                    <p className="text-sm text-slate-500 font-medium">Configura los datos principales de la ruta.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                        Nombre de la ruta de aprendizaje <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Introducción a la Programación"
                                        className="w-full px-6 py-5 rounded-[2rem] border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-bold text-lg placeholder:text-slate-300 shadow-inner"
                                        value={formData.nombreRuta}
                                        onChange={(e) => setFormData({ ...formData, nombreRuta: e.target.value })}
                                        maxLength={100}
                                    />
                                    <div className="text-xs text-slate-400 font-bold pl-2">
                                        {formData.nombreRuta.length}/100 caracteres
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                        Descripción de la ruta de aprendizaje
                                    </label>
                                    <textarea
                                        rows="6"
                                        placeholder="Describe los objetivos, contenido y beneficios..."
                                        className="w-full px-6 py-5 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder:text-slate-300 text-base shadow-inner resize-none"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        maxLength={400}
                                    />
                                    <div className="text-xs text-slate-400 font-bold pl-2">
                                        {formData.descripcion.length}/400 caracteres
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight pl-2">
                                    <Info size={14} className="text-indigo-400" />
                                    <span>Una descripción clara ayuda a los participantes a entender el valor de la ruta.</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 p-8 lg:p-12 bg-slate-50/30 flex flex-col space-y-8">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Imagen de portada
                                </label>
                                {imagenPreview && (
                                    <span className="bg-green-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                                        Cargada
                                    </span>
                                )}
                            </div>

                            <div className="flex-grow min-h-[400px]">
                                {!imagenPreview ? (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`h-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-6 transition-all cursor-pointer group ${isDragging
                                            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                                            : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
                                            }`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                                            <Upload className="text-indigo-600" size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-slate-900 font-bold text-base">Arrastra tu imagen aquí</h4>
                                            <p className="text-slate-400 text-xs font-medium">o haz clic para seleccionar</p>
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-medium">
                                            JPG, PNG, GIF o SVG (máx. 5MB)
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                            onClick={(e) => { e.stopPropagation(); toast.info('Función de búsqueda online próximamente'); }}
                                        >
                                            <Camera size={18} /> Buscar imagen online
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group relative animate-in fade-in slide-in-from-right-4">
                                        <img src={imagenPreview} alt="Vista previa" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={handleRemoveImage}
                                                className="absolute top-4 right-4 bg-white hover:bg-rose-500 text-slate-700 hover:text-white p-3 rounded-2xl transition-all shadow-lg hover:scale-110"
                                            >
                                                <X size={20} />
                                            </button>
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full bg-white/90 hover:bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <ImageIcon size={18} /> Cambiar imagen
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                <div className="relative z-10 space-y-2">
                                    <h4 className="text-sm font-bold">Consejo de diseño</h4>
                                    <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                                        Una imagen atractiva incrementa el engagement. Usa imágenes de alta calidad.
                                    </p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={handleCancel}
                        className="text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!formData.nombreRuta.trim()}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        Continuar a Privacidad
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default DatosGenerales;
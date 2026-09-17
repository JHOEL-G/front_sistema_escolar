import React, { useState } from 'react';
import { Info, Upload, ChevronRight, Image as ImageIcon, Eye, Loader2, ChevronLeft } from 'lucide-react';
import Stepper from '../create_curso/pantallas_formulario/Stepper';
import { useCourseCreation } from '../create_curso/CourseCreationContext';
import { useNavigate } from 'react-router-dom';

const VistaPreviaCurso = () => {
    const { previaCourseData, updatePreviaCourseData } = useCourseCreation();
    const navigate = useNavigate();
    const [courseName, setCourseName] = useState(previaCourseData?.courseName || '');
    const [courseDescription, setCourseDescription] = useState(previaCourseData?.courseDescription || '');
    const [coverImageFile, setCoverImageFile] = useState(previaCourseData?.coverImage || null);
    const [previewUrl, setPreviewUrl] = useState(
        previaCourseData?.coverImage instanceof File
            ? URL.createObjectURL(previaCourseData.coverImage)
            : previaCourseData?.coverImage || null
    );
    const [isSaving, setIsSaving] = useState(false);


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Formato de imagen no válido. Use: jpg, jpeg, png, gif, webp');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB');
                return;
            }

            setCoverImageFile(file);

            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setCoverImageFile(null);
        setPreviewUrl(null);
    };


    const handleNext = () => {
        if (!courseName.trim()) return alert("El nombre del curso es obligatorio");

        updatePreviaCourseData({
            courseName,
            courseDescription,
            coverImage: coverImageFile
        });
        navigate('/curso/crear/configuration-previa');
    };

    return (
        <div className="min-h-[90vh] bg-[#F8FAFC] selection:bg-indigo-100">
            <main className="max-w-8xl mx-auto py-10 px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Gestión Docente</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nuevo Curso</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Información <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Básica</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                            <Eye size={18} /> Vista previa
                        </button>
                    </div>
                </div>

                <Stepper currentStep={1} type="previa" />

                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                        <div className="lg:col-span-7 p-8 lg:p-12 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <ImageIcon className="text-white" size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Gestión Docente</h3>
                                    <p className="text-sm text-slate-500">Documenta cursos completados fuera de la plataforma.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="group">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 group-focus-within:text-indigo-600 transition-colors">
                                        Nombre del curso
                                    </label>
                                    <input
                                        type="text"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        className="w-full bg-slate-50/50 p-4 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-800 font-semibold placeholder:text-slate-300 text-lg"
                                        placeholder="Ej: Certificación en Gestión de Proyectos Ágiles"
                                    />
                                    <div className="mt-3 flex items-center gap-2 text-slate-400 font-medium italic text-[11px]">
                                        <Info size={14} /> <span>Ingresa el nombre oficial del curso externo completado.</span>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 group-focus-within:text-indigo-600 transition-colors">
                                        Descripción del curso (opcional)
                                    </label>
                                    <textarea
                                        value={courseDescription}
                                        onChange={(e) => setCourseDescription(e.target.value)}
                                        className="w-full bg-slate-50/50 p-4 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300 resize-none h-32"
                                        placeholder="Describe brevemente el contenido y objetivos del curso..."
                                        maxLength={650}
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 font-medium italic text-[11px]">
                                            <Info size={14} /> <span>Proporciona contexto sobre lo aprendido en el curso.</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-semibold">
                                            {courseDescription.length}/650
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 bg-slate-50/50 p-8 lg:p-12 border-l border-slate-50">
                            <div className="h-full flex flex-col">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                                    Imagen de portada
                                    {coverImageFile && (
                                        <span className="ml-2 text-indigo-600">
                                            ({(coverImageFile.size / 1024).toFixed(0)} KB)
                                        </span>
                                    )}
                                </label>

                                <div
                                    onClick={() => document.getElementById('coverImageInput').click()}
                                    className="flex-grow group relative border-2 border-dashed border-slate-200 rounded-[2rem] bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover p-2 rounded-[2rem]" />
                                            <button
                                                onClick={handleRemoveImage}
                                                className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-bold shadow-lg transition-all"
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    ) : (
                                        <div className="relative z-10 flex flex-col items-center p-6 text-center">
                                            <div className="bg-slate-50 p-5 rounded-3xl mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                                                <Upload className="text-indigo-600" size={32} />
                                            </div>
                                            <h5 className="text-slate-900 font-bold text-lg">Arrastra tu portada</h5>
                                            <p className="text-slate-400 text-sm font-medium max-w-[200px] mb-2">O haz clic para buscar archivos</p>
                                            <p className="text-slate-300 text-xs font-medium">JPG, JPEG, GIF, PNG o WEBP (máx. 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        id="coverImageInput"
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <button
                        onClick={() => navigate('/curso/crear')}
                        className="flex items-center gap-2 px-6 py-3 text-slate-400 font-bold hover:text-rose-500 transition-colors text-xs uppercase tracking-[0.2em]"
                    >
                        <ChevronLeft size={18} />
                        Cancelar proceso
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={isSaving || !courseName.trim()}
                        className="group bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:translate-y-0"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Continuar al siguiente paso'}
                        {!isSaving && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default VistaPreviaCurso;
import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    X,
    Check,
    Save,
    Eye,
    Layers,
    Info,
    BookOpen,
    Pencil
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from './stepper_layout/StepperLayout';

export default function GestionTemas({ initialData, cursoId, isEditMode, onNext, onCancel }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [nombreCurso, setNombreCurso] = useState(initialData?.nombreCurso || '');
    const [expandedItems, setExpandedItems] = useState([]);

    const [selectedTopics, setSelectedTopics] = useState([]);

    const [temasDisponibles, setTemasDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [curso, setCurso] = useState(null);

    useEffect(() => {
        const cargarTemas = async () => {
            try {
                setLoading(true);
                const [temaRes, cursoRes] = await Promise.all([
                    serviceApiNet.Temas.list(),
                    serviceApiNet.Cursos.list()
                ]);

                const cursoData = cursoRes.data.data.find(
                    (c) => String(c.cursoId) === String(cursoId)
                );
                if (cursoData) {
                    setCurso(cursoData);
                    setNombreCurso(cursoData.nombreCurso);
                }

                const temasFormateados = temaRes.data.data.map((tema) => ({
                    id: tema.temaId,
                    name: tema.nombreTema,
                    subCount: tema.creacionSubtemaList?.length || 0,
                }));

                setTemasDisponibles(temasFormateados);

                if (isEditMode && initialData?.temas?.length > 0) {
                    const temasPreseleccionados = initialData.temas
                        .map((t) => {
                            const found = temasFormateados.find((tf) => tf.id === t.temaId);
                            return found
                                ? { id: found.id, name: found.name, orden: t.orden, subtopics: [] }
                                : null;
                        })
                        .filter(Boolean);

                    setSelectedTopics(temasPreseleccionados);
                }

            } catch (error) {
                console.error('Error al cargar temas:', error);
                toast.error('Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        cargarTemas();
    }, [cursoId, isEditMode]);

    const toggleExpand = (name) => {
        setExpandedItems((prev) =>
            prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
        );
    };

    const isSelected = (id) => selectedTopics.some((t) => t.id === id);

    const handleToggleTema = (tema) => {
        if (isSelected(tema.id)) {
            setSelectedTopics(selectedTopics.filter((t) => t.id !== tema.id));
        } else {
            setSelectedTopics([
                ...selectedTopics,
                {
                    id: tema.id,
                    name: tema.name,
                    orden: selectedTopics.length + 1,
                    subtopics: []
                }
            ]);
        }
    };

    const handleRemoveTema = (temaId) => {
        setSelectedTopics(selectedTopics.filter((t) => t.id !== temaId));
    };

    const handleNext = () => {
        if (!nombreCurso.trim()) {
            toast.error('Ingrese un nombre para la gestión del curso');
            return;
        }

        if (selectedTopics.length === 0) {
            toast.error('Debe seleccionar al menos un tema');
            return;
        }

        const temasFormateados = selectedTopics.map((topic, index) => ({
            temaId: topic.id,
            orden: index + 1
        }));

        onNext({
            nombreCurso: nombreCurso.trim(),
            temas: temasFormateados
        });
    };

    const temasFiltrados = temasDisponibles.filter((tema) =>
        tema.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-full bg-slate-50/30 selection:bg-indigo-100 font-sans">
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                Gestión Docente
                            </span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {isEditMode ? 'Editar Contenido' : 'Selección de Contenido'}
                            </span>
                            {isEditMode && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100">
                                    <Pencil size={10} /> Modo Edición
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Estructura de{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                Temas
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

                <div className="mx-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-3">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Nombre de la Gestión del Curso
                    </label>
                    <input
                        type="text"
                        value={nombreCurso}
                        readOnly
                        placeholder="Cargando nombre del curso..."
                        className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none transition-all text-slate-500 font-bold text-base cursor-not-allowed"
                    />
                </div>

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                        <div className="lg:col-span-7 p-8 lg:p-12 border-r border-slate-50 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                    <Layers className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Explorar Biblioteca</h3>
                                    <p className="text-sm text-slate-500 font-medium">Busca y selecciona los temas para el curso.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Busca por nombre de tema o etiquetas..."
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder:text-slate-300 text-lg shadow-inner"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                        Resultados disponibles ({temasFiltrados.length})
                                    </label>

                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                            <p className="text-sm text-slate-400 mt-2">Cargando temas...</p>
                                        </div>
                                    ) : temasFiltrados.length > 0 ? (
                                        <div className="grid gap-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                                            {temasFiltrados.map((topic) => (
                                                <div key={topic.id} className="group relative">
                                                    <div
                                                        onClick={() => handleToggleTema(topic)}
                                                        className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer ${isSelected(topic.id)
                                                            ? 'border-indigo-500 bg-indigo-50/20 shadow-lg shadow-indigo-100'
                                                            : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isSelected(topic.id)
                                                                ? 'bg-indigo-600 shadow-lg shadow-indigo-200'
                                                                : 'bg-slate-100'
                                                                }`}>
                                                                {isSelected(topic.id) ? (
                                                                    <Check className="text-white" size={20} />
                                                                ) : (
                                                                    <BookOpen className="text-slate-400" size={20} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className={`block text-base font-bold transition-colors ${isSelected(topic.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                    {topic.name}
                                                                </span>
                                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                                                                    {topic.subCount} Subtemas disponibles
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(topic.name);
                                                            }}
                                                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                                                        >
                                                            {expandedItems.includes(topic.name) ? (
                                                                <ChevronUp size={20} />
                                                            ) : (
                                                                <ChevronDown size={20} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">No se encontraron temas</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight pl-2">
                                    <Info size={14} className="text-indigo-400" />
                                    <span>Puedes seleccionar múltiples temas para construir el temario.</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col space-y-8">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Resumen de selección
                                </label>
                                <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                                    {selectedTopics.length} Temas
                                </span>
                            </div>

                            <div className="flex-grow space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedTopics.length > 0 ? (
                                    selectedTopics.map((item) => (
                                        <div key={item.id} className="p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 flex items-start justify-between group animate-in fade-in slide-in-from-right-4">
                                            <div className="space-y-2 w-full">
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg leading-tight">{item.name}</h4>
                                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">
                                                        Orden: {item.orden}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveTema(item.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-grow border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                                            <Layers size={32} />
                                        </div>
                                        <div>
                                            <h5 className="text-slate-900 font-bold text-base mb-1">Sin temas aún</h5>
                                            <p className="text-slate-400 text-xs font-medium">Selecciona temas del panel izquierdo para comenzar.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                <div className="relative z-10 space-y-2">
                                    <h4 className="text-sm font-bold">Consejo de diseño</h4>
                                    <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                                        Un curso efectivo suele tener entre 3 y 5 temas principales para mantener el foco del estudiante.
                                    </p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Layers size={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors uppercase tracking-widest"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={selectedTopics.length === 0 || !nombreCurso.trim()}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuar a Privacidad
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
}
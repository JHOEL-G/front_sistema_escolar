import {
    Filter, Trash2, Info, Search, Users, ChevronRight,
    Clock, MessageSquare, Bold, Italic, Underline,
    Type, ChevronLeft, Loader2
} from "lucide-react";
import { useState } from "react";
import Stepper from "../create_curso/pantallas_formulario/Stepper";
import { useEffect } from "react";
import { useMemo } from "react";
import serviceApiNet from "../../../../lib/api/serviceApiNet";
import { useNavigate } from "react-router-dom";
import { useCourseCreation } from "../create_curso/CourseCreationContext";

const ConfigurationScreenPrevia = () => {
    const { previaCourseData, updatePreviaCourseData, isSaving, handleGuardarRegistroPrevio } = useCourseCreation();
    const navigate = useNavigate();
    const [selectedInstructorIds, setSelectedInstructorIds] = useState(previaCourseData.instructorIds || []);
    const [duracionHoras, setDuracionHoras] = useState(previaCourseData?.duracionHoras || '');
    const [mensajeBienvenida, setMensajeBienvenida] = useState(previaCourseData?.mensajeBienvenida || '');
    const [habilitarReacreditacion, setHabilitarReacreditacion] = useState(previaCourseData?.habilitarReacreditacion || false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermSelected, setSearchTermSelected] = useState('');

    const [availableInstructors, setAvailableInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (previaCourseData?.instructorIds) {
            setSelectedInstructorIds(previaCourseData.instructorIds);
        }
    }, [previaCourseData?.instructorIds]);

    const filteredAvailableInstructors = useMemo(() => {
        return availableInstructors.filter(ins =>
            !selectedInstructorIds.includes(ins.id) &&
            ins.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableInstructors, selectedInstructorIds, searchTerm]);

    const selectedInstructors = useMemo(() => {
        return availableInstructors.filter(ins =>
            selectedInstructorIds.includes(ins.id) &&
            ins.nombre.toLowerCase().includes(searchTermSelected.toLowerCase())
        );
    }, [availableInstructors, selectedInstructorIds, searchTermSelected]);

    const toggleInstructor = (id) => {
        if (!id) return;
        setSelectedInstructorIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const idsToAdd = filteredAvailableInstructors.map(i => i.id);
        setSelectedInstructorIds(prev => [...new Set([...prev, ...idsToAdd])]);
    };

    const handleDeselectAll = () => setSelectedInstructorIds([]);

    const handleComplete = () => {
        if (selectedInstructors.length === 0) {
            alert('⚠️ Debes seleccionar al menos un instructor');
            return;
        }
        if (!duracionHoras || parseFloat(duracionHoras) <= 0) {
            alert('⚠️ La duración del curso debe ser mayor a 0 horas');
            return;
        }

        handleGuardarRegistroPrevio({
            instructorIds: selectedInstructors.map(ins => ins.id),
            duracionHoras: duracionHoras ? parseFloat(duracionHoras) : null,
            mensajeBienvenida,
            habilitarReacreditacion
        });
    };

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const response = await serviceApiNet.Usuario.list(true);

                const usersFromDb = response.data.map(u => ({
                    id: u.usuarioId || u.UsuarioId || u.id,
                    nombre: `${u.nombre || ''} ${u.apeLlido || ''}`.trim() || u.correo,
                    rol: u.rol || 'Instructor',
                    correo: u.correo,
                    nivelPermiso: u.permisoNombre,
                    avatar: (u.nombre || u.correo || 'U').substring(0, 1).toUpperCase()
                }));

                setAvailableInstructors(usersFromDb);
            } catch (error) {
                console.error("Error al obtener usuarios:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    return (
        <div className="min-h-full bg-[#F8FAFC]">
            <main className="max-w-8xl mx-auto py-10 px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Finalización</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Configuración Final</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Ajustes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Generales</span>
                        </h2>
                    </div>
                </div>

                <Stepper currentStep={2} type="previa" />

                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 p-8 lg:p-12 space-y-12">

                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="space-y-3 group">
                                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={14} className="text-indigo-500" />
                                    Duración del curso (hrs) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={duracionHoras}
                                        onChange={(e) => setDuracionHoras(e.target.value)}
                                        min="0"
                                        step="0.5"
                                        disabled={isSaving}
                                        className="w-full bg-slate-50/50 p-4 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    {duracionHoras && !isSaving && (
                                        <button
                                            onClick={() => setDuracionHoras('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                {!duracionHoras && (
                                    <p className="text-xs text-rose-500 font-medium">
                                        Este campo es obligatorio
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <MessageSquare size={14} className="text-indigo-500" />
                                Mensaje de Bienvenida
                                <Info size={14} className="text-slate-300 cursor-help" title="Este mensaje se mostrará a los estudiantes al acceder al curso" />
                            </label>
                            <div className="border-2 border-slate-50 rounded-[2rem] overflow-hidden focus-within:border-indigo-500 transition-all">
                                <div className="bg-slate-50/50 border-b border-slate-100 p-3 flex gap-2">
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-50"
                                    >
                                        <Bold size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-50"
                                    >
                                        <Italic size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-50"
                                    >
                                        <Underline size={16} />
                                    </button>
                                    <div className="w-px bg-slate-200 mx-1"></div>
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-50"
                                    >
                                        <Type size={16} />
                                    </button>
                                </div>
                                <textarea
                                    value={mensajeBienvenida}
                                    onChange={(e) => setMensajeBienvenida(e.target.value)}
                                    disabled={isSaving}
                                    className="w-full p-6 min-h-[150px] outline-none text-slate-600 leading-relaxed placeholder:text-slate-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Escribe un mensaje inspirador para tus alumnos..."
                                    maxLength={1000}
                                />
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xs text-slate-400 font-semibold">
                                    {mensajeBienvenida.length}/1000
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                Selección de instructores *
                            </h3>
                            {selectedInstructorIds.length > 0 && (
                                <button
                                    onClick={handleDeselectAll}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                                >
                                    Deseleccionar todos
                                </button>
                            )}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                                        <Filter size={14} className="text-slate-500" />
                                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                                            {loading ? '...' : filteredAvailableInstructors.length} Disponibles
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Seleccionar todos
                                    </button>
                                </div>

                                <div className="relative group">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div className="bg-slate-50/30 rounded-[2rem] border-2 border-slate-50 overflow-hidden max-h-[380px] overflow-y-auto custom-scrollbar">
                                    {loading ? (
                                        <div className="flex flex-col items-center py-12 space-y-3">
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando base de datos...</p>
                                        </div>
                                    ) : filteredAvailableInstructors.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <p className="text-sm font-medium">No hay instructores para mostrar</p>
                                        </div>
                                    ) : (
                                        filteredAvailableInstructors.map((instructor) => (
                                            <div
                                                key={instructor.id}
                                                onClick={() => toggleInstructor(instructor.id)}
                                                className="flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-slate-50 last:border-0 hover:bg-white group/item"
                                            >
                                                <div className="w-5 h-5 rounded-md border-2 border-slate-200 bg-white flex items-center justify-center group-hover/item:border-indigo-500 transition-colors">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                    {instructor.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm text-slate-800">{instructor.nombre}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{instructor.correo} / {instructor.nivelPermiso}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={`rounded-[2.5rem] border-2 flex flex-col p-8 transition-all ${selectedInstructors.length === 0
                                ? 'bg-slate-50/50 border-dashed border-slate-200 items-center justify-center text-center'
                                : 'bg-slate-50/30 border-slate-50 overflow-hidden'
                                }`}>
                                {selectedInstructors.length === 0 ? (
                                    <div className="group">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6 group-hover:scale-110 transition-transform duration-500 mx-auto">
                                            <Users className="text-slate-200 group-hover:text-indigo-500 transition-colors" size={40} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800">No hay seleccionados</h4>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <span className="text-xs font-bold text-slate-500 uppercase">
                                            {selectedInstructors.length} Seleccionado{selectedInstructors.length !== 1 ? 's' : ''}
                                        </span>
                                        <div className="space-y-2 max-h-[320px] overflow-y-auto">
                                            {selectedInstructors.map((instructor) => (
                                                <div
                                                    key={instructor.id}
                                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-50 group/sel"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                        {instructor.avatar}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-sm text-slate-800">{instructor.nombre}</div>
                                                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{instructor.correo} / {instructor.nivelPermiso}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleInstructor(instructor.id)}
                                                        className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-indigo-500/20"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                Reacreditación Obligatoria
                                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30">PREMIUM</span>
                            </h3>
                            <p className="text-slate-400 text-sm max-w-md font-medium">
                                Define la vigencia automática y solicita asistencia de reacreditación al vencimiento del curso.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer scale-125">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={habilitarReacreditacion}
                                onChange={(e) => setHabilitarReacreditacion(e.target.checked)}
                                disabled={isSaving}
                            />
                            <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[19px] after:w-[19px] after:transition-all peer-checked:bg-indigo-500 shadow-inner peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/curso/crear/basic-info-previa')}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                        Atrás
                    </button>

                    <button
                        type="button"
                        onClick={handleComplete}
                        disabled={isSaving || selectedInstructors.length === 0 || !duracionHoras || parseFloat(duracionHoras) <= 0}
                        className="group bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-4 text-xs uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:hover:translate-y-0"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creando curso...
                            </>
                        ) : (
                            <>
                                Crear Curso
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <ChevronRight size={18} />
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ConfigurationScreenPrevia;
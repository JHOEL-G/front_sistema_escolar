import React, { useState, useEffect } from 'react';
import { Filter, Trash2, Info, Search, Users, ChevronRight, Eye, Clock, MessageSquare, Bold, Italic, Underline, Type, ChevronLeft } from "lucide-react";
import Stepper from './Stepper';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../../components/modal/PageModal';
import { Check } from 'lucide-react';
import { useCurso } from '../useCurso';

export default function ConfigurationScreen() {
    const { courseData, updateCourseData, handleGuardarCursoCompleto, isSaving, isEditing, id } = useCurso();
    const navigate = useNavigate();
    const [modalCursoOpen, setModalCursoOpen] = useState(false);
    const [searchCurso, setSearchCurso] = useState('');
    const [duracionHoras, setDuracionHoras] = useState(courseData?.DuracionHoras || '');
    const [mensajeBienvenida, setMensajeBienvenida] = useState(courseData?.MensajeBienvenida || '');
    const [usarMensajePredeterminado, setUsarMensajePredeterminado] = useState(courseData?.UsarMensajePredeterminado || false);
    const [habilitarReacreditacion, setHabilitarReacreditacion] = useState(courseData?.HabilitarReacreditacion || false);
    const [vigenciaMeses, setVigenciaMeses] = useState(courseData?.VigenciaMeses || '');
    const [selectedInstructorIds, setSelectedInstructorIds] = useState(courseData?.instructorIds || []);
    const [cursoReacreditacionId, setCursoReacreditacionId] = useState(courseData?.CursoReacreditacionId || null);
    const [periodoVigencia, setPeriodoVigencia] = useState(courseData?.PeriodoVigencia || '');
    const [cursosDisponibles, setCursosDisponibles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTermSelected, setSearchTermSelected] = useState('');

    const [availableInstructors, setAvailableInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseData?.DuracionHoras) setDuracionHoras(courseData.DuracionHoras);
        if (courseData?.MensajeBienvenida) setMensajeBienvenida(courseData.MensajeBienvenida);
        if (courseData?.UsarMensajePredeterminado !== undefined) setUsarMensajePredeterminado(courseData.UsarMensajePredeterminado);
        if (courseData?.HabilitarReacreditacion !== undefined) setHabilitarReacreditacion(courseData.HabilitarReacreditacion);
        if (courseData?.VigenciaMeses) setVigenciaMeses(courseData.VigenciaMeses);
        if (courseData?.CursoReacreditacionId) setCursoReacreditacionId(courseData.CursoReacreditacionId);
        if (courseData?.PeriodoVigencia) setPeriodoVigencia(courseData.PeriodoVigencia);
    }, [
        courseData?.DuracionHoras,
        courseData?.MensajeBienvenida,
        courseData?.UsarMensajePredeterminado,
        courseData?.HabilitarReacreditacion,
        courseData?.VigenciaMeses
    ]);

    useEffect(() => {
        if (courseData?.instructorIds?.length > 0) {
            setSelectedInstructorIds(courseData.instructorIds);
        } else if (courseData?.instructorId) {
            setSelectedInstructorIds([courseData.instructorId]);
        }
    }, [courseData?.instructorIds, courseData?.instructorId]);

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

    useEffect(() => {
        if (habilitarReacreditacion) {
            serviceApiNet.Cursos.list().then(res => {
                const lista = res.data?.data ?? res.data ?? [];
                setCursosDisponibles(lista);
            }).catch(() => { });
        }
    }, [habilitarReacreditacion]);

    const handleGuardarCurso = (publicar) => {
        if (!duracionHoras || duracionHoras <= 0) {
            alert("La duración del curso debe ser mayor a 0 horas.");
            return;
        }

        if (selectedInstructorIds.length === 0) {
            alert("Debes seleccionar al menos un instructor.");
            return;
        }

        if (habilitarReacreditacion && !periodoVigencia) {
            alert("Si habilitas la reacreditación, debes seleccionar el período de vigencia.");
            return;
        }

        const finalData = {
            DuracionHoras: Number(duracionHoras),
            MensajeBienvenida: mensajeBienvenida.trim(),
            UsarMensajePredeterminado: usarMensajePredeterminado,
            HabilitarReacreditacion: habilitarReacreditacion,
            VigenciaMeses: habilitarReacreditacion ? Number(vigenciaMeses) : 0,
            instructorIds: selectedInstructorIds,
            estaPublicado: publicar,
            CursoReacreditacionId: habilitarReacreditacion ? cursoReacreditacionId : null,
            PeriodoVigencia: habilitarReacreditacion ? periodoVigencia : null,
        };

        handleGuardarCursoCompleto(finalData);
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
                    permisoNombre: u.permisoNombre,
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

    if (!courseData) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-full bg-[#F8FAFC]">
            <main className="max-w-8xl mx-auto py-10 px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Paso 5</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Configuración Final</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Ajustes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Generales</span>
                        </h2>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 transition-all">
                        <Eye size={18} />
                        Vista Previa
                    </button>
                </div>

                <Stepper currentStep={5} type="completo" />

                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 p-8 lg:p-12 space-y-12">

                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="space-y-3 group">
                                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={14} className="text-indigo-500" />
                                    Duración del curso (hrs) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={duracionHoras}
                                        onChange={(e) => setDuracionHoras(e.target.value)}
                                        step="0.5"
                                        min="0"
                                        className="w-full bg-slate-50/50 p-4 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                                    />
                                    {duracionHoras && (
                                        <button
                                            onClick={() => setDuracionHoras('')}
                                            className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">
                                    Tiempo estimado para completar todo el curso
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <MessageSquare size={14} className="text-indigo-500" />
                                Mensaje de Bienvenida
                                <Info size={14} className="text-slate-300 cursor-help" title="Este mensaje se mostrará cuando los estudiantes inicien el curso" />
                            </label>
                            <div className="border-2 border-slate-50 rounded-[2rem] overflow-hidden focus-within:border-indigo-500 transition-all">
                                <div className="bg-slate-50/50 border-b border-slate-100 p-3 flex gap-2">
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                                        title="Negrita"
                                    >
                                        <Bold size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                                        title="Cursiva"
                                    >
                                        <Italic size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                                        title="Subrayado"
                                    >
                                        <Underline size={16} />
                                    </button>
                                    <div className="w-px bg-slate-200 mx-1"></div>
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                                        title="Formato de texto"
                                    >
                                        <Type size={16} />
                                    </button>
                                </div>
                                <textarea
                                    className="w-full p-6 min-h-[150px] outline-none text-slate-600 leading-relaxed placeholder:text-slate-300"
                                    placeholder="Escribe un mensaje inspirador para tus alumnos..."
                                    value={mensajeBienvenida}
                                    onChange={(e) => setMensajeBienvenida(e.target.value)}
                                    disabled={usarMensajePredeterminado}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <input
                                    type="checkbox"
                                    id="usarMensajePredeterminado"
                                    checked={usarMensajePredeterminado}
                                    onChange={(e) => {
                                        setUsarMensajePredeterminado(e.target.checked);
                                        if (e.target.checked) {
                                            setMensajeBienvenida("¡Bienvenido al curso! Estamos emocionados de tenerte aquí.");
                                        } else {
                                            setMensajeBienvenida("");
                                        }
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="usarMensajePredeterminado" className="text-sm text-slate-600 font-medium cursor-pointer">
                                    Utilizar mensaje predeterminado
                                </label>
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
                                                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{instructor.correo}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{instructor.permisoNombre}</div>
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
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                                                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{instructor.correo}</div>
                                                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{instructor.permisoNombre}</div>
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

                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden transition-all duration-500">
                        <div className="p-8 lg:p-10">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Reacreditación</h3>
                                        {habilitarReacreditacion && (
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100 animate-in fade-in zoom-in">
                                                Activo
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium max-w-xl">
                                        Define la vigencia de un curso y establece su reacreditación obligatoria al vencimiento.
                                    </p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={habilitarReacreditacion}
                                        onChange={(e) => setHabilitarReacreditacion(e.target.checked)}
                                    />
                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer 
                    peer-checked:after:translate-x-7 peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[4px] after:left-[4px] 
                    after:bg-white after:rounded-full after:h-[20px] after:w-[20px] 
                    after:transition-all after:shadow-sm peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {habilitarReacreditacion && (
                                <div className="mt-10 pt-10 border-t border-slate-50 space-y-8 animate-in slide-in-from-top-4 duration-500">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                Período de vigencia
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={periodoVigencia}
                                                    onChange={(e) => setPeriodoVigencia(e.target.value)}
                                                    className="w-full appearance-none bg-slate-50/50 border border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                                >
                                                    <option value="">Seleccionar vigencia...</option>
                                                    <option value="6">6 meses</option>
                                                    <option value="12">12 meses (1 año)</option>
                                                    <option value="18">18 meses</option>
                                                    <option value="24">24 meses (2 años)</option>
                                                    <option value="36">36 meses (3 años)</option>
                                                    <option value="48">48 meses (4 años)</option>
                                                    <option value="60">60 meses (5 años)</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                Curso de reacreditación
                                            </label>

                                            <button
                                                onClick={() => setModalCursoOpen(true)}
                                                className="w-full flex items-center justify-between bg-slate-50/50 border border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl hover:bg-white hover:border-indigo-500 outline-none transition-all cursor-pointer"
                                            >
                                                <span className={cursoReacreditacionId ? 'text-slate-800' : 'text-slate-400'}>
                                                    {cursoReacreditacionId
                                                        ? cursosDisponibles.find(c => (c.cursoId ?? c.id) === cursoReacreditacionId)?.nombreCurso || 'Curso seleccionado'
                                                        : 'Seleccionar curso...'}
                                                </span>
                                                <ChevronDown size={18} className="text-slate-400" />
                                            </button>

                                            <Modal
                                                isOpen={modalCursoOpen}
                                                onClose={() => { setModalCursoOpen(false); setSearchCurso(''); }}
                                                title="Seleccionar curso de reacreditación"
                                                showConfirm={false}
                                                cancelText="Cerrar"
                                            >
                                                <div className="relative mb-4">
                                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar curso..."
                                                        value={searchCurso}
                                                        onChange={(e) => setSearchCurso(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                                    />
                                                </div>

                                                <div className="max-h-[360px] overflow-y-auto space-y-2">
                                                    {cursosDisponibles
                                                        .filter(c => (c.cursoId ?? c.id) !== Number(id))
                                                        .filter(c => c.nombreCurso?.toLowerCase().includes(searchCurso.toLowerCase()))
                                                        .map(c => {
                                                            const cId = c.cursoId ?? c.id;
                                                            const isSelected = cursoReacreditacionId === cId;
                                                            return (
                                                                <button
                                                                    key={cId}
                                                                    onClick={() => {
                                                                        setCursoReacreditacionId(cId);
                                                                        setModalCursoOpen(false);
                                                                        setSearchCurso('');
                                                                    }}
                                                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                                                                        }`}
                                                                >
                                                                    <span className="font-bold text-sm">{c.nombreCurso}</span>
                                                                    {isSelected && (
                                                                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                                                            <Check size={12} className="text-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}

                                                    {cursosDisponibles.filter(c =>
                                                        (c.cursoId ?? c.id) !== Number(id) &&
                                                        c.nombreCurso?.toLowerCase().includes(searchCurso.toLowerCase())
                                                    ).length === 0 && (
                                                            <p className="text-center text-slate-400 text-sm py-8 font-medium">
                                                                No se encontraron cursos
                                                            </p>
                                                        )}
                                                </div>
                                            </Modal>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/30 rounded-2xl p-4 flex items-start gap-3">
                                        <Info size={18} className="text-indigo-500 mt-0.5" />
                                        <p className="text-xs text-indigo-700/70 font-medium leading-relaxed">
                                            Al cumplirse el plazo de <strong>{periodoVigencia ? `${periodoVigencia} meses` : '—'}</strong>, el sistema marcará el certificado como vencido y solicitará al colaborador completar nuevamente este curso o el seleccionado para mantener su cumplimiento.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                    <button
                        onClick={() => navigate(isEditing ? `/curso/editar/${id}/weighting` : '/curso/crear/weighting')}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        <ChevronLeft size={18} />
                        Atrás
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleGuardarCurso(false)}
                            disabled={isSaving}
                            className={`group px-8 py-3 rounded-2xl font-black border-2 transition-all flex items-center gap-3 text-xs uppercase tracking-[0.2em] ${isSaving
                                ? "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-lg active:scale-95"
                                }`}
                        >
                            {isSaving ? <>Guardando...</> : (
                                <>
                                    {isEditing ? 'Guardar cambios' : 'Guardar como Borrador'}
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleGuardarCurso(true)}
                            disabled={isSaving}
                            className={`group px-8 py-3 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-3 text-xs uppercase tracking-[0.2em] ${isSaving
                                ? "bg-slate-400 cursor-not-allowed text-white"
                                : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    {isEditing ? 'Actualizando...' : 'Guardando Curso...'}
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {isEditing ? 'Actualizar y Publicar' : 'Crear y Publicar Curso'}
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import {
    ChevronRight, Search, Info, Eye, Save, Plus, Edit2,
    Clock, Award, ChevronDown, Layout, BookOpen, X,
    GripVertical, Calendar, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from '../../gestion_curso/crear_gestion_curso/stepper_layout/StepperLayout';
import { useNavigate } from 'react-router-dom';
import { useRutaActiveContext } from '../useRutaActiveContext';

const RecursosEstudios = () => {
    const navigate = useNavigate();
    const { rutaData, updateRutaData, handleCancel, isEditing, rutaId } = useRutaActiveContext();
    const [formData, setFormData] = useState({
        asignarFecha: rutaData?.asignarFecha || null,
        asignarDia: rutaData?.asignarDia || null,
        fechaLimite: rutaData?.fechaLimite || false,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [cursosDisponibles, setCursosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [secciones, setSecciones] = useState(
        rutaData?.secciones?.length > 0
            ? rutaData.secciones.map((s, i) => ({ id: i + 1, nombre: s.nombreSeccion, orden: s.orden, cursos: [] }))
            : [{ id: 1, nombre: 'Sección 1', orden: 1, cursos: [] }]
    );
    const [seccionExpandida, setSeccionExpandida] = useState(1);
    const [temporalidadActiva, setTemporalidadActiva] = useState(
        !!(rutaData?.asignarFecha || rutaData?.asignarDia)
    );

    useEffect(() => {
        if (isEditing && rutaData?.secciones?.length > 0 && cursosDisponibles.length > 0) {
            setSecciones(
                rutaData.secciones.map((s, i) => ({
                    id: i + 1,
                    nombre: s.nombreSeccion,
                    orden: s.orden,
                    cursos: (s.cursos || []).map(c => {
                        const cursoInfo = cursosDisponibles.find(cd => cd.id === c.cursoId);
                        return cursoInfo
                            ? { ...cursoInfo, orden: c.orden }
                            : { id: c.cursoId, nombre: `Curso ${c.cursoId}`, orden: c.orden };
                    })
                }))
            );
        }
    }, [cursosDisponibles, isEditing, rutaData?.secciones]);

    useEffect(() => {
        const cargarCursos = async () => {
            try {
                setLoading(true);
                const response = await serviceApiNet.Cursos.list();
                setCursosDisponibles((response.data?.data || []).map(curso => ({
                    id: curso.cursoId,
                    nombre: curso.nombreCurso,
                    duracion: curso.duracionCurso || '0.00 horas',
                    competencias: curso.totalRecursos || 0
                })));
            } catch (error) {
                console.error('Error al cargar cursos:', error);
                toast.error('Error al cargar los cursos disponibles');
            } finally {
                setLoading(false);
            }
        };
        cargarCursos();
    }, []);

    const handleAgregarSeccion = () => {
        const nueva = {
            id: Date.now(),
            nombre: `Sección ${secciones.length + 1}`,
            orden: secciones.length + 1,
            cursos: []
        };
        setSecciones([...secciones, nueva]);
    };

    const handleEliminarSeccion = (seccionId) => {
        if (secciones.length === 1) { toast.warning('Debe haber al menos una sección'); return; }
        setSecciones(secciones.filter(s => s.id !== seccionId));
    };

    const handleRenombrarSeccion = (seccionId, nuevoNombre) => {
        setSecciones(secciones.map(s => s.id === seccionId ? { ...s, nombre: nuevoNombre } : s));
    };

    const handleAgregarCursoASeccion = (curso, seccionId) => {
        setSecciones(secciones.map(seccion => {
            if (seccion.id !== seccionId) return seccion;
            if (seccion.cursos.some(c => c.id === curso.id)) { toast.info('El curso ya está en esta sección'); return seccion; }
            return { ...seccion, cursos: [...seccion.cursos, { ...curso, orden: seccion.cursos.length + 1 }] };
        }));
        toast.success(`Curso agregado a ${secciones.find(s => s.id === seccionId)?.nombre}`);
    };

    const handleEliminarCursoDeSeccion = (cursoId, seccionId) => {
        setSecciones(secciones.map(s =>
            s.id === seccionId ? { ...s, cursos: s.cursos.filter(c => c.id !== cursoId) } : s
        ));
    };

    const handleNext = () => {
        const totalCursos = secciones.reduce((sum, s) => sum + s.cursos.length, 0);
        if (totalCursos === 0) { toast.error('Debe agregar al menos un curso a las secciones'); return; }

        updateRutaData({
            asignarFecha: temporalidadActiva ? formData.asignarFecha : null,
            asignarDia: temporalidadActiva ? formData.asignarDia : null,
            fechaLimite: temporalidadActiva ? formData.fechaLimite : false,
            secciones: secciones.map(s => ({
                nombreSeccion: s.nombre,
                orden: s.orden,
                cursos: s.cursos.map(c => ({ cursoId: c.id, orden: c.orden }))
            }))
        });
        if (isEditing) navigate(`/editar_ruta/${rutaId}/participantes`);
        else navigate('/crear_ruta/participantes');
    };

    const cursosFiltrados = cursosDisponibles.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const cursoEstEnAlgunaSeccion = (cursoId) =>
        secciones.some(s => s.cursos.some(c => c.id === cursoId));

    return (
        <div className="min-h-full bg-slate-50/30 selection:bg-indigo-100 font-sans">
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                Ruta de Aprendizaje
                            </span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Contenido de Aprendizaje
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Recursos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Estudio</span>
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

                <StepperLayout currentStep={3} />

                <div className="mx-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <Calendar className="text-indigo-600" size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Configurar temporalidad</h3>
                        </div>
                    </div>
                    <div className="p-6 flex items-center gap-4">
                        <button
                            onClick={() => setTemporalidadActiva(!temporalidadActiva)}
                            className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${temporalidadActiva ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${temporalidadActiva ? 'left-8' : 'left-1'}`} />
                        </button>
                        <span className="text-sm font-bold text-slate-700">Asignar temporalidad a la ruta de aprendizaje</span>
                    </div>
                    {temporalidadActiva && (
                        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Fecha de inicio</label>
                                <input
                                    type="date"
                                    value={formData.asignarFecha || ''}
                                    onChange={(e) => setFormData({ ...formData, asignarFecha: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Día de la semana</label>
                                <select
                                    value={formData.asignarDia || ''}
                                    onChange={(e) => setFormData({ ...formData, asignarDia: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-semibold cursor-pointer"
                                >
                                    <option value="">Seleccionar día</option>
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl w-full cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.fechaLimite}
                                        onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Fecha límite</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-7 p-8 lg:p-12 border-r border-slate-50 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                    <BookOpen className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Biblioteca de Cursos</h3>
                                    <p className="text-sm text-slate-500 font-medium">Selecciona los cursos para agregar.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar cursos por nombre..."
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder:text-slate-300 text-base shadow-inner"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center justify-between pl-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Cursos disponibles ({cursosFiltrados.length})
                                    </label>
                                </div>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                            <p className="text-sm text-slate-400 mt-2">Cargando cursos...</p>
                                        </div>
                                    ) : cursosFiltrados.length > 0 ? (
                                        cursosFiltrados.map((curso) => (
                                            <div
                                                key={curso.id}
                                                className={`p-5 rounded-3xl border-2 transition-all ${cursoEstEnAlgunaSeccion(curso.id)
                                                    ? 'border-green-200 bg-green-50/30'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-slate-800 mb-2 leading-tight">{curso.nombre}</h4>
                                                        <div className="flex gap-4">
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                                                <Clock className="w-3.5 h-3.5" />{curso.duracion}
                                                            </span>
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                                                <Award className="w-3.5 h-3.5" />{curso.competencias} competencias
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {secciones.map(seccion => (
                                                            <button
                                                                key={seccion.id}
                                                                onClick={() => handleAgregarCursoASeccion(curso, seccion.id)}
                                                                disabled={seccion.cursos.some(c => c.id === curso.id)}
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${seccion.cursos.some(c => c.id === curso.id)
                                                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                                                    }`}
                                                                title={`Agregar a ${seccion.nombre}`}
                                                            >
                                                                S{seccion.orden}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">No se encontraron cursos</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight pl-2">
                                    <Info size={14} className="text-indigo-400" />
                                    <span>Haz clic en S1, S2, etc. para agregar el curso a esa sección.</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 p-8 lg:p-12 bg-slate-50/30 flex flex-col space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Estructura de Secciones</label>
                                <button
                                    onClick={handleAgregarSeccion}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    <Plus size={16} /> Agregar Sección
                                </button>
                            </div>

                            <div className="flex-grow space-y-4 max-h-[600px] overflow-y-auto">
                                {secciones.map((seccion) => (
                                    <div key={seccion.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4">
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                                                <input
                                                    type="text"
                                                    value={seccion.nombre}
                                                    onChange={(e) => handleRenombrarSeccion(seccion.id, e.target.value)}
                                                    className="text-sm font-bold text-slate-800 bg-transparent border-none outline-none"
                                                />
                                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                    {seccion.cursos.length} {seccion.cursos.length === 1 ? 'curso' : 'cursos'}
                                                </span>
                                                <button
                                                    onClick={() => setSeccionExpandida(seccionExpandida === seccion.id ? null : seccion.id)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${seccionExpandida === seccion.id ? 'rotate-180' : ''}`} />
                                                </button>
                                                {secciones.length > 1 && (
                                                    <button onClick={() => handleEliminarSeccion(seccion.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {seccionExpandida === seccion.id && (
                                            <div className="p-4 space-y-2">
                                                {seccion.cursos.length > 0 ? (
                                                    seccion.cursos.map((curso) => (
                                                        <div key={curso.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-indigo-50 transition-all">
                                                            <div className="flex items-center gap-2">
                                                                <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                                                                <span className="text-xs font-semibold text-slate-700">{curso.nombre}</span>
                                                            </div>
                                                            <button onClick={() => handleEliminarCursoDeSeccion(curso.id, seccion.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-6 text-center">
                                                        <p className="text-xs font-semibold text-slate-400">No hay cursos en esta sección</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                <div className="relative z-10 space-y-2">
                                    <h4 className="text-sm font-bold">Consejo de organización</h4>
                                    <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                                        Organiza los cursos en secciones temáticas para facilitar el aprendizaje progresivo.
                                    </p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Layout size={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={secciones.reduce((sum, s) => sum + s.cursos.length, 0) === 0}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuar a Participantes
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RecursosEstudios;
import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    X,
    Users,
    ChevronDown,
    Filter,
    ChevronLeft,
    UploadCloud,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from './stepper_layout/StepperLayout';

const EvaluatorCard = ({ user, selected, onToggle }) => (
    <div
        onClick={onToggle}
        className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${selected
            ? 'bg-indigo-50/40 border-indigo-200'
            : 'bg-white border-slate-100 hover:border-indigo-100'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`}
                        alt={user.nombre}
                        className="w-full h-full object-cover"
                    />
                </div>
                {selected && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800 uppercase">{user.nombre}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {user.nombreOu} / {user.nombreRol}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {selected ? (
                <button className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                    <X size={16} />
                </button>
            ) : (
                <div className="w-5 h-5 border-2 border-slate-200 rounded-lg group-hover:border-indigo-300 transition-colors"></div>
            )}
        </div>
    </div>
);

const EvaluadoresScreen = ({ initialData, onNext, onBack }) => {
    const [evaluadoresSeleccionados, setEvaluadoresSeleccionados] = useState(
        initialData?.evaluadores || []
    );
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSelected, setSearchSelected] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);

    useEffect(() => {
        const cargarEvaluadores = async () => {
            try {
                setLoading(true);

                const response = await serviceApiNet.Usuario.list(true);
                const usuarios = Array.isArray(response.data?.data) ? response.data.data
                    : Array.isArray(response.data) ? response.data : [];
                setUsuariosDisponibles(usuarios);

            } catch (error) {
                console.error('Error al cargar evaluadores:', error);
                toast.error('Error al cargar los evaluadores disponibles');
            } finally {
                setLoading(false);
            }
        };

        cargarEvaluadores();
    }, []);

    const toggleEvaluador = (usuarioId) => {
        if (evaluadoresSeleccionados.includes(usuarioId)) {
            setEvaluadoresSeleccionados(evaluadoresSeleccionados.filter(id => id !== usuarioId));
        } else {
            setEvaluadoresSeleccionados([...evaluadoresSeleccionados, usuarioId]);
        }
    };

    const isSelected = (usuarioId) => {
        return evaluadoresSeleccionados.includes(usuarioId);
    };

    const handleSeleccionarTodos = () => {
        const usuariosFiltrados = usuariosFiltradosDisponibles.map(u => u.usuarioId);
        const nuevosUsuarios = usuariosFiltrados.filter(id => !isSelected(id));

        if (nuevosUsuarios.length > 0) {
            setEvaluadoresSeleccionados([...evaluadoresSeleccionados, ...nuevosUsuarios]);
            toast.success(`${nuevosUsuarios.length} evaluadores agregados`);
        }
    };

    const handleDeseleccionarTodos = () => {
        setEvaluadoresSeleccionados([]);
        toast.info('Todos los evaluadores deseleccionados');
    };

    const handleNext = () => {
        if (evaluadoresSeleccionados.length === 0) {
            toast.warning('No has seleccionado ningún evaluador');
        }

        onNext({
            evaluadores: evaluadoresSeleccionados
        });
    };

    const PERMISOS_EVALUADOR = ['Administrador'];

    const usuariosFiltradosDisponibles = usuariosDisponibles
        .filter(u => PERMISOS_EVALUADOR.includes(u.permisoNombre))
        .filter(u => !isSelected(u.usuarioId))
        .filter(u =>
            u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.correo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const evaluadoresSeleccionadosData = usuariosDisponibles
        .filter(u => isSelected(u.usuarioId))
        .filter(u =>
            u.nombre?.toLowerCase().includes(searchSelected.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchSelected.toLowerCase())
        );

    const totalPages = Math.ceil(usuariosFiltradosDisponibles.length / pageSize);
    const usuariosPaginados = usuariosFiltradosDisponibles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="min-h-full bg-slate-50/50 font-sans selection:bg-indigo-100">
            <main className="max-w-full mx-auto p-4 sm:p-6 space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Selección de <span className="text-indigo-600">evaluadores</span>
                            </h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                Paso 4 de 5 • Gestión de calidad
                            </p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                        <UploadCloud size={18} /> Carga masiva de usuarios
                    </button>
                </div>

                <StepperLayout currentStep={4} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-slate-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    <h3 className="font-bold text-slate-800 text-sm">
                                        Resultados ({usuariosFiltradosDisponibles.length})
                                    </h3>
                                </div>
                                <button
                                    onClick={handleSeleccionarTodos}
                                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                >
                                    Seleccionar todos
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                                    <Filter size={18} />
                                </div>
                                <div className="relative flex-grow group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o correo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="text-sm text-slate-400 mt-2">Cargando evaluadores...</p>
                                </div>
                            ) : usuariosPaginados.length > 0 ? (
                                usuariosPaginados.map(user => (
                                    <EvaluatorCard
                                        key={user.usuarioId}
                                        user={user}
                                        selected={false}
                                        onToggle={() => toggleEvaluador(user.usuarioId)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    No se encontraron evaluadores
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Mostrar</span>
                                <span className="bg-white border border-slate-200 rounded-lg text-[10px] px-2 py-1 font-bold">
                                    {pageSize}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, usuariosFiltradosDisponibles.length)} de {usuariosFiltradosDisponibles.length}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-slate-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-emerald-50 rounded-md flex items-center justify-center">
                                        <UserCheck size={14} className="text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm">
                                        {evaluadoresSeleccionados.length} usuarios seleccionados
                                    </h3>
                                </div>
                                <button
                                    onClick={handleDeseleccionarTodos}
                                    className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                                >
                                    Deseleccionar todos
                                </button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Filtrar en la selección..."
                                    value={searchSelected}
                                    onChange={(e) => setSearchSelected(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {evaluadoresSeleccionadosData.length > 0 ? (
                                evaluadoresSeleccionadosData.map(user => (
                                    <EvaluatorCard
                                        key={user.usuarioId}
                                        user={user}
                                        selected={true}
                                        onToggle={() => toggleEvaluador(user.usuarioId)}
                                    />
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2">
                                    <Users size={48} strokeWidth={1} />
                                    <p className="text-xs font-bold uppercase tracking-tighter">
                                        {evaluadoresSeleccionados.length === 0
                                            ? 'No hay evaluadores seleccionados'
                                            : 'No se encontraron resultados'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {evaluadoresSeleccionadosData.length} de {evaluadoresSeleccionados.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <button
                        onClick={onBack}
                        className="text-slate-400 font-black text-[11px] hover:text-rose-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Regresar
                    </button>

                    <div className="flex gap-4">
                        <button className="hidden sm:flex items-center gap-2 px-6 py-4 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-widest">
                            Guardar Borrador
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 text-xs uppercase tracking-widest"
                        >
                            Siguiente paso
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EvaluadoresScreen;
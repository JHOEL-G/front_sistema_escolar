import React, { useState, useEffect } from 'react';
import {
    Search, ChevronRight, X, Save, Eye, Lock,
    Users, Info, ChevronDown, Eye as EyeIcon, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { StepperLayout } from './stepper_layout/StepperLayout';

const PrivacyScreen = ({ initialData, isEditMode, onNext, onBack }) => {
    const [privacyType, setPrivacyType] = useState(initialData?.privacidad || 'Privado');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('OU');

    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                setLoading(true);
                let gruposFormateados = [];

                if (filtroTipo === 'OU') {
                    const response = await serviceApiNet.Ous.list();
                    gruposFormateados = (response.data?.data || []).map(ou => ({
                        id: ou.organizacionalesId,
                        name: ou.nombre,
                        count: ou.cantidadColaboradores || 0,
                        tipo: 'OU'
                    }));
                } else {
                    const response = await serviceApiNet.Roles.list();
                    gruposFormateados = (response.data?.data || []).map(rol => ({
                        id: rol.rolId,
                        name: rol.nombreRol,
                        count: rol.cantidadUsuarios || 0,
                        tipo: 'ROL'
                    }));
                }

                setAvailableGroups(gruposFormateados);

                if (initialData?.visibilidad?.length > 0) {
                    const preseleccionados = gruposFormateados.filter(g =>
                        initialData.visibilidad.some(
                            v => v.grupoId === g.id && v.tipoGrupo === g.tipo
                        )
                    );
                    if (preseleccionados.length > 0) {
                        setSelectedGroups(prev => {
                            const existingIds = new Set(prev.map(p => `${p.tipo}-${p.id}`));
                            const nuevos = preseleccionados.filter(
                                p => !existingIds.has(`${p.tipo}-${p.id}`)
                            );
                            return [...prev, ...nuevos];
                        });
                    }
                }
            } catch (error) {
                console.error('Error al cargar grupos:', error);
                toast.error('Error al cargar los grupos disponibles');
            } finally {
                setLoading(false);
            }
        };

        cargarGrupos();
    }, [filtroTipo]);

    const toggleGroup = (group) => {
        const existe = selectedGroups.find(g => g.id === group.id && g.tipo === group.tipo);
        if (existe) {
            setSelectedGroups(selectedGroups.filter(g => !(g.id === group.id && g.tipo === group.tipo)));
        } else {
            setSelectedGroups([...selectedGroups, group]);
        }
    };

    const removeGroup = (id, tipo) => {
        setSelectedGroups(selectedGroups.filter(g => !(g.id === id && g.tipo === tipo)));
    };

    const isSelected = (id, tipo) => selectedGroups.some(g => g.id === id && g.tipo === tipo);

    const handleSelectAll = () => {
        const filtrados = availableGroups.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const nuevos = filtrados.filter(g => !isSelected(g.id, g.tipo));
        if (nuevos.length > 0) {
            setSelectedGroups([...selectedGroups, ...nuevos]);
            toast.success(`${nuevos.length} grupos agregados`);
        }
    };

    const handleNext = () => {
        if (privacyType === 'Público') {
            onNext({ privacidad: privacyType, visibilidad: [] });
            return;
        }
        if (selectedGroups.length === 0) {
            toast.warning('Seleccione al menos un grupo para continuar');
            return;
        }
        onNext({
            privacidad: privacyType,
            visibilidad: selectedGroups.map(g => ({
                tipoGrupo: g.tipo,
                grupoId: g.id
            }))
        });
    };

    const gruposFiltrados = availableGroups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalColaboradores = selectedGroups.reduce((sum, g) => sum + g.count, 0);

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
                                Privacidad del curso
                            </span>
                            {isEditMode && (
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100">
                                    ✏️ Modo Edición
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Control de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Visibilidad</span>
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

                <StepperLayout currentStep={2} />

                <div className="mx-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Nombre del curso
                        </label>
                        <p className="text-lg font-black text-slate-800">
                            {initialData?.nombreCurso || 'CURSO SIN NOMBRE'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Configuración de Privacidad
                            </label>
                            <div className="relative">
                                <select
                                    value={privacyType}
                                    onChange={(e) => setPrivacyType(e.target.value)}
                                    className="w-full appearance-none p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-bold text-base"
                                >
                                    <option value="Privado">Privado (Solo grupos seleccionados)</option>
                                    <option value="Público">Público (Toda la organización)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                {privacyType === 'Privado' ? <Lock size={20} /> : <Globe size={20} />}
                            </div>
                            <p className="text-xs text-indigo-900 font-medium leading-tight">
                                El curso está configurado como <span className="font-bold underline">{privacyType}</span>.
                                {privacyType === 'Privado'
                                    ? ' Solo las personas pertenecientes a los grupos de abajo podrán acceder.'
                                    : ' Cualquier colaborador podrá visualizar este contenido.'}
                            </p>
                        </div>
                    </div>
                </div>

                {privacyType === 'Privado' && (
                    <div className="mx-2 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12">

                            <div className="lg:col-span-7 p-8 lg:p-12 space-y-10 border-r border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                        <Users className="text-indigo-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                            Elige quiénes podrán visualizar el curso
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Filtra por Organizaciones, Departamentos o Puestos.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 relative group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Escribe el nombre que quieres buscar..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-600"
                                            />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={filtroTipo}
                                                onChange={(e) => setFiltroTipo(e.target.value)}
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 appearance-none outline-none focus:border-indigo-500 transition-all"
                                            >
                                                <option value="OU">Agrupar por: O.U</option>
                                                <option value="ROL">Agrupar por: Rol</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                Resultados de búsqueda ({gruposFiltrados.length})
                                            </label>
                                            <button onClick={handleSelectAll} className="text-indigo-600 text-xs font-bold hover:underline">
                                                Seleccionar todos
                                            </button>
                                        </div>

                                        {loading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                                <p className="text-sm text-slate-400 mt-2">Cargando grupos...</p>
                                            </div>
                                        ) : gruposFiltrados.length > 0 ? (
                                            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                                {gruposFiltrados.map((group) => (
                                                    <div
                                                        key={`${group.tipo}-${group.id}`}
                                                        onClick={() => toggleGroup(group)}
                                                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${isSelected(group.id, group.tipo)
                                                            ? 'bg-indigo-50 border-2 border-indigo-200 shadow-md'
                                                            : 'bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-5 h-5 border-2 rounded-md transition-colors flex items-center justify-center ${isSelected(group.id, group.tipo)
                                                                ? 'bg-indigo-600 border-indigo-600'
                                                                : 'border-slate-200 group-hover:border-indigo-400'
                                                                }`}>
                                                                {isSelected(group.id, group.tipo) && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700">{group.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">
                                                                    {group.count} Colaboradores • {group.tipo}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <EyeIcon size={16} className={`transition-colors ${isSelected(group.id, group.tipo) ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-400'
                                                            }`} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">No se encontraron grupos</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 p-8 lg:p-12 bg-slate-50/30 flex flex-col space-y-6">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Selección ({selectedGroups.length})
                                </label>

                                <div className="flex-grow space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto pr-2">
                                    {selectedGroups.length > 0 ? (
                                        selectedGroups.map((group) => (
                                            <div
                                                key={`selected-${group.tipo}-${group.id}`}
                                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-right-2"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{group.name}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                            {group.count} Colaboradores • {group.tipo}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeGroup(group.id, group.tipo)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                            <Users size={48} strokeWidth={1} />
                                            <p className="text-xs font-bold uppercase mt-2">Sin grupos seleccionados</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-lg shadow-indigo-100">
                                    <div className="relative z-10 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Info size={16} className="text-indigo-200" />
                                            <h4 className="text-sm font-bold">Resumen de audiencia</h4>
                                        </div>
                                        <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                                            Actualmente este curso será visible para un total de{' '}
                                            <span className="text-white font-black underline">{totalColaboradores} colaboradores</span> únicos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        onClick={onBack}
                        className="text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors uppercase tracking-widest"
                    >
                        Regresar
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={privacyType === 'Privado' && selectedGroups.length === 0}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente paso
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PrivacyScreen;
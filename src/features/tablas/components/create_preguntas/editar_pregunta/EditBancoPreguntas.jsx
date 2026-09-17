import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';

const EditBancoPreguntas = ({ bancaId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [loadingArchivo, setLoadingArchivo] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [preguntas, setPreguntas] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchBanca = async () => {
            try {
                setLoading(true);
                const response = await serviceApiNet.Preguntas.listarPorBanco(bancaId);
                const data = response.data?.data;
                if (!data) return;
                setFormData({ nombre: data.nombreBanca || '', descripcion: data.descripcion || '' });
                const preguntasMapeadas = (data.preguntas || []).map((p, index) => ({
                    id: p.preguntaId ?? Date.now() + index,
                    preguntaId: p.preguntaId,
                    tipo: mapTipoIdToLabel(p.tipoPreguntaId),
                    tipoPreguntaId: p.tipoPreguntaId,
                    texto: p.textoPregunta,
                    explicacion: p.explicacion || '',
                    puntosValor: p.puntosValor ?? 1,
                    orden: p.orden ?? index + 1,
                    color: getColor(p.tipoPreguntaId),
                    opciones: (p.opciones || []).map((o, oIdx) => ({
                        id: o.opcionId ?? Date.now() + oIdx,
                        texto: o.textoOpcion,
                        explicacion: o.explicacionORelacion || '',
                        esCorrecta: o.esCorrecta,
                        orden: o.orden ?? oIdx + 1,
                    })),
                }));
                setPreguntas(preguntasMapeadas);
            } catch (error) {
                console.error('Error al cargar banca:', error);
            } finally {
                setLoading(false);
            }
        };
        if (bancaId) fetchBanca();
    }, [bancaId]);

    const mapTipoIdToLabel = (id) => {
        switch (id) {
            case 1: return 'Múltiple';
            case 2: return 'Relacionar';
            case 3: return 'Encuesta';
            default: return 'Múltiple';
        }
    };

    const getColor = (tipoPreguntaId) => {
        switch (tipoPreguntaId) {
            case 2: return 'bg-purple-100 text-purple-600';
            case 3: return 'bg-green-100 text-green-600';
            default: return 'bg-indigo-100 text-indigo-600';
        }
    };

    const obtenerTipoId = (tipoExcel) => {
        const tipo = tipoExcel?.toString().trim().toLowerCase();
        switch (tipo) {
            case 'opción múltiple':
            case 'opcion multiple':
            case 'múltiple': return 1;
            case 'relacionar': return 2;
            case 'encuesta': return 3;
            default: return 1;
        }
    };

    const procesarArchivo = (file) => {
        if (!file) return;
        setLoadingArchivo(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);

                const nuevasPreguntas = json.map((row, index) => {
                    const opcionesProcesadas = [];
                    const opcionCorrectaIndice = parseInt(row["Opción correcta"]);
                    for (let i = 1; i <= 6; i++) {
                        const desc = row[`Opción ${i} descripción`];
                        const rel = row[`Opción ${i} explicación o relación`];
                        if (desc && desc !== "NA") {
                            opcionesProcesadas.push({
                                id: Date.now() + index * 100 + i,
                                texto: desc,
                                explicacion: (rel && rel !== "NA") ? rel : '',
                                esCorrecta: i === opcionCorrectaIndice,
                                orden: i,
                            });
                        }
                    }
                    const tipoId = obtenerTipoId(row["Tipo de Pregunta"]);
                    return {
                        id: Date.now() + index,
                        preguntaId: null,
                        tipo: mapTipoIdToLabel(tipoId),
                        tipoPreguntaId: tipoId,
                        texto: row["Pregunta"] || 'Pregunta sin título',
                        explicacion: '',
                        puntosValor: 1,
                        orden: 0,
                        color: getColor(tipoId),
                        opciones: opcionesProcesadas,
                        esNueva: true,
                    };
                });

                setPreguntas(prev => [...prev, ...nuevasPreguntas]);
            } catch (error) {
                console.error('Error al leer Excel:', error);
                alert('Error al procesar el archivo. Revisa los encabezados.');
            } finally {
                setLoadingArchivo(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);
    const eliminarPregunta = (id) => setPreguntas(preguntas.filter(p => p.id !== id));

    const handleActualizar = async () => {
        if (!formData.nombre.trim()) { alert('Por favor, ingresa un nombre.'); return; }
        if (preguntas.length === 0) { alert('El banco debe tener al menos una pregunta.'); return; }
        setIsSaving(true);
        const payload = {
            bancaId,
            nombreBanca: formData.nombre,
            descripcion: formData.descripcion || '',
            archivoPlantilla: '',
            activo: true,
            totalPreguntas: preguntas.length,
            preguntas: preguntas.map((p, index) => ({
                tipoPreguntaId: p.tipoPreguntaId,
                textoPregunta: p.texto,
                explicacion: p.explicacion || '',
                puntosValor: p.puntosValor ?? 1,
                orden: index + 1,
                opciones: p.opciones.map((o, oIndex) => ({
                    preguntaTextoReferencia: p.texto,
                    textoOpcion: o.texto,
                    explicacionORelacion: o.explicacion || '',
                    esCorrecta: o.esCorrecta,
                    orden: oIndex + 1,
                })),
            })),
        };
        try {
            await serviceApiNet.Preguntas.update(bancaId, payload);
            alert('¡Banco de preguntas actualizado con éxito!');
            onSuccess?.();
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error al conectar con el servidor.';
            alert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
                <Loader2 className="animate-spin text-indigo-500" size={36} />
                <p className="text-slate-500 font-medium text-sm">Cargando banco de preguntas...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-5xl bg-white shadow-2xl flex flex-col rounded-2xl overflow-hidden border border-slate-200 max-h-[95vh]">

                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Editar Banco de Preguntas</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="text-slate-400" size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">Datos generales</h3>
                        <div className="grid gap-6">
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">Nombre del banco</label>
                                <input name="nombre" type="text" value={formData.nombre} placeholder="Escribe algo..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    onChange={manejarCambio} />
                            </div>
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">Descripción</label>
                                <textarea name="descripcion" rows="2" value={formData.descripcion} placeholder="Escribe algo..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    onChange={manejarCambio} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800">Agregar preguntas desde archivo</h3>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">opcional</span>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".xls,.xlsx"
                            onChange={(e) => procesarArchivo(e.target.files[0])} />
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); procesarArchivo(e.dataTransfer.files[0]); }}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/50'}`}
                        >
                            {loadingArchivo
                                ? <Loader2 className="animate-spin text-indigo-500 mb-2" size={28} />
                                : <Upload className="text-indigo-400 mb-2" size={28} />
                            }
                            <p className="text-slate-500 font-medium text-sm">
                                {loadingArchivo ? 'Procesando archivo...' : 'Las preguntas del archivo se agregarán a las existentes'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">XLS, XLSX</p>
                            <button onClick={() => fileInputRef.current.click()} disabled={loadingArchivo}
                                className="mt-3 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all text-sm disabled:opacity-50">
                                <Plus size={16} />
                                Buscar archivo
                            </button>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">Preguntas ({preguntas.length})</h3>
                        <div className="space-y-4">
                            {preguntas.length === 0 ? (
                                <div className="text-center py-10 border border-slate-100 rounded-xl text-slate-500">No hay preguntas cargadas</div>
                            ) : (
                                preguntas.map((p) => (
                                    <div key={p.id} className={`border rounded-xl overflow-hidden shadow-sm bg-white ${p.esNueva ? 'border-indigo-200' : 'border-slate-200'}`}>
                                        {p.esNueva && (
                                            <div className="bg-indigo-50 px-4 py-1 border-b border-indigo-100">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Nueva pregunta</span>
                                            </div>
                                        )}
                                        <div onClick={() => toggleExpand(p.id)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${p.color}`}>{p.tipo}</span>
                                                <p className="text-slate-700 font-medium text-sm">{p.texto}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); eliminarPregunta(p.id); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                                {expandedId === p.id ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                                            </div>
                                        </div>
                                        {expandedId === p.id && (
                                            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
                                                <div className="bg-white border border-slate-200 rounded-lg p-4 text-slate-600 text-sm">{p.texto}</div>
                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Opciones ({p.opciones.length})</h4>
                                                    <div className="grid gap-3">
                                                        {p.opciones.map((opt) => (
                                                            <div key={opt.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm">
                                                                <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${opt.esCorrecta ? 'border-indigo-500' : 'border-slate-200'}`}>
                                                                    {opt.esCorrecta && <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Opción</p>
                                                                    <p className="text-slate-700 text-sm font-medium">{opt.texto}</p>
                                                                    {opt.explicacion && <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 italic">{opt.explicacion}</p>}
                                                                    {opt.esCorrecta && <span className="text-[10px] text-indigo-600 font-black uppercase mt-2 inline-block">Respuesta correcta</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                    <button onClick={onClose} disabled={isSaving} className="text-indigo-600 font-bold px-6 py-2 hover:bg-indigo-50 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleActualizar} disabled={preguntas.length === 0 || isSaving}
                        className="bg-indigo-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 hover:bg-indigo-700 transition-all flex items-center gap-2">
                        {isSaving ? (<><Loader2 className="animate-spin" size={18} />Guardando...</>) : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditBancoPreguntas;
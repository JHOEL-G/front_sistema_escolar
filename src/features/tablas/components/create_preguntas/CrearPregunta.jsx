import React, { useState, useRef } from 'react';
import { X, Upload, Download, Trash2, ChevronDown, ChevronUp, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import serviceApiNet from '../../../../lib/api/serviceApiNet';

const CreateBancoPreguntas = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [archivoSubido, setArchivoSubido] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const fileInputRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
    const [preguntas, setPreguntas] = useState([]);

    const procesarArchivo = (file) => {
        if (!file) return;
        setLoading(true);
        setArchivoSubido(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);

                const nuevasPreguntas = json.map((row, index) => {
                    const opcionesProcesadas = [];
                    const numOpciones = parseInt(row["Número de opciones"]) || 0;
                    const opcionCorrectaIndice = parseInt(row["Opción correcta"]);

                    for (let i = 1; i <= 6; i++) {
                        const desc = row[`Opción ${i} descripción`];
                        const rel = row[`Opción ${i} explicación o relación`];

                        if (desc && desc !== "NA") {
                            opcionesProcesadas.push({
                                id: i,
                                texto: desc,
                                explicacion: (rel && rel !== "NA") ? rel : null,
                                esCorrecta: i === opcionCorrectaIndice
                            });
                        }
                    }

                    return {
                        id: Date.now() + index,
                        tipo: row["Tipo de Pregunta"] || 'Múltiple',
                        texto: row["Pregunta"] || 'Pregunta sin título',
                        opciones: opcionesProcesadas,
                        color: row["Tipo de Pregunta"] === 'Relacionar' ? 'bg-purple-100 text-purple-600' :
                            row["Tipo de Pregunta"] === 'Encuesta' ? 'bg-green-100 text-green-600' :
                                'bg-indigo-100 text-indigo-600'
                    };
                });

                setPreguntas(nuevasPreguntas);
            } catch (error) {
                console.error("Error al leer Excel:", error);
                alert("Error al procesar el archivo. Revisa los encabezados.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const eliminarPregunta = (id) => {
        setPreguntas(preguntas.filter(p => p.id !== id));
    };

    const handleCrearBanco = async () => {
        if (!formData.nombre.trim()) {
            alert("Por favor, ingresa un nombre para el banco de preguntas.");
            return;
        }

        if (preguntas.length === 0) {
            alert("El banco debe tener al menos una pregunta.");
            return;
        }

        const obtenerTipoId = (tipoExcel) => {
            const tipo = tipoExcel?.toString().trim().toLowerCase();

            switch (tipo) {
                case 'opción múltiple':
                case 'opcion multiple':
                case 'múltiple':
                    return 1;
                case 'relacionar':
                    return 2;
                case 'encuesta':
                    return 3;
                default:
                    return 1;
            }
        };

        setIsSaving(true);

        const payload = {
            bancaId: 0,
            nombreBanca: formData.nombre,
            descripcion: formData.descripcion || "",
            archivoPlantilla: archivoSubido || "",
            fechaCreacion: new Date().toISOString(),
            activo: true,
            totalPreguntas: preguntas.length,
            preguntas: preguntas.map((p, index) => ({
                tipoPreguntaId: obtenerTipoId(p.tipo),
                textoPregunta: p.texto,
                explicacion: "",
                puntosValor: 1,
                orden: index + 1,
                opciones: p.opciones.map((o, oIndex) => ({
                    preguntaTextoReferencia: p.texto,
                    textoOpcion: o.texto,
                    explicacionORelacion: o.explicacion || "",
                    esCorrecta: o.esCorrecta,
                    orden: oIndex + 1
                }))
            }))
        };

        try {
            await serviceApiNet.Preguntas.crear(payload);
            alert("¡Banco de preguntas creado con éxito!");
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            const errorMsg = error.response?.data?.message || "Error al conectar con el servidor.";
            alert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-5xl bg-white shadow-2xl flex flex-col rounded-2xl overflow-hidden border border-slate-200 max-h-[95vh]">

                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Creación de Banco de preguntas</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="text-slate-400" size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">Datos generales</h3>
                        <div className="grid gap-6">
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">Nombre del banco de preguntas</label>
                                <input name="nombre" type="text" placeholder="Escribe algo..." className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" onChange={manejarCambio} />
                            </div>
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">Descripción</label>
                                <textarea name="descripcion" rows="2" placeholder="Escribe algo..." className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" onChange={manejarCambio} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800">Completa la plantilla y arrastra el archivo</h3>
                            <button className="text-indigo-600 font-bold hover:underline text-sm">Descargar</button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".xls,.xlsx" onChange={(e) => procesarArchivo(e.target.files[0])} />
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); procesarArchivo(e.dataTransfer.files[0]); }}
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/50'}`}
                        >
                            {loading ? <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} /> : <Upload className="text-indigo-500 mb-2" size={32} />}
                            <p className="text-slate-600 font-medium">{archivoSubido || "Arrastra y suelta un archivo"}</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Formatos aceptados: XLS, XLSX</p>
                            <button onClick={() => fileInputRef.current.click()} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                                Buscar archivos para subir
                            </button>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Preguntas ({preguntas.length})</h3>
                            {preguntas.length > 0 && (
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm">
                                    Descargar preguntas <Download size={16} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {preguntas.length === 0 ? (
                                <div className="text-center py-10 border border-slate-100 rounded-xl text-slate-500">No hay preguntas cargadas</div>
                            ) : (
                                preguntas.map((p) => (
                                    <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                        <div onClick={() => toggleExpand(p.id)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${p.color}`}>{p.tipo}</span>
                                                <p className="text-slate-700 font-medium text-sm">{p.texto}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); eliminarPregunta(p.id); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                {expandedId === p.id ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                                            </div>
                                        </div>

                                        {expandedId === p.id && (
                                            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
                                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                    <div className="flex gap-4 px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-slate-400">
                                                        <span className="text-xs font-bold">Poppins</span>
                                                        <span className="text-xs font-bold">B</span>
                                                        <span className="text-xs italic">I</span>
                                                        <span className="text-xs underline">U</span>
                                                    </div>
                                                    <div className="p-4 text-slate-600 text-sm">{p.texto}</div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Opciones ({p.opciones.length})</h4>
                                                    <div className="grid gap-3">
                                                        {p.opciones.map((opt) => (
                                                            <div key={opt.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm relative group">
                                                                <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${opt.esCorrecta ? 'border-indigo-500' : 'border-slate-200'}`}>
                                                                    {opt.esCorrecta && <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Título de opción</p>
                                                                    <p className="text-slate-700 text-sm font-medium">{opt.texto}</p>
                                                                    {opt.explicacion && <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 italic">{opt.explicacion}</p>}
                                                                    {opt.esCorrecta && <span className="text-[10px] text-indigo-600 font-black uppercase mt-2 inline-block">Respuesta correcta</span>}
                                                                </div>
                                                                <button className="opacity-0 group-hover:opacity-100 absolute right-4 top-4 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
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
                    <button
                        onClick={onClose}
                        className="text-indigo-600 font-bold px-6 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleCrearBanco}
                        disabled={preguntas.length === 0 || isSaving || loading}
                        className="bg-indigo-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Guardando...
                            </>
                        ) : (
                            "Crear banco"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateBancoPreguntas;
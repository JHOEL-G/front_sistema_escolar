import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download, Info, Eye, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';

const ImportarRol = ({ onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState([]);
    const [previewColumns, setPreviewColumns] = useState([]);
    const [errors, setErrors] = useState([]);
    const [showErrors, setShowErrors] = useState(false);
    const [success, setSuccess] = useState(false);
    const [stats, setStats] = useState(null);

    const expectedColumns = ['nombreRol', 'descripcion'];

    const columnLabels = {
        nombreRol: 'Nombre del Rol',
        descripcion: 'Descripción'
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!validTypes.includes(selectedFile.type)) {
            setErrors(['Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV']);
            return;
        }

        setFile(selectedFile);
        setErrors([]);
        setSuccess(false);
        setStats(null);
        processFile(selectedFile);
    };

    const processFile = (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                    defval: '',
                    raw: false
                });

                if (jsonData.length === 0) {
                    setErrors(['El archivo está vacío o no tiene datos']);
                    return;
                }

                const fileColumns = Object.keys(jsonData[0]);
                const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));

                if (missingColumns.length > 0) {
                    setErrors([
                        'Faltan las siguientes columnas en el archivo:',
                        ...missingColumns.map(col => `• ${col}`)
                    ]);
                    return;
                }

                const normalizedData = jsonData.map(row => ({
                    nombreRol: String(row.nombreRol || '').trim(),
                    descripcion: String(row.descripcion || '').trim()
                }));

                setPreviewColumns(expectedColumns);
                setPreview(normalizedData.slice(0, 5));

            } catch (error) {
                setErrors(['Error al procesar el archivo: ' + error.message]);
                console.error('Error procesando archivo:', error);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const validateData = (data) => {
        const validationErrors = [];

        data.forEach((row, index) => {
            const rowNumber = index + 2;

            if (!row.nombreRol || row.nombreRol === '') {
                validationErrors.push(`Fila ${rowNumber}: El nombre del rol es obligatorio`);
            } else if (row.nombreRol.length < 2) {
                validationErrors.push(`Fila ${rowNumber}: El nombre del rol debe tener al menos 2 caracteres`);
            }
        });

        return validationErrors;
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setErrors([]);
        setStats(null);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                    defval: '',
                    raw: false
                });

                const normalizedData = jsonData.map(row => ({
                    nombreRol: String(row.nombreRol || '').trim(),
                    descripcion: String(row.descripcion || '').trim()
                }));

                const validationErrors = validateData(normalizedData);
                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                    setLoading(false);
                    return;
                }

                const results = {
                    success: 0,
                    failed: 0,
                    errors: []
                };

                for (let i = 0; i < normalizedData.length; i++) {
                    const row = normalizedData[i];
                    const rowNumber = i + 2;

                    const rolData = {
                        nombreRol: row.nombreRol,
                        descripcion: row.descripcion || ''
                    };

                    try {
                        await serviceApiNet.Roles.create(rolData);
                        results.success++;
                    } catch (error) {
                        results.failed++;
                        const errorMsg = error.response?.data?.mensaje ||
                            error.response?.data?.Mensaje ||
                            error.response?.data?.message ||
                            error.message;
                        results.errors.push(`Fila ${rowNumber} (${row.nombreRol}): ${errorMsg}`);
                        console.error(`❌ Error en fila ${rowNumber}:`, error);
                    }
                }

                setStats({
                    total: normalizedData.length,
                    success: results.success,
                    failed: results.failed
                });

                if (results.failed > 0) {
                    setErrors(results.errors);
                } else {
                    setSuccess(true);
                    setTimeout(() => {
                        onImportSuccess();
                        onClose();
                    }, 3000);
                }

                setLoading(false);
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            setErrors(['Error al importar roles: ' + error.message]);
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                nombreRol: 'Administrador de Sistema',
                descripcion: 'Acceso completo a todas las funcionalidades del sistema'
            },
            {
                nombreRol: 'Supervisor',
                descripcion: 'Puede gestionar usuarios y ver reportes'
            },
            {
                nombreRol: 'Usuario Básico',
                descripcion: 'Acceso limitado a funciones básicas'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);

        const colWidths = [
            { wch: 30 },
            { wch: 60 }
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Roles');
        XLSX.writeFile(wb, 'plantilla_roles.xlsx');
    };

    const formatCellValue = (value) => {
        if (value === '' || value === null || value === undefined) {
            return <span className="text-slate-300 italic text-[10px]">(vacío)</span>;
        }
        return <span className="text-slate-700">{String(value)}</span>;
    };

    const extractPrimaryError = (error) => {
        let mensaje = error.replace(/^Fila \d+ \((.+?)\):\s*/, '');
        mensaje = mensaje.replace(/^Fila \d+:\s*/, '');
        mensaje = mensaje.replace(/^Error en flujo de creación:\s*/i, '');
        mensaje = mensaje.replace(/^Error:\s*/i, '');

        return mensaje.trim() || error;
    };

    const extractMainError = (error) => {
        const rowMatch = error.match(/Fila \d+ \((.+?)\):/);
        if (rowMatch) {
            return `Rol: ${rowMatch[1]}`;
        }

        const rowNumMatch = error.match(/Fila (\d+):/);
        if (rowNumMatch) {
            return `Fila ${rowNumMatch[1]}`;
        }

        return 'Error';
    };

    const extractDetailError = (error) => {
        let detalle = error.replace(/^Fila \d+ \((.+?)\):\s*/, '');
        detalle = detalle.replace(/^Fila \d+:\s*/, '');
        detalle = detalle.replace(/^Error en flujo de creación:\s*/i, '');
        detalle = detalle.replace(/^Error:\s*/i, '');

        return detalle.trim() || null;
    };

    useEffect(() => {
        if (errors.length > 0 && !showErrors) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors.length, showErrors]);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-200">

                {loading && (
                    <div className="h-1.5 bg-slate-100">
                        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-pulse"></div>
                    </div>
                )}

                <div className="flex justify-between items-start p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FileSpreadsheet className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Importar Roles
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Carga masiva desde Excel
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                    >
                        <X size={22} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">

                    <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Info className="text-emerald-600" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Descarga la plantilla con el formato correcto
                                    </p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Campos: Nombre del Rol (obligatorio) • Descripción (opcional)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={downloadTemplate}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
                            >
                                <Download size={16} />
                                Descargar
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Seleccionar archivo Excel
                        </label>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload-rol"
                            disabled={loading}
                        />
                        <label
                            htmlFor="file-upload-rol"
                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${loading
                                ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                                }`}
                        >
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-2">
                                <Upload className="text-emerald-600" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                                {file ? file.name : 'Click para seleccionar archivo'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                .xlsx, .xls, .csv (máx. 10MB)
                            </p>
                        </label>
                    </div>

                    {preview.length > 0 && (
                        <div className="mb-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Eye size={16} className="text-emerald-600" />
                                    Vista previa ({preview.length} registros)
                                </h3>
                                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                                    {previewColumns.length} columnas
                                </span>
                            </div>
                            <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl bg-white shadow-sm">
                                <table className="w-full text-xs">
                                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                        <tr>
                                            <th className="px-3 py-3 text-left font-bold text-slate-500 uppercase text-[10px] border-r border-slate-200">
                                                #
                                            </th>
                                            {previewColumns.map((key) => (
                                                <th key={key} className="px-3 py-3 text-left font-bold text-slate-600 uppercase text-[10px] border-r border-slate-200 whitespace-nowrap">
                                                    {columnLabels[key] || key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {preview.map((row, i) => (
                                            <tr key={i} className="hover:bg-emerald-50/30 transition">
                                                <td className="px-3 py-3 text-slate-400 font-mono text-[10px] border-r border-slate-100">
                                                    {i + 1}
                                                </td>
                                                {previewColumns.map((col) => (
                                                    <td key={col} className="px-3 py-3 border-r border-slate-100 text-[11px]">
                                                        {formatCellValue(row[col])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {stats && (
                        <div className="mb-6 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-400">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Total</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                                <p className="text-2xl font-bold text-emerald-600">{stats.success}</p>
                                <p className="text-xs text-emerald-600 font-medium mt-1">Exitosos</p>
                            </div>
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
                                <p className="text-2xl font-bold text-rose-600">{stats.failed}</p>
                                <p className="text-xs text-rose-600 font-medium mt-1">Fallidos</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in zoom-in duration-500">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-600" size={22} />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">
                                        ¡{stats.success} roles importados!
                                    </p>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Cerrando automáticamente...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-white">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {success ? 'Cerrar' : 'Cancelar'}
                    </button>

                    <button
                        onClick={handleImport}
                        disabled={!file || loading || success}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Importando...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Importar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="fixed top-6 right-6 z-[60] max-w-md w-full animate-in slide-in-from-right-5 duration-500">
                    <div className="bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="h-1 bg-white/20">
                            <div
                                className="h-full bg-white/60 transition-all ease-linear"
                                style={{
                                    width: showErrors ? '100%' : '0%',
                                    transitionDuration: showErrors ? '0s' : '5s'
                                }}
                            />
                        </div>

                        <button
                            onClick={() => setShowErrors(!showErrors)}
                            className="w-full p-4 text-white flex items-center justify-between hover:bg-black/10 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">
                                        {extractPrimaryError(errors[0])}
                                    </p>
                                    <p className="text-xs text-rose-100">
                                        {errors.length > 1 ? (
                                            <>{errors.length} errores • Click para ver todos</>
                                        ) : (
                                            <>Click para {showErrors ? 'ocultar' : 'ver'} detalles</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`transition-transform duration-300 ${showErrors ? 'rotate-180' : ''}`}>
                                    <ChevronDown className="text-white" size={20} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setErrors([]);
                                        setShowErrors(false);
                                    }}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </button>

                        {showErrors && (
                            <div className="p-4 bg-rose-50 border-t border-rose-400/20 max-h-96 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    {errors.map((error, i) => {
                                        const mainError = extractMainError(error);
                                        const detailError = extractDetailError(error);

                                        return (
                                            <div
                                                key={i}
                                                className="flex gap-2.5 p-3 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                                            >
                                                <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 pt-0.5 space-y-1">
                                                    <p className="text-sm font-bold text-rose-900">
                                                        {mainError}
                                                    </p>
                                                    {detailError && (
                                                        <p className="text-xs text-rose-700 leading-relaxed">
                                                            {detailError}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportarRol;
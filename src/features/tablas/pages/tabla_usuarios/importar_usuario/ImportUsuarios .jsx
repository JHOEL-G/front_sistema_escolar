import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download, Info, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import serviceApiNet from '../../../../../lib/api/serviceApiNet';
import { ChevronDown } from 'lucide-react';

const ImportUsuarios = ({ onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState([]);
    const [previewColumns, setPreviewColumns] = useState([]);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState(false);
    const [stats, setStats] = useState(null);
    const [showErrors, setShowErrors] = useState(false);

    const [catalogos, setCatalogos] = useState({
        roles: [],
        puestos: [],
        jefes: [],
        unidades: [],
    });

    const expectedColumns = [
        'nombre', 'apeLLido', 'correo', 'contraseña', 'correoAlternativo',
        'rol', 'puesto', 'jefe', 'unidad_Organizacional',
        'fechaDesactivacion', 'razonSocial', 'nivelPermiso', 'activo'
    ];

    const columnLabels = {
        nombre: 'Nombre',
        apeLLido: 'Apellido',
        correo: 'Correo',
        contraseña: 'Contraseña',
        correoAlternativo: 'Correo Alt.',
        rol: 'Rol',
        puesto: 'Puesto',
        jefe: 'Jefe Directo',
        unidad_Organizacional: 'Unidad Org.',
        fechaDesactivacion: 'F. Desactivación',
        razonSocial: 'Razón Social',
        nivelPermiso: 'Nivel',
        activo: 'Activo',
    };

    useEffect(() => {
        const cargar = async () => {
            try {
                const [resRoles, resOus, resPuestos, resJefes] = await Promise.all([
                    serviceApiNet.Roles.list(),
                    serviceApiNet.Ous.list(),
                    serviceApiNet.Puestos.list(),
                    serviceApiNet.Jefes.list(),
                ]);
                const toArr = (res) =>
                    Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);

                setCatalogos({
                    roles: toArr(resRoles).map(r => ({ id: r.rolId, nombre: (r.nombreRol || '').toLowerCase() })),
                    puestos: toArr(resPuestos).map(p => ({ id: p.puestoId, nombre: (p.nombre_Puesto || '').toLowerCase() })),
                    jefes: toArr(resJefes).map(j => ({ id: j.jefeId, nombre: (j.nombre || '').toLowerCase() })),
                    unidades: toArr(resOus).map(ou => ({ id: ou.organizacionalesId, nombre: (ou.nombre || '').toLowerCase() })),
                });
            } catch (e) {
                console.error('Error cargando catálogos:', e);
            }
        };
        cargar();
    }, []);

    const resolverTexto = (texto, lista) => {
        if (!texto || texto === '') return null;
        const t = texto.toLowerCase().trim();
        const match = lista.find(item => item.nombre === t || item.nombre.includes(t));
        return match ? match.id : null;
    };

    const obtenerNivelPermisoId = (nivelPermiso) => {
        const map = { 'administrador': 1, 'admin': 1, 'colaborador': 2, 'instructor': 3, 'lite': 4 };
        return map[String(nivelPermiso).toLowerCase().trim()] || 4;
    };

    const convertirFecha = (fechaStr) => {
        if (!fechaStr || fechaStr === '') return null;
        try {
            if (fechaStr.includes('/')) {
                const [dia, mes, año] = fechaStr.split('/');
                return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }
            return fechaStr;
        } catch { return null; }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: true, blankrows: false });

                if (jsonData.length === 0) { setErrors(['El archivo está vacío']); return; }

                const fileColumns = Object.keys(jsonData[0]);
                const missing = expectedColumns.filter(col => !fileColumns.includes(col));
                if (missing.length > 0) {
                    setErrors(['Faltan columnas:', ...missing.map(c => `• ${c}`)]);
                    return;
                }

                const normalized = jsonData.map(row => normalizeRow(row, true));
                setPreviewColumns(expectedColumns);
                setPreview(normalized.slice(0, 5));
            } catch (err) {
                setErrors(['Error al procesar el archivo: ' + err.message]);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const normalizeRow = (row, rawMode = false) => {
        const normalized = {};
        expectedColumns.forEach(col => {
            let value = row[col];
            if (value === '' || value === null || value === undefined) {
                normalized[col] = '';
            } else if (col === 'activo') {
                const s = String(value).toLowerCase().trim();
                normalized[col] = ['true', 'verdadero', 'si', 'sí', '1', 'activo'].includes(s);
            } else if (col === 'nivelPermiso') {
                const map = { admin: 'Administrador', administrador: 'Administrador', instructor: 'Instructor', colaborador: 'Colaborador', lite: 'Lite' };
                normalized[col] = map[String(value).toLowerCase().trim()] || 'Lite';
            } else {
                normalized[col] = String(value).trim();
            }
        });
        return normalized;
    };

    const validateData = (data) => {
        const errs = [];
        data.forEach((row, i) => {
            const n = i + 2;
            if (!row.nombre) errs.push(`Fila ${n}: El nombre es obligatorio`);
            if (!row.apeLLido) errs.push(`Fila ${n}: El apellido es obligatorio`);
            if (!row.correo) errs.push(`Fila ${n}: El correo es obligatorio`);
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.correo))
                errs.push(`Fila ${n}: Correo inválido (${row.correo})`);
            if (!row.contraseña || row.contraseña.length < 8)
                errs.push(`Fila ${n}: Contraseña mínimo 8 caracteres`);
            if (!row.rol) errs.push(`Fila ${n}: El rol es obligatorio`);
            if (!row.puesto) errs.push(`Fila ${n}: El puesto es obligatorio`);
            if (!row.unidad_Organizacional)
                errs.push(`Fila ${n}: La unidad organizacional es obligatoria`);

            if (row.rol && resolverTexto(row.rol, catalogos.roles) === null)
                errs.push(`Fila ${n}: Rol no encontrado — "${row.rol}"`);
            if (row.puesto && resolverTexto(row.puesto, catalogos.puestos) === null)
                errs.push(`Fila ${n}: Puesto no encontrado — "${row.puesto}"`);
            if (row.jefe && resolverTexto(row.jefe, catalogos.jefes) === null)
                errs.push(`Fila ${n}: Jefe no encontrado — "${row.jefe}"`);
            if (row.unidad_Organizacional && resolverTexto(row.unidad_Organizacional, catalogos.unidades) === null)
                errs.push(`Fila ${n}: Unidad no encontrada — "${row.unidad_Organizacional}"`);
        });
        return errs;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel', 'text/csv'
        ];
        if (!validTypes.includes(selectedFile.type)) {
            setErrors(['Selecciona un archivo .xlsx, .xls o .csv']);
            return;
        }
        setFile(selectedFile);
        setErrors([]);
        setSuccess(false);
        setStats(null);
        processFile(selectedFile);
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
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false });
                const normalizedData = jsonData.map(row => normalizeRow(row));

                const validationErrors = validateData(normalizedData);
                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                    setLoading(false);
                    return;
                }

                const results = { success: 0, failed: 0, errors: [] };

                for (let i = 0; i < normalizedData.length; i++) {
                    const row = normalizedData[i];
                    const rowNumber = i + 2;

                    const usuarioData = {
                        nombre: row.nombre,
                        apeLLido: row.apeLLido,
                        correo: row.correo,
                        contraseña: row.contraseña,
                        correoAlternativo: row.correoAlternativo || null,
                        razonSocial: row.razonSocial || null,
                        fechaDesactivacion: convertirFecha(row.fechaDesactivacion),
                        activo: row.activo,
                        rolId: resolverTexto(row.rol, catalogos.roles),
                        puestoId: resolverTexto(row.puesto, catalogos.puestos),
                        jefeId: resolverTexto(row.jefe, catalogos.jefes),
                        OrganizacionalesId: resolverTexto(row.unidad_Organizacional, catalogos.unidades),
                        nivelPermisoId: obtenerNivelPermisoId(row.nivelPermiso),
                    };

                    try {
                        const formData = new FormData();
                        formData.append('UsuarioData', JSON.stringify(usuarioData));
                        await serviceApiNet.Keycloak.createUsuarioKeycloak(formData);
                        results.success++;
                    } catch (error) {
                        results.failed++;
                        const errorMsg = error.response?.data?.mensaje ||
                            error.response?.data?.message || error.message;
                        results.errors.push(`Fila ${rowNumber} (${row.nombre} ${row.apeLLido}): ${errorMsg}`);
                    }
                }

                setStats({ total: normalizedData.length, success: results.success, failed: results.failed });

                if (results.failed > 0) {
                    setErrors(results.errors);
                } else {
                    setSuccess(true);
                    setTimeout(() => { onImportSuccess(); onClose(); }, 3000);
                }
                setLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            setErrors(['Error al importar: ' + error.message]);
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                nombre: 'Juan', apeLLido: 'Pérez',
                correo: 'juan.perez@empresa.com', contraseña: 'Password123!',
                correoAlternativo: 'juan.alt@empresa.com',
                rol: 'Administrador', puesto: 'Gerente', jefe: 'Carlos López',
                unidad_Organizacional: 'Tecnología',
                fechaDesactivacion: '',
                razonSocial: 'Empresa SA de CV', nivelPermiso: 'Lite', activo: 'VERDADERO'
            },
            {
                nombre: 'María', apeLLido: 'García',
                correo: 'maria.garcia@empresa.com', contraseña: 'Segura456!',
                correoAlternativo: '',
                rol: 'Instructor', puesto: 'Analista', jefe: '',
                unidad_Organizacional: 'Recursos Humanos',
                fechaDesactivacion: '',
                razonSocial: 'Empresa SA de CV', nivelPermiso: 'Colaborador', activo: 'VERDADERO'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        ws['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
            { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 },
            { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 12 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'plantilla_usuarios.xlsx');
    };

    const formatCellValue = (value) => {
        if (value === '' || value === null || value === undefined)
            return <span className="text-slate-300 italic text-[10px]">(vacío)</span>;
        if (typeof value === 'boolean')
            return value
                ? <span className="text-emerald-600 font-semibold">Sí</span>
                : <span className="text-slate-400 font-semibold">No</span>;
        return <span className="text-slate-700">{String(value)}</span>;
    };

    const extractPrimaryError = (error) =>
        error.replace(/^Fila \d+ \((.+?)\):\s*/, '')
            .replace(/^Fila \d+:\s*/, '')
            .replace(/^Error en flujo de creación:\s*/i, '')
            .replace(/^Error:\s*/i, '').trim() || error;

    const extractMainError = (error) => {
        const m = error.match(/Fila \d+ \((.+?)\):/);
        if (m) return `Usuario: ${m[1]}`;
        const n = error.match(/Fila (\d+):/);
        if (n) return `Fila ${n[1]}`;
        return 'Error';
    };

    const extractDetailError = (error) =>
        error.replace(/^Fila \d+ \((.+?)\):\s*/, '')
            .replace(/^Fila \d+:\s*/, '')
            .replace(/^Error en flujo de creación:\s*/i, '')
            .replace(/^Error:\s*/i, '').trim() || null;

    useEffect(() => {
        if (errors.length > 0 && !showErrors) {
            const t = setTimeout(() => setErrors([]), 5000);
            return () => clearTimeout(t);
        }
    }, [errors.length, showErrors]);

    useEffect(() => {
        if (errors.length === 1) setShowErrors(true);
    }, [errors.length]);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-200">

                {loading && (
                    <div className="h-1.5 bg-slate-100">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
                    </div>
                )}

                <div className="flex justify-between items-start p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FileSpreadsheet className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Importar Usuarios
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Carga masiva desde Excel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200">
                        <X size={22} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">

                    <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Info className="text-indigo-600 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Usa la plantilla con formato correcto</p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Escribe el <strong>nombre</strong> del rol, puesto, jefe y unidad tal como están registrados •
                                        Activo: VERDADERO/FALSO
                                    </p>
                                </div>
                            </div>
                            <button onClick={downloadTemplate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 flex-shrink-0 ml-4">
                                <Download size={16} /> Descargar
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Seleccionar archivo Excel</label>
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange}
                            className="hidden" id="file-upload" disabled={loading} />
                        <label htmlFor="file-upload"
                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${loading ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50'}`}>
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-2">
                                <Upload className="text-indigo-600" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                                {file ? file.name : 'Click para seleccionar archivo'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">.xlsx, .xls, .csv (máx. 10MB)</p>
                        </label>
                    </div>

                    {preview.length > 0 && (
                        <div className="mb-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Eye size={16} className="text-indigo-600" />
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
                                            <th className="px-3 py-3 text-left font-bold text-slate-500 uppercase text-[10px] border-r border-slate-200">#</th>
                                            {previewColumns.map(key => (
                                                <th key={key} className="px-3 py-3 text-left font-bold text-slate-600 uppercase text-[10px] border-r border-slate-200 whitespace-nowrap">
                                                    {columnLabels[key] || key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {preview.map((row, i) => (
                                            <tr key={i} className="hover:bg-indigo-50/30 transition">
                                                <td className="px-3 py-3 text-slate-400 font-mono text-[10px] border-r border-slate-100">{i + 1}</td>
                                                {previewColumns.map(col => (
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

                    {errors.length > 0 && (
                        <div className="fixed top-6 right-6 z-[60] max-w-md w-full animate-in slide-in-from-right-5 duration-500">
                            <div className="bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl overflow-hidden shadow-2xl">
                                <button onClick={() => setShowErrors(!showErrors)}
                                    className="w-full p-4 text-white flex items-center justify-between hover:bg-black/10 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{extractPrimaryError(errors[0])}</p>
                                            <p className="text-xs text-rose-100">
                                                {errors.length > 1
                                                    ? <>{errors.length} errores · Click para ver todos</>
                                                    : <>Click para {showErrors ? 'ocultar' : 'ver'} detalles</>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className={`transition-transform duration-300 ${showErrors ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="text-white" size={20} />
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setErrors([]); setShowErrors(false); }}
                                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </button>

                                {showErrors && (
                                    <div className="p-4 bg-rose-50 border-t border-rose-400/20 max-h-96 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            {errors.map((error, i) => (
                                                <div key={i} className="flex gap-2.5 p-3 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors">
                                                    <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">{i + 1}</span>
                                                    <div className="flex-1 pt-0.5 space-y-1">
                                                        <p className="text-sm font-bold text-rose-900">{extractMainError(error)}</p>
                                                        {extractDetailError(error) && (
                                                            <p className="text-xs text-rose-700 leading-relaxed">{extractDetailError(error)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in zoom-in duration-500">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-600" size={22} />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">¡{stats.success} usuarios importados!</p>
                                    <p className="text-xs text-emerald-700 mt-0.5">Cerrando automáticamente...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-white">
                    <button onClick={onClose} disabled={loading}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {success ? 'Cerrar' : 'Cancelar'}
                    </button>
                    <button onClick={handleImport} disabled={!file || loading || success}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading
                            ? <><Loader2 className="animate-spin" size={18} /> Importando...</>
                            : <><Upload size={18} /> Importar</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportUsuarios;
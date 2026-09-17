import { useState, useRef, useEffect } from 'react';
import { X, Image, ChevronDown, ChevronUp, Trash2, Plus, Check, Link2, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Subscript, Superscript } from 'lucide-react';

export const crearOpcionVacia = (texto = '') => ({
    id: crypto.randomUUID(),
    texto,
    explicacion: '',
    esCorrecta: false,
    imagen: null,
    imagenFile: null,
    imagenNombre: null
});

export const crearPreguntaVacia = (tipo = 'multiple') => ({
    id: crypto.randomUUID(),
    tipo,
    pregunta: '',
    opciones: tipo === 'multiple'
        ? [crearOpcionVacia('Opción 1'), crearOpcionVacia('Opción 2')]
        : [],
    pares: tipo === 'relacion'
        ? [{ id: crypto.randomUUID(), izquierda: '', derecha: '' }]
        : [],
    criterios: tipo === 'desarrollo'
        ? [{ id: crypto.randomUUID(), descripcion: '', puntos: 0 }]
        : [],
    imagenPregunta: null,
    imagenPreguntaFile: null,
    imagenPreguntaNombre: null
});

const leerArchivo = (file) =>
    new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result);
        r.readAsDataURL(file);
    });

export const BtnImagen = ({ imagen, onImagen, onEliminar, size = 'sm' }) => {
    const ref = useRef();
    return imagen ? (
        <div className="relative inline-block">
            <img src={imagen} alt="" className={`rounded-xl object-cover border border-slate-100 ${size === 'sm' ? 'h-16' : 'h-28 w-full'}`} />
            <button
                type="button"
                onClick={onEliminar}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow"
            >
                <X size={10} />
            </button>
        </div>
    ) : (
        <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wide">
            <Image size={12} />
            Imagen
            <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                    const f = e.target.files[0];
                    if (f) { const b64 = await leerArchivo(f); onImagen(b64, f); }
                    e.target.value = '';
                }}
            />
        </label>
    );
};

export const RichEditor = ({ value, onChange, placeholder, disableImage = false }) => {
    const editorRef = useRef(null);
    const isComposing = useRef(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, []);

    const exec = (cmd, val = null) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
    };

    const insertImage = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const b64 = await leerArchivo(f);
        exec('insertImage', b64);
        e.target.value = '';
    };

    const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32'];
    const FONTS = ['Poppins', 'Arial', 'Georgia', 'Courier New'];

    return (
        <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-indigo-300 transition-colors">
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('undo'); }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all" title="Deshacer">
                    ↩
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('redo'); }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all" title="Rehacer">
                    ↪
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                <select onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => { exec('fontName', e.target.value); editorRef.current?.focus(); }}
                    className="text-xs text-slate-600 bg-transparent border border-slate-200 rounded-lg px-1.5 py-1 cursor-pointer outline-none hover:border-indigo-300 transition-colors">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <select onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => { exec('fontSize', e.target.value); editorRef.current?.focus(); }}
                    className="text-xs text-slate-600 bg-transparent border border-slate-200 rounded-lg px-1.5 py-1 w-16 cursor-pointer outline-none hover:border-indigo-300 transition-colors">
                    {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {[
                    { cmd: 'bold', label: <strong>B</strong>, title: 'Negrita' },
                    { cmd: 'italic', label: <em>I</em>, title: 'Cursiva' },
                    { cmd: 'underline', label: <u>U</u>, title: 'Subrayado' },
                ].map(({ cmd, label, title }) => (
                    <button key={cmd} type="button" title={title}
                        onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
                        className="px-2 py-1 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all font-medium">
                        {label}
                    </button>
                ))}

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {[
                    { cmd: 'justifyLeft', label: '⬛︎', title: 'Izquierda' },
                    { cmd: 'justifyCenter', label: '▣', title: 'Centro' },
                    { cmd: 'justifyRight', label: '▪', title: 'Derecha' },
                ].map(({ cmd, label, title }) => (
                    <button key={cmd} type="button" title={title}
                        onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
                        className="p-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all">
                        {label}
                    </button>
                ))}

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {[
                    { cmd: 'insertUnorderedList', label: '≡', title: 'Lista' },
                    { cmd: 'insertOrderedList', label: '1.', title: 'Lista numerada' },
                ].map(({ cmd, label, title }) => (
                    <button key={cmd} type="button" title={title}
                        onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
                        className="p-1.5 text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all font-bold">
                        {label}
                    </button>
                ))}

                <div className="w-px h-4 bg-slate-200 mx-1" />

                <button type="button" title="Subíndice"
                    onMouseDown={(e) => { e.preventDefault(); exec('subscript'); }}
                    className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all">
                    x₂
                </button>
                <button type="button" title="Superíndice"
                    onMouseDown={(e) => { e.preventDefault(); exec('superscript'); }}
                    className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all">
                    x²
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {!disableImage && (
                    <label title="Insertar imagen" className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all">
                        🖼
                        <input type="file" accept="image/*" className="hidden" onChange={insertImage} />
                    </label>
                )}

                <button type="button" title="Insertar enlace"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const url = prompt('URL del enlace:');
                        if (url) exec('createLink', url);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all text-sm">
                    🔗
                </button>
            </div>

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {
                    if (!isComposing.current) onChange(editorRef.current?.innerHTML || '');
                }}
                onCompositionStart={() => { isComposing.current = true; }}
                onCompositionEnd={() => {
                    isComposing.current = false;
                    onChange(editorRef.current?.innerHTML || '');
                }}
                data-placeholder={placeholder}
                className="min-h-[80px] p-3 text-sm text-slate-700 outline-none leading-relaxed
                    [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300"
            />
        </div>
    );
};

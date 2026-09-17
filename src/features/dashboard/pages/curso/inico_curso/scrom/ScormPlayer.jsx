import React, { useState, useEffect } from 'react';
import { Code, ExternalLink, FileText, Image, Film, File, Download } from 'lucide-react';
import JSZip from 'jszip';

const ICONOS_EXTENSION = {
  pdf: FileText,
  html: Code,
  htm: Code,
  jpg: Image, jpeg: Image, png: Image, gif: Image, webp: Image, svg: Image,
  mp4: Film, webm: Film, avi: Film, mov: Film,
  mp3: Film, wav: Film,
  txt: FileText, md: FileText,
};

const getMimeType = (nombre) => {
  const ext = nombre.split('.').pop().toLowerCase();
  const mimes = {
    html: 'text/html', htm: 'text/html',
    css: 'text/css', js: 'application/javascript',
    pdf: 'application/pdf',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm',
    mp3: 'audio/mpeg', wav: 'audio/wav',
    txt: 'text/plain', md: 'text/plain',
  };
  return mimes[ext] || 'application/octet-stream';
};

const ScormPlayer = ({ dataJson, titulo }) => {
  const [iframeUrl, setIframeUrl] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [modoLista, setModoLista] = useState(false);

  const archivoUrl = dataJson?.ArchivoPath || dataJson?.ScormPath || dataJson?.UrlScorm;

  useEffect(() => {
    if (!archivoUrl) return;
    cargarScorm();
  }, [archivoUrl]);

  const cargarScorm = async () => {
    setCargando(true);
    setError(null);
    setIframeUrl(null);
    setArchivos([]);
    setModoLista(false);

    try {
      const response = await fetch(archivoUrl);
      if (!response.ok) throw new Error('No se pudo descargar el archivo');

      const blob = await response.blob();
      const zip = await JSZip.loadAsync(blob);

      const archivosBlob = {};
      const listaArchivos = [];

      await Promise.all(
        Object.keys(zip.files).map(async (nombre) => {
          const file = zip.files[nombre];
          if (!file.dir) {
            const ext = nombre.split('.').pop().toLowerCase();
            const mime = getMimeType(nombre);
            const contenido = await file.async('blob');
            const blobConTipo = new Blob([contenido], { type: mime });
            const url = URL.createObjectURL(blobConTipo);
            archivosBlob[nombre] = url;
            listaArchivos.push({ nombre, url, ext, mime });
          }
        })
      );

      const posiblesIndex = ['index.html', 'index_lms.html', 'story.html', 'scormdriver.html'];
      const indexNombre = posiblesIndex.find(n => zip.files[n]) ||
        Object.keys(zip.files).find(n => n.endsWith('.html') || n.endsWith('.htm'));

      if (indexNombre) {
        let htmlContent = await zip.files[indexNombre].async('text');
        Object.keys(archivosBlob).forEach(nombre => {
          htmlContent = htmlContent.replaceAll(nombre, archivosBlob[nombre]);
        });
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        setIframeUrl(URL.createObjectURL(htmlBlob));
      } else {
        setArchivos(listaArchivos);
        setModoLista(true);
        const visualizables = listaArchivos.filter(a =>
          ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'txt', 'md'].includes(a.ext)
        );
        if (visualizables.length === 1) {
          setArchivoSeleccionado(visualizables[0]);
        }
      }

    } catch (e) {
      console.error('Error cargando archivo:', e);
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const renderVisualizador = (archivo) => {
    const { url, ext, nombre } = archivo;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
      return <img src={url} alt={nombre} className="max-w-full max-h-[600px] object-contain mx-auto" />;
    if (['mp4', 'webm'].includes(ext))
      return <video src={url} controls className="w-full max-h-[600px]" />;
    if (['mp3', 'wav'].includes(ext))
      return <audio src={url} controls className="w-full mt-4" />;
    if (ext === 'pdf')
      return <iframe src={url} className="w-full h-[600px]" title={nombre} />;
    if (['txt', 'md'].includes(ext))
      return <iframe src={url} className="w-full h-[600px]" title={nombre} />;
    return (
      <div className="p-10 text-center">
        <File size={48} className="mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-bold mb-4">Este archivo no se puede previsualizar</p>
        <a href={url} download={nombre}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all">
          <Download size={16} /> Descargar
        </a>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Code size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{titulo}</p>
            <p className="text-slate-400 text-xs">{dataJson?.NombreArchivo || 'Contenido ZIP'}</p>
          </div>
        </div>
        {archivoUrl && (
          <a href={archivoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
            <Download size={16} /> Descargar ZIP
          </a>
        )}
      </div>

      {!archivoUrl ? (
        <div className="p-10 text-center text-slate-400">
          <Code size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold">Archivo no encontrado</p>
        </div>
      ) : cargando ? (
        <div className="p-10 flex flex-col items-center gap-4 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
          <p className="font-bold text-sm">Cargando contenido...</p>
          <p className="text-xs text-slate-300">Esto puede tardar unos segundos</p>
        </div>
      ) : error ? (
        <div className="p-10 flex flex-col items-center gap-4 text-slate-400">
          <Code size={40} className="mx-auto opacity-20" />
          <p className="font-bold text-rose-500">{error}</p>
          <button onClick={cargarScorm}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all">
            Reintentar
          </button>
        </div>
      ) : iframeUrl ? (
        <iframe src={iframeUrl} className="w-full h-[650px]" title="SCORM" allow="fullscreen" />
      ) : modoLista ? (
        <div className="p-6">
          {archivoSeleccionado ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setArchivoSeleccionado(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all">
                  ← Volver
                </button>
                <p className="text-slate-500 text-sm font-medium truncate">{archivoSeleccionado.nombre}</p>
              </div>
              {renderVisualizador(archivoSeleccionado)}
            </div>
          ) : (
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
                Archivos del paquete · {archivos.length}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {archivos.map((archivo) => {
                  const Icono = ICONOS_EXTENSION[archivo.ext] || File;
                  return (
                    <button key={archivo.nombre}
                      onClick={() => setArchivoSeleccionado(archivo)}
                      className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 group-hover:border-indigo-200 transition-all">
                        <Icono size={18} className="text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{archivo.nombre}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{archivo.ext}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ScormPlayer;
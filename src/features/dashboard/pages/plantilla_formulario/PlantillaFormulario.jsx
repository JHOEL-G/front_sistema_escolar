import React, { useState, useEffect } from 'react';
import serviceApiNet from '../../../../lib/api/serviceApiNet';
import Dashboard from './pantallas_plantilla/Dashboard';
import Editor from './pantallas_plantilla/Editor';
import PublicForm from './pantallas_plantilla/PublicForm';
import RespuestasView from './formulario/RespuestasView';
import { Loader2 } from 'lucide-react';
import { MessageSquare } from 'lucide-react';

const PlantillaFormulario = () => {
    const [view, setView] = useState('dashboard');
    const [templates, setTemplates] = useState([]);
    const [currentForm, setCurrentForm] = useState(null);
    const [plantillaIdGuardada, setPlantillaIdGuardada] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedUUID, setCopiedUUID] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [respuestasFormulario, setRespuestasFormulario] = useState(null);
    const [loadingRespuestas, setLoadingRespuestas] = useState(false);

    const buildPayload = (form) => ({
        titulo: form.title,
        descripcion: form.descripcion || null,
        preguntas: (form.questions || []).map((q, i) => {
            let opciones = [];
            if (['radio', 'checkbox', 'ranking'].includes(q.type)) {
                opciones = (q.options || []).map((opt, oIdx) => ({
                    textoOpcion: typeof opt === 'object' ? opt.label : opt,
                    orden: oIdx + 1
                }));
            } else if (q.type === 'rating') {
                opciones = [
                    { textoOpcion: `max:${q.ratingMax || 5}`, orden: 1 },
                    { textoOpcion: `labelMin:${q.labelMin || ''}`, orden: 2 },
                    { textoOpcion: `labelMax:${q.labelMax || ''}`, orden: 3 },
                ];
            } else if (q.type === 'stars') {
                opciones = [{ textoOpcion: `max:${q.starsMax || 5}`, orden: 1 }];
            }
            return { tipoPregunta: q.type, etiqueta: q.label, obligatorio: !!q.required, orden: i + 1, opciones };
        })
    });

    const fetchTemplates = async (signal) => {
        try {
            const response = await serviceApiNet.Formulario.listarConRespuestas(signal);
            const data = response.data?.data || [];
            setTemplates(data.map(t => ({
                id: t.plantillaId.toString(),
                plantillaId: t.plantillaId,
                publicId: t.publicId,
                title: t.titulo,
                descripcion: t.descripcion,
                publicado: t.publicado,
                totalRespuestas: t.totalRespuestas ?? 0,
                questions: Array(t.totalPreguntas ?? 0).fill({}),
            })));
        } catch (error) {
            if (error.name !== 'CanceledError') console.error(error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchTemplates(controller.signal);
        return () => controller.abort();
    }, []);

    const createNewForm = async (template = null) => {
        if (template?.plantillaId) {
            setLoadingDetalle(true);
            try {
                const response = await serviceApiNet.Formulario.obtenerPorId(template.plantillaId);
                const data = response.data?.data;
                if (data) {
                    setCurrentForm({
                        id: data.plantillaId.toString(),
                        plantillaId: data.plantillaId,
                        publicId: data.publicId,
                        title: data.titulo,
                        descripcion: data.descripcion || '',
                        publicado: data.publicado,
                        questions: (data.preguntas || []).map(p => {
                            const base = {
                                id: p.preguntaId, type: p.tipoPregunta, label: p.etiqueta,
                                required: p.obligatorio, orden: p.orden,
                                options: [], ratingMax: 5, starsMax: 5, labelMin: '', labelMax: '',
                            };
                            if (p.tipoPregunta === 'rating') {
                                (p.opciones || []).forEach(o => {
                                    if (o.textoOpcion?.startsWith('max:')) base.ratingMax = parseInt(o.textoOpcion.split(':')[1]) || 5;
                                    if (o.textoOpcion?.startsWith('labelMin:')) base.labelMin = o.textoOpcion.slice(9);
                                    if (o.textoOpcion?.startsWith('labelMax:')) base.labelMax = o.textoOpcion.slice(9);
                                });
                            } else if (p.tipoPregunta === 'stars') {
                                (p.opciones || []).forEach(o => {
                                    if (o.textoOpcion?.startsWith('max:')) base.starsMax = parseInt(o.textoOpcion.split(':')[1]) || 5;
                                });
                            } else {
                                base.options = (p.opciones || []).map(o => o.textoOpcion);
                            }
                            return base;
                        })
                    });
                    setPlantillaIdGuardada(data.plantillaId);
                    setView('editor');
                }
            } catch (error) {
                alert('Error al cargar el formulario');
                console.error(error);
            } finally {
                setLoadingDetalle(false);
            }
        } else {
            setCurrentForm({
                id: Date.now().toString(),
                title: 'Nuevo Formulario',
                descripcion: '',
                questions: []
            });
            setPlantillaIdGuardada(null);
            setView('editor');
        }
    };

    const verRespuestas = async (template) => {
        setLoadingRespuestas(true);
        try {
            const response = await serviceApiNet.Formulario.obtenerRespuestas(template.plantillaId);
            setRespuestasFormulario(response.data?.data);
            setCurrentForm(template);
            setView('respuestas');
        } catch {
            alert('Error al cargar las respuestas');
        } finally {
            setLoadingRespuestas(false);
        }
    };

    const addQuestion = () => {
        const newQ = {
            id: Date.now(), type: 'text', label: 'Nueva pregunta', required: false,
            options: ['Opción 1', 'Opción 2'],
            ratingMax: 5, starsMax: 5, labelMin: '', labelMax: '',
        };
        setCurrentForm(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    };

    const updateQuestion = (id, field, value) => {
        setCurrentForm(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
        }));
    };

    const deleteQuestion = (id) => {
        setCurrentForm(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
    };

    const copyURL = (uuid) => {
        navigator.clipboard.writeText(`${window.location.origin}/f/${uuid}`);
        setCopiedUUID(true);
        setTimeout(() => setCopiedUUID(false), 2000);
    };

    const saveForm = async () => {
        if (!currentForm.title?.trim()) { alert('El título es obligatorio'); return; }
        if (!currentForm.questions?.length) { alert('Agrega al menos una pregunta'); return; }
        setIsSaving(true);
        try {
            const payload = buildPayload(currentForm);
            let response;
            if (plantillaIdGuardada) {
                response = await serviceApiNet.Formulario.modificar(plantillaIdGuardada, payload);
            } else {
                response = await serviceApiNet.Formulario.crear(payload);
                const id = response.data?.data?.resultId;
                if (id) {
                    setPlantillaIdGuardada(id);
                    setCurrentForm(prev => ({ ...prev, plantillaId: id }));
                }
            }
            const saved = { ...currentForm, plantillaId: plantillaIdGuardada || response.data?.data?.resultId };
            setTemplates(prev => {
                const exists = prev.find(t => t.id === currentForm.id);
                return exists ? prev.map(t => t.id === currentForm.id ? saved : t) : [...prev, saved];
            });
            await fetchTemplates();
            setView('dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const publishForm = async () => {
        if (!plantillaIdGuardada) { alert('Guarda el formulario primero'); return; }
        setIsSaving(true);
        try {
            const response = await serviceApiNet.Formulario.publicar(plantillaIdGuardada, true);
            const uuid = response.data?.data?.publicId;
            setTemplates(prev => prev.map(t =>
                t.id === currentForm.id ? { ...t, publicado: true, publicId: uuid } : t
            ));
            setView('dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al publicar');
        } finally {
            setIsSaving(false);
        }
    };

    const publishFromDashboard = async (template) => {
        try {
            const nuevoEstado = !template.publicado;
            await serviceApiNet.Formulario.publicar(template.plantillaId, nuevoEstado);
            await fetchTemplates();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al publicar');
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
            {view === 'dashboard' && (
                <Dashboard
                    templates={templates}
                    copiedUUID={copiedUUID}
                    createNewForm={createNewForm}
                    copyURL={copyURL}
                    setCurrentForm={setCurrentForm}
                    setView={setView}
                    loadingDetalle={loadingDetalle}
                    verRespuestas={verRespuestas}
                    loadingRespuestas={loadingRespuestas}
                    publishFromDashboard={publishFromDashboard}
                />
            )}
            {view === 'editor' && currentForm && (
                <Editor
                    currentForm={currentForm}
                    setCurrentForm={setCurrentForm}
                    plantillaIdGuardada={plantillaIdGuardada}
                    isSaving={isSaving}
                    addQuestion={addQuestion}
                    updateQuestion={updateQuestion}
                    deleteQuestion={deleteQuestion}
                    saveForm={saveForm}
                    publishForm={publishForm}
                    setView={setView}
                />
            )}
            {view === 'public' && currentForm && (
                <PublicForm currentForm={currentForm} setView={setView} />
            )}
            {view === 'respuestas' && (
                <RespuestasView
                    formulario={currentForm}
                    respuestas={respuestasFormulario}
                    setView={setView}
                />
            )}
        </div>
    );
};

export default PlantillaFormulario;
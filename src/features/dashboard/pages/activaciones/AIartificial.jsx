import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Sparkles, ChevronLeft,
    User, Bot, Mic, Paperclip,
    Terminal, ShieldCheck, Zap, GraduationCap,
    BookOpen, HelpCircle, ClipboardList
} from 'lucide-react';

const LIAAssistant = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1, type: 'bot',
            text: '¡Hola! Soy LIA, tu asistente académico universitario 🎓 ¿En qué puedo ayudarte hoy?'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

    const enviarMensaje = async (textoOverride) => {
        const texto = textoOverride ?? input.trim();
        if (!texto) return;

        const nuevoMensajeUsuario = { id: Date.now(), type: 'user', text: texto };
        setMessages(prev => [...prev, nuevoMensajeUsuario]);
        setInput('');
        setIsTyping(true);

        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1, type: 'bot',
                    text: 'API key no configurada. Configura VITE_GROQ_API_KEY en tu .env'
                }]);
            }, 800);
            return;
        }

        const historial = messages.slice(-6).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text
        }));

        try {
            const response = await fetch(import.meta.env.VITE_GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: `Eres LIA, un asistente académico universitario inteligente y amigable. 
Ayudas a estudiantes con: dudas académicas, orientación sobre cursos, rutas de aprendizaje, 
calificaciones, inscripciones y motivación estudiantil. 
Responde siempre en español, de forma clara, concisa y motivadora. 
Máximo 3 párrafos por respuesta. Usa emojis con moderación.`
                        },
                        ...historial,
                        { role: 'user', content: texto }
                    ],
                    temperature: 0.7,
                    max_tokens: 400,
                })
            });

            const data = await response.json();
            const respuesta = data.choices?.[0]?.message?.content ?? 'No pude generar una respuesta.';

            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: respuesta
            }]);
        } catch (err) {
            console.error('Error Groq:', err);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Ocurrió un error al conectar con el asistente. Intenta de nuevo.'
            }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    const sugerencias = [
        { icon: BookOpen, texto: '¿Cómo inscribo un curso?' },
        { icon: ClipboardList, texto: '¿Cómo veo mis calificaciones?' },
        { icon: GraduationCap, texto: '¿Qué es una ruta de aprendizaje?' },
        { icon: HelpCircle, texto: '¿Cómo obtengo un certificado?' },
    ];

    const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-full flex flex-col font-sans">
            <main className="flex-1 flex overflow-hidden">
                <aside className="hidden lg:flex w-80 p-6 flex-col gap-6 overflow-y-auto mb-10">
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">LIA Asistente</h1>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Académico</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase">Sistema Online</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preguntas frecuentes</h3>
                        {sugerencias.map((s, i) => (
                            <div key={i}
                                onClick={() => enviarMensaje(s.texto)}
                                className="group p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <s.icon size={16} className="text-indigo-400 flex-shrink-0" />
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{s.texto}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Guías del sistema</h3>
                        {[
                            { title: 'Gestión de cursos', icon: Terminal, color: 'text-amber-500' },
                            { title: 'Seguridad y Roles', icon: ShieldCheck, color: 'text-blue-500' },
                            { title: 'Carga Masiva', icon: Zap, color: 'text-indigo-500' },
                        ].map((item, i) => (
                            <div key={i} className="group p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <item.icon size={16} className={item.color} />
                                    <span className="text-xs font-bold text-slate-700">{item.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] text-white relative overflow-hidden">
                        <Sparkles className="absolute -right-2 -top-2 opacity-20" size={80} />
                        <p className="text-[10px] font-bold opacity-80 mb-1 uppercase">Soporte Humano</p>
                        <p className="text-sm font-black leading-tight">¿Deseas una llamada experta?</p>
                        <button className="mt-4 w-full py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl text-xs font-bold transition-colors border border-white/10">
                            Agendar
                        </button>
                    </div>
                </aside>

                <section className="flex-1 flex flex-col relative">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-white border border-slate-200' : 'bg-indigo-600 text-white'}`}>
                                        {msg.type === 'user' ? <User size={16} className="text-slate-400" /> : <Bot size={16} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed whitespace-pre-wrap ${msg.type === 'user'
                                            ? 'bg-white border border-slate-100 text-slate-700 rounded-tr-none shadow-sm'
                                            : 'bg-indigo-600 text-white rounded-tl-none font-medium shadow-lg shadow-indigo-100'}`}>
                                            {msg.text}
                                        </div>
                                        <p className={`text-[9px] font-bold text-slate-400 uppercase tracking-tight px-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.type === 'user' ? 'Tú' : 'LIA'} • {hora}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[70%]">
                                    <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                        <Bot size={16} />
                                    </div>
                                    <div className="p-4 rounded-[1.5rem] rounded-tl-none bg-indigo-600 shadow-lg shadow-indigo-100">
                                        <div className="flex gap-1.5 items-center h-4">
                                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 pb-6">
                        <div className="max-w-3xl mx-auto relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
                            <div className="relative bg-white border border-slate-200 rounded-[2rem] p-2 shadow-lg flex items-center gap-1">
                                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribe tu pregunta académica..."
                                    disabled={isTyping}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                                />
                                <div className="flex items-center gap-1">
                                    <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors hidden sm:block">
                                        <Mic size={18} />
                                    </button>
                                    <button
                                        onClick={() => enviarMensaje()}
                                        disabled={isTyping || !input.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all shadow-md group">
                                        <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LIAAssistant;
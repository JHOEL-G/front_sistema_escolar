import { FileEdit, BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SelectionScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative p-8">

            <button
                onClick={() => navigate('/curso')}
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium group"
            >
                <div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                    <ArrowLeft size={20} />
                </div>
                Volver
            </button>

            <div className="text-center mb-12 max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Crear aprendizaje</h1>
                <p className="text-slate-500 text-lg">
                    Simplificamos tu próximo paso, ya sea creando algo completamente nuevo o reconociendo tus logros pasados. ¡Selecciona y comienza!
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full px-4">
                <div
                    onClick={() => navigate('/curso/crear/basic-info')}
                    className="p-12 rounded-3xl shadow-sm border-2 border-transparent hover:border-indigo-400 transition-all cursor-pointer group text-center bg-white"
                >
                    <div className="bg-slate-100 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-8 group-hover:bg-indigo-100 transition-colors">
                        <BookOpen className="text-slate-600 group-hover:text-indigo-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">Curso desde cero</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Aquí, construye tu curso desde la base: contenido, duración, presentación y más. Es tu lienzo en blanco esperando ser llenado con conocimiento y pasión.
                    </p>
                </div>

                <div
                    onClick={() => navigate('/curso/crear/basic-info-previa')}
                    className="p-12 rounded-3xl shadow-sm border-2 border-transparent hover:border-indigo-400 transition-all cursor-pointer group text-center bg-white"
                >
                    <div className="bg-slate-100 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-8 group-hover:bg-indigo-100 transition-colors">
                        <FileEdit className="text-slate-600 group-hover:text-indigo-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">Registro previo</h3>
                    <p className="text-slate-500 leading-relaxed">
                        ¿Tus colaboradores completaron un curso externo? Registra ese logro aquí. Así, reconoces su esfuerzo y mantienes todo en su lugar.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SelectionScreen;
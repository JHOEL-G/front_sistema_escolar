import { useState, useEffect } from "react";

export const useGroqMotivation = (cursos) => {
  const [mensajesIA, setMensajesIA] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumenIA, setResumenIA] = useState(null);

  const generarMensajeConGroq = async (
    nombreCurso,
    progreso,
    fechaInscripcion,
  ) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return getFallbackMessage(progreso);

    const diasDesdeInscripcion = Math.floor(
      (new Date() - new Date(fechaInscripcion)) / (1000 * 60 * 60 * 24),
    );

    try {
      const response = await fetch(import.meta.env.VITE_GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Eres un coach motivacional. Respondes SOLO con JSON válido, sin markdown ni explicaciones.",
            },
            {
              role: "user",
              content: `Eres un coach motivacional de cursos en línea. Genera un mensaje motivacional corto.\n\nContexto del estudiante:\n- Curso inscrito: "${nombreCurso}"\n- Progreso actual: ${progreso}%\n- Días desde que se inscribió: ${diasDesdeInscripcion}\n\nInstrucciones:\n- Si progreso > 80%: felicítalo y anímalo a terminar\n- Si progreso < 20%: motívalo a empezar con energía\n- Si han pasado muchos días sin avanzar: recuérdale amablemente retomar\n\nResponde ÚNICAMENTE con este formato JSON:\n{"titulo": "título motivacional corto (máximo 6 palabras)", "mensaje": "mensaje breve y directo (máximo 15 palabras)"}`,
            },
          ],
          temperature: 0.8,
          max_tokens: 150,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) return getFallbackMessage(progreso);

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(data.choices[0].message.content);
        return { h: parsed.titulo, p: parsed.mensaje };
      }
      return getFallbackMessage(progreso);
    } catch {
      return getFallbackMessage(progreso);
    }
  };

  const getFallbackMessage = (progreso, index = 0) => {
    const inicio = [
      { h: "¡Es momento de comenzar!", p: "Da el primer paso hoy en" },
      { h: "Tu camino empieza aquí", p: "Aún no has iniciado el curso de" },
      {
        h: "Nuevo conocimiento te espera",
        p: "Inicia cuando estés listo el curso",
      },
      { h: "¡Arranquemos con todo!", p: "Todavía puedes comenzar el curso de" },
      {
        h: "Un gran recorrido te espera",
        p: "Aún no has explorado el curso de",
      },
      { h: "¡Hoy es un buen día!", p: "Empieza a avanzar en el curso de" },
    ];
    const medio = [
      { h: "Continuar donde te quedaste", p: "Retoma hoy mismo el curso de" },
      { h: "¡Vas por buen camino!", p: "Sigue avanzando en el curso de" },
      { h: "Refuerza lo aprendido", p: "Dale un repaso rápido a" },
      { h: "La constancia es clave", p: "No pares ahora, sigue en" },
    ];
    const avanzado = [
      { h: "¡Casi lo logras!", p: "Estás muy cerca de terminar" },
      { h: "La meta está cerca", p: "Solo un poco más en el curso de" },
      { h: "¡Al final del camino!", p: "Termina lo que empezaste en" },
    ];
    const inactivo = [
      { h: "¡Hora de volver a la acción!", p: "Hace tiempo que no avanzas en" },
      { h: "Te estábamos esperando", p: "Es momento de retomar el curso de" },
      {
        h: "¡El conocimiento no espera!",
        p: "Vuelve a conectar con el curso de",
      },
      { h: "Reactiva tu aprendizaje", p: "No dejes pasar más tiempo en" },
      { h: "¡Tu progreso te necesita!", p: "Regresa y continúa avanzando en" },
    ];

    if (progreso >= 80) return avanzado[index % avanzado.length];
    if (progreso >= 20) return medio[index % medio.length];
    return inactivo[index % inactivo.length];
  };

  const detectarGeneroYAvatar = async (nombre) => {
    if (!nombre) return;
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    setAvatarUrl(`https://api.dicebear.com/7.x/thumbs/png?seed=${nombre}`);
    if (!apiKey) return;

    try {
      const response = await fetch(import.meta.env.VITE_GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Clasificador de nombres. Responde SOLO JSON válido.",
            },
            {
              role: "user",
              content: `¿"${nombre}" es masculino o femenino en español? Responde: {"genero": "male"} o {"genero": "female"}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 20,
          response_format: { type: "json_object" },
        }),
      });
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      const opciones =
        parsed.genero === "female"
          ? "topType=LongHairStraight"
          : "topType=ShortHairShortFlat";
      setAvatarUrl(
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}&${opciones}`,
      );
    } catch (e) {
      console.error("Error detectando género:", e);
    }
  };

  const generarResumen = async (cursos) => {
    if (!cursos || cursos.length === 0) return;
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      setResumenIA({
        titulo: "Estudiante activo",
        resumen: "Construyendo su camino académico paso a paso.",
        estado: "En progreso",
      });
      return;
    }

    const completados = cursos.filter((c) => c.esCompletado).length;
    const enProgreso = cursos.filter(
      (c) => !c.esCompletado && Number(c.progreso) > 0,
    ).length;
    const promedioProgreso = Math.round(
      cursos.reduce((acc, c) => acc + (Number(c.progreso) || 0), 0) /
        cursos.length,
    );

    try {
      const response = await fetch(import.meta.env.VITE_GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente académico universitario. Responde SOLO JSON válido, sin markdown.",
            },
            {
              role: "user",
              content: `Estudiante universitario: ${cursos.length} cursos inscritos, ${completados} completados, ${enProgreso} en progreso, promedio de avance ${promedioProgreso}%. Genera un resumen académico breve y motivador en español. SOLO este JSON: {"titulo": "texto de máximo 6 palabras", "resumen": "texto de máximo 20 palabras", "estado": "una palabra que describa su momento académico"}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
          response_format: { type: "json_object" },
        }),
      });
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setResumenIA(parsed);
    } catch {
      setResumenIA({
        titulo: "Estudiante activo",
        resumen: "Construyendo su camino académico paso a paso.",
        estado: "En progreso",
      });
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      if (!cursos || cursos.length === 0) return;

      setLoading(true);
      const cursosAMostrar = cursos.slice(0, 3);
      const promesas = cursosAMostrar.map((c) =>
        generarMensajeConGroq(c.nombreCurso, c.progreso, c.fechaInscripcion),
      );
      const resultados = await Promise.all(promesas);
      const nuevosMensajes = {};
      cursosAMostrar.forEach((c, i) => {
        nuevosMensajes[c.inscripcionId] = resultados[i];
      });
      setMensajesIA(nuevosMensajes);
      setLoading(false);

      await generarResumen(cursos);
    };

    inicializar();
  }, [cursos]);

  return {
    mensajesIA,
    loading,
    getFallbackMessage,
    avatarUrl,
    detectarGeneroYAvatar,
    resumenIA,
    generarResumen,
  };
};

export default useGroqMotivation;

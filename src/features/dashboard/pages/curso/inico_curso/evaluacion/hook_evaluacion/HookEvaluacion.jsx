import React, { useState, useEffect, useRef } from "react";
import {
  ClipboardList,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const mezclar = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const prepararPreguntas = (dataJson, aleatorias) => {
  const manuales = (dataJson?.preguntas || []).map((p) => {
    const preguntaId =
      p.evaluacionPreguntaId ?? p.EvaluacionPreguntaId ?? crypto.randomUUID();
    console.log(
      "🔍 Opciones raw de pregunta",
      preguntaId,
      ":",
      p.opciones ?? p.Opciones,
    );
    console.log("🔍 Pregunta raw completa:", JSON.stringify(p, null, 2));

    return {
      preguntaId,
      preguntaIdReal: preguntaId, // ← ID real (numérico)
      esDeBanco: false,
      texto: p.textoPregunta ?? p.TextoPregunta,
      tipo: p.tipoPreguntaId ?? p.TipoPreguntaId ?? 1,
      puntos: p.puntosValor ?? p.PuntosValor ?? 1,
      imagenPregunta: p.imagenPregunta ?? p.ImagenPregunta ?? null,
      opciones: (p.opciones ?? p.Opciones ?? []).map((o, i) => {
        const idReal =
          o.evaluacionPreguntaOpcionId ??
          o.EvaluacionPreguntaOpcionId ??
          o.OpcionId ??
          o.opcionId ??
          null;

        const opcionId =
          idReal !== null
            ? Number(idReal)
            : `${preguntaId}-${o.Orden ?? o.orden ?? i}`;

        return {
          opcionId,
          opcionIdReal: idReal !== null ? Number(idReal) : null,
          orden: o.Orden ?? o.orden ?? i,
          texto: stripHtml(o.textoOpcion ?? o.TextoOpcion),
          esCorrecta: o.esCorrecta ?? o.EsCorrecta,
          explicacion: stripHtml(
            o.explicacionORelacion ?? o.ExplicacionORelacion ?? "",
          ),
          imagenOpcion: o.imagenOpcion ?? o.ImagenOpcion ?? null,
        };
      }),
    };
  });

  const externas = (dataJson?.bancasPreguntas || []).flatMap((b) =>
    (b.preguntas || []).map((p, idx) => {
      const preguntaKey = `banca-${b.bancaId}-${p.orden ?? idx}`;

      return {
        preguntaId: preguntaKey,
        preguntaIdReal: null,
        esDeBanco: true,
        bancaId: b.bancaId,
        textoPreguntaOriginal: p.textoPregunta,
        texto: stripHtml(p.textoPregunta),
        tipo: p.tipoPreguntaId || 1,
        puntos: p.puntosValor || 1,
        opciones: (p.opciones || []).map((o, i) => ({
          opcionId: `${preguntaKey}-op-${o.orden ?? i}`,
          opcionIdReal: null,
          textoOpcionOriginal: o.textoOpcion,
          texto: stripHtml(o.textoOpcion),
          esCorrecta: o.esCorrecta,
          explicacion: stripHtml(o.explicacionORelacion || ""),
        })),
      };
    }),
  );

  let todas = [...manuales, ...externas];
  if (aleatorias) todas = mezclar(todas);
  return todas;
};

export const useTemporizador = (totalSegundos, activo, onFin) => {
  const [restantes, setRestantes] = useState(totalSegundos);
  const ref = useRef(null);

  useEffect(() => {
    if (!activo || totalSegundos === 0) return;
    ref.current = setInterval(() => {
      setRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          onFin?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [activo]);

  const mm = String(Math.floor(restantes / 60)).padStart(2, "0");
  const ss = String(restantes % 60).padStart(2, "0");
  const pct = totalSegundos > 0 ? (restantes / totalSegundos) * 100 : 100;
  const urgente = totalSegundos > 0 && restantes < 60;
  return { mm, ss, pct, urgente, restantes };
};

export const PantallaInicio = ({
  dataJson,
  preguntas,
  onIniciar,
  intentosUsados,
  maxIntentos,
}) => {
  const totalSeg =
    (dataJson?.tiempoHoras || 0) * 3600 + (dataJson?.tiempoMinutos || 0) * 60;
  const agotados = intentosUsados >= maxIntentos;

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-200 rotate-3">
          <ClipboardList
            size={52}
            className="text-white -rotate-3"
            strokeWidth={1.5}
          />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-black">
            {preguntas.length}
          </span>
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-900 text-center mb-2">
        {dataJson?.titulo || "Evaluación"}
      </h2>
      <p className="text-slate-500 text-center text-sm mb-8 max-w-sm leading-relaxed">
        {dataJson?.evaluacionInstrucciones ||
          dataJson?.instrucciones ||
          "Lee cada pregunta con atención y selecciona la respuesta correcta."}
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
        {[
          {
            label: "Preguntas",
            val: preguntas.length,
            color: "bg-amber-50 border-amber-100 text-amber-700",
          },
          {
            label: "Intentos",
            val: dataJson?.oportunidades || 1,
            color: "bg-indigo-50 border-indigo-100 text-indigo-700",
          },
          {
            label: "Tiempo",
            val:
              totalSeg > 0
                ? dataJson?.tiempoMinutos
                  ? `${dataJson.tiempoMinutos}m`
                  : `${dataJson.tiempoHoras}h`
                : "∞",
            color: "bg-slate-50 border-slate-200 text-slate-700",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className={`${color} border rounded-2xl p-3 text-center`}
          >
            <p className="text-2xl font-black">{val}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {dataJson?.preguntasCorrectasAprobar > 0 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-8 text-sm text-emerald-700 font-medium">
          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
          Necesitas{" "}
          <strong className="mx-1">
            {dataJson.preguntasCorrectasAprobar}
          </strong>{" "}
          respuestas correctas para aprobar
        </div>
      )}

      {agotados ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 text-rose-700 font-bold text-sm">
            <XCircle size={18} className="text-rose-500 flex-shrink-0" />
            Has agotado tus {maxIntentos}{" "}
            {maxIntentos === 1 ? "oportunidad" : "oportunidades"}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Contacta a tu instructor para más información
          </p>
        </div>
      ) : (
        <button
          onClick={onIniciar}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-xl shadow-amber-200 transition-all hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-widest"
        >
          <span>
            {intentosUsados > 0
              ? "Reintentar evaluación"
              : "Comenzar evaluación"}
          </span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};

export const PreguntaMultiple = ({
  pregunta,
  respuesta,
  onResponder,
  mostrarResultado,
}) => (
  <div className="space-y-3">
    {pregunta.opciones.map((op, i) => {
      const seleccionada = respuesta === op.opcionId;
      const correcta = op.esCorrecta;

      let estilo =
        "border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30";
      let circulo = "border-slate-200 bg-white";
      let letra = (
        <span className="text-[11px] font-black text-slate-400">
          {String.fromCharCode(65 + i)}
        </span>
      );

      if (!mostrarResultado && seleccionada) {
        estilo =
          "border-indigo-400 bg-indigo-50 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]";
        circulo = "border-indigo-500 bg-indigo-500";
        letra = (
          <span className="text-[11px] font-black text-white">
            {String.fromCharCode(65 + i)}
          </span>
        );
      }

      if (mostrarResultado) {
        if (correcta) {
          estilo = "border-emerald-300 bg-emerald-50";
          circulo = "border-emerald-500 bg-emerald-500";
          letra = <CheckCircle2 size={12} className="text-white" />;
        } else if (seleccionada && !correcta) {
          estilo = "border-rose-300 bg-rose-50";
          circulo = "border-rose-500 bg-rose-500";
          letra = <XCircle size={12} className="text-white" />;
        }
      }

      return (
        <button
          key={op.opcionId ?? i}
          onClick={() => !mostrarResultado && onResponder(op.opcionId)}
          disabled={mostrarResultado}
          // ✅ padding más pequeño en móvil
          className={`w-full flex items-center gap-3 p-3 sm:p-4 border-2 rounded-2xl transition-all duration-200 text-left ${estilo} ${!mostrarResultado ? "cursor-pointer" : "cursor-default"}`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${circulo}`}
          >
            {letra}
          </div>
          <span
            className={`text-sm font-medium flex-1 ${mostrarResultado && correcta ? "text-emerald-800 font-bold" : mostrarResultado && seleccionada ? "text-rose-700" : "text-slate-700"}`}
          >
            {op.texto}
          </span>
          {/* ✅ badge "Correcta" solo en sm+ */}
          {mostrarResultado && correcta && (
            <span className="hidden sm:inline text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0">
              Correcta
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const PreguntaRelacion = ({
  pregunta,
  respuestas,
  onResponder,
  mostrarResultado,
}) => {
  const pares = pregunta.opciones.map((op) => ({
    izquierda: op.texto,
    derecha: op.explicacion,
    opcionId: op.opcionId,
  }));

  const derechasMezcladas = mostrarResultado
    ? pares.map((p) => p.derecha)
    : mezclar(pares.map((p) => p.derecha));

  const [opcDerecha] = useState(derechasMezcladas);
  const [selIzq, setSelIzq] = useState(null);

  const handleIzq = (idx) => {
    if (mostrarResultado) return;
    setSelIzq(selIzq === idx ? null : idx);
  };

  const handleDer = (der) => {
    if (mostrarResultado || selIzq === null) return;
    const nuevas = { ...(respuestas || {}) };
    nuevas[pares[selIzq].izquierda] = der;
    onResponder(nuevas);
    setSelIzq(null);
  };

  const resp = respuestas || {};
  const correctosPares = mostrarResultado
    ? pares.filter((p) => resp[p.izquierda] === p.derecha).length
    : null;

  return (
    <div className="space-y-4">
      {mostrarResultado && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-2">
          <span className="text-xs font-bold text-slate-500">
            Pares correctos
          </span>
          <span className="font-black text-slate-800">
            {correctosPares}/{pares.length}
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Concepto
          </p>
          {pares.map((par, i) => {
            const asignado = resp[par.izquierda];
            const esCorrecta = mostrarResultado && asignado === par.derecha;
            const esIncorrecta =
              mostrarResultado && asignado && asignado !== par.derecha;
            return (
              <button
                key={i}
                onClick={() => handleIzq(i)}
                className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all
                                    ${
                                      selIzq === i
                                        ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                        : esCorrecta
                                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                          : esIncorrecta
                                            ? "border-rose-300 bg-rose-50 text-rose-800"
                                            : asignado
                                              ? "border-slate-200 bg-slate-50 text-slate-700"
                                              : "border-slate-100 bg-white text-slate-600 hover:border-indigo-200"
                                    }`}
              >
                {par.izquierda}
                {asignado && !mostrarResultado && (
                  <div className="text-[10px] text-indigo-500 font-bold mt-0.5 truncate">
                    → {asignado}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Definición
          </p>
          {(mostrarResultado ? pares.map((p) => p.derecha) : opcDerecha).map(
            (der, i) => {
              const yaUsado = Object.values(resp).includes(der);
              const parCorrecto =
                mostrarResultado && pares.find((p) => p.derecha === der);
              const respUsuario =
                mostrarResultado && parCorrecto && resp[parCorrecto.izquierda];
              const esCorr = mostrarResultado && respUsuario === der;
              return (
                <button
                  key={i}
                  onClick={() => handleDer(der)}
                  disabled={mostrarResultado || (yaUsado && !mostrarResultado)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all
                                    ${
                                      esCorr
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                        : mostrarResultado && !esCorr
                                          ? "border-rose-200 bg-rose-50/50 text-rose-700"
                                          : yaUsado
                                            ? "border-slate-100 bg-slate-50 text-slate-400 opacity-50"
                                            : selIzq !== null
                                              ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:border-indigo-400 cursor-pointer"
                                              : "border-slate-100 bg-white text-slate-600"
                                    }`}
                >
                  {der}
                </button>
              );
            },
          )}
        </div>
      </div>
      {!mostrarResultado && selIzq !== null && (
        <p className="text-xs text-indigo-500 font-bold text-center animate-pulse">
          Selecciona la definición correspondiente →
        </p>
      )}
    </div>
  );
};

export const PreguntaDesarrollo = ({
  pregunta,
  respuesta,
  onResponder,
  mostrarResultado,
}) => (
  <div className="space-y-3">
    <textarea
      value={respuesta || ""}
      onChange={(e) => !mostrarResultado && onResponder(e.target.value)}
      disabled={mostrarResultado}
      placeholder="Escribe tu respuesta aquí..."
      rows={6}
      className={`w-full px-5 py-4 border-2 rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-300 resize-none transition-all focus:outline-none
                ${
                  mostrarResultado
                    ? "border-slate-100 bg-slate-50 text-slate-500 cursor-default"
                    : "border-slate-200 bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                }`}
    />
    {mostrarResultado && (
      <div className="flex items-start gap-3 px-4 py-3 bg-violet-50 border border-violet-100 rounded-2xl text-sm text-violet-700">
        <AlertCircle
          size={16}
          className="text-violet-500 flex-shrink-0 mt-0.5"
        />
        <span className="font-medium">
          Esta respuesta será revisada por tu instructor.
        </span>
      </div>
    )}
  </div>
);

export const PantallaResultado = ({
  preguntas,
  respuestas,
  dataJson,
  onReintentar,
  onVerRevision,
  intentosUsados,
  maxIntentos,
}) => {
  const minAprobar = dataJson?.preguntasCorrectasAprobar || 0;

  const correctas = preguntas.filter((p) => {
    if (p.tipo === 5) return false;
    if (p.tipo === 2) {
      const resp = respuestas[p.preguntaId] || {};
      return p.opciones.every((op) => resp[op.texto] === op.explicacion);
    }
    const opCorrecta = p.opciones.find((o) => o.esCorrecta);
    return respuestas[p.preguntaId] === opCorrecta?.opcionId;
  }).length;

  const pct = Math.round((correctas / preguntas.length) * 100);

  const aprobado =
    minAprobar > 0 && minAprobar <= preguntas.length
      ? correctas >= minAprobar
      : pct >= 60;

  const textoUmbral =
    minAprobar > 0 ? `${minAprobar} de ${preguntas.length}` : "el 60%";

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div
        className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 ${aprobado ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200" : "bg-gradient-to-br from-rose-400 to-red-500 shadow-rose-200"}`}
      >
        {aprobado ? (
          <Trophy size={44} className="text-white" strokeWidth={1.5} />
        ) : (
          <XCircle size={44} className="text-white" strokeWidth={1.5} />
        )}
      </div>

      <h2 className="text-3xl font-black text-slate-900 mb-1">
        {aprobado ? "¡Aprobado!" : "Intenta de nuevo"}
      </h2>

      <p className="text-slate-500 text-sm mb-8 text-center">
        {aprobado
          ? "Superaste la evaluación con éxito"
          : `Necesitabas ${textoUmbral} correctas para aprobar`}
      </p>

      <div className="relative w-36 h-36 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={aprobado ? "#10b981" : "#f43f5e"}
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900">{pct}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Score
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
        {[
          {
            label: "Correctas",
            val: correctas,
            color: "bg-emerald-50 border-emerald-100 text-emerald-700",
          },
          {
            label: "Incorrectas",
            val: preguntas.length - correctas,
            color: "bg-rose-50 border-rose-100 text-rose-700",
          },
          {
            label: "Total",
            val: preguntas.length,
            color: "bg-slate-50 border-slate-200 text-slate-700",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className={`${color} border rounded-2xl p-3 text-center`}
          >
            <p className="text-2xl font-black">{val}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full max-w-xs gap-3">
        <button
          onClick={onVerRevision}
          className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all text-sm"
        >
          <BookOpen size={16} /> Ver revisión completa
        </button>

        {!aprobado && intentosUsados < maxIntentos && (
          <button
            onClick={onReintentar}
            className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-2xl transition-all text-sm"
          >
            <RotateCcw size={16} />
            Intentar de nuevo ({maxIntentos - intentosUsados} restante
            {maxIntentos - intentosUsados !== 1 ? "s" : ""})
          </button>
        )}

        {!aprobado && intentosUsados >= maxIntentos && (
          <div className="flex items-center justify-center gap-2 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
            <XCircle size={14} /> Sin intentos restantes
          </div>
        )}
      </div>
    </div>
  );
};

export const LoaderBancas = () => (
  <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 p-8">
    <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    <p className="text-sm font-bold text-slate-400">Cargando evaluación...</p>
  </div>
);

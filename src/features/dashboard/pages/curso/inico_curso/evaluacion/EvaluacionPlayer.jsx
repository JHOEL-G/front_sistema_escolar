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
import serviceApiNet from "../../../../../../lib/api/serviceApiNet";
import {
  useTemporizador,
  PantallaInicio,
  PreguntaMultiple,
  PreguntaRelacion,
  PreguntaDesarrollo,
  PantallaResultado,
  LoaderBancas,
  prepararPreguntas,
} from "./hook_evaluacion/HookEvaluacion";

const EvaluacionPlayer = ({ dataJson, titulo, usuarioId, onCalificar }) => {
  const evaluacionId = dataJson?.evaluacionId ?? dataJson?.EvaluacionId;
  const [fase, setFase] = useState("inicio");
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [preguntas, setPreguntas] = useState([]);
  const [intentosUsados, setIntentosUsados] = useState(0);

  const [dataJsonCompleto, setDataJsonCompleto] = useState(null);
  const [cargandoBancas, setCargandoBancas] = useState(false);
  const [errorBancas, setErrorBancas] = useState(null);
  const [cargandoIntentos, setCargandoIntentos] = useState(true);

  useEffect(() => {
    const cargarBancas = async () => {
      const bancasIds = dataJson?.bancasIds || [];

      if (bancasIds.length === 0) {
        setDataJsonCompleto(dataJson);
        return;
      }

      setCargandoBancas(true);
      setErrorBancas(null);

      try {
        const bancasPreguntas = await Promise.all(
          bancasIds.map(async (b) => {
            const id = b.bancaId ?? b.BancaId;
            const res = await serviceApiNet.Preguntas.listarPorBanco(id);

            const preguntasDeBanca =
              res.data?.data?.preguntas ??
              res.data?.preguntas ??
              res.data?.data ??
              [];

            return { bancaId: id, preguntas: preguntasDeBanca };
          }),
        );

        setDataJsonCompleto({
          ...dataJson,
          bancasPreguntas,
        });
      } catch (err) {
        console.error("Error cargando bancas:", err);
        setErrorBancas("No se pudieron cargar las preguntas del banco.");
        setDataJsonCompleto(dataJson);
      } finally {
        setCargandoBancas(false);
      }
    };

    cargarBancas();
  }, [dataJson]);

  useEffect(() => {
    const cargarIntentosPrevios = async () => {
      if (!usuarioId || !evaluacionId) {
        setCargandoIntentos(false);
        return;
      }

      try {
        const res = await serviceApiNet.Evaluacion.getRespuestasAlumno(
          evaluacionId,
          usuarioId,
        );
        const respuestas = res.data?.data ?? res.data ?? [];
        const maxIntento = respuestas.reduce(
          (max, r) => Math.max(max, r.intento || 0),
          0,
        );
        setIntentosUsados(maxIntento);
      } catch (err) {
        console.error("Error cargando intentos previos:", err);
        // si falla, dejamos intentosUsados en 0 (no bloqueamos al alumno por un error de red)
      } finally {
        setCargandoIntentos(false);
      }
    };

    cargarIntentosPrevios();
  }, [dataJson, usuarioId]);

  const maxIntentos = dataJson?.oportunidades || 1;
  const intentosAgotados = intentosUsados >= maxIntentos;

  const totalSeg =
    (dataJson?.tiempoHoras || 0) * 3600 + (dataJson?.tiempoMinutos || 0) * 60;
  const {
    mm,
    ss,
    pct: timerPct,
    urgente,
  } = useTemporizador(totalSeg, fase === "evaluando", () => {
    const correctas = preguntas.filter((p) => {
      if (p.tipo === 5) return false;
      if (p.tipo === 2) {
        const resp = respuestas[p.preguntaId] || {};
        return p.opciones.every((op) => resp[op.texto] === op.explicacion);
      }
      const opCorrecta = p.opciones.find((o) => o.esCorrecta);
      return respuestas[p.preguntaId] === opCorrecta?.opcionId;
    }).length;
    const pct =
      preguntas.length > 0
        ? Math.round((correctas / preguntas.length) * 100)
        : 0;
    onCalificar?.(pct);
    setFase("resultado");
  });

  const iniciar = () => {
    if (intentosAgotados || !dataJsonCompleto) return;
    const prep = prepararPreguntas(
      dataJsonCompleto,
      dataJsonCompleto?.preguntasAleatorias,
    );
    setPreguntas(prep);
    setRespuestas({});
    setPreguntaIdx(0);
    setFase("evaluando");
    setIntentosUsados((prev) => prev + 1);
  };

  const preguntaActual = preguntas[preguntaIdx];
  const totalPreguntas = preguntas.length;
  const respuestaActual = preguntaActual
    ? respuestas[preguntaActual.preguntaId]
    : undefined;
  const yaRespondida =
    respuestaActual !== undefined &&
    (preguntaActual?.tipo !== 5 || respuestaActual?.trim?.()?.length > 0);

  const irSiguiente = async () => {
    if (preguntaIdx < totalPreguntas - 1) {
      setPreguntaIdx((i) => i + 1);
      return;
    }

    const correctas = preguntas.filter((p) => {
      if (p.tipo === 5) return false;
      if (p.tipo === 2) {
        const resp = respuestas[p.preguntaId] || {};
        return p.opciones.every((op) => resp[op.texto] === op.explicacion);
      }
      const opCorrecta = p.opciones.find((o) => o.esCorrecta);
      return Number(respuestas[p.preguntaId]) === Number(opCorrecta?.opcionId);
    }).length;

    const pct = Math.round((correctas / preguntas.length) * 100);

    if (usuarioId) {
      try {
        const payload = preguntas
          .filter((p) => p.tipo !== 2)
          .map((p) => {
            if (p.tipo === 5) {
              return {
                preguntaId: Number(p.preguntaIdReal) || null,
                opcionId: null,
                esCorrecta: false,
                puntosObtenidos: 0,
                textoRespuesta: respuestas[p.preguntaId] || "",
              };
            }

            const respuesta = respuestas[p.preguntaId];
            // ✅ Comparación segura número vs número
            const opcion = p.opciones.find(
              (o) => Number(o.opcionId) === Number(respuesta),
            );
            const opCorrecta = p.opciones.find((o) => o.esCorrecta);

            const preguntaIdFinal = p.esDeBanco
              ? null
              : Number(p.preguntaIdReal) || null;

            const opcionIdFinal = p.esDeBanco
              ? null
              : Number(opcion?.opcionIdReal) || null;

            const esCorr = p.esDeBanco
              ? opcion?.esCorrecta === true
              : Number(respuesta) === Number(opCorrecta?.opcionId);

            return {
              preguntaId: preguntaIdFinal,
              opcionId: opcionIdFinal,
              esCorrecta: esCorr ?? false,
              puntosObtenidos: esCorr ? p.puntos || 1 : 0,
              textoPregunta: p.esDeBanco ? p.textoPreguntaOriginal : null,
              textoOpcion: p.esDeBanco
                ? (opcion?.textoOpcionOriginal ?? opcion?.texto)
                : null,
              tipoPreguntaId: p.esDeBanco ? p.tipo : null,
              puntosValor: p.esDeBanco ? p.puntos || 1 : null,
            };
          })
          .filter(
            (r) =>
              r.preguntaId !== null &&
              r.preguntaId !== undefined &&
              r.preguntaId > 0,
          );

        console.log("📦 PAYLOAD FINAL:", JSON.stringify(payload, null, 2));

        await serviceApiNet.Inscripcion.guardarRespuestas({
          evaluacionId,
          usuarioId,
          respuestas: payload,
        });

        try {
          const res = await serviceApiNet.Evaluacion.getRespuestasAlumno(
            evaluacionId,
            usuarioId,
          );
          const respuestasBack = res.data?.data ?? res.data ?? [];
          const maxIntento = respuestasBack.reduce(
            (max, r) => Math.max(max, r.intento || 0),
            0,
          );
          setIntentosUsados(maxIntento);
        } catch (e) {
          console.error("Error re-sincronizando intentos:", e);
        }
      } catch (e) {
        console.error("Error guardando respuestas:", e);
      }
    }

    onCalificar?.(pct);
    setFase("resultado");
  };

  const irAnterior = () => {
    if (preguntaIdx > 0) setPreguntaIdx((i) => i - 1);
  };

  const responder = (val) => {
    if (modoRevision) return;
    setRespuestas((prev) => ({ ...prev, [preguntaActual.preguntaId]: val }));
  };

  const modoRevision = fase === "revision";

  if (cargandoBancas || cargandoIntentos) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-amber-100 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        <LoaderBancas />
      </div>
    );
  }

  if (fase === "inicio") {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-amber-100 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        <PantallaInicio
          dataJson={dataJsonCompleto || dataJson}
          preguntas={prepararPreguntas(dataJsonCompleto || dataJson, false)}
          onIniciar={iniciar}
          intentosUsados={intentosUsados}
          maxIntentos={maxIntentos}
        />
      </div>
    );
  }

  if (fase === "resultado") {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
        <PantallaResultado
          preguntas={preguntas}
          respuestas={respuestas}
          dataJson={dataJsonCompleto || dataJson}
          onReintentar={iniciar}
          onVerRevision={() => {
            setPreguntaIdx(0);
            setFase("revision");
          }}
          intentosUsados={intentosUsados}
          maxIntentos={maxIntentos}
        />
      </div>
    );
  }

  if (!preguntaActual) return null;

  const progreso = ((preguntaIdx + 1) / totalPreguntas) * 100;
  const opCorrecta =
    preguntaActual?.tipo !== 2 && preguntaActual?.tipo !== 5
      ? preguntaActual.opciones.find((o) => o.esCorrecta)
      : null;
  const esCorrecta =
    modoRevision &&
    (preguntaActual.tipo === 2
      ? preguntaActual.opciones.every(
          (op) => (respuestaActual || {})[op.texto] === op.explicacion,
        )
      : respuestaActual === opCorrecta?.opcionId);

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="h-1.5 w-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <div className="p-4 sm:p-8">
        {/* ✅ Header responsivo */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
            {modoRevision && (
              <button
                onClick={() => setFase("resultado")}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all"
              >
                <ChevronLeft size={13} />
                <span className="hidden sm:inline">Resultados</span>
              </button>
            )}
            <span
              className={`text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1.5 rounded-xl uppercase tracking-widest ${modoRevision ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-700"}`}
            >
              {modoRevision ? (
                "📋 Revisión"
              ) : (
                <>
                  <span className="sm:hidden">
                    P. {preguntaIdx + 1}/{totalPreguntas}
                  </span>
                  <span className="hidden sm:inline">
                    Pregunta {preguntaIdx + 1} de {totalPreguntas}
                  </span>
                </>
              )}
            </span>
            {preguntaActual.tipo === 2 && (
              <span className="text-[9px] sm:text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                Relación
              </span>
            )}
            {preguntaActual.tipo === 5 && (
              <span className="text-[9px] sm:text-[10px] font-black bg-violet-50 text-violet-600 border border-violet-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                Desarrollo
              </span>
            )}
          </div>

          {/* ✅ Timer compacto en móvil */}
          {totalSeg > 0 && !modoRevision && (
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border-2 flex-shrink-0 transition-all ${urgente ? "border-rose-200 bg-rose-50" : "border-slate-100 bg-slate-50"}`}
            >
              <div className="relative w-5 h-5 sm:w-7 sm:h-7">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    stroke={urgente ? "#fecaca" : "#e2e8f0"}
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    stroke={urgente ? "#f43f5e" : "#f59e0b"}
                    strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 11}`}
                    strokeDashoffset={`${2 * Math.PI * 11 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <Clock
                  size={8}
                  className={`absolute inset-0 m-auto ${urgente ? "text-rose-500" : "text-amber-500"}`}
                />
              </div>
              <span
                className={`text-xs sm:text-sm font-black tabular-nums ${urgente ? "text-rose-600" : "text-slate-700"}`}
              >
                {mm}:{ss}
              </span>
            </div>
          )}
        </div>

        {/* Banners revisión */}
        {modoRevision && preguntaActual.tipo !== 5 && (
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm font-bold ${
              esCorrecta
                ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                : "bg-rose-50 border border-rose-100 text-rose-700"
            }`}
          >
            {esCorrecta ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-500" />{" "}
                Respuesta correcta
              </>
            ) : (
              <>
                <XCircle size={16} className="text-rose-500" /> Respuesta
                incorrecta
              </>
            )}
          </div>
        )}
        {modoRevision && preguntaActual.tipo === 5 && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm font-bold bg-violet-50 border border-violet-100 text-violet-700">
            <AlertCircle size={16} className="text-violet-500" /> Pendiente de
            revisión por instructor
          </div>
        )}

        {/* ✅ Pregunta — texto más pequeño en móvil */}
        <div className="mb-4 sm:mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            {preguntaActual.puntos}{" "}
            {preguntaActual.puntos === 1 ? "punto" : "puntos"}
          </p>
          <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
            {preguntaActual.texto}
          </h3>
          {preguntaActual.imagenPregunta && (
            <img
              src={preguntaActual.imagenPregunta}
              alt="pregunta"
              className="mt-3 rounded-2xl max-h-36 sm:max-h-48 object-contain"
            />
          )}
        </div>

        {/* Componentes de pregunta — sin cambios */}
        {preguntaActual.tipo === 2 ? (
          <PreguntaRelacion
            pregunta={preguntaActual}
            respuestas={respuestaActual}
            onResponder={responder}
            mostrarResultado={modoRevision}
          />
        ) : preguntaActual.tipo === 5 ? (
          <PreguntaDesarrollo
            pregunta={preguntaActual}
            respuesta={respuestaActual}
            onResponder={responder}
            mostrarResultado={modoRevision}
          />
        ) : (
          <PreguntaMultiple
            pregunta={preguntaActual}
            respuesta={respuestaActual}
            onResponder={responder}
            mostrarResultado={modoRevision}
          />
        )}

        <div className="flex items-center justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 gap-2">
          {preguntaIdx > 0 && (
            <button
              onClick={irAnterior}
              className="flex items-center gap-1 px-3 py-2 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-2xl transition-all"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          )}

          {!modoRevision && (
            <button
              onClick={irSiguiente}
              disabled={
                !yaRespondida &&
                preguntaActual.tipo !== 2 &&
                preguntaActual.tipo !== 5
              }
              className={`flex items-center gap-1.5 px-5 py-2 font-bold text-xs rounded-2xl transition-all whitespace-nowrap ${
                yaRespondida ||
                preguntaActual.tipo === 2 ||
                preguntaActual.tipo === 5
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {preguntaIdx < totalPreguntas - 1 ? (
                <>
                  <span>Siguiente</span>
                  <ChevronRight size={14} />
                </>
              ) : (
                <>
                  <span>Finalizar</span>
                  <CheckCircle2 size={14} />
                </>
              )}
            </button>
          )}

          {modoRevision && preguntaIdx < totalPreguntas - 1 && (
            <button
              onClick={irSiguiente}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all whitespace-nowrap"
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluacionPlayer;

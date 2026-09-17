import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { OverlayPregunta } from "./hook/OverlayPregunta";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Loader,
} from "lucide-react";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoInteractivoPlayer = ({
  src,
  preguntas,
  isInteractivo,
  isVertical,
  onComplete,
}) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [preguntaActiva, setPreguntaActiva] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [esMobile, setEsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 640,
  );

  const youtubePlayerRef = useRef(null);
  const intervalRef = useRef(null);
  const respondidasIdsRef = useRef([]);
  const preguntaActivaRef = useRef(null);
  const isPlayingRef = useRef(false);
  const srcRef = useRef(src);

  useEffect(() => {
    srcRef.current = src;
  }, [src]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const esYoutube = src?.includes("youtube.com") || src?.includes("youtu.be");

  useEffect(() => {
    const handleResize = () => setEsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    setVideoError(null);
    setIsLoading(true);
    setPreguntaActiva(null);
    preguntaActivaRef.current = null;
    respondidasIdsRef.current = [];
    setFeedback(null);
    setPlaybackRate(1);
    setShowSpeedMenu(false);
  }, [src]);

  useEffect(() => {
    if (!esYoutube && videoRef.current && src) {
      const t = setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 200);
      return () => clearTimeout(t);
    }
  }, [src, esYoutube]);

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };
  const videoId = getYoutubeVideoId(src);

  const changeSpeed = useCallback(
    (rate) => {
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
      if (esYoutube) {
        try {
          youtubePlayerRef.current?.setPlaybackRate(rate);
        } catch (e) {}
      } else if (videoRef.current) {
        videoRef.current.playbackRate = rate;
      }
    },
    [esYoutube],
  );

  const toggleFullscreen = useCallback(() => {
    const isFs = !!(
      document.fullscreenElement || document.webkitFullscreenElement
    );
    if (isFs) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(
        document,
      );
    } else {
      const el = document.documentElement;
      const fn = el.requestFullscreen || el.webkitRequestFullscreen;
      fn?.call(el).catch((err) => console.error("[FS] Error:", err));
    }
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      const fs = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      setIsFullscreen(fs);
      document.body.classList.toggle("is-fullscreen-video", fs);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("webkitfullscreenchange", handleFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("webkitfullscreenchange", handleFSChange);
      document.body.classList.remove("is-fullscreen-video");
    };
  }, []);

  useEffect(() => {
    if (!esYoutube || !src) return;
    const yId = getYoutubeVideoId(src);
    if (!yId) return;

    let destroyed = false;
    const containerId = `yt-player-${yId}`;

    clearInterval(intervalRef.current);
    intervalRef.current = null;

    const initPlayer = () => {
      if (destroyed || !document.getElementById(containerId)) return;

      try {
        youtubePlayerRef.current?.destroy?.();
      } catch (e) {}
      youtubePlayerRef.current = null;

      youtubePlayerRef.current = new window.YT.Player(containerId, {
        videoId: yId,
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1 }, // ← autoplay YT
        events: {
          onReady: (event) => {
            if (destroyed) return;
            setIsLoading(false);
            try {
              event.target.setPlaybackRate(playbackRate);
            } catch (e) {}
            intervalRef.current = setInterval(() => {
              if (destroyed || !youtubePlayerRef.current) return;
              if (preguntaActivaRef.current) return;
              try {
                const t = Math.floor(youtubePlayerRef.current.getCurrentTime());
                const pregunta = preguntas?.find((p) => p.SegundoMarca === t);
                if (
                  pregunta &&
                  !respondidasIdsRef.current.includes(pregunta.PreguntaVideoId)
                ) {
                  youtubePlayerRef.current.pauseVideo();
                  mostrarPregunta(pregunta);
                }
              } catch (e) {}
            }, 500);
          },
          onError: (e) => {
            if (!destroyed) setVideoError(`Error de YouTube: ${e.data}`);
          },
          onStateChange: (e) => {
            if (destroyed) return;
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
            // ── REPRODUCCIÓN AUTOMÁTICA al finalizar (YT) ──
            if (e.data === window.YT.PlayerState.ENDED) {
              onComplete?.();
              try {
                youtubePlayerRef.current?.seekTo(0, true);
                youtubePlayerRef.current?.playVideo();
              } catch (err) {}
            }
          },
        },
      });
    };

    if (!window.YT) {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      destroyed = true;
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      try {
        youtubePlayerRef.current?.destroy?.();
      } catch (e) {}
      youtubePlayerRef.current = null;
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || videoError) return;
    if (v.paused) {
      v.play().catch((err) => {
        console.warn("[VIDEO] Error al reproducir:", err.message);
        if (err.name === "NotAllowedError") {
          setVideoError("Haz clic para reproducir el video");
        }
      });
    } else {
      v.pause();
    }
  }, [videoError]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const handleProgressClick = useCallback((e) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || isNaN(v.duration)) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }, []);

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlayingRef.current) setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(hideControlsTimer.current);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !preguntas?.length) return;

    setCurrentTime(v.currentTime);

    if (preguntaActivaRef.current) return;

    const t = Math.floor(v.currentTime);
    const pregunta = preguntas.find((p) => p.SegundoMarca === t);
    if (
      pregunta &&
      !respondidasIdsRef.current.includes(pregunta.PreguntaVideoId)
    ) {
      v.pause();
      mostrarPregunta(pregunta);
    }
  }, [preguntas]);

  const mostrarPregunta = (p) => {
    preguntaActivaRef.current = p;
    setPreguntaActiva(p);
  };

  const ocultarPregunta = () => {
    preguntaActivaRef.current = null;
    setPreguntaActiva(null);
  };

  const handleRespuesta = useCallback(
    (esCorrecta) => {
      if (!preguntaActivaRef.current) return;
      const idRespondida = preguntaActivaRef.current.PreguntaVideoId;

      setFeedback(esCorrecta ? "correcto" : "incorrecto");
      respondidasIdsRef.current = [...respondidasIdsRef.current, idRespondida];

      setTimeout(() => {
        ocultarPregunta();
        setFeedback(null);

        if (esYoutube) {
          try {
            youtubePlayerRef.current?.playVideo();
          } catch (e) {}
        } else {
          videoRef.current?.play().catch(console.warn);
        }
      }, 1500);
    },
    [esYoutube],
  );

  return (
    <>
      <style>{`
                :fullscreen #vip-player,
                :-webkit-full-screen #vip-player {
                    position: fixed !important;
                    inset: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 1 !important;
                    border-radius: 0 !important;
                    background: #0f172a !important;
                }
            `}</style>

      <div
        id="vip-player"
        ref={wrapperRef}
        onMouseMove={resetHideTimer}
        onMouseEnter={() => setShowControls(true)}
        onClick={!esYoutube ? togglePlay : undefined}
        className="relative overflow-hidden border-2 border-white/30 w-full group"
        style={{
          aspectRatio: esMobile ? "9/16" : "16/9",
          borderRadius: "1.5rem",
          margin: "0 auto",
          boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.3)",
          background: "#0f172a",
          cursor: showControls ? "default" : "none",
        }}
      >
        {videoError && !esYoutube && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-slate-900/90 text-white">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-sm text-center px-4 max-w-xs text-slate-300">
              {videoError}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVideoError(null);
                videoRef.current?.load();
              }}
              className="px-4 py-2 bg-violet-600 rounded-xl text-sm font-semibold hover:bg-violet-500 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/60 pointer-events-none">
            <Loader size={32} className="text-violet-400 animate-spin" />
          </div>
        )}

        {esYoutube ? (
          <div
            key={`yt-${videoId}`}
            id={`yt-player-${videoId}`}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
              src={src}
              preload="metadata"
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                const v = videoRef.current;
                if (v) {
                  setDuration(v.duration);
                  setIsLoading(false);
                  setVideoError(null);
                  v.playbackRate = playbackRate;
                }
              }}
              onLoadedData={() => setIsLoading(false)}
              onCanPlay={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onEnded={() => {
                setIsPlaying(false);
                isPlayingRef.current = false;
                onComplete?.();
                const v = videoRef.current;
                if (v) {
                  v.currentTime = 0;
                  v.play().catch(console.warn);
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
                isPlayingRef.current = true;
              }}
              onPause={() => {
                setIsPlaying(false);
                isPlayingRef.current = false;
              }}
              onError={(e) => {
                const err = e.currentTarget.error;
                const mensajes = {
                  1: "Reproducción cancelada.",
                  2: "Error de red al cargar el video.",
                  3: "Error al decodificar el video.",
                  4: "Formato de video no compatible con este navegador.",
                };
                setVideoError(
                  mensajes[err?.code] || "No se pudo cargar el video.",
                );
                setIsLoading(false);
                setIsPlaying(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {!isPlaying && !isLoading && !videoError && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 24px rgba(139,92,246,0.4)",
                    cursor: "pointer",
                    transition: "transform 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(139,92,246,1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(139,92,246,0.85)")
                  }
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.93)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <Play
                    size={28}
                    fill="white"
                    color="white"
                    style={{ marginLeft: 4 }}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                padding: "2rem 1rem 0.75rem",
                transition: "opacity 0.3s",
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? "auto" : "none",
                zIndex: 3,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "2px",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    background: "#8b5cf6",
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    transition: "width 0.1s",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <button onClick={togglePlay} style={btnStyle}>
                  {isPlaying ? (
                    <Pause size={20} fill="white" />
                  ) : (
                    <Play size={20} fill="white" />
                  )}
                </button>
                <button onClick={toggleMute} style={btnStyle}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <span
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "12px",
                    flex: 1,
                  }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpeedMenu((v) => !v);
                    }}
                    style={{
                      ...btnStyle,
                      fontSize: "11px",
                      fontWeight: 700,
                      minWidth: 36,
                      letterSpacing: "-0.5px",
                      padding: "4px 6px",
                      borderRadius: "6px",
                      background: showSpeedMenu
                        ? "rgba(139,92,246,0.4)"
                        : "rgba(255,255,255,0.1)",
                      transition: "background 0.15s",
                    }}
                    title="Velocidad de reproducción"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(15,23,42,0.97)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                        zIndex: 20,
                        minWidth: "110px",
                      }}
                    >
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          onClick={(e) => {
                            e.stopPropagation();
                            changeSpeed(s);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 16px",
                            background:
                              playbackRate === s
                                ? "rgba(139,92,246,0.3)"
                                : "transparent",
                            color:
                              playbackRate === s
                                ? "#c4b5fd"
                                : "rgba(255,255,255,0.75)",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: playbackRate === s ? 700 : 400,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            transition: "background 0.12s, color 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(139,92,246,0.18)";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              playbackRate === s
                                ? "rgba(139,92,246,0.3)"
                                : "transparent";
                            e.currentTarget.style.color =
                              playbackRate === s
                                ? "#c4b5fd"
                                : "rgba(255,255,255,0.75)";
                          }}
                        >
                          {s === 1 ? "1× Normal" : `${s}×`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={toggleFullscreen} style={btnStyle}>
                  {isFullscreen ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {isInteractivo && (
          <div
            className="absolute top-6 left-6 px-4 py-2 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg"
            style={{ zIndex: 4 }}
          >
            Video Interactivo
          </div>
        )}

        {preguntaActiva &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483647,
                background: "rgba(15,23,42,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              <OverlayPregunta
                preguntaActiva={preguntaActiva}
                feedback={feedback}
                handleRespuesta={handleRespuesta}
              />
            </div>,
            document.body,
          )}
      </div>
    </>
  );
};

const btnStyle = {
  color: "white",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default VideoInteractivoPlayer;

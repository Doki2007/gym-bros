import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { calcRacha } from "../lib/racha";
import { useToast } from "../contexts/ToastContext";
import ErrorCard from "../components/ErrorCard";
import {
  AlertTriangle,
  ChevronRight,
  Dumbbell,
  Flame,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";

const SPLIT_CONFIG = {
  Push: {
    icon: Dumbbell,
    name: "Push",
    subtitle: "Pecho • Hombro • Tríceps",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    badge: "bg-violet-500/15 text-violet-300",
  },
  Pull: {
    icon: Zap,
    name: "Pull",
    subtitle: "Espalda • Bíceps",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    badge: "bg-indigo-500/15 text-indigo-300",
  },
  Legs: {
    icon: Flame,
    name: "Legs",
    subtitle: "Cuádriceps • Femoral",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-300",
  },
  Upper: {
    icon: Trophy,
    name: "Upper",
    subtitle: "Tren Superior",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/15 text-cyan-300",
  },
  "Full Body": {
    icon: Sparkles,
    name: "Full Body",
    subtitle: "Cuerpo Completo",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-300",
  },
};

const DEFAULT_SPLIT_STYLE = {
  icon: Dumbbell,
  name: "Entreno",
  subtitle: "Rutina",
  color: "text-indigo-400",
  bg: "bg-indigo-500/10",
  border: "border-indigo-500/20",
  badge: "bg-indigo-500/15 text-indigo-300",
};

function formatFecha(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getFechaHoyTexto() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function HistorialPage({
  session,
  onOpenSesion,
  showModal: externalShowModal,
  setShowModal: externalSetShowModal,
}) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [creando, setCreando] = useState(false);
  const [currentDateDisplay] = useState(getFechaHoyTexto);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
  const setShowModal = externalSetShowModal !== undefined ? externalSetShowModal : setInternalShowModal;

  const fetchSesiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("sesiones")
      .select("id, fecha, split, sesion_ejercicios(id)")
      .order("fecha", { ascending: false });
    if (err) {
      setError("No se pudieron cargar tus sesiones.");
      setLoading(false);
      return;
    }
    const list = data ?? [];
    setSesiones(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSesiones();
  }, [fetchSesiones]);

  async function crearSesion(split) {
    setCreando(true);
    const { data, error: err } = await supabase
      .from("sesiones")
      .insert({ usuario_id: session.user.id, split })
      .select("id")
      .single();
    setCreando(false);
    setShowModal(false);
    if (err) {
      toast("Error al crear la sesión. Intenta de nuevo.", "error");
      return;
    }
    if (data) {
      toast(`Sesión ${split} creada 💪`, "success");
      onOpenSesion(data.id);
    }
  }

  async function eliminarSesion(id) {
    setDeletingId(id);
    const { error: err } = await supabase
      .from("sesiones")
      .delete()
      .eq("id", id);
    if (err) {
      toast("Error al eliminar la sesión.", "error");
    } else {
      setSesiones(sesiones.filter((s) => s.id !== id));
      toast("Sesión eliminada.", "info");
    }
    setDeletingId(null);
    setPendingDeleteId(null);
  }

  const latestSplit = sesiones[0]?.split || "Ninguno";
  const latestSplitConfig = SPLIT_CONFIG[latestSplit] || DEFAULT_SPLIT_STYLE;
  const racha = calcRacha(sesiones.map((s) => s.fecha));

  return (
    <div className="flex-1 flex flex-col px-6 pt-9 pb-36">
      {/* ── HEADER SUPERIOR AMISTOSO ── */}
      <header className="flex items-center justify-between mb-12 safe-top">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none">Hoy</h1>
          <p className="text-sm font-semibold text-zinc-400 capitalize">{currentDateDisplay}</p>
        </div>

        {/* Píldora flotante de Racha & Conteo */}
        <div className="bg-[#14141a]/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3.5 floating-pill-shadow border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400" title="Racha">
            <Flame size={15} className="fill-amber-400 text-amber-400" />
            <span>{racha}</span>
          </div>
          <div className="w-[1px] h-3.5 bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400" title="Total entrenos">
            <Trophy size={14} />
            <span>{sesiones.length}</span>
          </div>
        </div>
      </header>

      {/* ── TARJETA RESUMEN ── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xs font-extrabold tracking-wider text-zinc-400 uppercase">
            Resumen
          </h2>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 py-1 px-2 -mr-2 rounded-lg hover:bg-white/5"
          >
            <Plus size={14} /> Nueva sesión
          </button>
        </div>

        <div className="soft-card p-6 border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#161622] to-[#121218]">
          <div className="grid grid-cols-3 items-center text-center divide-x divide-white/5 py-1">
            <div className="px-2 flex flex-col items-center gap-2">
              <div className="text-2xl font-black text-white leading-none">{sesiones.length}</div>
              <div className="text-xs font-semibold text-zinc-400">Completadas</div>
            </div>

            <div className="px-2 flex flex-col items-center gap-2">
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1 leading-none">
                <Flame size={18} className="fill-amber-400" />
                <span>{racha}d</span>
              </div>
              <div className="text-xs font-semibold text-zinc-400">Racha</div>
            </div>

            <div className="px-2 flex flex-col items-center gap-2 min-w-0">
              <div className={`text-base font-black ${latestSplitConfig.color} truncate w-full leading-none`}>
                {latestSplit}
              </div>
              <div className="text-xs font-semibold text-zinc-400">Último split</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LISTA DE ENTRENAMIENTOS ── */}
      <section className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xs font-extrabold tracking-wider text-zinc-400 uppercase">
            Mis Sesiones
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
            {sesiones.length}
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchSesiones} />
        ) : sesiones.length === 0 ? (
          <div className="soft-card p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Dumbbell size={26} />
            </div>
            <div>
              <p className="text-base font-bold text-white">Aún no hay sesiones</p>
              <p className="text-xs text-zinc-400 mt-1">
                Toca abajo en el botón central (+) para registrar tu primer entrenamiento 💪
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
            >
              Comenzar ahora
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {sesiones.map((s) => {
              const config = SPLIT_CONFIG[s.split] || DEFAULT_SPLIT_STYLE;
              const Icon = config.icon;
              const totalEjercicios = s.sesion_ejercicios?.length ?? 0;

              const isPendingDelete = pendingDeleteId === s.id;
              const isDeleting = deletingId === s.id;

              return (
                <li key={s.id}>
                  {isPendingDelete ? (
                    /* ── Confirm-delete inline state ── */
                    <div className="soft-card p-5 flex flex-col gap-4 border border-red-500/20 bg-gradient-to-b from-[#1a1015] to-[#130e10] anim-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                          <AlertTriangle size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-extrabold text-white">¿Eliminar esta sesión?</span>
                          <span className="text-xs text-zinc-400 truncate">
                            {s.split} · {formatFecha(s.fecha)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-sm active:scale-95 transition-all disabled:opacity-40"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarSesion(s.id)}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-600/20 disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          {isDeleting ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Normal card state ── */
                    <div className="soft-card-interactive p-5 flex items-center justify-between gap-3 group">
                      <button
                        type="button"
                        onClick={() => onOpenSesion(s.id)}
                        className="flex items-center gap-4 min-w-0 flex-1 text-left"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center ${config.color} shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          <Icon size={22} strokeWidth={2.4} />
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-white tracking-tight truncate group-hover:text-indigo-400 transition-colors">
                              {s.split}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                              {config.name}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-zinc-400 capitalize">
                            {formatFecha(s.fecha)} · {totalEjercicios > 0 ? `${totalEjercicios} ejercicios` : "Sin ejercicios"}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(s.id)}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/15 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all active:scale-90"
                          aria-label="Eliminar sesión"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── BOTTOM SHEET: ELEGIR SPLIT ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md anim-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#13131a] rounded-t-[36px] p-6 pt-3 space-y-4 shadow-2xl border border-white/10 anim-slide-up safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle pill */}
            <div className="w-10 h-1.5 bg-zinc-700/80 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">¿Qué entrenaste hoy?</h3>
                <p className="text-xs text-zinc-400">Selecciona el grupo muscular de la sesión</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {Object.entries(SPLIT_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => crearSesion(key)}
                    disabled={creando}
                    className={`p-3.5 rounded-2xl bg-[#171722] hover:bg-[#1e1e2c] border ${config.border} hover:border-indigo-500/50 text-white font-bold text-sm flex items-center gap-3 active:scale-95 transition-all text-left disabled:opacity-40 group`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={19} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm text-white truncate">{config.name}</span>
                      <span className="text-[10px] font-normal text-zinc-400 truncate">{config.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {creando && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-indigo-400">
                <Loader2 size={16} className="animate-spin" />
                Creando sesión...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

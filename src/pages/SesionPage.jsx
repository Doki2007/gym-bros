import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ExerciseAccordion from "../components/ExerciseAccordion";
import ErrorCard from "../components/ErrorCard";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Flame,
  Loader2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

const SPLIT_CONFIG = {
  Push: {
    icon: Dumbbell,
    name: "Push",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  Pull: {
    icon: Zap,
    name: "Pull",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  Legs: {
    icon: Flame,
    name: "Legs",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  Upper: {
    icon: Trophy,
    name: "Upper",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  "Full Body": {
    icon: Sparkles,
    name: "Full Body",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

const DEFAULT_SPLIT_STYLE = {
  icon: Dumbbell,
  name: "Entreno",
  color: "text-indigo-400",
  bg: "bg-indigo-500/10",
  border: "border-indigo-500/20",
};

function formatFechaLarga(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function SesionPage({ sesionId, onBack }) {
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSesion = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("sesiones")
      .select("id, fecha, split")
      .eq("id", sesionId)
      .single();
    if (err) {
      setError("No se pudo cargar esta sesión.");
      setLoading(false);
      return;
    }
    setSesion(data);
    setLoading(false);
  }, [sesionId]);

  useEffect(() => {
    fetchSesion();
  }, [fetchSesion]);

  const config = SPLIT_CONFIG[sesion?.split] || DEFAULT_SPLIT_STYLE;
  const Icon = config.icon;

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-36">
      <header className="safe-top flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[#14141a] border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-zinc-300 flex items-center justify-center shrink-0 floating-pill-shadow"
            title="Regresar a entrenos"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center ${config.color} shrink-0`}>
              <Icon size={20} />
            </div>

            <div className="flex flex-col min-w-0">
              <h1 className="text-xl font-black text-white tracking-tight truncate">
                {loading ? "Cargando..." : (sesion?.split ?? "Sesión")}
              </h1>
              <p className="text-xs font-semibold text-zinc-400 capitalize flex items-center gap-1 mt-0.5">
                <Calendar size={12} className="text-indigo-400" />
                {sesion ? formatFechaLarga(sesion.fecha) : "..."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#14141a] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 floating-pill-shadow border border-white/10 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-zinc-300">Activo</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchSesion} />
        ) : (
          <ExerciseAccordion sesionId={sesionId} />
        )}
      </main>
    </div>
  );
}

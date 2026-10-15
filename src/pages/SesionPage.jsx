import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ExerciseAccordion from "../components/ExerciseAccordion";
import { ArrowLeft, Calendar } from "lucide-react";

function formatFechaLarga(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function SesionPage({ sesionId, onBack }) {
  const [sesion, setSesion] = useState(null);

  useEffect(() => {
    supabase
      .from("sesiones")
      .select("id, fecha, split")
      .eq("id", sesionId)
      .single()
      .then(({ data }) => setSesion(data));
  }, [sesionId]);

  return (
    <div className="flex-1 flex flex-col px-5 py-6">

      {/* ── Top bar ── */}
      <div className="safe-top flex items-center gap-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 shrink-0"
          title="Regresar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-base leading-tight text-white truncate">
            {sesion?.split ?? "…"}
          </span>
          <span className="text-xs text-zinc-500 capitalize flex items-center gap-1 mt-0.5">
            <Calendar size={10} />
            {sesion ? formatFechaLarga(sesion.fecha) : "\u00a0"}
          </span>
        </div>
      </div>

      {/* ── Ejercicios ── */}
      <div className="pt-2 flex-1 flex flex-col">
        <ExerciseAccordion sesionId={sesionId} />
      </div>
    </div>
  );
}

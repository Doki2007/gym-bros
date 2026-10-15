import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, ChevronRight, LogOut, Dumbbell, Loader2 } from "lucide-react";

const SPLITS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

const SPLIT_ICONS = {
  Push: "🫸",
  Pull: "🫷",
  Legs: "🦵",
  Upper: "💪",
  Lower: "🏋️",
  "Full Body": "🔥",
};

function formatFecha(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function HistorialPage({ session, onOpenSesion }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    fetchSesiones();
  }, []);

  async function fetchSesiones() {
    setLoading(true);
    const { data } = await supabase
      .from("sesiones")
      .select("id, fecha, split")
      .order("fecha", { ascending: false });
    setSesiones(data ?? []);
    setLoading(false);
  }

  async function crearSesion(split) {
    setCreando(true);
    const { data, error } = await supabase
      .from("sesiones")
      .insert({ usuario_id: session.user.id, split })
      .select("id")
      .single();
    setCreando(false);
    setShowModal(false);
    if (!error && data) onOpenSesion(data.id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex-1 flex flex-col px-5 py-6">

      {/* ── Top bar ── */}
      <div className="safe-top flex items-center justify-between pb-4">
        <div className="bg-indigo-600/10 text-indigo-400 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
          <Dumbbell size={14} />
          Gym Bros
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors active:scale-95 shadow-md shadow-indigo-600/20"
            title="Nueva sesión"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Section title ── */}
      <div className="flex items-center justify-between pt-4 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white">Mis sesiones</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-500">
          {sesiones.length}
        </span>
      </div>

      {/* ── Lista / estados ── */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : sesiones.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl py-16 border border-zinc-800/80 bg-zinc-900/30">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
              <Dumbbell size={24} className="text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-400">Aún no hay sesiones</p>
              <p className="text-xs text-zinc-600 mt-1">¡Empieza una nueva! 💪</p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {sesiones.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onOpenSesion(s.id)}
                  className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5 bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700/80 transition-all active:scale-[0.98] group text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1 self-stretch rounded-full bg-indigo-500/60 shrink-0" />
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <span className="font-semibold text-sm text-white truncate">
                        {s.split}
                      </span>
                      <span className="text-xs capitalize text-zinc-500">
                        {formatFecha(s.fecha)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Bottom sheet: elegir split ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center anim-fade-in"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-[420px] bg-zinc-900/95 backdrop-blur-md rounded-t-3xl safe-bottom flex flex-col gap-5 p-6 pt-4 border border-zinc-800 border-b-0 anim-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>

            <h3 className="text-base font-bold text-white">¿Qué entrenaste hoy?</h3>

            <div className="grid grid-cols-2 gap-3">
              {SPLITS.map((split) => (
                <button
                  key={split}
                  type="button"
                  onClick={() => crearSesion(split)}
                  disabled={creando}
                  className="bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 py-4 rounded-2xl text-sm font-medium border border-zinc-700/50 text-zinc-200 transition-all flex flex-col items-center gap-1.5 disabled:opacity-40"
                >
                  <span className="text-lg">{SPLIT_ICONS[split]}</span>
                  {split}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-xs py-2 text-center text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

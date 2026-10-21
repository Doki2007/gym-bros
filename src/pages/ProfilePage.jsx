import { useCallback, useEffect, useState } from "react";
import { Dumbbell, Flame, Loader2, LogOut, ShieldCheck, User, Zap } from "lucide-react";
import { supabase } from "../lib/supabase";
import { calcRacha } from "../lib/racha";
import { useToast } from "../contexts/ToastContext";
import ErrorCard from "../components/ErrorCard";

function getFechaHoyTexto() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ProfilePage({ session }) {
  const { toast } = useToast();
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchSesiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("sesiones")
      .select("id, fecha, split")
      .order("fecha", { ascending: false });
    if (err) {
      setError("No se pudieron cargar tus estadísticas.");
      setLoading(false);
      return;
    }
    setSesiones(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSesiones();
  }, [fetchSesiones]);

  async function handleLogout() {
    setLoggingOut(true);
    const { error: err } = await supabase.auth.signOut();
    if (err) {
      toast("No se pudo cerrar sesión. Intenta de nuevo.", "error");
      setLoggingOut(false);
    }
  }

  const userEmail = session?.user?.email || "Usuario Gym";
  const userName = userEmail.split("@")[0];
  const currentDateDisplay = getFechaHoyTexto();
  const racha = calcRacha(sesiones.map((s) => s.fecha));
  const latestSplit = sesiones[0]?.split || "—";

  return (
    <div className="flex-1 flex flex-col px-6 pt-9 pb-36">
      <header className="flex items-center justify-between mb-10 safe-top">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none">Perfil</h1>
          <p className="text-sm font-semibold text-zinc-400 capitalize">
            {currentDateDisplay}
          </p>
        </div>

        <div className="bg-[#14141a]/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 floating-pill-shadow border border-white/10">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-zinc-300">Activo</span>
        </div>
      </header>

      <div className="soft-card p-6 mb-8 flex items-center gap-4 bg-gradient-to-b from-[#161622] to-[#121218]">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
          <User size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate capitalize">{userName}</h2>
          <p className="text-xs font-medium text-zinc-400 truncate mt-0.5">{userEmail}</p>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-extrabold tracking-wider text-zinc-400 uppercase">
            Estadísticas Globales
          </h2>
        </div>

        {loading ? (
          <div className="soft-card p-10 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchSesiones} />
        ) : (
          <div className="soft-card p-6 bg-gradient-to-b from-[#161622] to-[#121218]">
            <div className="grid grid-cols-3 items-center text-center divide-x divide-white/5 py-1">
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-white leading-none">
                  <Dumbbell size={20} className="text-indigo-400" />
                  <span>{sesiones.length}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-400">Entrenos</div>
              </div>

              <div className="flex flex-col items-center gap-2 px-1">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-amber-400 leading-none">
                  <Flame size={20} className="fill-amber-400" />
                  <span>{racha}d</span>
                </div>
                <div className="text-xs font-semibold text-zinc-400">Racha</div>
              </div>

              <div className="flex flex-col items-center gap-2 px-1 min-w-0">
                <div className="flex items-center justify-center gap-1.5 text-base font-black text-cyan-400 leading-none w-full">
                  <Zap size={18} className="shrink-0" />
                  <span className="truncate">{latestSplit}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-400">Último split</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-4 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
        >
          {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
      </section>
    </div>
  );
}

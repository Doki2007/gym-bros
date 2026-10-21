import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Reusable error card.
 * @param {string}   message  - Human-readable error description.
 * @param {Function} onRetry  - Optional retry callback. If absent, button is hidden.
 */
export default function ErrorCard({ message = "Algo salió mal.", onRetry }) {
  return (
    <div className="soft-card p-8 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-13 h-13 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <AlertTriangle size={24} strokeWidth={2} />
      </div>

      <div>
        <p className="text-base font-bold text-white">Error al cargar</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-[220px]">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all border border-white/10"
        >
          <RefreshCw size={13} />
          Reintentar
        </button>
      )}
    </div>
  );
}

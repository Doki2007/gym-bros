import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

const STYLES = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-400",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  error: {
    icon: XCircle,
    bar: "bg-red-400",
    iconColor: "text-red-400",
    border: "border-red-500/20",
  },
  info: {
    icon: Info,
    bar: "bg-indigo-400",
    iconColor: "text-indigo-400",
    border: "border-indigo-500/20",
  },
};

function ToastItem({ toast, onDismiss }) {
  const s = STYLES[toast.type] ?? STYLES.info;
  const Icon = s.icon;

  return (
    <div
      className={`relative w-full flex items-center gap-3 bg-[#18181f] border ${s.border} rounded-2xl px-4 py-3 shadow-xl shadow-black/40 anim-slide-up overflow-hidden`}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-2xl`} />

      <Icon size={17} className={`${s.iconColor} shrink-0 ml-1`} />
      <span className="flex-1 text-sm font-semibold text-white">{toast.message}</span>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="w-6 h-6 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-300 flex items-center justify-center transition-colors shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

import { Dumbbell, Plus, User } from "lucide-react";

export default function BottomNav({ activeTab, onSelectTab, onNewWorkout }) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none">
      <nav className="w-full max-w-[340px] bg-[#121218]/95 backdrop-blur-2xl border border-white/10 rounded-full p-2 grid grid-cols-3 items-center floating-pill-shadow pointer-events-auto relative">
        {/* Tab: Entrenos / Historial */}
        <button
          type="button"
          onClick={() => onSelectTab("historial")}
          className={`flex flex-col items-center justify-center py-2 rounded-full transition-all active:scale-95 ${
            activeTab === "historial"
              ? "bg-white/10 text-indigo-400 font-extrabold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 font-medium"
          }`}
        >
          <Dumbbell size={20} strokeWidth={activeTab === "historial" ? 2.5 : 2} />
          <span className="text-[11px] mt-1 font-semibold tracking-tight">Entrenos</span>
        </button>

        {/* Botón Central Flotante Elevado (FAB) */}
        <div className="flex items-center justify-center -my-3">
          <button
            type="button"
            onClick={onNewWorkout}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all border-2 border-[#121218]"
            title="Nueva sesión"
          >
            <Plus size={24} strokeWidth={2.8} />
          </button>
        </div>

        {/* Tab: Perfil */}
        <button
          type="button"
          onClick={() => onSelectTab("perfil")}
          className={`flex flex-col items-center justify-center py-2 rounded-full transition-all active:scale-95 ${
            activeTab === "perfil"
              ? "bg-white/10 text-indigo-400 font-extrabold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 font-medium"
          }`}
        >
          <User size={20} strokeWidth={activeTab === "perfil" ? 2.5 : 2} />
          <span className="text-[11px] mt-1 font-semibold tracking-tight">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

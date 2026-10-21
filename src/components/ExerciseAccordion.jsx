import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../contexts/ToastContext";
import ErrorCard from "./ErrorCard";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Dumbbell, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

function SerieRow({ serie, onChange, onDelete }) {
  const { toast } = useToast();

  async function handleBlur(field, value) {
    const parsed =
      value === ""
        ? null
        : field === "peso_kg"
          ? parseFloat(value)
          : parseInt(value, 10);
    const { error: err } = await supabase
      .from("series")
      .update({ [field]: isNaN(parsed) ? null : parsed })
      .eq("id", serie.id);
    if (err) {
      toast("No se pudo guardar la serie.", "error");
      return;
    }
    onChange();
  }

  return (
    <div className="flex items-center gap-3 px-5 mb-3">
      <span className="text-xs font-bold text-zinc-400 w-5 text-center shrink-0 tabular-nums select-none">
        #{serie.orden}
      </span>

      <div className="flex-1 flex bg-[#0c0c10] border border-white/10 rounded-2xl px-3.5 py-2.5 items-center focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
        <input
          defaultValue={serie.peso_kg ?? ""}
          inputMode="decimal"
          placeholder="0"
          className="w-full bg-transparent text-center text-sm font-bold text-white focus:outline-none placeholder:text-zinc-600"
          onBlur={(e) => handleBlur("peso_kg", e.target.value)}
        />
        <span className="text-[11px] font-semibold text-zinc-400 select-none pl-1">kg</span>
      </div>

      <div className="flex-1 flex bg-[#0c0c10] border border-white/10 rounded-2xl px-3.5 py-2.5 items-center focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
        <input
          defaultValue={serie.reps ?? ""}
          inputMode="numeric"
          placeholder="0"
          className="w-full bg-transparent text-center text-sm font-bold text-white focus:outline-none placeholder:text-zinc-600"
          onBlur={(e) => handleBlur("reps", e.target.value)}
        />
        <span className="text-[11px] font-semibold text-zinc-400 select-none pl-1">reps</span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-9 h-9 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
        title="Eliminar serie"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function SeriesBloque({ titulo, tipo, ejercicioId, series, onRefresh }) {
  const { toast } = useToast();
  const delSerie = series.filter((s) => s.tipo === tipo);

  async function agregarSerie() {
    const { error: err } = await supabase.from("series").insert({
      ejercicio_id: ejercicioId,
      tipo,
      orden: delSerie.length + 1,
    });
    if (err) {
      toast("Error al agregar la serie.", "error");
      return;
    }
    toast("Serie agregada.", "success");
    onRefresh();
  }

  async function borrarSerie(id) {
    const { error: err } = await supabase.from("series").delete().eq("id", id);
    if (err) {
      toast("Error al eliminar la serie.", "error");
      return;
    }
    toast("Serie eliminada.", "info");
    onRefresh();
  }

  return (
    <div className="flex flex-col">
      <div className="text-[11px] font-extrabold tracking-wider text-zinc-400 uppercase mb-3 mt-4 px-5 flex items-center justify-between">
        <span>{titulo}</span>
        <span className="bg-white/5 border border-white/5 text-zinc-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
          {delSerie.length} {delSerie.length === 1 ? "serie" : "series"}
        </span>
      </div>

      {delSerie.map((s) => (
        <SerieRow
          key={s.id}
          serie={s}
          onChange={onRefresh}
          onDelete={() => borrarSerie(s.id)}
        />
      ))}

      <div className="px-5 mt-2 mb-4">
        <button
          type="button"
          onClick={agregarSerie}
          className="w-full py-2.5 rounded-2xl text-xs font-bold text-indigo-400 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 flex justify-center items-center gap-1.5 active:scale-98 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Agregar {tipo === "aproximacion" ? "aproximación" : "serie efectiva"}
        </button>
      </div>
    </div>
  );
}

function EjercicioItem({
  ejercicio,
  index,
  isOpen,
  onToggle,
  onRefresh,
  onDelete,
}) {
  const { toast } = useToast();
  const [series, setSeries] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editRef = useRef(null);

  const fetchSeries = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("series")
      .select("*")
      .eq("ejercicio_id", ejercicio.id)
      .order("tipo")
      .order("orden");
    if (err) {
      toast("No se pudieron cargar las series.", "error");
      return;
    }
    setSeries(data ?? []);
  }, [ejercicio.id, toast]);

  useEffect(() => {
    if (isOpen) fetchSeries();
  }, [isOpen, fetchSeries]);

  useEffect(() => {
    if (editingName) editRef.current?.focus();
  }, [editingName]);

  function refresh() {
    fetchSeries();
    onRefresh();
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const ok = await onDelete();
    if (!ok) setIsDeleting(false);
  }

  function startEdit() {
    setEditValue(ejercicio.nombre);
    setEditingName(true);
  }

  function cancelEdit() {
    setEditingName(false);
    setEditValue("");
  }

  async function handleSaveEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === ejercicio.nombre) {
      cancelEdit();
      return;
    }
    setIsSaving(true);
    const { error: err } = await supabase
      .from("sesion_ejercicios")
      .update({ nombre: trimmed })
      .eq("id", ejercicio.id);
    setIsSaving(false);
    if (err) {
      toast("Error al guardar el nombre.", "error");
      return;
    }
    toast("Ejercicio actualizado.", "success");
    setEditingName(false);
    onRefresh();
  }

  return (
    <div className="soft-card mb-4 overflow-hidden transition-all duration-200">
      {pendingDelete && (
        <div className="p-4 px-5 flex flex-col gap-3.5 bg-gradient-to-b from-[#1a1015] to-[#130e10] anim-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle size={17} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-extrabold text-white">¿Eliminar ejercicio?</span>
              <span className="text-xs text-zinc-400 truncate">{ejercicio.nombre}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendingDelete(false)}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-sm active:scale-95 transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-600/20 disabled:opacity-60"
            >
              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {isDeleting ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        </div>
      )}

      {!pendingDelete && editingName && (
        <div className="p-4 px-5 flex flex-col gap-3 anim-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center tabular-nums shrink-0">
              {index + 1}
            </span>
            <input
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              disabled={isSaving}
              className="flex-1 bg-[#0c0c10] border border-indigo-500/50 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-zinc-600 disabled:opacity-50"
              placeholder="Nombre del ejercicio"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-sm active:scale-95 transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSaving || !editValue.trim()}
              className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {isSaving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {!pendingDelete && !editingName && (
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          className="flex justify-between items-center p-4.5 px-5 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <span className="w-7 h-7 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center tabular-nums shrink-0">
              {index + 1}
            </span>
            <span className="text-base font-bold text-white truncate">
              {ejercicio.nombre}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); startEdit(); }}
              className="w-8 h-8 rounded-xl hover:text-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center transition-colors text-zinc-400"
              title="Editar nombre"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPendingDelete(true); }}
              className="w-8 h-8 rounded-xl hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors text-zinc-400"
              title="Eliminar ejercicio"
            >
              <Trash2 size={15} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      )}

      {!pendingDelete && !editingName && isOpen && (
        <div className="border-t border-white/5 pb-2 bg-black/20 anim-accordion">
          <SeriesBloque
            titulo="Aproximaciones"
            tipo="aproximacion"
            ejercicioId={ejercicio.id}
            series={series}
            onRefresh={refresh}
          />
          <div className="border-t border-white/5 mx-4 my-1.5" />
          <SeriesBloque
            titulo="Series Efectivas"
            tipo="efectiva"
            ejercicioId={ejercicio.id}
            series={series}
            onRefresh={refresh}
          />
        </div>
      )}
    </div>
  );
}

export default function ExerciseAccordion({ sesionId }) {
  const { toast } = useToast();
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const inputRef = useRef(null);

  const fetchEjercicios = useCallback(async ({ silent } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const { data, error: err } = await supabase
      .from("sesion_ejercicios")
      .select("id, nombre, orden")
      .eq("sesion_id", sesionId)
      .order("orden");
    if (err) {
      if (!silent) {
        setError("No se pudieron cargar los ejercicios.");
        setLoading(false);
      } else {
        toast("No se pudieron actualizar los ejercicios.", "error");
      }
      return;
    }
    setEjercicios(data ?? []);
    setLoading(false);
  }, [sesionId, toast]);

  useEffect(() => {
    fetchEjercicios();
  }, [fetchEjercicios]);

  async function agregarEjercicio() {
    const nombre = nuevoNombre.trim();
    if (!nombre) {
      setShowInput(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("sesion_ejercicios")
      .insert({ sesion_id: sesionId, nombre, orden: ejercicios.length + 1 })
      .select("id")
      .single();
    if (err) {
      toast("Error al agregar el ejercicio.", "error");
      return;
    }
    setNuevoNombre("");
    setShowInput(false);
    toast("Ejercicio agregado.", "success");
    await fetchEjercicios({ silent: true });
    if (data) setOpenId(data.id);
  }

  async function borrarEjercicio(id) {
    const { error: err } = await supabase.from("sesion_ejercicios").delete().eq("id", id);
    if (err) {
      toast("Error al eliminar el ejercicio.", "error");
      return false;
    }
    if (openId === id) setOpenId(null);
    toast("Ejercicio eliminado.", "info");
    fetchEjercicios({ silent: true });
    return true;
  }

  function toggleOpen(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return <ErrorCard message={error} onRetry={() => fetchEjercicios()} />;
  }

  return (
    <div className="flex flex-col flex-1 pb-4">
      {ejercicios.length === 0 && !showInput && (
        <div className="soft-card p-8 flex flex-col items-center justify-center gap-3 text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Dumbbell size={22} />
          </div>
          <div>
            <p className="text-base font-bold text-white">Sin ejercicios aún</p>
            <p className="text-xs text-zinc-400 mt-1">
              Agrega tu primer ejercicio para empezar a cargar pesos y repeticiones.
            </p>
          </div>
        </div>
      )}

      {ejercicios.map((ej, i) => (
        <EjercicioItem
          key={ej.id}
          ejercicio={ej}
          index={i}
          isOpen={openId === ej.id}
          onToggle={() => toggleOpen(ej.id)}
          onRefresh={() => fetchEjercicios({ silent: true })}
          onDelete={() => borrarEjercicio(ej.id)}
        />
      ))}

      {showInput && (
        <div className="soft-card p-4 flex items-center gap-3 mb-4 anim-fade-in border-indigo-500/40">
          <input
            ref={inputRef}
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarEjercicio()}
            placeholder="Nombre del ejercicio (ej. Press inclinado)"
            className="flex-1 bg-transparent outline-none text-sm font-semibold text-white placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={agregarEjercicio}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs active:scale-95 transition-all"
          >
            Guardar
          </button>
        </div>
      )}

      {!showInput && (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
        >
          <Plus size={18} strokeWidth={2.8} />
          Agregar ejercicio
        </button>
      )}
    </div>
  );
}

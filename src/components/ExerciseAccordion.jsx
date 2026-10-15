import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

// ─── Fila de serie ──────────────────────────────────────────────
function SerieRow({ serie, onChange, onDelete }) {
  async function handleBlur(field, value) {
    const parsed =
      value === ""
        ? null
        : field === "peso_kg"
          ? parseFloat(value)
          : parseInt(value, 10);
    await supabase
      .from("series")
      .update({ [field]: isNaN(parsed) ? null : parsed })
      .eq("id", serie.id);
    onChange();
  }

  return (
    <div className="flex items-center gap-3 px-4 mb-2">
      {/* Número de serie */}
      <span className="text-xs font-bold text-zinc-600 w-4 text-center shrink-0 tabular-nums select-none">
        {serie.orden}
      </span>

      {/* Peso */}
      <div className="flex-1 flex bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 items-center focus-within:border-indigo-500/50 transition-colors">
        <input
          defaultValue={serie.peso_kg ?? ""}
          inputMode="decimal"
          placeholder="—"
          className="w-full bg-transparent text-center text-sm font-medium text-white focus:outline-none"
          onBlur={(e) => handleBlur("peso_kg", e.target.value)}
        />
        <span className="text-[10px] text-zinc-500 select-none pl-1">kg</span>
      </div>

      {/* Reps */}
      <div className="flex-1 flex bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 items-center focus-within:border-indigo-500/50 transition-colors">
        <input
          defaultValue={serie.reps ?? ""}
          inputMode="numeric"
          placeholder="—"
          className="w-full bg-transparent text-center text-sm font-medium text-white focus:outline-none"
          onBlur={(e) => handleBlur("reps", e.target.value)}
        />
        <span className="text-[10px] text-zinc-500 select-none pl-1">reps</span>
      </div>

      {/* Borrar serie */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-zinc-600 hover:text-red-400 p-2 rounded-lg transition-colors shrink-0"
        title="Eliminar serie"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Bloque de series ────────────────────────────────────────────
function SeriesBloque({ titulo, tipo, ejercicioId, series, onRefresh }) {
  const delSerie = series.filter((s) => s.tipo === tipo);

  async function agregarSerie() {
    await supabase.from("series").insert({
      ejercicio_id: ejercicioId,
      tipo,
      orden: delSerie.length + 1,
    });
    onRefresh();
  }

  async function borrarSerie(id) {
    await supabase.from("series").delete().eq("id", id);
    onRefresh();
  }

  return (
    <div className="flex flex-col">
      {/* Encabezado del bloque */}
      <div className="text-[10px] tracking-widest font-bold text-zinc-500 uppercase mb-3 mt-4 px-4 flex items-center justify-between">
        <span>{titulo}</span>
        <span className="bg-zinc-900/90 text-zinc-400 px-2 py-0.5 rounded-md text-[10px] normal-case tracking-normal">
          {delSerie.length}
        </span>
      </div>

      {/* Filas de series */}
      {delSerie.map((s) => (
        <SerieRow
          key={s.id}
          serie={s}
          onChange={onRefresh}
          onDelete={() => borrarSerie(s.id)}
        />
      ))}

      {/* Botón fantasma agregar serie */}
      <button
        type="button"
        onClick={agregarSerie}
        className="w-[calc(100%-2rem)] mx-auto mt-2 mb-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 flex justify-center items-center gap-1.5 transition-colors"
      >
        <Plus size={13} strokeWidth={2.5} />
        Agregar serie
      </button>
    </div>
  );
}

// ─── Item del acordeón ───────────────────────────────────────────
function EjercicioItem({
  ejercicio,
  index,
  isOpen,
  onToggle,
  onRefresh,
  onDelete,
}) {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (isOpen) fetchSeries();
  }, [isOpen]);

  async function fetchSeries() {
    const { data } = await supabase
      .from("series")
      .select("*")
      .eq("ejercicio_id", ejercicio.id)
      .order("tipo")
      .order("orden");
    setSeries(data ?? []);
  }

  function refresh() {
    fetchSeries();
    onRefresh();
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl mb-4 overflow-hidden transition-all duration-200">
      {/* Cabecera del Ejercicio — ¡NO ES UN <button> para prevenir error de hidratación! */}
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
        className="flex justify-between items-center p-4 cursor-pointer select-none hover:bg-zinc-800/20 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="text-xs font-bold text-zinc-600 tabular-nums shrink-0">
            {index + 1}.
          </span>
          <span className="text-sm font-semibold text-zinc-100 truncate">
            {ejercicio.nombre}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:text-red-400 rounded-lg transition-colors text-zinc-500 hover:bg-zinc-800/40"
            title="Eliminar ejercicio"
          >
            <Trash2 size={15} />
          </button>
          <div className="p-1">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Contenido expandido */}
      {isOpen && (
        <div className="border-t border-zinc-800/50 pb-2 bg-zinc-950/20 anim-accordion">
          {/* Aproximaciones */}
          <SeriesBloque
            titulo="Aproximaciones"
            tipo="aproximacion"
            ejercicioId={ejercicio.id}
            series={series}
            onRefresh={refresh}
          />

          {/* Separador */}
          <div className="border-t border-zinc-800/40 mx-4 my-1" />

          {/* Efectivas */}
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

// ─── Acordeón principal ──────────────────────────────────────────
export default function ExerciseAccordion({ sesionId }) {
  const [ejercicios, setEjercicios] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    fetchEjercicios();
  }, [sesionId]);

  async function fetchEjercicios() {
    const { data } = await supabase
      .from("sesion_ejercicios")
      .select("id, nombre, orden")
      .eq("sesion_id", sesionId)
      .order("orden");
    setEjercicios(data ?? []);
  }

  async function agregarEjercicio() {
    const nombre = nuevoNombre.trim();
    if (!nombre) {
      setShowInput(false);
      return;
    }
    const { data } = await supabase
      .from("sesion_ejercicios")
      .insert({ sesion_id: sesionId, nombre, orden: ejercicios.length + 1 })
      .select("id")
      .single();
    setNuevoNombre("");
    setShowInput(false);
    await fetchEjercicios();
    if (data) setOpenId(data.id);
  }

  async function borrarEjercicio(id) {
    await supabase.from("sesion_ejercicios").delete().eq("id", id);
    if (openId === id) setOpenId(null);
    fetchEjercicios();
  }

  function toggleOpen(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  return (
    <div className="flex flex-col flex-1 pb-6">
      {/* Estado vacío sin borde punteado */}
      {ejercicios.length === 0 && !showInput && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl py-14 border border-zinc-800/60 bg-zinc-900/30 mb-4">
          <p className="text-sm font-medium text-zinc-400">
            Sin ejercicios aún
          </p>
          <p className="text-xs text-zinc-600">
            Agrega el primero para comenzar 👇
          </p>
        </div>
      )}

      {/* Lista de ejercicios */}
      {ejercicios.map((ej, i) => (
        <EjercicioItem
          key={ej.id}
          ejercicio={ej}
          index={i}
          isOpen={openId === ej.id}
          onToggle={() => toggleOpen(ej.id)}
          onRefresh={fetchEjercicios}
          onDelete={() => borrarEjercicio(ej.id)}
        />
      ))}

      {/* Input nuevo ejercicio */}
      {showInput && (
        <div className="bg-zinc-900/60 rounded-2xl border border-indigo-500/50 p-4 flex items-center gap-3 mb-4 anim-fade-in shadow-lg shadow-indigo-500/5">
          <input
            ref={inputRef}
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarEjercicio()}
            onBlur={agregarEjercicio}
            placeholder="Nombre del ejercicio (ej. Press inclinado)"
            className="flex-1 bg-transparent outline-none text-sm font-semibold text-white placeholder:text-zinc-600"
          />
        </div>
      )}

      {/* Botón primario agregar ejercicio */}
      {!showInput && (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="w-full bg-zinc-100 text-zinc-900 font-bold py-3.5 rounded-2xl text-sm mt-6 hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
        >
          <Plus size={16} strokeWidth={2.5} />
          Agregar ejercicio
        </button>
      )}
    </div>
  );
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { Dumbbell, Send, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (error) {
      toast('No se pudo enviar el enlace. Intenta de nuevo.', 'error')
      return
    }
    setSent(true)
    toast('Enlace mágico enviado. Revisa tu correo.', 'success')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full min-h-screen">
      {/* ── Logo & Brand ── */}
      <div className="flex flex-col items-center gap-4 mb-9 text-center">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-indigo-600/20 border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
          <Dumbbell size={32} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Gym Bros</h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1.5">
            Tu registro de entrenamientos mobile first
          </p>
        </div>
      </div>

      {/* ── Card Estilo NutriStudio (soft-card) ── */}
      <div className="w-full soft-card p-7 flex flex-col gap-6">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center anim-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Send size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-extrabold text-lg text-white">¡Revisa tu correo!</p>
              <p className="text-xs mt-2 leading-relaxed text-zinc-400">
                Te enviamos un enlace de acceso a <strong className="text-zinc-200">{email}</strong>.
                Tócalo para ingresar automáticamente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-2 text-xs font-bold text-indigo-400 hover:underline"
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full h-12 rounded-2xl px-4 text-sm font-semibold outline-none transition-all bg-[#0c0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 rounded-2xl font-extrabold text-sm text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                'Entrar con enlace mágico'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Dumbbell, Send, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 gap-8 min-h-screen sm:min-h-[800px]">
      {/* ── Logo & Brand ── */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-indigo-600/15 shadow-lg shadow-indigo-500/10">
          <Dumbbell size={30} className="text-indigo-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">Gym Bros</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Tu registro de entrenamientos
          </p>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="w-full rounded-2xl p-6 flex flex-col gap-5 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center anim-fade-in">
            <div className="w-14 h-14 rounded-full bg-indigo-600/15 flex items-center justify-center">
              <Send size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-lg text-white">¡Revisa tu email!</p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Te enviamos un enlace mágico a{' '}
                <strong className="text-zinc-300">{email}</strong>.
                <br />Haz clic en él para entrar.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full h-12 rounded-xl px-4 text-sm font-medium outline-none transition-all bg-zinc-950/60 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading || !email ? 'var(--color-surface-2)' : 'var(--color-accent)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando…
                </>
              ) : (
                'Enviar enlace mágico'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

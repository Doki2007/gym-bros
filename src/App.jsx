import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import HistorialPage from './pages/HistorialPage'
import SesionPage from './pages/SesionPage'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [currentSesionId, setCurrentSesionId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  function renderView() {
    // Splash mientras carga la sesión
    if (session === undefined) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
            />
            <span className="text-xs font-medium text-zinc-500">
              Cargando…
            </span>
          </div>
        </div>
      )
    }

    if (!session) return <LoginPage />

    if (currentSesionId) {
      return (
        <SesionPage
          sesionId={currentSesionId}
          onBack={() => setCurrentSesionId(null)}
        />
      )
    }

    return (
      <HistorialPage
        session={session}
        onOpenSesion={id => setCurrentSesionId(id)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center items-start sm:pt-12 sm:pb-12">
      <div className="w-full max-w-[420px] bg-[#0F0F12] min-h-screen sm:min-h-[800px] sm:h-auto sm:rounded-[2.5rem] sm:border border-zinc-800/80 sm:shadow-2xl relative flex flex-col overflow-hidden">
        {renderView()}
      </div>
    </div>
  )
}

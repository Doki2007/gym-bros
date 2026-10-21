import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import HistorialPage from './pages/HistorialPage'
import SesionPage from './pages/SesionPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import ToastContainer from './components/ToastContainer'
import { ToastProvider } from './contexts/ToastContext'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [currentSesionId, setCurrentSesionId] = useState(null)
  const [activeTab, setActiveTab] = useState('historial')
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleNewWorkout() {
    if (currentSesionId) {
      setCurrentSesionId(null)
    }
    setActiveTab('historial')
    setShowNewModal(true)
  }

  function renderContent() {
    // Splash mientras carga la sesión
    if (session === undefined) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
            />
            <span className="text-xs font-bold text-zinc-400">
              Cargando Gym Bros…
            </span>
          </div>
        </div>
      )
    }

    if (!session) return <LoginPage />

    // Si está dentro de una sesión de entrenamiento
    if (currentSesionId) {
      return (
        <SesionPage
          sesionId={currentSesionId}
          onBack={() => setCurrentSesionId(null)}
        />
      )
    }

    // Pestaña Perfil
    if (activeTab === 'perfil') {
      return (
        <ProfilePage session={session} />
      )
    }

    // Pestaña Historial / Entrenos por defecto
    return (
      <HistorialPage
        session={session}
        onOpenSesion={id => setCurrentSesionId(id)}
        showModal={showNewModal}
        setShowModal={setShowNewModal}
      />
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#09090b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] text-white flex flex-col items-center justify-start w-full">
        {/* Contenedor Mobile First */}
        <div className="w-full max-w-md min-h-screen sm:min-h-[820px] sm:my-8 sm:rounded-[36px] sm:border sm:border-white/10 sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative flex flex-col bg-[#0b0b0f] overflow-hidden">
          <ToastContainer />
          {renderContent()}

          {session && !currentSesionId && (
            <BottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onNewWorkout={handleNewWorkout}
            />
          )}
        </div>
      </div>
    </ToastProvider>
  )
}


# 🏋️ Gym Bros

**Tu registro de entrenamientos, mobile-first.**  
Registra sesiones, pesos y series. Comparte el progreso con tus gym bros.

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)](LICENSE)

> 🌐 [English version](README.md)

---

## ✨ Features

- 🔐 **Auth sin contraseña** — Magic link via Supabase Auth
- 📋 **Gestión de sesiones** — Crea, visualiza y elimina sesiones de entrenamiento por tipo de split (Push / Pull / Legs / Upper / Full Body)
- 💪 **Registro de ejercicios** — Agrega ejercicios a cada sesión, edita su nombre y elimínalos con confirmación inline
- 📊 **Series detalladas** — Registra aproximaciones y series efectivas con peso (kg) y repeticiones por ejercicio
- 🗂️ **Historial completo** — Panel principal con resumen de sesiones, racha y último split
- 🔔 **Toast notifications** — Feedback visual inmediato en cada acción (crear, eliminar, error)
- 📱 **Mobile-first design** — UI premium con tema dark, glassmorphism y micro-animaciones. En desktop se muestra como phone frame.
- ⚡ **PWA ready** — Manifest configurado para "Añadir a pantalla de inicio"

---

## 🖼️ Screenshots

> *Coming soon — la app corre en modo dark premium con fondo `#09090b` y acento índigo `#6366f1`.*

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework UI | React 19 + Vite 8 |
| Estilos | TailwindCSS v4 (vanilla, sin Tailwind plugins) |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Iconos | Lucide React |
| Tipografía | Plus Jakarta Sans (Google Fonts) |
| Package manager | pnpm |

---

## 🚀 Getting Started

### Pre-requisitos

- Node.js ≥ 18
- [pnpm](https://pnpm.io/installation) instalado globalmente
- Una cuenta en [Supabase](https://supabase.com) con un proyecto creado

### 1. Clonar el repositorio

```bash
git clone https://github.com/Doki2007/gym-bros.git
cd gym-bros
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Puedes encontrar estos valores en **Supabase → Settings → API**.

### 4. Configurar la base de datos

Ejecuta el siguiente SQL en el editor de Supabase (**SQL Editor → New query**):

```sql
-- Sesiones de entrenamiento
create table sesiones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id) on delete cascade not null,
  split text not null,
  fecha timestamptz default now() not null
);

-- Ejercicios dentro de una sesión
create table sesion_ejercicios (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id) on delete cascade not null,
  nombre text not null,
  orden int default 1
);

-- Series (aproximaciones + efectivas)
create table series (
  id uuid primary key default gen_random_uuid(),
  ejercicio_id uuid references sesion_ejercicios(id) on delete cascade not null,
  tipo text check (tipo in ('aproximacion', 'efectiva')) not null,
  orden int default 1,
  peso_kg numeric,
  reps int
);

-- Row Level Security
alter table sesiones enable row level security;
alter table sesion_ejercicios enable row level security;
alter table series enable row level security;

create policy "Usuarios ven sus propias sesiones" on sesiones
  for all using (auth.uid() = usuario_id);

create policy "Acceso a ejercicios de sus sesiones" on sesion_ejercicios
  for all using (
    sesion_id in (select id from sesiones where usuario_id = auth.uid())
  );

create policy "Acceso a series de sus ejercicios" on series
  for all using (
    ejercicio_id in (
      select se.id from sesion_ejercicios se
      join sesiones s on s.id = se.sesion_id
      where s.usuario_id = auth.uid()
    )
  );
```

### 5. Levantar el servidor de desarrollo

```bash
pnpm dev
```

La app estará disponible en `http://localhost:5173`.

---

## 📁 Estructura del proyecto

```
gym-bros/
├── public/
│   ├── favicon.svg
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx       # Navegación inferior estilo píldora
│   │   ├── ErrorCard.jsx       # Componente de error reutilizable
│   │   ├── ExerciseAccordion.jsx # Acordeón de ejercicios + series
│   │   └── ToastContainer.jsx  # Sistema de notificaciones
│   ├── contexts/
│   │   └── ToastContext.jsx    # Context + hook useToast()
│   ├── lib/
│   │   └── supabase.js         # Cliente Supabase configurado
│   ├── pages/
│   │   ├── HistorialPage.jsx   # Dashboard principal
│   │   ├── LoginPage.jsx       # Pantalla de auth
│   │   ├── ProfilePage.jsx     # Perfil + logout
│   │   └── SesionPage.jsx      # Vista de sesión activa
│   ├── App.jsx                 # Router y shell principal
│   ├── index.css               # Tokens de diseño + clases utilitarias
│   └── main.jsx
├── references/                 # Referencias de diseño (no se incluyen en build)
├── index.html
├── package.json
└── AGENTS.md                   # Protocolo para el agente de IA
```

---

## 🧩 Scripts disponibles

```bash
pnpm dev        # Servidor de desarrollo con HMR
pnpm build      # Build de producción (también sirve como smoke test)
pnpm preview    # Preview del build de producción
pnpm lint       # Linter con oxlint
```

---

## 🗺️ Roadmap

- [x] Auth con magic link
- [x] CRUD de sesiones (crear, leer, eliminar)
- [x] CRUD de ejercicios (crear, editar nombre, eliminar)
- [x] Registro de series con peso y reps
- [x] Sistema de toasts / feedback visual
- [x] Error handling con reintentar
- [x] PWA manifest
- [ ] OAuth (Google / GitHub)
- [ ] Racha real de días consecutivos
- [ ] Paginación semanal (7 sesiones por página)
- [ ] Editar split de una sesión existente
- [ ] Sistema de amigos y sesiones públicas/privadas

---

## 🤝 Contribuir

Las PRs son bienvenidas. Para cambios importantes, abre un issue primero para discutir qué te gustaría cambiar.

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'feat: agrega nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT © [Jamir](https://github.com/Doki2007)

---

*Hecho con 💪 y demasiado café.*

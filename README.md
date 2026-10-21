
# 🏋️ Gym Bros

**Your workout tracker, mobile-first.**  
Log sessions, weights and sets. Share your progress with your gym bros.

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)](LICENSE)

> 🌐 [Versión en Español](README.es.md)

---

## ✨ Features

- 🔐 **Passwordless auth** — Magic link via Supabase Auth
- 📋 **Session management** — Create, view and delete workout sessions by split type (Push / Pull / Legs / Upper / Full Body)
- 💪 **Exercise tracking** — Add exercises to each session, rename them and delete with inline confirmation
- 📊 **Detailed sets** — Log warm-up and working sets with weight (kg) and reps per exercise
- 🗂️ **Full history** — Dashboard with session summary, streak and last split
- 🔔 **Toast notifications** — Instant visual feedback on every action (create, delete, error)
- 📱 **Mobile-first design** — Premium dark UI with glassmorphism and micro-animations. Shows as a phone frame on desktop.
- ⚡ **PWA ready** — Manifest configured for "Add to home screen"

---

## 🖼️ Screenshots

> *Coming soon — the app runs in premium dark mode with `#09090b` background and indigo `#6366f1` accent.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + Vite 8 |
| Styles | TailwindCSS v4 (vanilla, no plugins) |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Icons | Lucide React |
| Typography | Plus Jakarta Sans (Google Fonts) |
| Package manager | pnpm |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- [pnpm](https://pnpm.io/installation) installed globally
- A [Supabase](https://supabase.com) account with a project created

### 1. Clone the repository

```bash
git clone https://github.com/Doki2007/gym-bros.git
cd gym-bros
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file at the project root:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

You can find these values in **Supabase → Settings → API**.

### 4. Set up the database

Run the following SQL in the Supabase editor (**SQL Editor → New query**):

```sql
-- Workout sessions
create table sesiones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id) on delete cascade not null,
  split text not null,
  fecha timestamptz default now() not null
);

-- Exercises within a session
create table sesion_ejercicios (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id) on delete cascade not null,
  nombre text not null,
  orden int default 1
);

-- Sets (warm-up + working)
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

create policy "Users see their own sessions" on sesiones
  for all using (auth.uid() = usuario_id);

create policy "Access to exercises of their sessions" on sesion_ejercicios
  for all using (
    sesion_id in (select id from sesiones where usuario_id = auth.uid())
  );

create policy "Access to sets of their exercises" on series
  for all using (
    ejercicio_id in (
      select se.id from sesion_ejercicios se
      join sesiones s on s.id = se.sesion_id
      where s.usuario_id = auth.uid()
    )
  );
```

### 5. Start the development server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project structure

```
gym-bros/
├── public/
│   ├── favicon.svg
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx       # Floating pill bottom navigation
│   │   ├── ErrorCard.jsx       # Reusable error component
│   │   ├── ExerciseAccordion.jsx # Exercise + sets accordion
│   │   └── ToastContainer.jsx  # Toast notification system
│   ├── contexts/
│   │   └── ToastContext.jsx    # Context + useToast() hook
│   ├── lib/
│   │   └── supabase.js         # Configured Supabase client
│   ├── pages/
│   │   ├── HistorialPage.jsx   # Main dashboard
│   │   ├── LoginPage.jsx       # Auth screen
│   │   ├── ProfilePage.jsx     # Profile + logout
│   │   └── SesionPage.jsx      # Active session view
│   ├── App.jsx                 # Router and main shell
│   ├── index.css               # Design tokens + utility classes
│   └── main.jsx
├── references/                 # Design references (not included in build)
├── index.html
├── package.json
└── AGENTS.md                   # AI agent protocol
```

---

## 🧩 Available scripts

```bash
pnpm dev        # Development server with HMR
pnpm build      # Production build (also acts as smoke test)
pnpm preview    # Preview the production build
pnpm lint       # Lint with oxlint
```

---

## 🗺️ Roadmap

- [x] Magic link auth
- [x] Session CRUD (create, read, delete)
- [x] Exercise CRUD (create, rename, delete)
- [x] Set logging with weight and reps
- [x] Toast / visual feedback system
- [x] Error handling with retry
- [x] PWA manifest
- [ ] OAuth (Google / GitHub)
- [ ] Real consecutive-day streak
- [ ] Weekly pagination (7 sessions per page)
- [ ] Edit split of an existing session
- [ ] Friends system with public/private sessions

---

## 🤝 Contributing

PRs are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the project
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © [Jamir](https://github.com/Doki2007)

---

*Built with 💪 and way too much coffee.*

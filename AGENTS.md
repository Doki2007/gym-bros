# AGENTS.md - Protocolo de Ejecución para Antigravity IDE

## 1. Stack Técnico e Infraestructura
- **Entorno:** React (Vite) + TailwindCSS v4 + Supabase Client.
- **Gestor de paquetes:** `pnpm` (Obligatorio, no usar npm ni yarn).
- **Comandos de control:**
  - Servidor de desarrollo: `pnpm dev`
  - Verificación de tipos/Linter: `pnpm lint` o `pnpm tsc` (si aplica)
  - Compilación de producción (Smoke Test): `pnpm build`

## 2. Restricciones Críticas de Diseño (Gym Bros UI)
- **Layout:** Mantener estrictamente el enfoque mobile-first. Todo componente principal debe envolverse o respetar el contenedor `max-w-md mx-auto` (estilo phone frame).
- **Paleta Dark Premium:** Fondo `#09090b`, superficie `#0b0b0f`, acento índigo `#6366f1`. Prohibido introducir colores planos arbitrarios.
- **Clases del Sistema:** Reutilizar siempre las clases declaradas en `index.css`: `.soft-card`, `.soft-card-interactive`, `.floating-pill-shadow`, `.safe-top`, `.safe-bottom`.
- **Iconos:** Usar exclusivamente `lucide-react`.

## 3. Manejo de Estado y Backend (Supabase)
- Toda consulta o mutación a la base de datos debe contemplar estados de carga (`loading`) y manejo explícito de errores (`error`).
- No hardcodear IDs de usuario; extraer siempre el UID de la sesión activa de Supabase Auth (`supabase.auth.getUser()`).

## 4. Bucle Obligatorio de Verificación (El Harness)
Antes de dar cualquier tarea por completada o solicitar la aprobación del usuario, DEBES abrir una terminal y ejecutar de manera autónoma:
1. `pnpm build` (Esto actúa como nuestro test de regresión. Si Vite encuentra un error de importación, un tag mal cerrado o un error de sintaxis, la compilación fallará).
2. Si el build falla, lee el log de error, corrige el código fuente de forma autónoma y vuelve a ejecutar `pnpm build`. Máximo 3 intentos.
3. Prohibido presentar código al usuario que rompa la compilación de producción.

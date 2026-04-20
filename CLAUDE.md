# ORO CAMPO — Reglas para Claude

## Respuestas
- Responde siempre en **español**.
- Sé directo y conciso. Sin introducción, sin resumen al final, sin "Aquí tienes…".
- Una pregunta simple → una respuesta simple. No expandas lo que no se pidió.
- Si algo es obvio por el código, no lo expliques.
- No agregues emojis salvo que se pidan.

## Código
- Sigue el estilo existente exactamente (Tailwind, naming, estructura de carpetas).
- Usa siempre los componentes de `src/components/ui/` en lugar de repetir clases.
- Usa las clases CSS globales (`.btn`, `.card`, `.input`, `.badge`, etc.) de `globals.css`.
- Colores y tokens → solo desde `src/styles/tokens.ts` o las variables CSS de `globals.css`. Nunca hex hardcodeados en código nuevo.
- Ningún archivo puede superar **1000 líneas**. Si crece, divide.
- Sin comentarios obvios. Solo comenta decisiones no evidentes.
- Sin manejo de errores para escenarios imposibles. Sin lógica defensiva innecesaria.

## Stack
- Next.js 14 App Router · Tailwind v4 · TypeScript
- API REST en `apps/api` (puerto 4001) — Fastify + Prisma
- Autenticación por sesión (iron-session)
- Roles: Root, Administrador, Secretaria, Domiciliario

## Estructura
```
apps/
  web/src/
    app/          → páginas (server components)
    components/
      ui/         → Button, Badge, Card, Modal, StatCard, PageHeader, EmptyState
      layout/     → AppLayout
      admin/      → UsersTable, UserFormModal
      inventario/ → InventarioView, MovimientosView, modales
      ventas/     → VentasView, VentaFormModal
      clientes/   → ClientesView, ClienteFormModal
      pagos/      → PagosView, PagoFormModal
      auth/       → LoginForm, LogoutButton
    styles/
      tokens.ts   → colores y fuentes como constantes JS
  api/src/
    routes/       → auth, users, roles, clientes, ventas, pagos, inventory, productTypes
    middleware/   → auth.ts (JWT)
    lib/          → prisma.ts, seed.ts
```

## Diseño
- Paleta: primary `#735c00`, primary-container `#d4af37`, surface `#fcf9f8`, error `#ba1a1a`
- Tipografía: Manrope (headlines) · Inter (body)
- Radios: tarjetas `2rem`, tarjetas grandes `2.5rem`, botones `rounded-full`
- Estética: premium · minimalista · sin grises genéricos

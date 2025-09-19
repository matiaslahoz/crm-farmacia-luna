# CRM Chatbot (Next.js + Supabase)

Mini-CRM para centralizar conversaciones de WhatsApp (vía n8n) y pedidos.
Incluye login, sidebar compacto, chats estilo WhatsApp (agrupados por número, “no leídos”, indicador **Derivar**), dashboard con métricas y gráfico, y pantalla de pedidos con detalle.

## ✨ Features

- **Auth Supabase** (email/contraseña).
- **Chats**:
  - Agrupados por **phone** y preview del último mensaje.
  - Indicador **Derivar** (franja/ícono) y limpieza automática al abrir.
  - “No leídos” por número (localStorage + realtime).
  - Hilo combinado (todas las sesiones del número) + **infinite scroll** hacia arriba.
  - Botón “**Abrir en WhatsApp**”.

- **Pedidos**: tabla con join a Session, filtros (texto + fechas) y **drawer** de ítems.
- **Dashboard**: métricas rápidas y gráfico (día/semana/mes/año) con Recharts.
- **UI**: Sidebar compacto (colapsado por defecto).
- **Modo claro forzado** (sin seguir el dark del navegador).

## 🧱 Stack

- **Next.js 14+**, **React 18**, **TypeScript**, **Tailwind CSS**
- **Supabase** (Auth, Postgres, Realtime, RLS)
- **Recharts** (gráficos), **lucide-react** (íconos)
- **ESLint + Prettier** (con `prettier-plugin-tailwindcss`)

---

## 🚀 Comenzar

```bash
# 1) Dependencias
npm install

# 2) Variables de entorno
cp .env.example .env.local

# 3) Dev
npm run dev
```

Abrí: [http://localhost:3000](http://localhost:3000)

### `.env.example`

```env
# Supabase (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# (Opcional) Código de país por defecto para wa.me (Argentina = 54)
NEXT_PUBLIC_DEFAULT_COUNTRY=54
```

---

## 🗃️ Base de datos (tablas mínimas)

```sql
-- Session
create table if not exists public."Session" (
  id bigint primary key generated always as identity,
  date timestamptz not null default now(),
  estado text,
  phone text,
  derivar_humano boolean not null default false,
  name text
);

-- Chat
create table if not exists public."Chat" (
  id bigint primary key generated always as identity,
  date timestamptz not null default now(),
  tipo text not null,                 -- 'ia' | 'user' | etc
  message text not null,
  session_id bigint not null references public."Session"(id) on delete cascade
);

-- Pedido
create table if not exists public."Pedido" (
  id bigint primary key generated always as identity,
  date timestamptz not null default now(),
  total numeric not null default 0,
  pedido jsonb not null default '[]',
  session_id bigint not null references public."Session"(id) on delete cascade
);

-- Índices útiles
create index if not exists session_date_idx on public."Session"(date desc);
create index if not exists chat_session_date_idx on public."Chat"(session_id, date);
create index if not exists pedido_session_date_idx on public."Pedido"(session_id, date);
```

### Realtime (recomendado para “no leídos”)

```sql
alter publication supabase_realtime add table public."Chat";
```

### RLS (políticas mínimas)

> Ajustá a tu modelo de auth; esto asume **usuarios autenticados** leen todo y pueden marcar `derivar_humano`.

```sql
alter table public."Session" enable row level security;
alter table public."Chat"    enable row level security;
alter table public."Pedido"  enable row level security;

-- Leer
create policy "read_session" on public."Session" for select using ( auth.role() = 'authenticated' );
create policy "read_chat"    on public."Chat"    for select using ( auth.role() = 'authenticated' );
create policy "read_pedido"  on public."Pedido"  for select using ( auth.role() = 'authenticated' );

-- Marcar derivar_humano desde la app
create policy "update_derivar" on public."Session"
  for update using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );
```

---

## 🧩 Estructura (resumen)

```
src/
  app/
    (app)/
      dashboard/page.tsx
      chats/
        page.tsx
        Conversation.tsx
        SessionsList.tsx
      pedidos/page.tsx
    login/page.tsx
    layout.tsx
    globals.css
  components/
    Sidebar.tsx
    chats/
      SessionAvatar.tsx
      SessionGroupItem.tsx
      MessageBubble.tsx
      ConversationHeader.tsx
    pedidos/
      OrdersTable.tsx
      OrderDrawer.tsx
    dashboard/
      StatCard.tsx
      StatsGrid.tsx
      PeriodTabs.tsx
      ConversationsChart.tsx
  hooks/
    useUnreadCounts.ts
  lib/
    supabaseClient.ts
    types.ts            # { Session, Chat, ... }
    groupByPhone.ts
    phone.ts            # waLink(), normalizePhone()
    pedido.ts           # parsePedido(), countItems()
    currency.ts
```

---

## 🧪 Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 🖌️ Estilo & Editor

- Formato: **Prettier** (con `prettier-plugin-tailwindcss`).
- Lint: **ESLint** (`next/core-web-vitals` + `plugin:prettier/recommended`).
- **Modo claro forzado**: `globals.css` define `:root{ color-scheme: light; }` (no usamos `@media (prefers-color-scheme)`).

---

## 📦 Deploy

- **Vercel**: importa el repo, setea `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Project Settings → Environment Variables.
- Habilitá **Edge Functions / Realtime** en Supabase si corresponde.

---

## ✅ Roadmap corto

- [ ] Exportar CSV/Excel (Pedidos / Conversaciones).
- [ ] Filtros avanzados: estado, derivadas, agente.
- [ ] Realtime en la conversación activa.
- [ ] Métricas adicionales en Dashboard: mensajes, tasa de derivación, conversión a pedido.

---

### Licencia

MIT — usalo, modificalo y contame cómo te fue 😉

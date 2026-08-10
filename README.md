# Circuit Bazaar

A specification-first hardware marketplace for Nepal, built with Next.js 15, React 19, Tailwind CSS v4, and Laravel 13.

## Prerequisites

- Node.js 20+
- npm 10+
- PHP 8.3+
- Composer 2+
- Docker (optional, for containerized setup)

## Local Development Setup

### Frontend (Next.js)

```bash
# Install dependencies
cd frontend
npm install

# Run development server on port 3000
npm run dev

# Open http://localhost:3000
```

### Backend (Laravel)

```bash
# Enter backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Start Laravel dev server on port 8000
php artisan serve

# API will be available at http://localhost:8000
```

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server on port 3000 |
| `npm run lint` | Run TypeScript type check (`tsc --noEmit`) |

### Backend

| Command | Description |
|---------|-------------|
| `php artisan serve` | Start Laravel dev server on port 8000 |
| `php artisan migrate` | Run database migrations |
| `php artisan make:model ModelName -mcr` | Create model, migration, controller, and seeder |
| `php artisan tinker` | Interactive PHP shell |
| `php artisan test` | Run PHPUnit tests |

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript 5.8
- **Backend:** Laravel 13, PHP 8.3+, Eloquent ORM
- **Icons:** Material Symbols Outlined, Lucide React
- **Package managers:** npm (frontend), Composer (backend)

## Project Structure

```
second-year-poo/
├── frontend/               # Next.js public marketplace + admin + vendor
│   └── src/
│       ├── app/
│       │   ├── layout.tsx  # Root layout
│       │   ├── page.tsx    # Public marketplace (/)
│       │   ├── admin/      # Admin dashboard (/admin/*)
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   └── vendor/     # Vendor portal (/vendor/*)
│       │       ├── layout.tsx
│       │       └── page.tsx
│       ├── components/
│       ├── context/
│       ├── data/
│       ├── types.ts
│       └── App.tsx
├── backend/                # Laravel 13 API
│   ├── app/
│   ├── routes/
│   │   └── api.php
│   └── ...
├── nginx/
│   └── nginx.conf          # Reverse proxy for subdomain routing
├── docker-compose.yml      # Orchestrates nginx + frontend + backend
└── README.md
```

## Subdomains

The app uses one domain with subdomains, routed by nginx in Docker:

| Subdomain | Service | Path | Description |
|-----------|---------|------|-------------|
| `baseurl` | Next.js | `/` | Public marketplace |
| `admin.baseurl` | Next.js | `/admin/*` | Admin dashboard |
| `vendor.baseurl` | Next.js | `/vendor/*` | Vendor portal |
| `api.baseurl` | Laravel | `/api/*` | Backend API |

## Docker Setup

### Prerequisites

- Docker Desktop installed and running
- Add to your `hosts` file (optional, for local subdomain testing):
  ```
  127.0.0.1 baseurl.localhost
  127.0.0.1 admin.baseurl.localhost
  127.0.0.1 vendor.baseurl.localhost
  127.0.0.1 api.baseurl.localhost
  ```

### Start All Services

```bash
docker compose up --build
```

This starts:
- **nginx** on `http://localhost:80` (routes subdomains)
- **frontend** (Next.js) on port 3000
- **backend** (Laravel) on port 8000

### Stop All Services

```bash
docker compose down
```

### How Docker Works

The `docker-compose.yml` defines 3 services:

1. **nginx** — Reverse proxy on port 80 that routes requests based on subdomain:
   - `admin.*` → Next.js admin routes (`/admin/*`)
   - `vendor.*` → Next.js vendor routes (`/vendor/*`)
   - `api.*` → Laravel backend (`/api/*`)
   - Everything else → Next.js public marketplace (`/`)

2. **frontend** — Builds the Next.js app using the multi-stage `Dockerfile`:
   - Stage 1: `deps` — installs npm dependencies with `npm ci`
   - Stage 2: `builder` — copies source and runs `npm run build`
   - Stage 3: `runner` — copies only compiled `.next/standalone` and `.next/static`, runs `node server.js`
   - Exposes port 3000 internally

3. **backend** — Builds Laravel API using `backend/Dockerfile`:
   - Installs PHP extensions (pdo_sqlite, gd, mbstring, etc.)
   - Installs Composer dependencies
   - Runs `php artisan serve` on port 8000
   - Persists `storage/` volume for SQLite database

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## Authentication

The app uses a client-side authentication system with `localStorage` persistence.

### How It Works

1. `AuthContext` (`frontend/src/context/AuthContext.tsx`) provides `user`, `isAuthenticated`, `login`, `signup`, and `logout`
2. User session persists in `localStorage` under key `circuit-bazaar-auth`
3. `Header` component shows "Sign In" when logged out, or a user dropdown with "Sign Out" when logged in
4. Protected routes:
   - **`/admin/*`** — admin dashboard (guarded by middleware)
   - **`/vendor/*`** — vendor portal (guarded by middleware)
   - **Cart checkout** — requires login before proceeding to payment
   - **Vendor application** — requires login before submitting

### Switching to a Real Backend

To connect to the Laravel API, update the `login` and `signup` functions in `frontend/src/context/AuthContext.tsx`:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const userData = await response.json();
  setUser(userData);
  localStorage.setItem('circuit-bazaar-auth', JSON.stringify(userData));
};
```

## Agentation (Visual Feedback Tool)

[Agentation](https://agentation.com) is an agent-agnostic visual feedback toolbar that lets you click elements on the page, add notes, and copy structured markdown for AI coding agents.

### Setup

`agentation` is already installed as a devDependency. It's wired into `frontend/src/app/layout.tsx` via `AgentationGuard`, which only renders on public routes:

```tsx
import { AgentationGuard } from "../components/AgentationGuard";

// Inside <body>:
<AgentationGuard />
```

### Usage

1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Click the Agentation icon in the bottom-right corner
4. Hover over elements to highlight them
5. Click any element to add an annotation with notes
6. Copy the generated markdown and paste it into your AI agent

### MCP Server (Optional, for Real-Time Sync)

For real-time annotation syncing instead of copy-paste, set up the MCP server:

```bash
# Universal setup (supports Claude Code, Cursor, Codex, Windsurf, etc.)
npx add-mcp "npx -y agentation-mcp server"

# Or for Claude Code specifically:
npx agentation-mcp init
```

After setup, restart your coding agent. The server runs on port 4747 by default.

## Notes

- **Single Next.js app** — public, admin, and vendor pages share one codebase via folder-based layouts
- **Subdomain routing** — nginx routes `admin.*`, `vendor.*`, and `api.*` to the correct service
- **Backend is Laravel 13** — see `backend/README.md` for backend-specific setup
- **For local dev without Docker**, run `npm run dev` and `cd backend && php artisan serve` separately

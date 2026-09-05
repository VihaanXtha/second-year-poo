# Circuit Bazaar

A specification-first hardware marketplace for Nepal, built with Next.js 15, React 19, Tailwind CSS v4, and Laravel 13.

## Local Development (Monorepo)

This repo is the **development monorepo**. Use Docker to run all services together locally:

```bash
docker compose up --build
```

This starts:
- **frontend** (Next.js) on `http://localhost:3000`
- **shop** (Next.js) on `http://localhost:3003`
- **admin** (Vite) on `http://localhost:3001`
- **vendor** (Vite) on `http://localhost:3002`
- **backend** (Laravel) on `http://localhost:8000`

## Deployment (Separated)

For production, each service is deployed independently:

| Service | Repo | Hosting |
|---------|------|---------|
| **frontend** | `home.circuit` | Vercel |
| **shop** | `shop.circuit` | Vercel |
| **admin** | `admin.circuit` | Vercel |
| **vendor** | `vender.circuit` | Vercel |
| **backend** | `backend.circuit` | Railway |

### Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://homecircuit.vercel.app |
| **Shop** | https://shopcircuit-six.vercel.app |
| **Admin** | https://admincircuit.vercel.app |
| **Vendor** | https://vendercircuit.vercel.app |
| **Backend** | https://backendcircuit-production.up.railway.app |

### Backend (Railway)

1. Push `backend/` folder to `https://github.com/VihaanXtha/backend.circuit.git`
2. Connect repo to Railway
3. Railway auto-detects Laravel and deploys via Dockerfile
4. Backend URL: `https://backendcircuit-production.up.railway.app`

> **Note:** Backend uses SQLite by default. If you add MySQL on Railway, update `.env` DB settings accordingly.

### Frontends (Vercel)

1. Push each frontend folder to its respective repo
2. Connect repo to Vercel
3. Vercel auto-detects framework and deploys
 4. Set `NEXT_PUBLIC_API_URL` environment variable in Vercel dashboard:
    ```
    https://backendcircuit-production.up.railway.app/api
    ```

### Pushing Folders to Separate Repos

```bash
# Frontend → home.circuit
git subtree split --prefix=frontend -b frontend-only
git remote add home-circuit https://github.com/VihaanXtha/home.circuit.git
git push home-circuit frontend-only:main
git remote remove home-circuit

# Shop → shop.circuit
git subtree split --prefix=shop -b shop-only
git remote add shop-circuit https://github.com/VihaanXtha/shop.circuit.git
git push shop-circuit shop-only:main
git remote remove shop-circuit

# Admin → admin.circuit
git subtree split --prefix=admin -b admin-only
git remote add admin-circuit https://github.com/VihaanXtha/admin.circuit.git
git push admin-circuit admin-only:main
git remote remove admin-circuit

# Vendor → vender.circuit
git subtree split --prefix=vendor -b vendor-only
git remote add vendor-circuit https://github.com/VihaanXtha/vender.circuit.git
git push vendor-circuit vendor-only:main
git remote remove vendor-circuit

# Backend → backend.circuit
git subtree split --prefix=backend -b backend-only
git remote add backend-circuit https://github.com/VihaanXtha/backend.circuit.git
git push backend-circuit backend-only:main
git remote remove backend-circuit
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript 5.8
- **Backend:** Laravel 13, PHP 8.3+, Eloquent ORM
- **Icons:** Material Symbols Outlined, Lucide React
- **Package managers:** npm (frontend), Composer (backend)

## Project Structure

```
second-year-poo/
├── frontend/               # Next.js public marketplace → home.circuit
├── shop/                   # Next.js shop frontend → shop.circuit
├── admin/                  # Vite admin dashboard → admin.circuit
├── vendor/                 # Vite vendor dashboard → vender.circuit
├── backend/                # Laravel 13 API → backend.circuit
├── nginx/                  # Reverse proxy for local Docker
├── docker-compose.yml      # Orchestrates all services locally
└── README.md
```

## Authentication

Client-side auth with `localStorage` persistence. Each frontend app has its own `AuthContext`.

### Switching to Real Backend

Update the `login` and `signup` functions to call the Railway backend:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('https://backendcircuit-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const userData = await response.json();
  setUser(userData);
  localStorage.setItem('circuit-bazaar-auth', JSON.stringify(userData));
};
```

## Docker Setup

### Start All Services

```bash
docker compose up --build
```

### Stop All Services

```bash
docker compose down
```

## Notes

- **Local:** Use docker-compose to run all services together
- **Production:** Each service is deployed independently to Railway/Vercel
- **Backend is Laravel 13** — see `backend/README.md` for backend-specific setup

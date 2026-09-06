# Circuit Bazaar

A specification-first hardware marketplace for Nepal, built with Next.js 15, React 19, Tailwind CSS v4, and Laravel 13.

## Local Development (No Docker)

Run each service separately in its own terminal:

```bash
# Terminal 1 - Backend (MySQL must be running locally)
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Shop
cd shop
npm run dev

# Terminal 4 - Admin
cd admin
npm run dev

# Terminal 5 - Vendor
cd vendor
npm run dev
```

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Shop | http://localhost:3003 |
| Admin | http://localhost:3001 |
| Vendor | http://localhost:3002 |
| Backend API | http://localhost:8000 |

## Database

- **MySQL 8.0** running locally on `localhost:3306`
- Database: `circuit_bazaar`
- Username: `root`
- Password: `(empty)` or your local MySQL root password

## Deployment

Each service is deployed independently:

| Service | Repo | Hosting |
|---------|------|---------|
| frontend | `home.circuit` | Vercel |
| shop | `shop.circuit` | Vercel |
| admin | `admin.circuit` | Vercel |
| vendor | `vender.circuit` | Vercel |
| backend | `backend.circuit` | Railway |

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript 5.8
- **Backend:** Laravel 13, PHP 8.3+, Eloquent ORM, Sanctum
- **Icons:** Material Symbols Outlined, Lucide React
- **Package managers:** npm (frontend), Composer (backend)

## Documentation

- `ARCHITECTURE.md` — Full system architecture, API contracts, database schema
- `FLOW_OF_FRONTEND.md` — Frontend app flow and pages
- `FLOW_OF_SHOP.md` — Shop app flow and pages
- `FLOW_OF_ADMIN.md` — Admin dashboard flow and pages
- `FLOW_OF_VENDOR.md` — Vendor dashboard flow and pages
- `FLOW_OF_BACKEND.md` — Backend API flow and endpoints
- `SYSTEM_FLOW.md` — How all apps connect and interact

## Authentication

Client-side auth with `localStorage` persistence. Each frontend app has its own `AuthContext`.

- Customer auth: email/phone + password, or Google OAuth
- Admin auth: email + password (admin role only)
- Vendor auth: email + password (vendor role only)
- All auth goes through `/api/auth/*` endpoints
- Tokens are Sanctum personal access tokens

## Notes

- **Local:** Run each app separately, no Docker
- **Production:** Each service is deployed independently to Railway/Vercel
- **Backend is Laravel 13** — see `backend/README.md` for backend-specific setup

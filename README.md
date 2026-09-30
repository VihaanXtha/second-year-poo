# Circuit Bazaar

A hardware marketplace built with Next.js 15, React 19, Tailwind CSS v4, and Laravel 13.

## Quick Start

Double-click `start.bat` in the project root. This launches all 5 services in separate windows:

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:3000   |
| Shop     | http://localhost:3003/shop |
| Admin    | http://localhost:3001   |
| Vendor   | http://localhost:3002   |
| Backend  | http://localhost:8000/api |

**Admin login:** admin@circuitbazaar.com / admin123

One Gmail can hold up to three separate accounts — one per space: **customer** (shop/frontend), **vendor** (vendor portal), **admin** (this panel) — all linked by the shared email. Each space has its own password; Google sign-in always lands in the customer space.

## Local Development (Manual)

Run each service in its own terminal:

```bash
# Terminal 1 - Backend (Laravel + SQLite, no MySQL needed)
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

## Database & File Storage

- **Database:** SQLite (single file at `backend/database/database.sqlite`)
- **Images & PDFs:** Stored locally in `backend/storage/app/public/`
- **Serve uploaded files:** Symlinked at `backend/public/storage/` -> `backend/storage/app/public/`
- **No cloud accounts needed** - Cloudinary/S3/Twilio credentials are left blank; the app falls back to local storage automatically

## Project Structure

```
circuit-bazaar/
  backend/       Laravel 13 API + SQLite database
  frontend/      Next.js 15 marketing site (port 3000)
  shop/          Next.js storefront (port 3003)
  admin/         React 19 + Vite admin dashboard (port 3001)
  vendor/        React 19 + Vite vendor portal (port 3002)
  start.bat      Double-click to launch all services
  stop.bat       Stops all running services
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, TypeScript
- **Admin/Vendor:** Vite, React 19, Tailwind CSS v4
- **Backend:** Laravel 13, PHP 8.4, SQLite, Sanctum API tokens

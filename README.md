# Circuit Bazaar

A hardware marketplace built with Next.js 15, React 19, Tailwind CSS v4, and Laravel 13.

## Quick Start

Two ways to run the whole stack. Both use the same ports, so run one at a time.

### Option A - Docker (MySQL + phpMyAdmin)

Double-click `start-docker.bat`: it starts Docker Desktop if needed, then runs `docker compose up --build`.
Stop it with `stop-docker.bat`.

| Service    | URL                       |
|------------|---------------------------|
| Frontend   | http://localhost:3000     |
| Shop       | http://localhost:3003     |
| Admin      | http://localhost:3001     |
| Vendor     | http://localhost:3002     |
| Backend    | http://localhost:8000/api |
| phpMyAdmin | http://localhost:8081     |
| MySQL      | localhost:3307 (root / root, database `circuit_bazaar`) |

Admin -> **Settings -> Open phpMyAdmin** opens http://localhost:8081 already logged in as root, on the `circuit_bazaar` database. See [Docker details](#docker-details).

### Option B - no Docker (SQLite)

Double-click `start.bat` in the project root. This launches all 5 services in separate windows:

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:3000   |
| Shop     | http://localhost:3003   |
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

## Docker details

`docker-compose.yml`, `backend/docker/` and the `.dockerignore` files are gitignored on purpose ("Docker local dev only") - Railway/Vercel build their own way.

- **MySQL is Docker-only.** `backend/.env` keeps `DB_CONNECTION=sqlite`. The compose file injects `DB_CONNECTION=mysql` and friends, and because Laravel builds its dotenv repository as *immutable*, real environment variables win over `.env`.
- **First boot:** the backend entrypoint waits for MySQL, runs `php artisan migrate --force`, then seeds the demo data **only when the database is empty** (`users` count = 0), so restarts never duplicate the catalog.
- **Uploads** still land in `backend/storage/app/public/` (bind-mounted) and are served as `/storage/...`; the entrypoint replaces the Windows `public/storage` junction with a real symlink when the container cannot use it.
- **Reset the database:** `docker compose down -v` (drops the `mysql_data` volume), then `start-docker.bat` again.
- **Added a package?** Rebuild that service - `docker compose build backend` / `admin` / `vendor` / `shop` / `frontend`. `vendor/` and `node_modules/` live in named volumes seeded from the image.
- **Ports match `start.bat`** (3000-3003, 8000), so no `.env`, CORS or callback URL needed changing.
- The first build downloads ~1.5 GB of images, so give it a few minutes.

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
  start-docker.bat   Docker stack: all 5 apps + MySQL + phpMyAdmin (see Docker details)
  stop-docker.bat    Stops the Docker stack (optionally wipes the MySQL volume)
  docker-compose.yml Docker stack definition (local-only, gitignored)
  backend/docker/    Backend Dockerfile, entrypoint, container php.ini (local-only)
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, TypeScript
- **Admin/Vendor:** Vite, React 19, Tailwind CSS v4
- **Backend:** Laravel 13, PHP 8.4, SQLite, Sanctum API tokens

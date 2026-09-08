# Circuit Bazaar — Tech Stack & Dependencies

> Complete map of every framework, library, service, and tool used across the codebase, including where it is connected and used.

---

## 1. Database

| Tool | Version / Config | Used In | Purpose |
|------|------------------|---------|---------|
| **SQLite** | `database/database.sqlite` (local) | `backend/.env` → `DB_CONNECTION=sqlite` | Primary database for local development |
| **MySQL** | 8.0 (Docker only) | `docker-compose.yml` → `mysql` service | Production / containerized environment |
| **Laravel Eloquent** | ORM | Entire backend (`app/Models/*`, controllers, seeders) | Database queries, models, relationships |
| **Laravel Migrations** | 31 migrations | `backend/database/migrations/` | Schema versioning |
| **Laravel Seeders** | 6 seeders | `backend/database/seeders/` | Initial data (admin, vendor, blog, jobs, testimonials) |
| **Laravel Sanctum** | Personal access tokens | `backend/app/Models/User.php`, `backend/routes/api.php` | API authentication tokens |
| **Laravel Cache (Database)** | `CACHE_STORE=database` | `backend/.env` | Query / route caching |
| **Laravel Session (Database)** | `SESSION_DRIVER=database` | `backend/.env` | User session storage |
| **Laravel Queue (Database)** | `QUEUE_CONNECTION=database` | `backend/.env`, `backend/config/queue.php` | Async job processing |

**Database Tables (via migrations):**
- `users`, `personal_access_tokens`, `password_reset_tokens`
- `cache`, `jobs`, `otp_codes`
- `vendor_stores`, `vendor_applications`
- `categories`, `products`
- `orders`, `order_items`, `payments`, `reviews`
- `blog_posts`, `job_postings`, `testimonials`
- `content_tables` (homepage slider, etc.)

---

## 2. Backend (Laravel 13 — `backend/`)

### Core Framework & Runtime
| Dependency | Version | Config File | Purpose |
|------------|---------|-------------|---------|
| **PHP** | ^8.3 | `backend/composer.json` | Runtime |
| **Laravel Framework** | ^13.8 | `backend/composer.json` | Backend framework |
| **Laravel Reverb** | `*` | `backend/composer.json`, `backend/config/reverb.php` | WebSocket broadcasting (real-time order updates, etc.) |
| **Laravel Sanctum** | `*` | `backend/composer.json` | API token authentication |
| **Laravel Socialite** | `*` | `backend/composer.json`, `backend/config/services.php` | OAuth (Google login) |
| **Laravel Tinker** | ^3.0 | `backend/composer.json` | REPL for debugging |

### External Services (Backend)
| Service | Env Variables | Config / Code | Used For |
|---------|---------------|---------------|----------|
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | `backend/.env`, `backend/app/Services/CloudinaryService.php` | Image uploads for products, vendors, blog posts |
| **Twilio** | `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` | `backend/.env`, `backend/app/Services/SmsService.php` | OTP SMS verification |
| **Google OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | `backend/.env`, `backend/config/services.php`, `backend/app/Http/Controllers/AuthController.php` | Social login |
| **Gmail SMTP** | `MAIL_HOST=smtp.gmail.com`, `MAIL_USERNAME`, `MAIL_PASSWORD` | `backend/.env`, `backend/config/mail.php` | Transactional emails (OTP, vendor credentials, order notifications) |
| **Payment Gateways** | No global env vars (configured per gateway) | `backend/app/Services/Payments/` | Order payments |
| — **eSewa** | — | `EsewaGateway.php` | Nepali payment gateway |
| — **Khalti** | — | `KhaltiGateway.php` | Nepali payment gateway |
| — **Stripe** | — | `StripeGateway.php` | International card payments |
| — **COD** | — | `CodGateway.php` | Cash on Delivery |
| **AWS S3** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET` (empty) | `backend/config/filesystems.php`, `backend/config/queue.php` | File storage fallback / queue driver (not actively used, credentials empty) |
| **Redis** | `REDIS_HOST=127.0.0.1`, `REDIS_PORT=6379` | `backend/.env`, `backend/config/database.php` | Cache / queue fallback (local Redis not running, using database fallback) |

### Backend Dev Tools
| Dependency | Version | Purpose |
|------------|---------|---------|
| **FakerPHP** | ^1.23 | Fake data for seeders |
| **Laravel Pail** | ^1.2.5 | Log streaming |
| **Laravel PAO** | ^1.0.6 | PHP AST optimization |
| **Laravel Pint** | ^1.27 | Code style fixer |
| **Mockery** | ^1.6 | Mocking in tests |
| **PHPUnit** | ^12.5.12 | Testing |

---

## 3. Frontend Apps

### 3.1 Main Frontend (`frontend/` — Next.js)
| Dependency | Version | Config File | Purpose |
|------------|---------|-------------|---------|
| **Next.js** | ^15.3.2 | `frontend/next.config.mjs` | React framework (App Router) |
| **React** | ^19.0.0 | `frontend/package.json` | UI library |
| **Tailwind CSS** | ^4.3.3 | `frontend/tailwind.config.cjs` | Utility-first CSS |
| **TypeScript** | ~5.8.2 | `frontend/tsconfig.json` | Type safety |
| **Framer Motion** | ^13.2.0 | `frontend/package.json` | Animations (`Hero.tsx` and other sections) |
| **Lucide React** | *(via framer-motion or direct)* | `frontend/package.json` | Icons |
| **PostCSS / Autoprefixer** | ^8.5.26 / ^10.5.4 | `frontend/postcss.config.mjs` | CSS processing |

**Where used:**
- `framer-motion` → `frontend/src/components/sections/Hero.tsx` (motion.div, useInView, useScroll, useTransform)
- `lucide-react` → `frontend/src/components/layout/Header.jsx` and icon components
- `next/link`, `next/navigation` → All pages for routing
- API calls → `frontend/src/utils/api.ts` → Backend `http://localhost:8000/api`

### 3.2 Shop (`shop/` — Next.js)
| Dependency | Version | Config File | Purpose |
|------------|---------|-------------|---------|
| **Next.js** | ^15.3.2 | `shop/next.config.mjs` | React framework |
| **React** | ^19.0.0 | `shop/package.json` | UI library |
| **Tailwind CSS** | ^4.3.3 | `shop/tailwind.config.cjs` | Utility-first CSS |
| **TypeScript** | ~5.8.2 | `shop/tsconfig.json` | Type safety |
| **Lucide React** | ^1.42.0 | `shop/package.json` | Icons |
| **PostCSS / Autoprefixer** | ^8.5.26 / ^10.5.4 | `shop/postcss.config.mjs` | CSS processing |

**Where used:**
- `lucide-react` → `shop/src/components/layout/Header.jsx` (Search, ShoppingBag, User, Heart, Globe, etc.)
- `next/link`, `next/navigation` → All shop pages
- API calls → `shop/src/utils/api.ts` → Backend `http://localhost:8000/api`

### 3.3 Admin (`admin/` — Vite + React)
| Dependency | Version | Config File | Purpose |
|------------|---------|-------------|---------|
| **Vite** | ^5.0.0 | `admin/vite.config.ts` | Build tool / dev server |
| **React** | ^19.0.0 | `admin/package.json` | UI library |
| **Tailwind CSS** | ^4.3.3 | `admin/tailwind.config.js` | Utility-first CSS |
| **TypeScript** | ~5.8.2 | `admin/tsconfig.json` | Type safety |
| **Lucide React** | ^1.31.0 | `admin/package.json` | Icons |
| **Recharts** | ^3.10.1 | `admin/package.json` | Charts / analytics dashboards |
| **@tailwindcss/vite** | ^4.3.3 | `admin/vite.config.ts` | Tailwind Vite plugin |
| **@vitejs/plugin-react** | ^5.0.0 | `admin/vite.config.ts` | React Vite plugin |

**Where used:**
- `lucide-react` → `admin/src/components/Header.tsx`, `DataTable.tsx`, `AdminsPage.tsx`, `BrandsPage.tsx`, `CourierPage.tsx`, `CustomersPage.tsx`, `Login.tsx`, `FaqPage.tsx`, `PageHeader.tsx`, `mockData.ts`
- `recharts` → `admin/src/pages/Analytics.tsx`, `admin/src/pages/SalesReports.tsx`
- API calls → `admin/src/utils/api.ts` → Backend `http://localhost:8000/api`

### 3.4 Vendor (`vendor/` — Vite + React)
| Dependency | Version | Config File | Purpose |
|------------|---------|-------------|---------|
| **Vite** | ^5.0.0 | `vendor/vite.config.ts` | Build tool / dev server |
| **React** | ^19.0.0 | `vendor/package.json` | UI library |
| **Tailwind CSS** | ^4.3.3 | `vendor/tailwind.config.js` | Utility-first CSS |
| **TypeScript** | ~5.8.2 | `vendor/tsconfig.json` | Type safety |
| **Lucide React** | ^1.31.0 | `vendor/package.json` | Icons |
| **Recharts** | ^3.10.1 | `vendor/package.json` | Charts / sales analytics |
| **@tailwindcss/vite** | ^4.3.3 | `vendor/vite.config.ts` | Tailwind Vite plugin |
| **@vitejs/plugin-react** | ^5.0.0 | `vendor/vite.config.ts` | React Vite plugin |

**Where used:**
- `lucide-react` → Vendor dashboard components
- `recharts` → Vendor analytics pages
- API calls → `vendor/src/utils/api.ts` → Backend `http://localhost:8000/api`

---

## 4. Infrastructure & DevOps

| Tool | Where Configured | Purpose |
|------|------------------|---------|
| **Docker** | `docker-compose.yml` | Container orchestration for production-like stack (MySQL, backend, Reverb, frontend, admin, vendor, shop) |
| **Docker Volumes** | `docker-compose.yml` → `mysql_data`, `backend_storage` | Persistent MySQL data and Laravel storage |
| **Docker Networks** | `docker-compose.yml` → `circuit-bazaar` | Bridge network for inter-service communication |
| **Nginx / Apache** | Not explicitly configured; Laravel `artisan serve` used locally | Local dev serving |
| **Git** | `.git/` | Version control |

---

## 5. Authentication & Security

| Mechanism | Implementation | Where |
|-----------|---------------|-------|
| **Sanctum Tokens** | `HasApiTokens` trait on `User` model | `backend/app/Models/User.php` |
| **Session Auth** | Laravel sessions (database driver) | `backend/.env` → `SESSION_DRIVER=database` |
| **Google OAuth** | Socialite | `backend/app/Http/Controllers/AuthController.php` → `googleRedirect()`, `googleCallback()` |
| **OTP (SMS)** | Twilio | `backend/app/Services/SmsService.php`, OTP routes |
| **OTP (Email)** | Gmail SMTP | `backend/app/Mail/OtpMail.php` |
| **CORS** | Custom middleware | `backend/app/Http/Middleware/Cors.php` |
| **Password Hashing** | Bcrypt (rounds 12) | `backend/.env` → `BCRYPT_ROUNDS=12` |
| **Must Change Password** | Migration + middleware | `backend/database/migrations/2026_09_07_000001_add_must_change_password_to_users_table.php` |

---

## 6. Real-Time / Broadcasting

| Tool | Config | Where Used |
|------|--------|------------|
| **Laravel Reverb** | `backend/config/reverb.php`, `backend/.env` | WebSocket server (`php artisan reverb:start`) |
| **Broadcast Events** | `backend/app/Events/OrderStatusUpdated.php` | Private channel broadcasting for order status changes |

---

## 7. File Storage & Media

| Tool | Purpose | Where |
|------|---------|-------|
| **Cloudinary** | Image uploads (products, vendors, banners, blog posts) | `backend/app/Services/CloudinaryService.php`, `ContentController::uploadImage()` |
| **Laravel Local Storage** | Fallback / local files | `backend/.env` → `FILESYSTEM_DISK=local` |
| **AWS S3** | Configured but not active (no credentials) | `backend/config/filesystems.php` |

---

## 8. Payment Processing

| Gateway | Files | Routes |
|---------|-------|--------|
| **eSewa** | `backend/app/Services/Payments/EsewaGateway.php` | `POST /api/payments/callback/esewa` |
| **Khalti** | `backend/app/Services/Payments/KhaltiGateway.php` | `POST /api/payments/callback/khalti` |
| **Stripe** | `backend/app/Services/Payments/StripeGateway.php` | `POST /api/payments/webhook/stripe` |
| **COD** | `backend/app/Services/Payments/CodGateway.php` | Handled in `PaymentService` |

---

## 9. Testing

| Tool | Purpose |
|------|---------|
| **PHPUnit** | Backend feature / unit tests (`backend/tests/`) |
| **Mockery** | Mocking dependencies in tests |
| **Pest** | Plugin enabled in composer config (not actively used based on file scan) |

---

## 10. Code Quality & Tooling

| Tool | Purpose |
|------|---------|
| **Laravel Pint** | PHP code style fixer |
| **TypeScript** | Frontend / admin / vendor / shop type checking (`tsc --noEmit`) |
| **ESLint / Prettier** | Not explicitly configured; Tailwind + PostCSS used |

---

## 11. Service URLs (Local Development)

| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:8000 | 8000 |
| Frontend | http://localhost:3000 | 3000 |
| Shop | http://localhost:3003 | 3003 |
| Admin | http://localhost:3001 | 3001 |
| Vendor | http://localhost:3002 | 3002 |
| Reverb (WebSocket) | http://localhost:8080 | 8080 |

---

## 12. Summary: What Talks to What

```
Frontend (Next.js:3000) ──┐
Shop (Next.js:3003) ──────┤
Admin (Vite:3001) ────────┤
Vendor (Vite:3002) ───────┤
                           ▼
                    Backend (Laravel:8000)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      SQLite DB      Cloudinary         Twilio
   (local dev)    (image uploads)    (SMS OTP)
          │                │                │
          └────────────────┼────────────────┘
                           │
                    Gmail SMTP
               (email OTP / notifications)
                           │
                    Google OAuth
                  (social login)
                           │
                Payment Gateways
              (eSewa / Khalti / Stripe / COD)
```

---

*Generated on 2026-09-08. Database: SQLite. All services running locally.*

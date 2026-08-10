# Circuit Bazaar — Architecture & Implementation Guide

> **Purpose:** This is the canonical reference for the Circuit Bazaar codebase. Future AI agents and developers should read THIS document first before making any changes. It contains the full architecture, API contracts, database schema, and everything needed to understand the system without reading every file.

---

## 1. SYSTEM OVERVIEW

Circuit Bazaar is a multi-role hardware marketplace for Nepal with three frontends and one backend:

| Service | Tech Stack | Port | Subdomain | Description |
|---------|-----------|------|-----------|-------------|
| **frontend** | Next.js 15 (App Router), React 19, Tailwind v4 | 3000 | `baseurl` | Public marketplace for customers |
| **admin** | Vite 5, React 19, Tailwind v4, Recharts | 3001 | `admin.*` | Admin dashboard for platform management |
| **vendor** | Vite 5, React 19, Tailwind v4, Recharts | 3002 | `vendor.*` | Vendor dashboard for store management |
| **backend** | Laravel 13, PHP 8.3+, Sanctum | 8000 | `api.*` | REST API with role-based access |
| **mysql** | MySQL 8.0 | 3306 (internal) | — | Primary database |

**All services are orchestrated by docker-compose behind an nginx reverse proxy.**

---

## 2. DIRECTORY STRUCTURE

```
second-year-poo/
├── docker-compose.yml       # Orchestrates nginx + frontend + admin + vendor + backend + mysql
├── ARCHITECTURE.md          # THIS FILE — read first!
├── README.md                # Quick-start guide
├── nginx/
│   └── nginx.conf           # Reverse proxy: routes subdomains to services
├── frontend/                # Next.js public marketplace
│   ├── Dockerfile
│   ├── next.config.mjs      # output: 'standalone' for Docker
│   ├── .env                 # NEXT_PUBLIC_API_URL=http://api.localhost
│   └── src/
│       ├── app/             # Next.js App Router (page.tsx, auth/*, explore/*)
│       ├── components/      # App.tsx, Header.tsx, ProductCatalog, modals, etc.
│       ├── context/
│       │   └── AuthContext.tsx  # Client-side auth (localStorage)
│       ├── data/
│       │   └── hardwareData.ts  # Mock product/vendor data
│       └── types.ts
├── admin/                   # Standalone Vite admin SPA
│   ├── Dockerfile
│   ├── index.html
│   └── src/
│       ├── App.tsx          # Admin shell with auth guard + role check
│       ├── main.tsx
│       ├── styles.css
│       ├── context/
│       │   └── AuthContext.tsx  # Admin auth (localStorage + role check)
│       ├── components/      # Sidebar, Header, StatCard, charts, tables
│       ├── pages/           # Login, Dashboard, Analytics, UsersPage, ProductsPage, OrdersPage
│       ├── data/
│       │   └── mockData.ts  # Only navItems (data now from backend)
│       └── types/
│           └── index.ts
├── vendor/                  # Standalone Vite vendor SPA
│   ├── Dockerfile
│   ├── index.html
│   └── src/
│       ├── App.tsx          # Vendor shell with auth guard + role check
│       ├── main.tsx
│       ├── styles.css
│       ├── context/
│       │   └── AuthContext.tsx  # Vendor auth (localStorage + role check)
│       ├── components/      # Sidebar, Header, StatCard, charts, tables
│       ├── pages/           # Login, Dashboard, Analytics, Orders, Inventory
│       ├── data/
│       │   └── mockData.ts  # Only navItems (data now from backend)
│       └── types/
│           └── index.ts
└── backend/                 # Laravel 13 REST API
    ├── Dockerfile
    ├── .env                 # SQLite locally, MySQL in Docker
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   │   ├── Controller.php      # Base controller
    │   │   │   ├── AuthController.php  # Auth endpoints (login, register, OTP, profile)
    │   │   │   ├── AdminController.php # Admin CRUD (users, vendors, products, orders, stats)
    │   │   │   ├── VendorController.php # Vendor CRUD (store, products, orders, sales)
    │   │   │   ├── ProductController.php # Public product browsing
    │   │   │   ├── OrderController.php  # Order placement and tracking
    │   │   │   └── ReviewController.php # Product reviews
    │   └── Models/
    │       ├── User.php       # role: customer|admin|vendor, status: active|inactive|banned
    │       ├── OtpCode.php    # Email/phone OTP codes
    │       ├── VendorStore.php # Vendor store profile
    │       ├── Category.php   # Product categories
    │       ├── Product.php    # Product listings
    │       ├── Order.php      # Orders
    │       ├── OrderItem.php  # Order line items
    │       ├── Review.php     # Product ratings
    │       └── Payment.php    # Payment records
    ├── routes/
    │   └── api.php            # All API routes with role middleware
    ├── database/
    │   ├── migrations/        # 11 migrations (users, otp_codes, vendor_stores, categories, products, orders, order_items, reviews, payments, etc.)
    │   └── seeders/
    │       └── DatabaseSeeder.php
    └── config/
        ├── auth.php           # Sanctum token driver
        ├── cors.php
        └── ...
```

---

## 3. REQUEST FLOW

### 3.1 Docker (Production-like)
```
Browser → nginx (port 80)
          ├── admin.* → admin:3001 (Vite preview)
          ├── vendor.* → vendor:3002 (Vite preview)
          ├── api.* → backend:8000 (Laravel)
          └── _ → frontend:3000 (Next.js)
```

### 3.2 Local Development
```bash
# Backend
cd backend && php artisan serve --port=8000

# Frontend
cd frontend && npm run dev -- --port 3000

# Admin
cd admin && npm run dev -- --port 3001

# Vendor
cd vendor && npm run dev -- --port 3002
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 Flow
1. Frontend/Admin/Vendor POST credentials to `/api/auth/login`
2. Backend validates, returns `user` object + Sanctum `token`
3. Client stores user in `localStorage` + token separately
4. Subsequent requests include `Authorization: Bearer <token>` header
5. Role checks enforced via `role:admin` or `role:vendor` middleware on backend

### 4.2 Role-Based Routing
- **Admin login** → role must be `admin` → redirects to `admin.localhost`
- **Vendor login** → role must be `vendor` → redirects to `vendor.localhost`
- **Customer login** → role is `customer` → stays on marketplace
- **Admin app** → shows login if not authenticated or role ≠ admin
- **Vendor app** → shows login if not authenticated or role ≠ vendor

---

## 5. BACKEND API ENDPOINTS

### 5.1 Public
| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/register` | AuthController | Register customer, sends OTP |
| POST | `/api/auth/verify-email-otp` | AuthController | Verify email OTP |
| POST | `/api/auth/resend-otp` | AuthController | Resend OTP |
| POST | `/api/auth/login` | AuthController | Login, returns token + user |
| POST | `/api/auth/forgot-password` | AuthController | Request password reset |
| POST | `/api/auth/reset-password` | AuthController | Reset password with OTP |
| POST | `/api/auth/check-email` | AuthController | Check email availability |
| GET | `/api/products` | ProductController | Browse active products |
| GET | `/api/products/{id}` | ProductController | View single product |
| GET | `/api/categories` | ProductController | List all categories |

### 5.2 Protected (auth:sanctum)
| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/logout` | AuthController | Revoke token |
| GET | `/api/auth/me` | AuthController | Current user |
| POST | `/api/auth/update-profile` | AuthController | Update profile |
| POST | `/api/orders` | OrderController | Place order |
| GET | `/api/orders` | OrderController | List my orders |
| GET | `/api/orders/{id}` | OrderController | View order |
| POST | `/api/reviews` | ReviewController | Submit review |

### 5.3 Admin (auth:sanctum + role:admin)
| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| GET | `/api/admin/stats` | AdminController | Platform stats |
| GET | `/api/admin/users` | AdminController | List users (paginated) |
| PATCH | `/api/admin/users/{id}/status` | AdminController | Ban/unban user |
| GET | `/api/admin/vendors` | AdminController | List vendors |
| POST | `/api/admin/vendors/{id}/verify` | AdminController | Verify vendor |
| POST | `/api/admin/vendors/{id}/suspend` | AdminController | Suspend vendor |
| GET | `/api/admin/products` | AdminController | List all products |
| DELETE | `/api/admin/products/{id}` | AdminController | Delete product |
| GET | `/api/admin/orders` | AdminController | List all orders |
| PATCH | `/api/admin/orders/{id}/status` | AdminController | Update order status |
| GET | `/api/admin/sales` | AdminController | Sales report |

### 5.4 Vendor (auth:sanctum + role:vendor)
| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| POST | `/api/vendor/store` | VendorController | Register vendor store |
| GET | `/api/vendor/store` | VendorController | Get my store |
| GET | `/api/vendor/products` | VendorController | List my products |
| POST | `/api/vendor/products` | VendorController | Create product |
| PUT | `/api/vendor/products/{id}` | VendorController | Update product |
| DELETE | `/api/vendor/products/{id}` | VendorController | Delete product |
| GET | `/api/vendor/orders` | VendorController | List orders with my products |
| PATCH | `/api/vendor/orders/{id}/status` | VendorController | Update order status |
| GET | `/api/vendor/sales` | VendorController | Vendor sales report |
| GET | `/api/vendor/reviews` | VendorController | Reviews for my products |

---

## 6. DATABASE SCHEMA

### 6.1 users
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| email | string UNIQUE | |
| email_verified_at | timestamp nullable | |
| phone | string nullable UNIQUE | |
| phone_verified_at | timestamp nullable | |
| password | string hashed | |
| role | enum(customer, admin, vendor) | default: customer |
| status | enum(active, inactive, banned) | default: active |
| remember_token | string nullable | |
| address | string nullable | |
| city | string nullable | |
| postal_code | string nullable | |
| country | string nullable | |
| timestamps | | |

### 6.2 vendor_stores
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK → users.id | |
| store_name | string | |
| description | text nullable | |
| logo | string nullable | |
| address | string nullable | |
| phone | string nullable | |
| verified | boolean | default: false |
| status | enum(pending, active, suspended) | default: pending |
| timestamps | | |

### 6.3 categories
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string UNIQUE | |
| timestamps | | |

### 6.4 products
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| vendor_store_id | FK → vendor_stores.id | |
| category_id | FK → categories.id | |
| name | string | |
| sku | string UNIQUE | |
| description | text nullable | |
| price | decimal(12,2) | |
| stock | integer | default: 0 |
| image | string nullable | |
| specs | json nullable | |
| status | enum(active, inactive, draft) | default: active |
| timestamps | | |

### 6.5 orders
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK → users.id | |
| order_number | string UNIQUE | |
| status | enum(pending, processing, shipped, delivered, cancelled) | default: pending |
| total | decimal(12,2) | |
| payment_method | enum(esewa, khalti, cod) | default: cod |
| payment_status | enum(pending, paid, failed) | default: pending |
| shipping_address | text | |
| shipping_city | string nullable | |
| shipping_phone | string nullable | |
| timestamps | | |

### 6.6 order_items
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | FK → orders.id | |
| product_id | FK → products.id | |
| vendor_store_id | FK → vendor_stores.id | |
| product_name | string | snapshot |
| product_sku | string | snapshot |
| unit_price | decimal(12,2) | snapshot |
| quantity | integer | |
| subtotal | decimal(12,2) | |
| timestamps | | |

### 6.7 reviews
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK → users.id | |
| product_id | FK → products.id | |
| vendor_store_id | FK → vendor_stores.id nullable | |
| rating | tinyint | 1-5 |
| comment | text nullable | |
| timestamps | | |
| unique | | user_id + product_id |

### 6.8 payments
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | FK → orders.id | |
| user_id | FK → users.id | |
| method | enum(esewa, khalti, cod) | default: cod |
| status | enum(pending, paid, failed, refunded) | default: pending |
| transaction_id | string nullable UNIQUE | |
| amount | decimal(12,2) | |
| payload | json nullable | gateway response |
| timestamps | | |

---

## 7. FRONTEND APPS

### 7.1 Admin App (`admin.*`)
- **Auth**: `src/context/AuthContext.tsx` — login/logout, stores token + user in localStorage
- **Login Page**: `src/pages/Login.tsx` — email/password, role check (admin only)
- **App Shell**: `src/App.tsx` — shows Login if not authenticated, otherwise sidebar + routed pages
- **Pages**: Dashboard, Analytics, UsersPage, ProductsPage, OrdersPage
- **Data**: All pages fetch from `/api/admin/*` or `/api/*` using `apiFetch` helper with Bearer token

### 7.2 Vendor App (`vendor.*`)
- **Auth**: `src/context/AuthContext.tsx` — login/logout, stores token + user in localStorage
- **Login Page**: `src/pages/Login.tsx` — email/password, role check (vendor only)
- **App Shell**: `src/App.tsx` — shows Login if not authenticated, otherwise sidebar + routed pages
- **Pages**: Dashboard, Analytics, Orders, Inventory
- **Data**: All pages fetch from `/api/vendor/*` using `apiFetch` helper with Bearer token

### 7.3 Marketplace Frontend (`baseurl`)
- **Auth**: `src/context/AuthContext.tsx` — login/signup/logout
- **Role-aware**: Header shows "Admin Dashboard" / "Vendor Dashboard" links based on user.role
- **Login redirect**: `/auth/login` redirects to `admin.localhost` or `vendor.localhost` based on role

---

## 8. CRITICAL FILES & GOTCHAS

### 8.1 docker-compose.yml
- Admin and vendor services need `VITE_API_URL=http://api.localhost`
- Backend context is `./backend`, Dockerfile COPY paths are relative

### 8.2 Backend Models
- **User** has `role` (customer/admin/vendor) and `status` (active/inactive/banned)
- **VendorStore** links to User, has `verified` and `status` (pending/active/suspended)
- **OrderItem** links to Order, Product, and VendorStore (for vendor-specific order filtering)

### 8.3 Role Middleware
- `app/Http/Middleware/RoleMiddleware.php` — `role:admin`, `role:vendor`
- Registered in `bootstrap/app.php` as middleware alias

### 8.4 Sanctum Token Auth
- All admin/vendor/customer API routes use `auth:sanctum`
- Tokens stored in `personal_access_tokens` table
- Frontends send `Authorization: Bearer <token>` header

---

## 9. ENVIRONMENT VARIABLES

### frontend/.env
```
NEXT_PUBLIC_API_URL=http://api.localhost
```

### admin/.env (via docker-compose)
```
VITE_API_URL=http://api.localhost
```

### vendor/.env (via docker-compose)
```
VITE_API_URL=http://api.localhost
```

### backend/.env (key values)
```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=circuit_bazaar
DB_USERNAME=circuit
DB_PASSWORD=circuit
```

---

## 10. TESTING COMMANDS

```bash
# Frontend type check
cd frontend; npx tsc --noEmit

# Frontend build
cd frontend; npm run build

# Admin type check
cd admin; npx tsc --noEmit

# Admin build
cd admin; npm run build

# Vendor type check
cd vendor; npx tsc --noEmit

# Vendor build
cd vendor; npm run build

# Backend tests
cd backend; php artisan test

# Backend routes list
cd backend; php artisan route:list

# Backend migrate
cd backend; php artisan migrate

# Full Docker stack
docker compose up --build

# Verify services
docker compose ps
```

---

## 11. SUBDOMAIN CONFIGURATION (hosts file)

For local testing with subdomains, add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 baseurl.localhost
127.0.0.1 admin.baseurl.localhost
127.0.0.1 vendor.baseurl.localhost
127.0.0.1 api.baseurl.localhost
```

Then access:
- Public: http://baseurl.localhost
- Admin: http://admin.baseurl.localhost
- Vendor: http://vendor.baseurl.localhost
- API: http://api.baseurl.localhost

---

## 12. CURRENT STATE (as of last update)

| Feature | Status |
|---------|--------|
| Backend auth API (login/register/OTP) | ✅ Works |
| Backend product/order/review/payment APIs | ✅ Implemented |
| Admin dashboard login + role check | ✅ Works |
| Admin dashboard real data from backend | ✅ Implemented |
| Vendor dashboard login + role check | ✅ Works |
| Vendor dashboard real data from backend | ✅ Implemented |
| Frontend role-aware navigation | ✅ Implemented |
| Database migrations for all models | ✅ Implemented |
| Docker-compose with all services | ✅ Works |

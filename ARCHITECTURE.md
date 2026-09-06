# Circuit Bazaar — Architecture & Implementation Guide

> **Purpose:** This is the canonical reference for the Circuit Bazaar codebase. Future AI agents and developers should read THIS document first before making any changes. It contains the full architecture, API contracts, database schema, and everything needed to understand the system without reading every file.

---

## 1. SYSTEM OVERVIEW

Circuit Bazaar is a multi-role hardware marketplace for Nepal with three frontends and one backend:

| Service | Tech Stack | Port | URL | Description |
|---------|-----------|------|-----|-------------|
| **frontend** | Next.js 15 (App Router), React 19, Tailwind v4 | 3000 | http://localhost:3000 | Public marketplace for customers |
| **admin** | Vite 5, React 19, Tailwind v4, Recharts | 3001 | http://localhost:3001 | Admin dashboard for platform management |
| **vendor** | Vite 5, React 19, Tailwind v4, Recharts | 3002 | http://localhost:3002 | Vendor dashboard for store management |
| **shop** | Next.js 15 (App Router), React 19, Tailwind v4 | 3003 | http://localhost:3003 | Shop frontend for authenticated users |
| **backend** | Laravel 13, PHP 8.3+, Sanctum | 8000 | http://localhost:8000 | REST API with role-based access |
| **mysql** | MySQL 8.0 | 3306 | localhost:3306 | Primary database |

**Each service runs independently. No Docker. No reverse proxy.**

---

## 2. DIRECTORY STRUCTURE

```
second-year-poo/
├── ARCHITECTURE.md          # THIS FILE — read first!
├── README.md                # Quick-start guide
├── SYSTEM_FLOW.md           # Master system flow diagram
├── FLOW_OF_FRONTEND.md      # Frontend app detailed flow
├── FLOW_OF_SHOP.md          # Shop app detailed flow
├── FLOW_OF_ADMIN.md         # Admin dashboard detailed flow
├── FLOW_OF_VENDOR.md        # Vendor dashboard detailed flow
├── FLOW_OF_BACKEND.md       # Backend API detailed flow
├── frontend/                # Next.js public marketplace
│   ├── .env                 # NEXT_PUBLIC_API_URL=http://localhost:8000/api
│   └── src/
│       ├── app/             # Next.js App Router (page.tsx, auth/*, explore/*)
│       ├── components/      # UI components
│       ├── context/
│       │   └── AuthContext.tsx  # Client-side auth (localStorage)
│       ├── lib/
│       │   └── api.ts       # API client
│       └── types.ts
├── shop/                    # Next.js shop frontend
│   ├── .env                 # NEXT_PUBLIC_API_URL=http://localhost:8000/api
│   └── src/
│       ├── app/             # Next.js App Router
│       ├── components/      # UI components
│       ├── context/
│       │   └── AuthContext.tsx  # Shop auth (localStorage + URL token)
│       ├── lib/
│       │   └── api.ts       # API client
│       └── types.ts
├── admin/                   # Vite admin SPA
│   ├── .env                 # VITE_API_URL=http://localhost:8000/api
│   └── src/
│       ├── App.tsx          # Admin shell with auth guard + role check
│       ├── main.tsx
│       ├── styles.css
│       ├── context/
│       │   └── AuthContext.tsx  # Admin auth (localStorage + role check)
│       ├── components/      # Sidebar, Header, StatCard, charts, tables
│       ├── pages/           # Login, Dashboard, Analytics, etc.
│       └── types/
├── vendor/                  # Vite vendor SPA
│   ├── .env                 # VITE_API_URL=http://localhost:8000/api
│   └── src/
│       ├── App.tsx          # Vendor shell with auth guard + role check
│       ├── main.tsx
│       ├── styles.css
│       ├── context/
│       │   └── AuthContext.tsx  # Vendor auth (localStorage + role check)
│       ├── components/      # Sidebar, Header, StatCard, charts, tables
│       ├── pages/           # Login, Dashboard, Analytics, etc.
│       └── types/
└── backend/                 # Laravel 13 REST API
    ├── .env                 # MySQL config, API keys, etc.
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   │   ├── Controller.php      # Base controller
    │   │   │   ├── AuthController.php  # Auth endpoints (login, register, OTP, Google)
    │   │   │   ├── AdminController.php # Admin CRUD
    │   │   │   ├── VendorController.php # Vendor CRUD
    │   │   │   ├── ProductController.php # Public product browsing
    │   │   │   ├── OrderController.php  # Order placement and tracking
    │   │   │   └── ReviewController.php # Product reviews
    │   │   └── Middleware/
    │   │       └── RoleMiddleware.php   # role:admin, role:vendor
    │   └── Models/
    │       ├── User.php       # role: customer|admin|vendor
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
    │   ├── migrations/        # Database schema migrations
    │   └── seeders/           # Database seeders
    └── config/
        ├── auth.php           # Sanctum token driver
        ├── cors.php
        ├── services.php       # Third-party service config (Google, SMS)
        └── ...
```

---

## 3. REQUEST FLOW

### 3.1 Local Development

```
Browser
├── http://localhost:3000 → Frontend (Next.js)
├── http://localhost:3003 → Shop (Next.js)
├── http://localhost:3001 → Admin (Vite)
├── http://localhost:3002 → Vendor (Vite)
└── http://localhost:8000/api → Backend (Laravel)
```

### 3.2 API Call Chain

```
Frontend/Shop/Admin/Vendor
    ↓
http://localhost:8000/api/{endpoint}
    ↓
Laravel Backend
    ↓
MySQL (localhost:3306)
```

### 3.3 Authentication Flow

```
1. User enters credentials in any frontend
2. Frontend POSTs to /api/auth/login
3. Backend validates credentials
4. Backend returns user object + Sanctum token
5. Frontend stores:
   - user object in localStorage (app-specific key)
   - token in localStorage (app-specific key)
6. Subsequent requests include: Authorization: Bearer <token>
7. Backend middleware validates token + role
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 Auth Context per App

| App | Storage Key | Token Key | Role Check |
|-----|-------------|-----------|------------|
| frontend | `circuit-bazaar-auth` | `circuit-bazaar-token` | customer |
| shop | `shop-auth` | `shop-token` | customer |
| admin | `admin-auth` | `admin-token` | admin |
| vendor | `vendor-auth` | `vendor-token` | vendor |

### 4.2 Role-Based Routing

- **Admin login** → role must be `admin` → stays on admin app
- **Vendor login** → role must be `vendor` → stays on vendor app
- **Customer login** → role is `customer` → stays on frontend/shop
- **Google OAuth** → creates/finds user, redirects to shop app

### 4.3 Registration Flow

```
Step 1: Name + Email/Phone choice + Password
    ↓
Step 2: OTP verification (email or phone)
    ↓
Step 3: Address (Nepal address picker) — required
    ↓
Step 4: Mandatory phone verification (if not already verified)
    ↓
Complete → Redirect to shop with token
```

---

## 5. BACKEND API ENDPOINTS

### 5.1 Public
| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/register` | AuthController | Register customer, sends OTP |
| POST | `/api/auth/verify-email-otp` | AuthController | Verify email OTP |
| POST | `/api/auth/send-phone-otp` | AuthController | Send phone OTP |
| POST | `/api/auth/verify-phone-otp` | AuthController | Verify phone OTP |
| POST | `/api/auth/resend-otp` | AuthController | Resend OTP |
| POST | `/api/auth/login` | AuthController | Login, returns token + user |
| POST | `/api/auth/forgot-password` | AuthController | Request password reset |
| POST | `/api/auth/reset-password` | AuthController | Reset password with OTP |
| POST | `/api/auth/check-email` | AuthController | Check email availability |
| GET | `/api/products` | ProductController | Browse active products |
| GET | `/api/products/{id}` | ProductController | View single product |
| GET | `/api/categories` | ProductController | List all categories |
| GET | `/api/blog` | ContentController | Published blog posts |
| GET | `/api/job-postings` | JobPostingController | Active job postings |

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
| POST | `/api/vendor/apply` | VendorApplicationController | Apply as vendor |
| POST | `/api/vendor/verify-otp` | VendorApplicationController | Verify vendor application OTP |
| POST | `/api/vendor/resend-otp` | VendorApplicationController | Resend vendor OTP |
| GET | `/api/vendor/dashboard/stats` | VendorController | Dashboard stats |
| GET | `/api/vendor/products` | VendorController | List my products |
| POST | `/api/vendor/products` | VendorController | Create product |
| PUT | `/api/vendor/products/{id}` | VendorController | Update product |
| DELETE | `/api/vendor/products/{id}` | VendorController | Delete product |
| GET | `/api/vendor/orders` | VendorController | List orders with my products |
| PATCH | `/api/vendor/orders/{id}/status` | VendorController | Update order status |
| GET | `/api/vendor/sales` | VendorController | Vendor sales report |
| GET | `/api/vendor/reviews` | VendorController | Reviews for my products |

### 5.5 Google OAuth
| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| GET | `/api/auth/google/redirect` | AuthController | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | AuthController | Google OAuth callback |

---

## 6. DATABASE SCHEMA

### 6.1 users
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| email | string nullable UNIQUE | Required for email channel |
| email_verified_at | timestamp nullable | |
| phone | string nullable UNIQUE | Required for phone channel |
| phone_verified_at | timestamp nullable | |
| password | string hashed | |
| google_id | string nullable UNIQUE | Google OAuth ID |
| role | enum(customer, admin, vendor) | default: customer |
| status | enum(active, inactive, banned) | default: active |
| address | string nullable | |
| city | string nullable | |
| province | string nullable | Nepal province |
| district | string nullable | Nepal district |
| municipality | string nullable | Nepal municipality |
| ward | string nullable | Nepal ward |
| postal_code | string nullable | |
| country | string nullable | |
| remember_token | string nullable | |
| timestamps | | |

### 6.2 otp_codes
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK → users.id nullable | |
| email | string nullable | |
| phone | string nullable | |
| code | string(6) | 6-digit OTP |
| type | enum(email_verification, phone_verification, password_reset, vendor_application) | |
| verified_at | timestamp nullable | |
| expires_at | timestamp | 5 minutes from creation |
| timestamps | | |

### 6.3 vendor_stores
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK → users.id | |
| store_name | string | |
| store_slug | string UNIQUE | |
| description | text nullable | |
| logo_url | string nullable | |
| banner_url | string nullable | |
| address | string nullable | |
| phone | string nullable | |
| verified | boolean | default: false |
| status | enum(pending, active, suspended) | default: pending |
| rating | decimal(3,2) nullable | |
| total_products | integer | default: 0 |
| total_orders | integer | default: 0 |
| total_revenue | decimal(12,2) | default: 0 |
| pan_number | string nullable | |
| country | string nullable | |
| province | string nullable | |
| district | string nullable | |
| municipality | string nullable | |
| ward | string nullable | |
| postal_code | string nullable | |
| experience | string nullable | |
| website | string nullable | |
| timestamps | | |

### 6.4 categories
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string UNIQUE | |
| spec_schema | json nullable | Product specification schema |
| timestamps | | |

### 6.5 products
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

### 6.6 orders
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

### 6.7 order_items
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

### 6.8 reviews
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

### 6.9 payments
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

### 6.10 vendor_applications
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| full_name | string | |
| email | string | |
| phone | string nullable | |
| store_name | string | |
| description | text nullable | |
| website | string nullable | |
| pan_number | string | |
| address | string nullable | |
| country | string nullable | |
| province | string nullable | |
| district | string nullable | |
| municipality | string nullable | |
| ward | string nullable | |
| postal_code | string nullable | |
| experience | string nullable | |
| otp_code | string(6) | |
| otp_expires_at | timestamp | |
| otp_verified_at | timestamp nullable | |
| status | enum(pending, verified, rejected) | default: pending |
| timestamps | | |

### 6.11 blog_posts
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| title | string | |
| slug | string UNIQUE | |
| cover_image | string nullable | |
| body | text | |
| category | string nullable | |
| author | string nullable | |
| published_at | datetime nullable | |
| is_published | boolean | default: false |
| timestamps | | |

### 6.12 job_postings
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| title | string | |
| slug | string UNIQUE | |
| department | string | |
| location | string | |
| employment_type | string | |
| description | text | |
| responsibilities | text nullable | |
| requirements | json nullable | |
| benefits | json nullable | |
| application_deadline | datetime nullable | |
| is_active | boolean | default: true |
| timestamps | | |

### 6.13 testimonials
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string UNIQUE | |
| role | string nullable | |
| company | string nullable | |
| content | text | |
| photo | string nullable | |
| rating | tinyint | 1-5 |
| is_published | boolean | default: false |
| timestamps | | |

---

## 7. FRONTEND APPS

### 7.1 Admin App (http://localhost:3001)
- **Auth**: `src/context/AuthContext.tsx` — login/logout, stores token + user in localStorage
- **Login Page**: `src/pages/Login.tsx` — email/password, role check (admin only)
- **App Shell**: `src/App.tsx` — shows Login if not authenticated, otherwise sidebar + routed pages
- **Pages**: Dashboard, Analytics, UsersPage, ProductsPage, OrdersPage, Settings
- **Data**: All pages fetch from `/api/admin/*` or `/api/*` using `apiFetch` helper with Bearer token

### 7.2 Vendor App (http://localhost:3002)
- **Auth**: `src/context/AuthContext.tsx` — login/logout, stores token + user in localStorage
- **Login Page**: `src/pages/Login.tsx` — email/password, role check (vendor only), forgot/reset password
- **App Shell**: `src/App.tsx` — shows Login if not authenticated, otherwise sidebar + routed pages
- **Pages**: Dashboard, Store, Products, Orders, Sales, Analytics, Reviews
- **Data**: All pages fetch from `/api/vendor/*` using `apiFetch` helper with Bearer token

### 7.3 Shop App (http://localhost:3003)
- **Auth**: `src/context/AuthContext.tsx` — login/logout, stores token + user in localStorage
- **Auth Callback**: `src/app/auth/callback/page.tsx` — handles Google OAuth redirect with token in URL
- **Account Page**: `src/app/account/page.tsx` — user profile and orders
- **Data**: Fetches from `/api/*` using `apiClient` with Bearer token

### 7.4 Marketplace Frontend (http://localhost:3000)
- **Auth**: `src/context/AuthContext.tsx` — signup/login/logout with email/phone/Google
- **Register Flow**: Multi-step (name → channel → password → OTP → address → phone verification)
- **Login Flow**: Email/phone + password, or Google OAuth
- **Forgot/Reset Password**: Email OTP-based password reset
- **Pages**: Home, Products, Blog, Career, Testimonials, Courier, Vendor, Shop, Login, Register
- **Data**: Fetches from `/api/*` using `apiClient` with Bearer token

---

## 8. CRITICAL FILES & GOTCHAS

### 8.1 Backend .env
- MySQL credentials must match local MySQL installation
- `DB_HOST=127.0.0.1` for local MySQL
- `MAIL_USERNAME` and `MAIL_PASSWORD` for Gmail SMTP (OTP emails)
- `KUSHASMS_TOKEN` for SMS OTP (Nepal numbers)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth

### 8.2 Frontend .env
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `NEXT_PUBLIC_SHOP_URL=http://localhost:3003`

### 8.3 Admin .env
- `VITE_API_URL=http://localhost:8000/api`

### 8.4 Vendor .env
- `VITE_API_URL=http://localhost:8000/api`

### 8.5 Shop .env
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `NEXT_PUBLIC_SHOP_URL=http://localhost:3003`

### 8.6 OTP System
- All OTPs expire in 5 minutes (constant: `OTP_EXPIRY_MINUTES = 5`)
- Email OTP sent via Gmail SMTP
- Phone OTP sent via KushaSMS API (default) or SMSKIT fallback
- OTP types: `email_verification`, `phone_verification`, `password_reset`, `vendor_application`

### 8.7 Phone Verification Gate
- `phone_verified_at` is the hard gate for login
- Users cannot log in if `phone_verified_at` is null
- Google-authenticated users must also verify phone before full access

### 8.8 Google OAuth
- Backend handles OAuth flow via Socialite
- Google callback redirects to shop app with token in URL query params
- Shop app reads token from URL and stores in localStorage

---

## 9. ENVIRONMENT VARIABLES

### frontend/.env
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SHOP_URL=http://localhost:3003
```

### shop/.env
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SHOP_URL=http://localhost:3003
```

### admin/.env
```
VITE_API_URL=http://localhost:8000/api
```

### vendor/.env
```
VITE_API_URL=http://localhost:8000/api
```

### backend/.env (key values)
```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=circuit_bazaar
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@circuitbazaar.com
MAIL_FROM_NAME="Circuit Bazaar"

KUSHASMS_TOKEN=your-kushasms-token

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=${APP_URL}/api/auth/google/callback
```

---

## 10. TESTING COMMANDS

```bash
# Frontend type check
cd frontend; npx tsc --noEmit

# Frontend build
cd frontend; npm run build

# Shop type check
cd shop; npx tsc --noEmit

# Shop build
cd shop; npm run build

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
cd backend; php artisan migrate --force

# Backend seed
cd backend; php artisan db:seed --force
```

---

## 11. MYSQL SETUP

### Install MySQL on Windows

1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Install "MySQL Server" and "MySQL Shell"
3. During setup, set root password (or leave empty)
4. Start MySQL service from Windows Services or MySQL Workbench

### Create Database

```sql
CREATE DATABASE IF NOT EXISTS circuit_bazaar;
```

### Update backend/.env

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=circuit_bazaar
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

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
| Vendor forgot/reset password | ✅ Works |
| Frontend role-aware navigation | ✅ Works |
| Frontend multi-step registration | ✅ Works |
| Frontend forgot/reset password | ✅ Works |
| Shop app with auth callback | ✅ Works |
| Google OAuth integration | ✅ Works |
| KushaSMS integration | ✅ Works |
| Database migrations for all models | ✅ Works |
| No Docker — local development only | ✅ Works |

---

## 13. QUICK REFERENCE

### Default Credentials (seeded)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@circuitbazaar.com | admin123 |
| Vendor | vendor@circuitbazaar.com | vendor123 |

### API Base URL
```
http://localhost:8000/api
```

### CORS
Backend `config/cors.php` allows origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- `http://localhost:3003`

# System Flow — Circuit Bazaar

This document shows how all apps connect and interact. Read this after `ARCHITECTURE.md`.

---

## 1. Service Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR LAPTOP                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Frontend   │  │     Shop     │  │    Admin     │  │  Vendor  │ │
│  │  :3000       │  │  :3003       │  │  :3001       │  │  :3002   │ │
│  │  Next.js 15  │  │  Next.js 15  │  │  Vite 5      │  │  Vite 5 │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                  │                  │                │       │
│         └──────────────────┼──────────────────┼────────────────┘       │
│                            │                  │                       │
│                    ┌───────▼──────────────────▼───────┐               │
│                    │     Backend API :8000            │               │
│                    │     Laravel 13 + Sanctum         │               │
│                    └───────┬──────────────────┬───────┘               │
│                            │                  │                       │
│                    ┌───────▼───────┐  ┌───────▼───────┐               │
│                    │    MySQL     │  │     Redis     │               │
│                    │   :3306      │  │   :6379       │               │
│                    └──────────────┘  └───────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow: User Registration (Email Channel)

```
User on Frontend (localhost:3000)
    │
    ▼
1. Fills Step 1: Name + Email + Password
    │
    ▼
2. POST /api/auth/register { name, email, password, channel: "email" }
    │
    ▼
Backend: Creates user, sends OTP email via Gmail SMTP
    │
    ▼
3. User enters 6-digit OTP
    │
    ▼
4. POST /api/auth/verify-email-otp { email, code }
    │
    ▼
5. Backend marks email_verified_at
    │
    ▼
6. User continues to Address step (NepalAddressPicker)
    │
    ▼
7. POST /api/auth/update-profile { email, address, city, ... }
    │
    ▼
8. User verifies phone number
    │
    ▼
9. POST /api/auth/send-phone-otp { user_id }
    │   Backend sends SMS via KushaSMS
    ▼
10. User enters phone OTP
    │
    ▼
11. POST /api/auth/verify-phone-otp { user_id, code }
    │   Backend marks phone_verified_at + returns Sanctum token
    ▼
12. Frontend stores token + user in localStorage
    │
    ▼
13. User is now fully registered and logged in
```

---

## 3. Data Flow: User Registration (Phone Channel)

```
User on Frontend (localhost:3000)
    │
    ▼
1. Fills Step 1: Name + Phone + Password
    │
    ▼
2. POST /api/auth/register { name, phone, password, channel: "phone" }
    │
    ▼
3. Backend creates user, sends phone OTP via KushaSMS
    │
    ▼
4. User enters 6-digit phone OTP
    │
    ▼
5. POST /api/auth/verify-phone-otp { user_id, code }
    │   Backend marks phone_verified_at + returns Sanctum token
    ▼
6. User continues to Address step
    │
    ▼
7. POST /api/auth/update-profile { phone, address, city, ... }
    │
    ▼
8. Registration complete. Email remains unverified.
```

---

## 4. Data Flow: Google OAuth Registration

```
User on Frontend (localhost:3000)
    │
    ▼
1. Clicks "Continue with Google"
    │
    ▼
2. GET /api/auth/google/redirect
    │   Backend redirects to Google OAuth consent screen
    ▼
3. User approves on Google
    │
    ▼
4. Google redirects to /api/auth/google/callback
    │   Backend receives Google user info
    ▼
5. Backend finds or creates user by google_id or email
    │
    ▼
6. Since email is verified by Google, skip to Address step
    │
    ▼
7. User must verify phone (mandatory for all users)
    │
    ▼
8. POST /api/auth/send-phone-otp + POST /api/auth/verify-phone-otp
    │
    ▼
9. Backend redirects to Shop app (localhost:3003) with token in URL
    │
    ▼
10. Shop app reads token from URL, stores in localStorage
    │
    ▼
11. User is logged in on Shop app
```

---

## 5. Data Flow: Login

```
User on any frontend (localhost:3000, 3001, 3002, 3003)
    │
    ▼
1. Enters identifier (email or phone) + password
    │
    ▼
2. POST /api/auth/login { identifier, password }
    │
    ▼
3. Backend checks:
    │   - User exists?
    │   - Password matches?
    │   - phone_verified_at is not null?  ← HARD GATE
    │
    ▼
4. If phone_verified_at is null:
    │   Return 403 with requires_phone_verification = true
    │   Frontend shows phone verification flow
    ▼
5. If phone_verified_at is set:
    │   Return user + Sanctum token
    ▼
6. Frontend stores token + user in localStorage
    │
    ▼
7. User accesses protected routes
```

---

## 6. Data Flow: Admin Dashboard

```
Admin opens http://localhost:3001
    │
    ▼
1. Admin login page
    │
    ▼
2. POST /api/auth/login { email: admin@circuitbazaar.com, password }
    │
    ▼
3. Backend validates role = 'admin'
    │
    ▼
4. AdminContext stores user + token
    │
    ▼
5. App.tsx routes to Dashboard
    │
    ▼
6. Dashboard calls:
    │   GET /api/admin/stats
    │   GET /api/admin/users
    │   GET /api/admin/vendors
    │   GET /api/admin/products
    │   GET /api/admin/orders
    │
    ▼
7. Backend returns data with auth:sanctum + role:admin middleware
    │
    ▼
8. Admin sees charts, tables, action buttons
```

---

## 7. Data Flow: Vendor Dashboard

```
Vendor opens http://localhost:3002
    │
    ▼
1. Vendor login page
    │
    ▼
2. POST /api/auth/login { email: vendor@circuitbazaar.com, password }
    │
    ▼
3. Backend validates:
    │   - role = 'vendor'
    │   - VendorStore exists
    │   - VendorStore.verified = true
    │   - VendorStore.status = 'active'
    │
    ▼
4. VendorContext stores user + store + token
    │
    ▼
5. App.tsx routes to Dashboard
    │
    ▼
6. Dashboard calls:
    │   GET /api/vendor/dashboard/stats
    │   GET /api/vendor/products
    │   GET /api/vendor/orders
    │   GET /api/vendor/sales
    │
    ▼
7. Backend returns data with auth:sanctum + role:vendor middleware
    │
    ▼
8. Vendor sees charts, tables, action buttons
```

---

## 8. Data Flow: Shop App

```
User arrives at Shop (http://localhost:3003)
    │
    ▼
1. Shop AuthContext checks localStorage for token
    │
    ▼
2. If no token → show login/register options
    │   If token exists → show account page
    ▼
3. Google OAuth flow:
    │   GET /api/auth/google/redirect
    │   → Google consent screen
    │   → /api/auth/google/callback
    │   → Redirect back to shop with ?token=xxx&user_id=xxx
    ▼
4. Shop reads token from URL query params
    │   Stores in localStorage
    ▼
5. User can browse products, place orders
    │
    ▼
6. Authenticated requests include:
    │   Authorization: Bearer <token>
    ▼
7. Backend validates token via Sanctum
```

---

## 9. Data Flow: Password Reset

```
User on Frontend (localhost:3000)
    │
    ▼
1. Clicks "Forgot password"
    │
    ▼
2. Enters email on /forgot-password
    │
    ▼
3. POST /api/auth/forgot-password { email }
    │   Backend sends OTP email via Gmail SMTP
    ▼
4. User receives email with 6-digit OTP
    │
    ▼
5. Enters OTP + new password on /reset-password
    │
    ▼
6. POST /api/auth/reset-password { email, code, password }
    │   Backend verifies OTP, updates password
    ▼
7. Redirect to login page
```

---

## 10. Data Flow: Vendor Application

```
User on Frontend (localhost:3000)
    │
    ▼
1. Fills vendor application form
    │
    ▼
2. POST /api/vendor/apply { full_name, email, store_name, ... }
    │   Backend creates VendorApplication, sends OTP email
    ▼
3. User enters OTP
    │
    ▼
4. POST /api/vendor/verify-otp { email, code }
    │   Backend creates User (role: vendor) + VendorStore
    │   Sends credentials email to vendor
    ▼
5. Admin reviews application in Admin dashboard
    │
    ▼
6. Admin verifies store:
    │   POST /api/admin/vendors/{id}/verify
    ▼
7. Vendor can now log in at http://localhost:3002
```

---

## 11. Inter-App Communication

| From | To | Method | Purpose |
|------|----|--------|---------|
| Frontend | Backend | HTTP/REST | All API calls |
| Shop | Backend | HTTP/REST | All API calls |
| Admin | Backend | HTTP/REST | All API calls |
| Vendor | Backend | HTTP/REST | All API calls |
| Backend | Gmail SMTP | SMTP | OTP emails |
| Backend | KushaSMS | HTTP | SMS OTP |
| Backend | Google OAuth | OAuth 2.0 | Google sign-in |

---

## 12. Token Lifecycle

```
Login/Register
    │
    ▼
Backend creates Sanctum personal_access_token
    │
    ▼
Token returned to frontend
    │
    ▼
Frontend stores in localStorage
    │
    ▼
Every API request includes:
    Authorization: Bearer <token>
    │
    ▼
Backend middleware validates token
    │
    ▼
Logout
    │
    ▼
Frontend deletes token from localStorage
    Backend deletes token from database
```

---

## 13. State Management

| App | State | Storage |
|-----|-------|---------|
| Frontend | User, token, cart, favorites | localStorage + React state |
| Shop | User, token, cart, orders | localStorage + React state |
| Admin | User, token, sidebar collapsed | localStorage + React state |
| Vendor | User, store, token, sidebar collapsed | localStorage + React state |
| Backend | Sessions, cache, queues | Database + Redis |

---

## 14. CORS Configuration

Backend `config/cors.php` allows:
- `http://localhost:3000` (frontend)
- `http://localhost:3001` (admin)
- `http://localhost:3002` (vendor)
- `http://localhost:3003` (shop)

All origins allowed in local development for flexibility.

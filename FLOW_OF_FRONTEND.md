# Flow of Frontend — Circuit Bazaar

This document details the complete flow of the Frontend app (http://localhost:3000).

---

## 1. App Structure

```
frontend/src/
├── app/
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Homepage
│   ├── login/page.tsx       # Login
│   ├── register/page.tsx    # Multi-step registration
│   ├── forgot-password/page.tsx  # Request password reset
│   ├── reset-password/page.tsx   # Reset password with OTP
│   ├── shop/page.tsx        # Redirects to shop app
│   ├── products/page.tsx    # Product listing
│   ├── products/[id]/page.tsx  # Product detail
│   ├── blogs/page.tsx       # Blog listing
│   ├── blogs/[slug]/page.tsx   # Blog detail
│   ├── career/page.tsx      # Job listings
│   ├── testimonials/page.tsx   # Customer testimonials
│   ├── courier/page.tsx     # Courier information
│   ├── vendor/page.tsx      # Vendor application info
│   └── explore/page.tsx     # Explore products
├── components/
│   ├── sections/
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Hero.tsx         # Homepage hero
│   │   ├── ProductCatalog.tsx
│   │   ├── BlogSection.tsx
│   │   ├── CareerSection.tsx
│   │   ├── TestimonialSection.tsx
│   │   └── ...
│   └── NepalAddressPicker.tsx
├── context/
│   └── AuthContext.tsx      # Authentication state management
├── lib/
│   └── api.ts               # API client
└── types.ts                 # TypeScript interfaces
```

---

## 2. Authentication Flow

### 2.1 Login Flow

```
User visits /login
    │
    ▼
Login form: email/phone + password
    │
    ▼
POST /api/auth/login { identifier, password }
    │
    ▼
Backend validates:
    - User exists
    - Password matches
    - phone_verified_at is not null
    │
    ▼
If phone_verified_at is null:
    Return 403 + requires_phone_verification = true
    Frontend shows phone verification modal/flow
    │
    ▼
If valid:
    Return user + token
    │
    ▼
AuthContext stores:
    - user in localStorage (key: circuit-bazaar-auth)
    - token in localStorage (key: circuit-bazaar-token)
    │
    ▼
Header updates to show user menu
```

### 2.2 Registration Flow (4 Steps)

```
User visits /register
    │
    ▼
STEP 1: Identity
    - Full Name
    - Channel selection: Email or Phone (toggle)
    - Identifier input (email or phone based on channel)
    - Password + Confirm Password
    │
    ▼
POST /api/auth/register { name, email/phone, password, channel }
    │
    ▼
Backend creates user, sends OTP
    │
    ▼
STEP 2: OTP Verification
    - Shows 6-digit OTP input
    - Resend button (60s cooldown)
    │
    ▼
POST /api/auth/verify-email-otp OR /api/auth/send-phone-otp + verify-phone-otp
    │
    ▼
Backend marks email_verified_at or phone_verified_at
    │
    ▼
STEP 3: Address
    - NepalAddressPicker component
    - Province, District, Municipality, Ward, Postal Code
    - Required field
    │
    ▼
POST /api/auth/update-profile { address, city, province, ... }
    │
    ▼
STEP 4: Phone Verification (if email channel)
    - Only shown if user registered via email
    - Phone number input
    - Send OTP button
    - OTP input
    │
    ▼
POST /api/auth/send-phone-otp { user_id, phone }
POST /api/auth/verify-phone-otp { user_id, code }
    │
    ▼
Backend marks phone_verified_at
    │
    ▼
Registration complete → Redirect to /account or shop
```

### 2.3 Google OAuth Flow

```
User clicks "Continue with Google"
    │
    ▼
GET /api/auth/google/redirect
    │
    ▼
Backend redirects to Google OAuth consent screen
    │
    ▼
User approves on Google
    │
    ▼
Google redirects to /api/auth/google/callback
    │
    ▼
Backend:
    - Gets Google user info
    - Finds or creates user by google_id or email
    - Since email is verified, skips email OTP
    │
    ▼
Backend redirects to Shop app:
    http://localhost:3003?token=xxx&user_id=xxx&requires_profile_completion=1
    │
    ▼
Shop app reads token from URL
    Stores in localStorage
    │
    ▼
User is logged in on Shop
```

### 2.4 Forgot/Reset Password Flow

```
User visits /forgot-password
    │
    ▼
Enters email
    │
    ▼
POST /api/auth/forgot-password { email }
    │
    ▼
Backend sends OTP email via Gmail SMTP
    │
    ▼
User receives email with 6-digit OTP
    │
    ▼
Redirected to /reset-password
    │
    ▼
Enters:
    - Email
    - OTP code
    - New password
    - Confirm password
    │
    ▼
POST /api/auth/reset-password { email, code, password, password_confirmation }
    │
    ▼
Backend verifies OTP, updates password
    │
    ▼
Redirect to /login
```

---

## 3. Navigation Flow

```
Homepage (/, /shop)
    │
    ├── /products → Product listing
    ├── /products/[id] → Product detail
    ├── /blogs → Blog listing
    ├── /blogs/[slug] → Blog detail
    ├── /career → Job listings
    ├── /testimonials → Customer reviews
    ├── /courier → Courier info
    ├── /vendor → Vendor application info
    ├── /login → Login page
    │   └── After login → /account or shop
    ├── /register → Registration flow
    │   └── After complete → /account or shop
    ├── /forgot-password → Request reset
    └── /reset-password → Enter OTP + new password
```

---

## 4. Protected Routes

| Route | Requires Auth | Requires Phone Verified |
|-------|--------------|------------------------|
| / | No | No |
| /products | No | No |
| /blogs | No | No |
| /career | No | No |
| /login | No | No |
| /register | No | No |
| /forgot-password | No | No |
| /reset-password | No | No |
| /account | Yes | Yes |
| /orders | Yes | Yes |

---

## 5. API Calls

### 5.1 Public Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/register | POST | Register new user |
| /api/auth/verify-email-otp | POST | Verify email OTP |
| /api/auth/send-phone-otp | POST | Send phone OTP |
| /api/auth/verify-phone-otp | POST | Verify phone OTP |
| /api/auth/resend-otp | POST | Resend OTP |
| /api/auth/login | POST | Login |
| /api/auth/forgot-password | POST | Request password reset |
| /api/auth/reset-password | POST | Reset password |
| /api/auth/check-email | POST | Check email availability |
| /api/auth/google/redirect | GET | Google OAuth redirect |
| /api/products | GET | List products |
| /api/products/{id} | GET | Product detail |
| /api/categories | GET | List categories |
| /api/blog | GET | Published blog posts |
| /api/job-postings | GET | Active job postings |

### 5.2 Protected Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/logout | POST | Logout |
| /api/auth/me | GET | Current user |
| /api/auth/update-profile | POST | Update profile |
| /api/orders | POST | Place order |
| /api/orders | GET | List my orders |
| /api/orders/{id} | GET | View order |
| /api/reviews | POST | Submit review |

---

## 6. State Management

### 6.1 AuthContext

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier, password) => Promise<void>;
  signup: (name, identifier, password, channel, address?) => Promise<{user, channel}>;
  logout: () => Promise<void>;
  verifyEmailOtp: (email, code) => Promise<User>;
  sendPhoneOtp: (userId, phone?) => Promise<{phone}>;
  verifyPhoneOtp: (userId, code) => Promise<User>;
  resendOtp: (email, type) => Promise<void>;
  googleLogin: () => Promise<void>;
  loading: boolean;
}
```

### 6.2 Storage Keys
| Key | Purpose |
|-----|---------|
| circuit-bazaar-auth | Stored user object |
| circuit-bazaar-token | Sanctum token |

---

## 7. Error Handling

| Error | Handling |
|-------|----------|
| Network error | Show generic error message |
| 401 Unauthorized | Clear auth, redirect to login |
| 403 Phone verification required | Show phone verification flow |
| 422 Validation error | Show field-specific errors |
| 404 Not found | Show "not found" message |
| 500 Server error | Show "try again later" message |

---

## 8. Key Components

### 8.1 NepalAddressPicker
- Province dropdown
- District dropdown (depends on province)
- Municipality dropdown (depends on district)
- Ward input
- Postal code input
- Country input (default: Nepal)

### 8.2 Header
- Logo + brand name
- Navigation links
- Auth-aware:
  - Not logged in: Login + Register buttons
  - Logged in: User menu + Logout
  - Admin: Link to admin dashboard
  - Vendor: Link to vendor dashboard

### 8.3 Product Card
- Product image
- Product name
- Price
- Add to cart button
- Stock indicator

---

## 9. Registration Rules

1. **Exactly one** of email or phone is required
2. Password minimum 8 characters
3. Password confirmation must match
4. Email format validation if email provided
5. Phone uniqueness check if phone provided
6. OTP expires in 5 minutes
7. Address is required before completion
8. Phone verification is mandatory regardless of channel

---

## 10. Login Rules

1. Accepts email OR phone as identifier
2. Password required
3. phone_verified_at must not be null (hard gate)
4. If phone_verified_at is null, return 403 with requires_phone_verification
5. Banned users cannot log in (403)

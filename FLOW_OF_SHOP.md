# Flow of Shop — Circuit Bazaar

This document details the complete flow of the Shop app (http://localhost:3003).

---

## 1. App Structure

```
shop/src/
├── app/
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Homepage
│   ├── account/page.tsx     # User account dashboard
│   ├── orders/page.tsx      # Order history
│   └── auth/
│       └── callback/page.tsx # Google OAuth callback handler
├── components/
│   ├── sections/
│   │   ├── Navbar.tsx       # Navigation header
│   │   ├── Hero.tsx         # Homepage hero
│   │   ├── ProductGrid.tsx  # Product listing grid
│   │   └── ...
│   └── ProductCard.tsx      # Individual product card
├── context/
│   └── AuthContext.tsx      # Authentication state management
├── lib/
│   └── api.ts               # API client
└── types.ts                 # TypeScript interfaces
```

---

## 2. Authentication Flow

### 2.1 AuthContext Initialization

```
App loads
    │
    ▼
AuthContext checks localStorage for:
    - shop-auth (user object)
    - shop-token (Sanctum token)
    │
    ▼
If found:
    - Set user state
    - Include token in API requests
    │
    ▼
If not found:
    - User is null
    - Show login/register options
```

### 2.2 Google OAuth Callback Flow

```
User clicks "Continue with Google" on Frontend
    │
    ▼
Frontend redirects to:
    http://localhost:8000/api/auth/google/redirect
    │
    ▼
Backend redirects to Google OAuth consent screen
    │
    ▼
User approves on Google
    │
    ▼
Google redirects to:
    http://localhost:8000/api/auth/google/callback
    │
    ▼
Backend:
    - Receives Google user info
    - Finds or creates user by google_id or verified email
    - Creates Sanctum token
    - Determines next step:
      * New user → redirect with requires_profile_completion=1
      * Existing user without phone → redirect with requires_phone_verification=1
      * Existing user with phone → redirect with token only
    │
    ▼
Backend redirects to Shop:
    http://localhost:3003?token=xxx&user_id=xxx[&requires_profile_completion=1][&requires_phone_verification=1]
    │
    ▼
Shop AuthContext reads URL query params
    │
    ▼
If token present:
    - Store token in localStorage (shop-token)
    - If user_id matches stored user, set user state
    - If requires_profile_completion or requires_phone_verification:
      * Show respective completion flow
    - Otherwise: user is fully authenticated
    │
    ▼
If no token:
    - Show public shop view
```

---

## 3. Account Page Flow

```
User visits /account
    │
    ▼
AuthContext checks authentication
    │
    ▼
If not authenticated:
    - Show login/register options
    │
    ▼
If authenticated:
    - Show user profile
    - Show order history
    - Show address management
    │
    ▼
User can:
    - Update profile
    - View orders
    - Logout
```

---

## 4. Order Flow

```
User browses products on Frontend
    │
    ▼
Adds products to cart
    │
    ▼
Proceeds to checkout on Shop app
    │
    ▼
Selects payment method:
    - eSewa
    - Khalti
    - Cash on Delivery (COD)
    │
    ▼
POST /api/orders { items, payment_method, shipping_address, ... }
    │
    ▼
Backend creates order + order items + payment record
    │
    ▼
Order appears in /account/orders
    │
    ▼
Vendor can update order status
    │
    ▼
User receives status updates
```

---

## 5. Navigation Flow

```
Homepage (/)
    │
    ├── /account → User dashboard (requires auth)
    │   ├── Profile settings
    │   ├── Order history
    │   └── Address management
    │
    └── /orders → Order details (requires auth)
```

---

## 6. API Calls

### 6.1 API Client Configuration

```typescript
const API_URL = 'http://localhost:8000/api';

function buildHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    const token = getToken(); // from localStorage
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}
```

### 6.2 Token Storage

| Key | Purpose |
|-----|---------|
| shop-auth | User object |
| shop-token | Sanctum token |

### 6.3 Request Flow

```
Component calls apiClient()
    │
    ▼
apiClient adds:
    - Base URL: http://localhost:8000/api
    - Authorization header if token exists
    │
    ▼
fetch() to backend
    │
    ▼
If 401: Clear auth, redirect to login
If 403: Show error message
If 200: Return data
```

---

## 7. Error Handling

| Error | Handling |
|-------|----------|
| 401 Unauthorized | Clear localStorage, redirect to frontend login |
| 403 Forbidden | Show "access denied" message |
| 422 Validation | Show field errors |
| 404 Not found | Show "not found" |
| 500 Server error | Show "try again later" |
| Network error | Show "check connection" |

---

## 8. Key Differences from Frontend

| Feature | Frontend | Shop |
|---------|----------|------|
| Port | 3000 | 3003 |
| Auth key | circuit-bazaar-auth | shop-auth |
| Token key | circuit-bazaar-token | shop-token |
| Primary users | Guests + customers | Authenticated customers |
| Google callback | Redirects to shop | Handles callback directly |
| Registration | Full multi-step | None (uses frontend) |
| Product browsing | Yes | Yes (read-only from frontend) |

---

## 9. URL Token Pattern

When Google OAuth completes, backend redirects to Shop with token in URL:

```
http://localhost:3003?token=xxx&user_id=xxx&requires_profile_completion=1
```

Shop app:
1. Reads query params on mount
2. Stores token in localStorage
3. Cleans URL (removes query params)
4. Shows appropriate next step

This pattern avoids CORS issues with the OAuth callback.

---

## 10. Cross-App Auth Pattern

```
Frontend (localhost:3000)
    │
    ▼
User completes registration
    │
    ▼
Frontend has user + token in localStorage
    │
    ▼
User clicks "Go to Shop" or is redirected after registration
    │
    ▼
Frontend navigates to http://localhost:3003
    │
    ▼
Shop app checks for token
    │
    ▼
If no token:
    - Show login options
    - User must log in again on Shop
    │
    ▼
If token exists (from Google OAuth):
    - User is already authenticated
    - Can browse and shop immediately
```

Note: For email/phone registration, the user must log in separately on the Shop app. Only Google OAuth provides cross-app auth via URL token.

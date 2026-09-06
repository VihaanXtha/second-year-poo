# Flow of Vendor — Circuit Bazaar

This document details the complete flow of the Vendor dashboard (http://localhost:3002).

---

## 1. App Structure

```
vendor/src/
├── App.tsx                 # Shell with auth guard + role check
├── main.tsx                # Entry point
├── styles.css              # Global styles
├── context/
│   └── AuthContext.tsx     # Authentication + store state management
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Header.tsx          # Top header bar
│   ├── StatCard.tsx        # Stats display card
│   ├── Charts.tsx          # Chart components
│   └── Tables.tsx          # Data tables
├── pages/
│   ├── Login.tsx           # Vendor login + forgot/reset password
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Store.tsx           # Store settings
│   ├── Products.tsx        # Product management
│   ├── Orders.tsx          # Order management
│   ├── Sales.tsx           # Sales reports
│   └── Analytics.tsx       # Analytics page
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## 2. Authentication Flow

### 2.1 Login Flow

```
User visits http://localhost:3002
    │
    ▼
App.tsx checks AuthContext
    │
    ▼
If not authenticated:
    - Show Login page
    │
    ▼
User enters email + password
    │
    ▼
POST /api/auth/login { email, password }
    │
    ▼
Backend validates:
    - User exists
    - Password matches
    - role = 'vendor'
    - VendorStore exists
    - VendorStore.verified = true
    - VendorStore.status = 'active'
    │
    ▼
If store not verified or not active:
    Return 403 with store status info
    │
    ▼
If role ≠ vendor:
    Return 403 "Access denied. This portal is for vendors only."
    │
    ▼
If valid:
    Return user + store + token
    │
    ▼
AuthContext stores:
    - user in localStorage (key: vendor-auth)
    - store in localStorage (key: vendor-store)
    - token in localStorage (key: vendor-token)
    │
    ▼
App.tsx routes to Dashboard
```

### 2.2 Forgot/Reset Password Flow

```
User clicks "Forgot password?" on login
    │
    ▼
Shows forgot password form
    │
    ▼
User enters email
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
Shows reset password form:
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
Redirect to login with email pre-filled
```

### 2.3 Session Persistence

```
App loads
    │
    ▼
AuthContext reads localStorage:
    - vendor-auth (user)
    - vendor-store (store)
    - vendor-token (token)
    │
    ▼
If all found:
    - Set user state
    - Set store state
    - Set token state
    - App.tsx shows Dashboard
    │
    ▼
If any missing:
    - Show Login page
    │
    ▼
Logout:
    - Clear all localStorage keys
    - Set states to null
    - Show Login page
```

---

## 3. Navigation Flow

```
Login
    │
    ▼
Dashboard (default)
    │
    ├── Dashboard → Stats overview
    │   ├── Total products
    │   ├── Total orders
    │   ├── Total revenue
    │   └── Recent orders
    │
    ├── Store → Store settings
    │   ├── Store name, description
    │   ├── Address, phone
    │   ├── Logo, banner
    │   └── Business info
    │
    ├── Products → Product management
    │   ├── List products
    │   ├── Create product
    │   ├── Edit product
    │   └── Delete product
    │
    ├── Orders → Order management
    │   ├── List orders
    │   ├── Update order status
    │   └── View order details
    │
    ├── Sales → Sales reports
    │   ├── Revenue chart
    │   ├── Top products
    │   └── Sales by period
    │
    └── Analytics → Analytics page
        ├── Views chart
        └── Performance metrics
```

---

## 4. Dashboard Flow

```
Dashboard loads
    │
    ▼
Parallel API calls:
    │
    ├── GET /api/vendor/dashboard/stats
    │   └── Returns: products count, orders count, revenue, pending orders
    │
    ├── GET /api/vendor/orders
    │   └── Returns: recent orders with items
    │
    └── GET /api/vendor/sales
        └── Returns: sales data for chart
    │
    ▼
Display:
    - Stats cards (products, orders, revenue)
    - Recent orders table
    - Sales chart
```

---

## 5. Products Flow

```
Products page loads
    │
    ▼
GET /api/vendor/products
    │
    ▼
Display product table:
    - Name, SKU, price, stock, status
    - Actions: Edit, Delete
    │
    ▼
Vendor clicks "Add Product":
    Shows form:
    - Name, SKU, description
    - Price, stock
    - Category
    - Image URL
    - Specs (JSON)
    - Status (active/inactive/draft)
    │
    ▼
POST /api/vendor/products
    │
    ▼
Backend creates product
    │
    ▼
Table refreshes
```

---

## 6. Orders Flow

```
Orders page loads
    │
    ▼
GET /api/vendor/orders
    │
    ▼
Display order table:
    - Order number
    - Customer name
    - Items (product names, quantities)
    - Total
    - Status
    - Actions: Update status
    │
    ▼
Vendor updates status:
    PATCH /api/vendor/orders/{id}/status
    { status: 'shipped' }
    │
    ▼
Backend updates order status
    │
    ▼
Table refreshes
```

---

## 7. Store Flow

```
Store page loads
    │
    ▼
GET /api/vendor/store
    │
    ▼
Display store form:
    - Store name, description
    - Address, phone
    - Logo URL, banner URL
    - Business info (PAN, experience, website)
    - Address details (country, province, district, municipality, ward, postal)
    │
    ▼
Vendor updates fields
    │
    ▼
PUT /api/vendor/store
    │
    ▼
Backend updates store
    │
    ▼
Form refreshes with updated data
```

---

## 8. API Calls

### 8.1 API Client

```typescript
const API_URL = 'http://localhost:8000/api';

async function apiClient(path, options) {
    const token = getToken(); // from localStorage
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
}
```

### 8.2 Token Storage

| Key | Purpose |
|-----|---------|
| vendor-auth | User object |
| vendor-store | VendorStore object |
| vendor-token | Sanctum token |

### 8.3 Request Flow

```
Component calls apiClient()
    │
    ▼
Add Authorization header
    │
    ▼
fetch() to backend
    │
    ▼
Backend middleware:
    - auth:sanctum → validates token
    - role:vendor → validates role
    │
    ▼
If authorized:
    - Execute controller action
    - Return JSON response
    │
    ▼
If 401:
    - Clear auth
    - Redirect to login
```

---

## 9. Error Handling

| Error | Handling |
|-------|----------|
| 401 Unauthorized | Clear auth, redirect to login |
| 403 Forbidden | Show "store pending verification" or "access denied" |
| 404 Not found | Show "not found" |
| 422 Validation | Show field errors |
| 500 Server error | Show "try again later" |
| Network error | Show "check connection" |

---

## 10. Vendor Application Flow (from Frontend)

```
User on Frontend fills vendor application form
    │
    ▼
POST /api/vendor/apply
    { full_name, email, phone, store_name, description, ... }
    │
    ▼
Backend creates VendorApplication
    Sends OTP email to applicant
    │
    ▼
User verifies email OTP
    │
    ▼
POST /api/vendor/verify-otp
    │
    ▼
Backend:
    - Creates User (role: vendor)
    - Creates VendorStore (status: pending, verified: false)
    - Sends credentials email to vendor
    │
    ▼
Admin reviews in Admin dashboard
    │
    ▼
Admin verifies vendor:
    POST /api/admin/vendors/{id}/verify
    │
    ▼
VendorStore.verified = true
VendorStore.status = 'active'
    │
    ▼
Vendor can now log in at http://localhost:3002
```

---

## 11. Key Differences from Other Apps

| Feature | Vendor | Admin | Frontend |
|---------|--------|-------|----------|
| Port | 3002 | 3001 | 3000 |
| Auth key | vendor-auth | admin-auth | circuit-bazaar-auth |
| Role required | vendor | admin | customer |
| Google OAuth | No | No | Yes |
| Registration | No | No | Yes |
| Password reset | Yes | No | Yes |
| Store data | Yes | No | No |
| Products | Own only | All | All (read) |
| Orders | Own only | All | Own only |

---

## 12. Default Credentials

| Email | Password | Role |
|-------|----------|------|
| vendor@circuitbazaar.com | vendor123 | vendor |

---

## 13. Store Verification States

| State | Description | Can Login? |
|-------|-------------|------------|
| pending | Application submitted, awaiting admin review | No |
| active + verified = false | Store exists but not verified | No |
| active + verified = true | Store approved by admin | Yes |
| suspended | Store suspended by admin | No |

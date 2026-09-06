# Flow of Admin — Circuit Bazaar

This document details the complete flow of the Admin dashboard (http://localhost:3001).

---

## 1. App Structure

```
admin/src/
├── App.tsx                 # Shell with auth guard + role check
├── main.tsx                # Entry point
├── styles.css              # Global styles
├── context/
│   └── AuthContext.tsx     # Authentication state management
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Header.tsx          # Top header bar
│   ├── StatCard.tsx        # Stats display card
│   ├── Charts.tsx          # Chart components
│   └── Tables.tsx          # Data tables
├── pages/
│   ├── Login.tsx           # Admin login
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Analytics.tsx       # Analytics page
│   ├── CustomersPage.tsx   # Customer management
│   ├── AdminsPage.tsx      # Admin management
│   ├── VendorsPage.tsx     # Vendor management
│   ├── ProductsPage.tsx    # Product management
│   ├── CategoriesPage.tsx  # Category management
│   ├── OrdersPage.tsx      # Order management
│   ├── SalesReports.tsx    # Sales reports
│   ├── BlogPostsPage.tsx   # Blog post management
│   ├── JobPostingsPage.tsx # Job posting management
│   ├── TestimonialsPage.tsx # Testimonial management
│   ├── CourierPage.tsx     # Courier info management
│   ├── SlidersPage.tsx     # Homepage slider management
│   └── Settings.tsx        # Settings + phpMyAdmin link
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## 2. Authentication Flow

### 2.1 Login Flow

```
User visits http://localhost:3001
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
    - role = 'admin'
    │
    ▼
If role ≠ admin:
    Return 403 "Access denied. Admin only."
    │
    ▼
If valid:
    Return user + token
    │
    ▼
AuthContext stores:
    - user in localStorage (key: admin-auth)
    - token in localStorage (key: admin-token)
    │
    ▼
App.tsx routes to Dashboard
```

### 2.2 Session Persistence

```
App loads
    │
    ▼
AuthContext reads localStorage:
    - admin-auth
    - admin-token
    │
    ▼
If found:
    - Set user state
    - App.tsx shows Dashboard
    │
    ▼
If not found:
    - Show Login page
    │
    ▼
Logout:
    - Clear localStorage
    - Set user to null
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
    ├── Analytics → Charts and metrics
    ├── Customers → User management
    │   ├── List users
    │   ├── Ban/unban users
    │   └── View user details
    ├── Admins → Admin management
    ├── Vendors → Vendor management
    │   ├── List vendors
    │   ├── Verify vendors
    │   ├── Suspend vendors
    │   └── View vendor stores
    ├── Products → Product management
    │   ├── List all products
    │   ├── Delete products
    │   └── View product details
    ├── Categories → Category management
    ├── Orders → Order management
    │   ├── List all orders
    │   ├── Update order status
    │   └── View order details
    ├── Sales Reports → Sales analytics
    ├── Blog Posts → Blog management
    │   ├── Create posts
    │   ├── Edit posts
    │   └── Delete posts
    ├── Job Postings → Job management
    ├── Testimonials → Testimonial management
    ├── Courier → Courier info management
    ├── Sliders → Homepage slider management
    └── Settings → phpMyAdmin link
```

---

## 4. Dashboard Flow

```
Dashboard loads
    │
    ▼
Parallel API calls:
    │
    ├── GET /api/admin/stats
    │   └── Returns: total users, vendors, products, orders, revenue
    │
    ├── GET /api/admin/users?page=1
    │   └── Returns: paginated user list
    │
    ├── GET /api/admin/vendors
    │   └── Returns: vendor list with store info
    │
    ├── GET /api/admin/products
    │   └── Returns: product list
    │
    └── GET /api/admin/orders
        └── Returns: order list
    │
    ▼
Display stats cards + recent data tables
```

---

## 5. Key Pages Flow

### 5.1 Vendors Page

```
Vendors page loads
    │
    ▼
GET /api/admin/vendors
    │
    ▼
Display vendor table:
    - Name, email, store name
    - Verified status
    - Store status
    - Actions: Verify, Suspend
    │
    ▼
Admin clicks "Verify":
    POST /api/admin/vendors/{id}/verify
    │
    ▼
Backend updates:
    - vendor_stores.verified = true
    - vendor_stores.status = 'active'
    │
    ▼
Table refreshes
```

### 5.2 Orders Page

```
Orders page loads
    │
    ▼
GET /api/admin/orders
    │
    ▼
Display order table:
    - Order number
    - Customer name
    - Total amount
    - Payment method
    - Status
    - Actions: Update status
    │
    ▼
Admin clicks status dropdown:
    PATCH /api/admin/orders/{id}/status
    { status: 'shipped' }
    │
    ▼
Backend updates order status
    │
    ▼
Table refreshes
```

### 5.3 Blog Posts Page

```
Blog posts page loads
    │
    ▼
GET /api/blog
    │
    ▼
Display blog table:
    - Title, slug, category, author
    - Published date
    - Actions: Edit, Delete
    │
    ▼
Admin clicks "Create":
    Shows form:
    - Title, slug, category, author
    - Cover image URL
    - Body content
    - Published date
    - Is published toggle
    │
    ▼
POST /api/admin/content/blog
    │
    ▼
Backend creates blog post
    │
    ▼
Table refreshes
```

---

## 6. Settings Page

```
Settings page loads
    │
    ▼
Shows:
    - Database Management section
    - "Open phpMyAdmin" button
    - URL: http://localhost:8081
    - Credentials note
    │
    ▼
Admin clicks button:
    - Opens phpMyAdmin in new tab
    - URL: http://localhost:8081
```

---

## 7. API Calls

### 7.1 API Client

```typescript
const API_URL = 'http://localhost:8000/api';

async function apiClient(path, options) {
    const token = getAdminToken(); // from localStorage
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
        throw new Error('Request failed');
    }
    
    return response.json();
}
```

### 7.2 Token Storage

| Key | Purpose |
|-----|---------|
| admin-auth | User object |
| admin-token | Sanctum token |

### 7.3 Request Flow

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
    - role:admin → validates role
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

## 8. Error Handling

| Error | Handling |
|-------|----------|
| 401 Unauthorized | Clear auth, redirect to login |
| 403 Forbidden | Show "access denied" |
| 404 Not found | Show "not found" |
| 422 Validation | Show field errors |
| 500 Server error | Show "try again later" |
| Network error | Show "check connection" |

---

## 9. Role Check

```
Login attempt
    │
    ▼
Backend returns user with role
    │
    ▼
AuthContext checks:
    if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
    }
    │
    ▼
If not admin:
    - Show error message
    - Stay on login page
    │
    ▼
If admin:
    - Store user + token
    - Navigate to Dashboard
```

---

## 10. Key Differences from Other Apps

| Feature | Admin | Frontend | Vendor |
|---------|-------|----------|--------|
| Port | 3001 | 3000 | 3002 |
| Auth key | admin-auth | circuit-bazaar-auth | vendor-auth |
| Role required | admin | customer | vendor |
| Google OAuth | No | Yes | No |
| Registration | No | Yes | No |
| Password reset | No | Yes | Yes |
| API base | /api/admin/* | /api/* | /api/vendor/* |

---

## 11. Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@circuitbazaar.com | admin123 | admin |

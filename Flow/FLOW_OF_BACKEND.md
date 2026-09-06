# Flow of Backend — Circuit Bazaar

This document details the complete flow of the Backend API (http://localhost:8000).

---

## 1. Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php          # Base controller
│   │   │   ├── AuthController.php      # Auth endpoints
│   │   │   ├── AdminController.php     # Admin CRUD
│   │   │   ├── VendorController.php    # Vendor CRUD
│   │   │   ├── ProductController.php   # Public product API
│   │   │   ├── OrderController.php     # Order API
│   │   │   ├── ReviewController.php    # Review API
│   │   │   ├── ContentController.php   # Blog/testimonials/sliders
│   │   │   ├── JobPostingController.php # Job postings
│   │   │   └── VendorApplicationController.php # Vendor applications
│   │   └── Middleware/
│   │       └── RoleMiddleware.php      # role:admin, role:vendor
│   ├── Models/
│   │   ├── User.php
│   │   ├── OtpCode.php
│   │   ├── VendorStore.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Review.php
│   │   ├── Payment.php
│   │   ├── VendorApplication.php
│   │   ├── BlogPost.php
│   │   ├── JobPosting.php
│   │   ├── Testimonial.php
│   │   └── HomepageSlider.php
│   ├── Mail/
│   │   ├── OtpMail.php                 # OTP email
│   │   └── VendorCredentialsMail.php   # Vendor credentials email
│   ├── Services/
│   │   └── SmsService.php              # SMS service (KushaSMS, SMSKIT, Twilio)
│   └── Providers/
│       └── AppServiceProvider.php      # Socialite facade registration
├── routes/
│   └── api.php                          # All API routes
├── database/
│   ├── migrations/                      # 22 migrations
│   ├── seeders/                         # 6 seeders
│   └── factories/                       # Model factories
├── config/
│   ├── auth.php                         # Sanctum config
│   ├── cors.php                         # CORS config
│   ├── services.php                     # Google, SMS config
│   └── ...
├── tests/
│   └── Feature/
│       ├── RegistrationTest.php         # Registration tests
│       ├── ChannelAuthTest.php          # Channel auth tests
│       └── ContentTest.php              # Content tests
└── .env                                 # Environment variables
```

---

## 2. Authentication Flow

### 2.1 Registration Flow (Backend)

```
POST /api/auth/register
    │
    ▼
Validate:
    - name: required, string, max 255
    - email: nullable, email, unique (required if channel=email)
    - phone: nullable, string, max 20, unique (required if channel=phone)
    - password: required, string, min 8, confirmed
    - channel: required, in: [email, phone]
    - Exactly one of email/phone must be present
    │
    ▼
Create user:
    - Hash password
    - role = 'customer'
    - status = 'active'
    │
    ▼
If channel = email:
    POST /api/auth/generateAndSendOtp(email, userId, 'email_verification')
    - Generate 6-digit OTP
    - Store in otp_codes table (expires in 5 minutes)
    - Send email via Gmail SMTP
    │
    ▼
If channel = phone:
    - Generate 6-digit OTP
    - Store in otp_codes table (expires in 5 minutes)
    - Send SMS via KushaSMS
    │
    ▼
Return:
    - message: "Registration successful. Please verify your email/phone."
    - user: id, name, email, phone, role, channel
```

### 2.2 OTP Verification Flow

```
Email OTP Verification:
    POST /api/auth/verify-email-otp { email, code }
    │
    ▼
Find user by email
    Find OTP: email matches, type = email_verification, verified_at = null, expires_at > now
    │
    ▼
If OTP valid:
    - Mark OTP as verified (verified_at = now)
    - Mark user email as verified (email_verified_at = now)
    - If phone_verified_at is set:
        * Create Sanctum token
        * Return token
    - Else:
        * Return user without token
    │
    ▼
If OTP invalid:
    Return 422 "Invalid or expired OTP code"

Phone OTP Verification:
    POST /api/auth/verify-phone-otp { user_id, code }
    │
    ▼
Find user by user_id
    Find OTP: user_id matches, type = phone_verification, verified_at = null, expires_at > now
    │
    ▼
If OTP valid:
    - Mark OTP as verified (verified_at = now)
    - Mark user phone as verified (phone_verified_at = now)
    - Create Sanctum token
    - Return token + user
    │
    ▼
If OTP invalid:
    Return 422 "Invalid or expired OTP code"
```

### 2.3 Login Flow

```
POST /api/auth/login { identifier, password }
    │
    ▼
Find user by email OR phone
    │
    ▼
Validate:
    - User exists
    - Password matches (Hash::check)
    - Status ≠ 'banned'
    - phone_verified_at is not null  ← HARD GATE
    │
    ▼
If phone_verified_at is null:
    Return 403:
    {
        message: "Phone verification is required before login.",
        requires_phone_verification: true,
        user: { id, name, email, phone, role, email_verified, phone_verified }
    }
    │
    ▼
If all valid:
    Create Sanctum token
    Return:
    {
        message: "Login successful.",
        user: { id, name, email, phone, role, address, ... },
        token: "plain-text-token"
    }
```

### 2.4 Google OAuth Flow

```
GET /api/auth/google/redirect
    │
    ▼
Store redirect_to in session
    Redirect to Google OAuth consent screen
    │
    ▼
User approves on Google
    │
    ▼
GET /api/auth/google/callback
    │
    ▼
Socialite::driver('google')->user()
    - Get Google user info
    │
    ▼
Find or create user:
    - Search by google_id
    - Or search by verified email
    - If not found: create new user with random password
    - If found but no google_id: update google_id
    │
    ▼
Check user state:
    - isNew = !phone_verified_at && !address
    - needsPhoneVerification = !phone_verified_at
    │
    ▼
If isNew:
    Create token, redirect to shop with requires_profile_completion=1
    │
    ▼
If needsPhoneVerification:
    Create token, redirect to shop with requires_phone_verification=1
    │
    ▼
If fully verified:
    Create token, redirect to shop with token only
```

### 2.5 Password Reset Flow

```
POST /api/auth/forgot-password { email }
    │
    ▼
Find user by email
    │
    ▼
Generate OTP, send email via Gmail SMTP
    type = 'password_reset', expires in 5 minutes
    │
    ▼
POST /api/auth/reset-password { email, code, password, password_confirmation }
    │
    ▼
Find OTP: email matches, type = password_reset, verified_at = null, expires_at > now
    │
    ▼
If OTP valid:
    - Mark OTP as verified
    - Update user password (Hash::make)
    - Return success
    │
    ▼
If OTP invalid:
    Return 422 "Invalid or expired OTP code"
```

---

## 3. Admin API Flow

```
Request to /api/admin/*
    │
    ▼
Middleware: auth:sanctum
    - Validate Sanctum token
    - Attach user to request
    │
    ▼
Middleware: role:admin
    - Check user.role === 'admin'
    │
    ▼
Controller action
    │
    ▼
Return JSON response
```

### Key Admin Endpoints:
| Endpoint | Method | Action |
|----------|--------|--------|
| /api/admin/stats | GET | Platform statistics |
| /api/admin/users | GET | List users (paginated) |
| /api/admin/users/{id}/status | PATCH | Ban/unban user |
| /api/admin/vendors | GET | List vendors |
| /api/admin/vendors/{id}/verify | POST | Verify vendor store |
| /api/admin/vendors/{id}/suspend | POST | Suspend vendor |
| /api/admin/products | GET | List all products |
| /api/admin/products/{id} | DELETE | Delete product |
| /api/admin/orders | GET | List all orders |
| /api/admin/orders/{id}/status | PATCH | Update order status |
| /api/admin/sales | GET | Sales report |
| /api/admin/content/blog | POST | Create blog post |
| /api/admin/content/blog/{id} | PUT | Update blog post |
| /api/admin/content/blog/{id} | DELETE | Delete blog post |
| /api/admin/job-postings | POST | Create job posting |
| /api/admin/testimonials | POST | Create testimonial |
| /api/admin/sliders | POST | Create slider |

---

## 4. Vendor API Flow

```
Request to /api/vendor/*
    │
    ▼
Middleware: auth:sanctum
    - Validate Sanctum token
    - Attach user to request
    │
    ▼
Middleware: role:vendor
    - Check user.role === 'vendor'
    │
    ▼
Controller action
    │
    ▼
Return JSON response
```

### Key Vendor Endpoints:
| Endpoint | Method | Action |
|----------|--------|--------|
| /api/vendor/apply | POST | Apply as vendor |
| /api/vendor/verify-otp | POST | Verify vendor application OTP |
| /api/vendor/resend-otp | POST | Resend vendor OTP |
| /api/vendor/dashboard/stats | GET | Dashboard statistics |
| /api/vendor/store | GET | Get my store |
| /api/vendor/store | PUT | Update my store |
| /api/vendor/products | GET | List my products |
| /api/vendor/products | POST | Create product |
| /api/vendor/products/{id} | PUT | Update product |
| /api/vendor/products/{id} | DELETE | Delete product |
| /api/vendor/orders | GET | List orders with my products |
| /api/vendor/orders/{id}/status | PATCH | Update order status |
| /api/vendor/sales | GET | Sales report |
| /api/vendor/reviews | GET | Reviews for my products |

---

## 5. Public API Flow

```
Request to /api/* (no auth required)
    │
    ▼
Controller action
    │
    ▼
Return JSON response
```

### Key Public Endpoints:
| Endpoint | Method | Action |
|----------|--------|--------|
| /api/products | GET | Browse active products |
| /api/products/{id} | GET | View single product |
| /api/categories | GET | List all categories |
| /api/blog | GET | Published blog posts |
| /api/blog/{id} | GET | Blog post by ID |
| /api/blog/slug/{slug} | GET | Blog post by slug |
| /api/job-postings | GET | Active job postings |
| /api/job-postings/{idOrSlug} | GET | Job posting detail |
| /api/testimonials | GET | Published testimonials |
| /api/sliders | GET | Active homepage sliders |
| /api/courier | GET | Courier information |

---

## 6. OTP System Flow

### 6.1 OTP Generation

```
Any OTP endpoint
    │
    ▼
Generate 6-digit code:
    str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT)
    │
    ▼
Store in otp_codes table:
    - user_id (nullable)
    - email (nullable)
    - phone (nullable)
    - code: 6-digit string
    - type: email_verification|phone_verification|password_reset|vendor_application
    - expires_at: now + 5 minutes
    - verified_at: null
    │
    ▼
Send via appropriate channel:
    - email_verification → Gmail SMTP
    - phone_verification → KushaSMS (default) or SMSKIT fallback
    - password_reset → Gmail SMTP
    - vendor_application → Gmail SMTP
```

### 6.2 OTP Verification

```
Find OTP:
    - WHERE email/phone/user_id matches
    - AND type matches
    - AND verified_at IS NULL
    - AND expires_at > NOW()
    - ORDER BY id DESC
    - LIMIT 1
    │
    ▼
If found AND code matches:
    - Update verified_at = NOW()
    - Proceed with action
    │
    ▼
If not found or code mismatch:
    Return 422 "Invalid or expired OTP code"
```

### 6.3 OTP Constants

```php
private const OTP_EXPIRY_MINUTES = 5;
```

All OTPs expire in exactly 5 minutes. No magic numbers.

---

## 7. SMS Service Flow

```
SmsService::sendOtp($to, $code, $via = 'kushasms')
    │
    ▼
If via = 'kushasms' (default):
    - Clean phone number (remove non-digits)
    - Remove 977 prefix if present
    - Validate 10 digits starting with 98
    - POST to https://kushasms.com/sms/v4/send-user
    - Headers: auth-token: {KUSHASMS_TOKEN}
    - Body: { to: [phone], text: [message] }
    │
    ▼
If via = 'smskit':
    - POST to https://api.smskit.com/api/sms/send
    - Form data: api_key, sender_id, to, message
    │
    ▼
If via = 'twilio':
    - POST to Twilio Messages API
    - Basic auth with SID and token
    │
    ▼
Return true/false
    If false: return dev_code in response for testing
```

---

## 8. Middleware Stack

```
Request
    │
    ▼
CORS Middleware
    │
    ▼
TrimStrings / ConvertEmptyStringsToNull
    │
    ▼
Route Matching
    │
    ▼
auth:sanctum (for protected routes)
    │
    ▼
role:admin or role:vendor (for role-specific routes)
    │
    ▼
Controller Action
```

---

## 9. Database Connections

| Environment | Database | Host | Notes |
|-------------|----------|------|-------|
| Local | MySQL | 127.0.0.1:3306 | Root user, no password |
| Production | MySQL | Railway managed | Via Railway env vars |

---

## 10. Email Configuration

| Setting | Value |
|---------|-------|
| Driver | smtp |
| Host | smtp.gmail.com |
| Port | 587 |
| Encryption | tls |
| From | noreply@circuitbazaar.com |

Emails sent:
- OTP verification emails
- Password reset emails
- Vendor credentials emails
- Vendor application OTP emails

---

## 11. Testing

```
Backend tests: 52 tests
- RegistrationTest: 4 tests
- ChannelAuthTest: 9 tests
- ContentTest: 39 tests

Run: php artisan test

Key test scenarios:
- Email registration + OTP verification
- Phone registration + OTP verification
- Phone verification gate (login blocked if phone_verified_at is null)
- Google registration flow
- Password reset flow
- Blog CRUD operations
```

---

## 12. Error Responses

| Status | Format | Example |
|--------|--------|---------|
| 422 | { errors: { field: ["msg"] } } | Validation errors |
| 401 | { message: "Invalid password." } | Auth failure |
| 403 | { message: "Access denied." } | Role/permission denied |
| 404 | { message: "User not found." } | Resource not found |
| 500 | { message: "Server error." } | Server error |

---

## 13. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| /api/auth/register | 10 requests per minute |
| /api/auth/verify-email-otp | 10 requests per minute |
| /api/auth/resend-otp | 5 requests per minute |
| /api/auth/login | 10 requests per minute |
| /api/auth/google/redirect | 10 requests per minute |
| /api/auth/google/callback | 10 requests per minute |

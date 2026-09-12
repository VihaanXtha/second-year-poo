# Circuit Bazaar - Backend

Laravel 13 backend API for the Circuit Bazaar hardware marketplace.

## Prerequisites

- PHP 8.3+
- Composer 2+
- MySQL 8.0+ (local installation)
- Node.js (for artisan serve with Vite assets if needed)

## Quick Start

```bash
# 1. Enter backend directory
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file (if not already done)
copy .env.example .env

# 4. Update .env with your MySQL credentials
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=circuit_bazaar
# DB_USERNAME=root
# DB_PASSWORD=your_password

# 5. Generate application key
php artisan key:generate

# 6. Create database (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS circuit_bazaar;"

# 7. Run database migrations
php artisan migrate --force

# 8. Seed database (optional, for demo data)
php artisan db:seed --force

# 9. Start the development server
php artisan serve --host=0.0.0.0 --port=8000
```

The API will be available at `http://localhost:8000`.

## Project Structure

```
backend/
  app/
    Http/
      Controllers/    # API controllers
      Middleware/     # HTTP middleware (RoleMiddleware)
    Models/           # Eloquent models
    Mail/             # Mailable classes (OTP, credentials)
    Services/         # External services (SmsService)
    Providers/        # Service providers
  config/             # Configuration files
  database/
    migrations/       # Database schema migrations (22 migrations)
    seeders/          # Database seeders
    factories/        # Model factories for testing
  routes/
    api.php           # API routes
  storage/            # Logs, cache, sessions
  tests/              # PHPUnit tests (52 tests)
```

## Available Artisan Commands

```bash
# Development server
php artisan serve --host=0.0.0.0 --port=8000

# Database
php artisan migrate --force              # Run pending migrations
php artisan migrate:rollback             # Rollback last batch
php artisan db:seed --force              # Run seeders
php artisan migrate:fresh --seed --force # Fresh database

# Code generation
php artisan make:model Product -mcr      # Model + Migration + Controller + Resource
php artisan make:controller Api/ProductController
php artisan make:request ProductRequest
php artisan make:resource ProductResource

# Maintenance
php artisan optimize
php artisan config:cache
php artisan route:cache

# Testing
php artisan test
php artisan test --filter=RegistrationTest
```

## API Routes

API routes are defined in `routes/api.php` and are automatically prefixed with `/api`.

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register customer, sends OTP |
| POST | /api/auth/verify-email-otp | Verify email OTP |
| POST | /api/auth/send-phone-otp | Send phone OTP |
| POST | /api/auth/verify-phone-otp | Verify phone OTP |
| POST | /api/auth/resend-otp | Resend OTP |
| POST | /api/auth/login | Login, returns token + user |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with OTP |
| POST | /api/auth/check-email | Check email availability |
| GET | /api/auth/google/redirect | Google OAuth redirect |
| GET | /api/auth/google/callback | Google OAuth callback |
| GET | /api/products | Browse active products |
| GET | /api/products/{id} | View single product |
| GET | /api/categories | List all categories |
| GET | /api/blog | Published blog posts |
| GET | /api/job-postings | Active job postings |

### Protected Routes (auth:sanctum)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/logout | Revoke token |
| GET | /api/auth/me | Current user |
| POST | /api/auth/update-profile | Update profile |
| POST | /api/orders | Place order |
| GET | /api/orders | List my orders |
| GET | /api/orders/{id} | View order |
| POST | /api/reviews | Submit review |

### Admin Routes (auth:sanctum + role:admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Platform stats |
| GET | /api/admin/users | List users |
| PATCH | /api/admin/users/{id}/status | Ban/unban user |
| GET | /api/admin/vendors | List vendors |
| POST | /api/admin/vendors/{id}/verify | Verify vendor |
| POST | /api/admin/vendors/{id}/suspend | Suspend vendor |
| GET | /api/admin/products | List all products |
| DELETE | /api/admin/products/{id} | Delete product |
| GET | /api/admin/orders | List all orders |
| PATCH | /api/admin/orders/{id}/status | Update order status |
| GET | /api/admin/sales | Sales report |

### Vendor Routes (auth:sanctum + role:vendor)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/vendor/apply | Apply as vendor |
| POST | /api/vendor/verify-otp | Verify vendor application OTP |
| GET | /api/vendor/dashboard/stats | Dashboard stats |
| GET | /api/vendor/store | Get my store |
| PUT | /api/vendor/store | Update my store |
| GET | /api/vendor/products | List my products |
| POST | /api/vendor/products | Create product |
| PUT | /api/vendor/products/{id} | Update product |
| DELETE | /api/vendor/products/{id} | Delete product |
| GET | /api/vendor/orders | List orders with my products |
| PATCH | /api/vendor/orders/{id}/status | Update order status |
| GET | /api/vendor/sales | Sales report |
| GET | /api/vendor/reviews | Reviews for my products |

## Environment Variables

Key variables in `.env`:

```env
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

## CORS Configuration

Allowed origins in `config/cors.php`:
- http://localhost:3000 (frontend)
- http://localhost:3001 (admin)
- http://localhost:3002 (vendor)
- http://localhost:3003 (shop)

## Authentication

- Uses Laravel Sanctum for token-based auth
- Tokens stored in `personal_access_tokens` table
- Frontends send `Authorization: Bearer <token>` header
- Role checks via `role:admin` or `role:vendor` middleware

## Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test --filter=RegistrationTest

# Run with coverage
php artisan test --coverage
```

## Notes

- **MySQL** is used for local development (install MySQL separately)
- **API-only mode** — this backend is configured as an API server; frontend is served separately
- **CORS** is configured to allow requests from localhost:3000-3003
- **OTP expiry** is 5 minutes for all OTP types
- **Phone verification** is mandatory before login (hard gate)

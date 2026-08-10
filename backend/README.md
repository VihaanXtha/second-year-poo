# Circuit Bazaar - Backend

Laravel 13 backend API for the Circuit Bazaar hardware marketplace.

## Prerequisites

- PHP 8.3+
- Composer 2+
- SQLite (included with PHP) or MySQL/PostgreSQL

## Quick Start

```bash
# 1. Enter backend directory
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file (if not already done)
copy .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Run database migrations
php artisan migrate

# 6. Start the development server
php artisan serve
```

The API will be available at `http://localhost:8000`.

## Project Structure

```
backend/
  app/
    Models/           # Eloquent models (Product, Vendor, User, etc.)
    Http/
      Controllers/    # API controllers
      Middleware/     # HTTP middleware
      Resources/      # API resources (JSON transformers)
    Providers/        # Service providers
  config/             # Configuration files
  database/
    migrations/       # Database schema migrations
    seeders/          # Database seeders
    factories/        # Model factories for testing
  routes/
    web.php           # Web routes
    api.php           # API routes (prefix: /api)
  storage/            # Logs, cache, sessions
  tests/              # PHPUnit tests
```

## Available Artisan Commands

```bash
# Development server
php artisan serve

# Database
php artisan migrate              # Run pending migrations
php artisan migrate:rollback     # Rollback last batch
php artisan db:seed              # Run seeders

# Code generation
php artisan make:model Product -mcr   # Model + Migration + Controller + Resource
php artisan make:controller Api/ProductController
php artisan make:request ProductRequest
php artisan make:resource ProductResource

# Maintenance
php artisan optimize
php artisan config:cache
php artisan route:cache

# Testing
php artisan test
```

## API Routes

API routes are defined in `routes/api.php` and are automatically prefixed with `/api`.

Example default route:

```php
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
```

## CORS Configuration

If your frontend runs on `http://localhost:3000`, update `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

## Connecting Frontend to Backend

In your Next.js app, update API calls to point to the Laravel backend:

```typescript
// Instead of mock data, call the API:
const response = await fetch('http://localhost:8000/api/products');
const products = await response.json();
```

For local development, you can add a proxy in `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

## Environment Variables

Key variables in `.env`:

```env
APP_NAME=CircuitBazaar
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

## Notes

- **SQLite** is used by default for local development (no separate database server needed)
- **API-only mode** — this backend is configured as an API server; frontend is served separately by Next.js
- **CORS** is configured in `config/cors.php` to allow requests from `localhost:3000`
- **Authentication** — use Laravel Sanctum for token-based auth when connecting the frontend

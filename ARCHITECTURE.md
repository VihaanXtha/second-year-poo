# Circuit Bazaar — Architecture & System Memory

> Single source of truth for the whole repo: every app, every route, every model, every service.
> Referenced from `README.md` (Documentation section).

## Overview

Circuit Bazaar is a **specification-first hardware marketplace for Nepal**. One Laravel API plus four independent frontend apps. Specification-first means every `Category` carries a `spec_schema` (JSON array of field definitions: key, label, type, options, required) that the vendor portal uses to render per-category spec forms, the API validates vendor-supplied `Product.specs` against, and customers filter on via `?spec[<key>]=<value>` JSON queries.

## Repo Layout

| Directory | What it is | Stack | Port |
|-----------|-----------|-------|------|
| `backend/` | REST API, all business logic | Laravel 13, PHP 8.3+, Sanctum, Reverb, Socialite, Cloudinary, Twilio | 8000 |
| `frontend/` | Public marketing/home app | Next.js 15 App Router, React 19, Tailwind v4 | 3000 |
| `shop/` | Customer storefront (UNIMPLEMENTED — starter template) | Next.js 15 App Router | 3003 |
| `admin/` | Admin dashboard SPA (nav-switch, no router) | Vite + React 19, Tailwind | 3001 |
| `vendor/` | Vendor portal SPA (nav-switch, no router) | Vite + React 19, Tailwind | 3002 |
| `graft/` | Auto-generated per-file `.md` docs — NOT hand-written code | tooling | — |
| `sql/`, `.claude/`, `.kilo/`, `.clinerules/` | tooling/config only, no tracked code | — | — |

Root config of note: each frontend app is deployed independently (frontend/shop/admin/vendor → Vercel as `home.circuit`/`shop.circuit`/`admin.circuit`/`vender.circuit`, backend → Railway as `backend.circuit`). Each app has a `Dockerfile` + `vercel.json` + `.env.example`. README documents local no-Docker dev: `php artisan serve` for backend, `npm run dev` per frontend app. DB: local MySQL 8 `circuit_bazaar`, user `root`, empty password, `localhost:3306`.

## How the apps connect

- Every frontend app talks to the API at `NEXT_PUBLIC_API_URL` / `VITE_API_URL` (default `http://localhost:8000/api` or bare `http://localhost:8000` depending on app — see per-app details + Known Bugs).
- Auth is **Sanctum personal access tokens**; each app stores user JSON + token in its own localStorage keys: frontend `circuit-bazaar-auth`/`circuit-bazaar-token`, admin `admin-auth`/`admin-token`, vendor `vendor-auth`/`vendor-store`/`vendor-token`.
- CORS handled by custom `App\Http\Middleware\Cors` (appended to the `api` group in `bootstrap/app.php`): allowlist localhost:3000-3003 + `*.localhost` subdomains + `CORS_ALLOWED_ORIGINS` env; otherwise falls back to `Access-Control-Allow-Origin: *`.


## Database schema & models (`backend/app/Models/`)

Model conventions: modern Laravel — `User`, `VendorApplication`, `OtpCode` use PHP attributes `#[Fillable([...])]` / `#[Hidden([...])]`; other models use `protected $fillable`. JSON casts: `Product.specs`, `Category.spec_schema`, `Payment.payload` → `array`.

- **User** — `Authenticatable`, `HasApiTokens`. Fields: name, email, password (hashed cast), role (`customer|vendor|admin`), status (`active|inactive|banned`), email_verified_at, phone, phone_verified_at, google_id, Nepal address block (address, city, province, district, municipality, ward, postal_code, country), must_change_password (bool — set when admin approves a vendor application; vendor portal gates on SetPassword page until `/auth/set-password` clears it).
- **VendorStore** — belongsTo User; hasMany Product; `hasManyThrough(OrderItem, Product, 'vendor_store_id', 'product_id', 'id', 'id')`. Fields: user_id, store_name, description, logo, banner, address, phone, verified (bool cast), status. Appended attributes `logo_url`/`banner_url` (both just return logo/banner).
- **Category** — name, slug, description, image, display_order, is_active, **spec_schema** (JSON: key, label, type, options, required); hasMany Product + SubCategory. Admin edits schema via `PUT /admin/categories/{category}/spec-schema` (AdminController@updateCategorySpecSchema) and `PUT /admin/categories/{id}/spec-schema` (CategoryController@updateSpecSchema, also wired as `PUT /admin/categories/{category}/spec-schema` at api.php:168).
- **SubCategory** — belongsTo Category; **SuperSubCategory** — belongsTo SubCategory. Both carry name/slug/description/image/display_order/is_active.
- **Product** — vendor_store_id, category_id, name, sku, description, price, stock, image, **specs** (JSON), status. belongsTo VendorStore, Category; hasMany OrderItem, Review.
- **Order** — user_id, order_number (`ORD-`+8 random uppercase), status (`pending|processing|shipped|delivered|cancelled`), total (decimal:2), payment_method (`esewa|khalti|cod|stripe`), payment_status (`pending|paid|failed`), shipping_address/city/phone. belongsTo User; hasMany items (OrderItem) + payments (Payment).
- **OrderItem** — order_id, product_id, vendor_store_id, denormalized product_name/product_sku/unit_price/quantity/subtotal (vendor+admin sales computed from these). belongsTo Order, Product, VendorStore.
- **Payment** — order_id, user_id, method, status, transaction_id, amount (decimal:2), payload (JSON). belongsTo Order, User.
- **Review** — user_id, product_id, vendor_store_id (nullable), rating 1-5, comment (max 1000). Only creatable for products in a **delivered** order of the reviewer (`ReviewController@store` checks OrderItem→order user_id + status=delivered). belongsTo User, Product, VendorStore.
- **OtpCode** — user_id, email/phone, code (6-digit), type (`email_verification|phone_verification|password_reset`), expires_at (10 min via `AuthController::OTP_EXPIRY_MINUTES`).
- **VendorApplication** — vendor self-signup: full_name, email, phone, store_name, description, website, pan_number, Nepal address block, experience, otp_code, otp_expires_at (5 min), otp_verified_at, status (`pending|verified|approved|rejected`). PAN regex used in both vendor flows: `/^[A-Z]{3}[0-9]{7}$|^[0-9]{8,10}$/`.
- **Content models**: BlogPost (title, slug, category, author, cover_image, body, published_at, is_published), CareerPost (title, slug, description, requirements, is_published), JobPosting (title, slug, department, location, employment_type, description, responsibilities, requirements, benefits, application_deadline, is_active) + JobApplication (job_posting_id, full_name, email, phone, notice_period enum `15_days|1_month|2_months|3_months`, cv_url, submitted_at), CourierInfo (title, body, delivery_zones), HomepageSlider (title, subtitle, image_url, headline, link_url, sort_order, is_active), Faq (question, answer, display_order, is_active), Brand (name, slug, logo, description, website, is_active), Testimonial (name, role, company, content, photo, rating, is_published), NewsletterSubscriber (email, firstOrCreate).



## API contract (`backend/routes/api.php`, ~195 lines)

All URLs below are under `/api` (api.php). `routes/web.php` only serves the welcome view and `GET /nepal-address.json` (from `public/`). JSON errors always rendered for `api/*` (bootstrap `shouldRenderJsonWhen`). Throttles noted inline.

### Public — health & misc
- `GET /health` → `{status:'ok', service:'circuit-bazaar-api', time}`.
- `POST /newsletter/subscribe` (throttle 5/min) → ContentController@newsletterSubscribe.

### Public — auth (AuthController, ~790 lines)
- `POST /auth/register` (10/min) — name, password confirmed, `channel: email|phone`, email XOR phone required per channel; optional address/city/postal_code/country. Creates user role=customer status=active; email channel → `OtpCode` + `OtpMail`; phone channel → `OtpCode` + Twilio `SmsService@sendOtp`.
- `POST /auth/verify-email-otp`, `POST /auth/send-phone-otp`, `POST /auth/verify-phone-otp`, `POST /auth/resend-otp` (5/min), `POST /auth/check-email` (30/min).
- `POST /auth/login` (10/min) — `{identifier, password}` (identifier = email or phone). Sets OTP-verified tokens; phone-unverified login returns `requires_phone_verification` shape the frontend AuthContext maps to `PHONE_VERIFICATION_REQUIRED`.
- `POST /auth/vendor-login` (10/min) — vendor role only; returns user + store + `must_change_password`.
- Google OAuth: `GET /auth/google/redirect` + `GET /auth/google/callback` inside `web` middleware (Socialite; frontend passes `?redirect_to=<origin>`).
- Password reset: `POST /auth/forgot-password` → `POST /auth/verify-reset-otp` → `POST /auth/reset-password` (all 5/min).
- Authed (sanctum): `POST /auth/logout`, `GET /auth/me`, `POST /auth/update-profile` (address block + phone), `POST /auth/set-password` (email + password confirmed; only when `must_change_password`).

### Public — vendor application (VendorApplicationController)
- `POST /vendor/apply` (5/min) — creates VendorApplication pending + email OTP (OtpMail, type `vendor_application`); `POST /vendor/verify-otp` (10/min) → status `verified`; `POST /vendor/resend-otp` (5/min). Admin approval later creates User + VendorStore + mails `VendorCredentialsMail`.

### Public — browsing
- `GET /products` — filters: `category` (id), `search` (name/description/sku LIKE), `min_price`, `max_price`, `spec[<key>]` (JSON `specs->$key` match), `sort` (`price_asc|price_desc|newest|popular` — popular = withCount orderItems SUM(quantity)); paginate 24; eager loads vendorStore+category+reviews.
- `GET /products/{product}` (404 unless status=active), `GET /categories` (full tree: Category→subCategories→superSubCategories), `GET /categories/{category}/spec-schema`, `GET /categories/{category}/sub-categories`, `GET /sub-categories/{subCategory}/super-sub-categories`, `GET /brands`, `GET /faqs`.
- Content: `GET /blog` (+`/blog/{id}`, `/blog/slug/{slug}`; published only; cover_image → Cloudinary `deliveryUrl` w=1200), `GET /careers` (+`{id}`), `GET /courier` (single record), `GET /sliders` (active, sort_order).
- Jobs: `GET /job-postings`, `GET /job-postings/{idOrSlug}` (slug OR id), `POST /job-postings/{id}/apply` — CV via file upload (mimes:pdf max 5MB → Cloudinary raw) OR `cv_base64`+`cv_filename` (decoded → `storage/public/cvs/`); notice_period enum; rejects inactive posting or past deadline.
- Testimonials public: `GET /testimonials` (published), `GET /testimonials/{id}`.

### Public — payment callbacks (gateways call these)


### Protected — customer (`auth:sanctum`)
- Orders (`OrderController`): `POST /orders`, `GET /orders` (own, filter `status`, paginate 15, eager items.product), `GET /orders/{order}` (own or admin else 403). `OrderController@store` — validates items (`items.*.product_id` exists, quantity min 1), shipping_address/city/phone, payment_method enum; per-item stock check then DB transaction: create Order (`ORD-`+Str::random(8)) + OrderItems (denormalized name/sku/unit_price/subtotal) + `decrement('stock')` per product + create pending Payment (amount=total). Dead ternary note: `'cod' ? 'pending' : 'pending'` (see Known Bugs).
- `POST /reviews` (ReviewController@store — delivered-order check; updateOrCreate per user+product).
- `POST /payments/initiate/{order}` (own or admin else 403; 422 if already paid; validates `method`; updates order payment_method; Payment updateOrCreate; calls PaymentService@initiate).

### Admin (`auth:sanctum` + `role:admin`)
- Core (AdminController): `GET /admin/stats` (counts + revenue of paid orders + recent 5 users/orders), `GET /admin/users` (search/role filters, makeVisible address block), `PATCH /admin/users/{user}/status` (`active|inactive|banned`), `POST /admin/users` (createAdmin — role=admin), `DELETE /admin/users/{user}`.
- Vendors (AdminController): `GET /admin/vendors`, `POST /admin/vendors/{vendorStore}/verify`, `POST /admin/vendors/{vendorStore}/suspend`, `GET /admin/vendor-applications`, `GET /admin/new-vendor-applications`, `POST /admin/vendor-applications/{va}/approve` (creates User role=vendor + verified VendorStore + mails `VendorCredentialsMail`), `POST /admin/vendor-applications/{va}/reject`.
- Catalog/data (AdminController): `GET /admin/products` (search/category/status), `DELETE /admin/products/{product}`, `GET /admin/orders` (search order_number/user name, status filter), `PATCH /admin/orders/{order}/status` (fires OrderStatusUpdated), `GET /admin/sales` (daily|monthly over paid orders), `GET /admin/categories` (with spec_schema), `PUT /admin/categories/{category}/spec-schema` (AdminController@updateCategorySpecSchema — note api.php:168 also points this path at AdminController, so Admin\CategoryController@updateSpecSchema is redundant).
- apiResources under `/admin`: `categories`, `sub-categories`, `super-sub-categories`, `brands` (+ `POST /admin/brands/{brand}/upload-logo` — mimes:svg max 5MB → Cloudinary), `faqs` (controllers in `App\Http\Controllers\Admin\`).
- Content (prefix `admin/content`, ContentController, each mutating method also calls private `authorizeAdmin()`): blog CRUD + `POST /admin/content/upload/image` (max 5MB → Cloudinary `circuit-bazaar/blog`), careers CRUD, courier `GET/POST/PUT/DELETE`, sliders CRUD.


### Vendor (`auth:sanctum` + `role:vendor`, prefix `vendor` — VendorController)
- Store: `POST /vendor/store` (registerStore — store_name required, pan_number regex `/^[A-Z]{3}[0-9]{7}$|^[0-9]{8,10}$/`, optional logo/banner files (jpg/jpeg/png/webp max 2MB → Cloudinary via private `uploadStoreImage`) or `logo_url`/`banner_url`; sets user role=vendor, store status=pending), `PUT /vendor/store`, `GET /vendor/store` (myStore + computed rating/total_products/total_orders/total_revenue).
- Products: `GET /vendor/products` (own store, search/category/status filters + stats), `POST /vendor/products` (validates `specs` against the category's spec_schema — types select/number/boolean/text, required check, unknown-key rejection; duplicate SKU guard), `PUT /vendor/products/{product}` (403 if not own), `POST /vendor/products/{product}/image` (image → Cloudinary), `DELETE /vendor/products/{product}`.
- Orders: `GET /vendor/orders` (orders containing own OrderItems, distinct order_ids, status filter via whereHas, paginate 20), `PATCH /vendor/orders/{order}/status` (403 unless own OrderItem in order; status enum; fires `OrderStatusUpdated`).
- `GET /vendor/sales` (daily|monthly; OrderItem join orders where payment_status=paid, SUM(subtotal), COUNT DISTINCT order_id), `GET /vendor/reviews` (own store reviews with user+product, paginate 15).

### Payments — strategy pattern (`backend/app/Services/Payments/`)
- `PaymentGatewayInterface { initiate(Order): array; verify(array): bool }`. `PaymentService` = `match` factory (`esewa|khalti|stripe|cod` else InvalidArgumentException) + `initiate(Order)` / `verify(method, data)`. PaymentController injects it (`__construct(private PaymentService $payments)`).
- **EsewaGateway** — HMAC-SHA256 signed form POST (`signed_field_names=total_amount,transaction_uuid,product_code`) to `rc.esewa.com.np/api/epay/main/v2/form`; verify = hash_equals of received vs recomputed signature over base64 `data`; order number = `transaction_uuid` decoded from data (private `extractOrderNumberFromEsewa`).
- **KhaltiGateway** — POST `{base_url}/epayment/initiate/` (amount paisa = total*100, return_url = khalti callback route, customer_info from order user) → uses returned `payment_url`; verify = `POST /epayment/lookup/` with `pidx`, success when status `Completed`.
- **StripeGateway** — PaymentIntent via multipart POST `v1/payment_intents` (paisa, currency usd, metadata order_id/order_number, automatic_payment_methods, return_url → webhook route) → `client_secret` + `payment_intent_id`; throws RuntimeException on Stripe error; verify = re-GET PaymentIntent, success when status `succeeded`. Config under `services.{esewa|khalti|stripe}.*` (+ `base_url` overrides for dev/test).
- **CodGateway** — initiate returns `method:'none'` + pending message; verify always true.
- **resolvePayment(orderNumber, success, transactionId?)** (PaymentController, DB transaction): finds Order by order_number (silently returns if none), latest Payment; success → payment status=paid + transaction_id (default order_number), order payment_status=paid status=processing; failure → payment failed, order payment_status=failed status=cancelled, **stock restored** (`increment('stock', quantity)` per item). Esewa/Khalti callbacks `redirect()->away('/payment/success'|'/payment/failure')`; Stripe returns JSON `{status}`.

### Broadcast, middleware & services
- `App\Events\OrderStatusUpdated implements ShouldBroadcast` → private channel `order.{id}`, payload id/status/payment_status/updated_at (ISO). Fired by VendorController + AdminController updateOrderStatus. Reverb (`laravel/reverb`) websocket server; `Broadcast::routes(['middleware'=>['auth:sanctum']])` in api.php. Test: `tests/Feature/ChannelAuthTest.php`.
- `bootstrap/app.php`: `withRouting(web/api/commands, health:'/up')`; alias `role` → RoleMiddleware; custom `Cors` appended to `api` group; JSON exceptions for `api/*`.
- `RoleMiddleware` — variadic roles, 403 JSON `{message:'Unauthorized.'}`.
- `Cors` — allowlist localhost:3000-3003 + frontend/admin/vendor/shop.localhost + env `CORS_ALLOWED_ORIGINS`; OPTIONS → 204; matched origin gets credentials=true; unmatched falls back to `*`.
- `config/cloudinary.php` — CLOUDINARY_* env. `CloudinaryService`: `upload(file, folder='circuit-bazaar/products')` (jpg/jpeg/png/webp/svg), `uploadRaw` (pdf → `circuit-bazaar/cvs`), `deliveryUrl(url, w=1200, q='auto', f='auto')` — replaces `/upload/` with transformation segment; constructor try/catch → client null-safe (methods return null).
- `SmsService@sendOtp(to, code)` — Twilio REST `Http::withBasicAuth`; logs + returns false when credentials missing; body text says "expires in 5 minutes" though OtpCode expiry is 10.
- Mailables: `OtpMail(code, type)` — subject varies by type, view `emails.otp`; `VendorCredentialsMail(email, password, portalUrl)` — view `emails.vendor-credentials`.


### Backend tests (`backend/tests/`)
- `Feature/`: ChannelAuthTest, ContentTest, NepalAddressTest, PaymentTest, ProductImageTest, ProductSpecTest, RegistrationTest, ExampleTest; `Unit/ExampleTest.php`; `tests/TestCase.php`. Run via `composer test` (artisan test). `backend/tmp/` has throwaway env test scripts.

## Frontend apps

### `frontend/` — public home app (Next.js 15 App Router, port 3000)
- `src/app/layout.tsx` — Geist fonts + Material Symbols Outlined + JetBrains Mono; wraps children in AuthProvider + Navbar + Footer. ⚠ metadata still says "Lumen Studio — Design Tooling for Teams" (template leftover).
- `src/app/page.tsx` — composes 13 section components from `src/components/sections/`: HomepageSlider, TrustedBrand, About, WhyCircuitBazaar, FeaturedProducts, ShopByCategory, TrustedBrands, StatsBar, HowItWorks, Testimonials, BlogTeaser, FAQPreview, VendorCTA.
- Pages: `/shop`, `/blogs` + `[slug]`, `/career` + `[slug]` (JobPostingCard, ApplyForm, ShareRow), `/courier`, `/testimonials`, `/vendor`, `/login`, `/register`, `/forgot-password`, `/reset-password`; `error.tsx`, `not-found.tsx`.
- `src/lib/api.ts` — `apiClient<T>(path, options)` wrapper (default `NEXT_PUBLIC_API_URL` = `http://localhost:8000/api`; throws Error with `.status`) + typed interfaces (BlogPost, CareerPost, JobPosting, Testimonial, CourierInfo, HomepageSlider, Category tree, Brand, Faq) + getCategories/getBrands/getSliders/getFaqs.
- `src/context/AuthContext.tsx` — localStorage `circuit-bazaar-auth` (user JSON) + `circuit-bazaar-token` (Sanctum token). login (identifier/password; maps `requires_phone_verification` → throws `PHONE_VERIFICATION_REQUIRED`), signup (channel email|phone with Nepal AddressValue), verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, resendOtp, googleLogin (`/auth/google/redirect?redirect_to=<origin>`), logout. `useAuth()` returns a no-op default object outside the provider (doesn't throw).
- `src/components/NepalAddressPicker.tsx` — province/district/municipality/ward picker (data: `public/nepal-address.json`); `ScrollReveal.tsx`; `src/data/hardwareData.ts` mock fallback; `src/types.ts` — client Product/Vendor/CommunityBuild/CartItem/HardwareDrop (CategoryType union 'PC Components'|'IoT Gear'|'Laptops'|'Networking').
- `next.config.mjs` — reactStrictMode, output standalone, images remotePatterns images.unsplash.com + lh3.googleusercontent.com; `tailwind.config.cjs`.

### `shop/` — storefront (port 3003) — UNIMPLEMENTED
- Still the create-next-app starter (Next.js logo page). Only real code: `src/lib/api.ts` — token-aware `apiClient` (getToken/setToken/clearToken on `circuit-bazaar-token`, Bearer header, PaginatedResponse type). Next project step: build the storefront against the public product endpoints.

### `admin/` — admin dashboard (Vite + React 19, port 3001)
- No router — `src/App.tsx` switch on `activeNav` state; Sidebar/Header; one `apiFetch(endpoint, options)` created in App.tsx and passed as prop to every page (Bearer from `admin-token`, 401/403 → logout).
- Pages (`src/pages/`): Dashboard, Analytics, CustomersPage, AdminsPage, VendorsPage, ProductsPage, CategoriesPage, SubCategoriesPage, SuperSubCategoriesPage, BrandsPage, FaqPage, OrdersPage, SalesReports, BlogPostsPage, JobPostingsPage, TestimonialsPage, CourierPage, SlidersPage, Settings, Login. Shared: DataTable, Modal, PageHeader, StatCard. `src/data/mockData.ts` fallback; types `src/types/index.ts`.
- `src/context/AuthContext.tsx` — login via `/api/auth/login` (client-side admin role check), localStorage `admin-auth`/`admin-token`; exports getAdminToken() + getApiUrl() (VITE_API_URL trimmed, default **`http://localhost:8000/api`**). ⚠ double-prefix bug: getApiUrl default already includes `/api`, but App.tsx fetches `${getApiUrl()}/api${endpoint}` → `/api/api/...` unless VITE_API_URL is set bare (prod sets it bare; broken default).


### `vendor/` — vendor portal (Vite + React 19, port 3002)
- Same SPA pattern as admin: `src/App.tsx` switch on activeNav; `apiFetch` in useMemo (Bearer from `vendor-token`, 401/403 → logout, throws message). Exported type `ApiFetch`.
- Pages: Dashboard, Store (register/update via `/vendor/store`), Products (create/update with per-category spec forms + image upload), Orders, Sales, Analytics, Reviews, Login (`/auth/vendor-login`), SetPassword (gated on must_change_password → `/auth/set-password`), ForgotPassword, ResetPassword, VerifyOtp. Components: Sidebar, Header, Modal, StatCard, StatusBadge, Charts, UI, PasswordFieldGroup, PasswordResetForm. `src/data/mockData.ts` fallback; types `src/types/index.ts` (VendorUser + VendorStore mirror backend shapes incl. computed rating/total_products/total_orders/total_revenue).
- `src/context/AuthContext.tsx` — localStorage `vendor-auth`/`vendor-store`/`vendor-token`; login stores user+store+token + mustChangePassword flag; refreshStore persists; clearMustChangePassword updates stored user. `getApiUrl()` default `http://localhost:8000/api` and App fetches `${getApiUrl()}${endpoint}` with endpoints like `/vendor/products` — vendor expects VITE_API_URL to already include `/api` (**unlike admin**).
- `vite.config.ts`, `tailwind.config.js`, `index.html` + `src/main.tsx`, `src/styles.css`.

## Known bugs / left-behind notes (found during full read)
1. **shop/ is unimplemented** — starter template only.
2. **frontend/src/app/layout.tsx metadata** — "Lumen Studio" template text, not Circuit Bazaar.
3. **admin double `/api` prefix** — default getApiUrl() = `http://localhost:8000/api` then code appends `/api/...` → `/api/api/...`. Fix: default to bare `http://localhost:8000` (vendor's convention) or drop the appended `/api`.
4. **OrderController.store dead ternary** — `'cod' ? 'pending' : 'pending'` (both branches 'pending').
5. **ReviewController@productReviews(Product $product)** — no route wired in api.php (reviews reach clients via ProductController@show eager load); `Product` model not imported in that file.
6. **Cors** default `Access-Control-Allow-Origin: *` (any site can send Authorization tokens); env allowlist only matters for credentialed requests.
7. **SmsService** body says OTP expires in 5 min; OtpCode expiry is actually 10.
8. **frontend/ + vendor/** still ship mock/hardware data fallbacks alongside real API calls.

## Code conventions to follow when editing
- Backend: `response()->json(['message' => ..., ...])`; validation via `$request->validate([...])` (or Validator with after-hooks for conditionals) → 422 `{errors}`; ownership checks → 403 `{message:'Unauthorized.'}`; route-model binding where possible, explicit `findOrFail($id)` in id/slug-string controllers; Cloudinary for all media; `match()` over switch; modern attributes (`#[Fillable]`) on newer models.
- Next apps: 'use client' components, typed generic fetch wrappers, per-app localStorage auth keys (listed above), Tailwind utilities, pages under `src/app/`.
- Vite SPAs: pages receive `apiFetch` prop; switch-on-state navigation; shared DataTable/Modal/StatCard; `VITE_API_URL` env.
- Run/verify: backend `composer test` / `php artisan test`; frontend `npm run dev` per directory (frontend 3000, shop 3003, admin 3001, vendor 3002), `npm run build` for type checks.

<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ContentController;

// Public routes
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'circuit-bazaar-api', 'time' => now()->toIso8601String()]);
});

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/auth/verify-email-otp', [AuthController::class, 'verifyEmailOtp'])->middleware('throttle:10,1');
Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:5,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/vendor-login', [AuthController::class, 'vendorLogin'])->middleware('throttle:10,1');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::post('/auth/check-email', [AuthController::class, 'checkEmail'])->middleware('throttle:30,1');

// Public product browsing
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/categories/{category}/spec-schema', [ProductController::class, 'specSchema']);

// Payment callbacks/webhooks (public - called by gateways)
Route::post('/payments/callback/esewa', [PaymentController::class, 'callbackEsewa'])->name('payments.callback.esewa');
Route::post('/payments/callback/khalti', [PaymentController::class, 'callbackKhalti'])->name('payments.callback.khalti');
Route::post('/payments/webhook/stripe', [PaymentController::class, 'webhookStripe'])->name('payments.webhook.stripe');

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/update-profile', [AuthController::class, 'updateProfile']);

    // Customer routes
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Payment initiation
    Route::post('/payments/initiate/{order}', [PaymentController::class, 'initiate']);
});

// Public content routes
Route::get('/blog', [ContentController::class, 'blogIndex']);
Route::get('/blog/{id}', [ContentController::class, 'blogShow']);
Route::get('/careers', [ContentController::class, 'careerIndex']);
Route::get('/careers/{id}', [ContentController::class, 'careerShow']);
Route::get('/courier', [ContentController::class, 'courierShow']);
Route::get('/sliders', [ContentController::class, 'activeSliders']);

// Admin content routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/content')->group(function () {
    // Blog
    Route::get('/blog', [ContentController::class, 'blogIndex']);
    Route::post('/blog', [ContentController::class, 'blogStore']);
    Route::get('/blog/{id}', [ContentController::class, 'blogShow']);
    Route::put('/blog/{id}', [ContentController::class, 'blogUpdate']);
    Route::delete('/blog/{id}', [ContentController::class, 'blogDestroy']);

    // Careers
    Route::get('/careers', [ContentController::class, 'careerIndex']);
    Route::post('/careers', [ContentController::class, 'careerStore']);
    Route::get('/careers/{id}', [ContentController::class, 'careerShow']);
    Route::put('/careers/{id}', [ContentController::class, 'careerUpdate']);
    Route::delete('/careers/{id}', [ContentController::class, 'careerDestroy']);

    // Courier
    Route::get('/courier', [ContentController::class, 'courierShow']);
    Route::post('/courier', [ContentController::class, 'courierStore']);
    Route::put('/courier/{id}', [ContentController::class, 'courierUpdate']);

    // Sliders
    Route::get('/sliders', [ContentController::class, 'slidersIndex']);
    Route::post('/sliders', [ContentController::class, 'sliderStore']);
    Route::put('/sliders/{id}', [ContentController::class, 'sliderUpdate']);
    Route::delete('/sliders/{id}', [ContentController::class, 'sliderDestroy']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}/status', [AdminController::class, 'updateUserStatus']);
    Route::get('/vendors', [AdminController::class, 'vendors']);
    Route::post('/vendors/{vendorStore}/verify', [AdminController::class, 'verifyVendor']);
    Route::post('/vendors/{vendorStore}/suspend', [AdminController::class, 'suspendVendor']);
    Route::get('/products', [AdminController::class, 'products']);
    Route::delete('/products/{product}', [AdminController::class, 'deleteProduct']);
    Route::get('/orders', [AdminController::class, 'orders']);
    Route::patch('/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
    Route::get('/sales', [AdminController::class, 'salesReport']);
    Route::get('/categories', [AdminController::class, 'categories']);
    Route::put('/categories/{category}/spec-schema', [AdminController::class, 'updateCategorySpecSchema']);
});

// Vendor routes
Route::middleware(['auth:sanctum', 'role:vendor'])->prefix('vendor')->group(function () {
    Route::post('/store', [VendorController::class, 'registerStore']);
    Route::get('/store', [VendorController::class, 'myStore']);

    Route::get('/products', [VendorController::class, 'products']);
    Route::post('/products', [VendorController::class, 'createProduct']);
    Route::put('/products/{product}', [VendorController::class, 'updateProduct']);
    Route::post('/products/{product}/image', [VendorController::class, 'updateProductImage']);
    Route::delete('/products/{product}', [VendorController::class, 'deleteProduct']);

    Route::get('/orders', [VendorController::class, 'orders']);
    Route::patch('/orders/{order}/status', [VendorController::class, 'updateOrderStatus']);

    Route::get('/sales', [VendorController::class, 'sales']);
    Route::get('/reviews', [VendorController::class, 'reviews']);
});

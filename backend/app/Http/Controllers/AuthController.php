<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\GoogleAuthCode;
use App\Models\OrderItem;
use App\Models\OtpCode;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\VendorStore;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    private const OTP_EXPIRY_MINUTES = 10;

    /**
     * Normalize a phone number to E.164 (+<country><number>, no spaces/dashes)
     * so Twilio accepts it. Plain 10-digit Nepal mobiles gain the +977 prefix.
     */
    private function normalizePhone(?string $phone): ?string
    {
        if ($phone === null || $phone === '') {
            return null;
        }

        $trimmed = trim($phone);

        // Already E.164 (+97798...) — strip separators, keep the leading +.
        if (str_starts_with($trimmed, '+')) {
            $digits = preg_replace('/\D/', '', $trimmed);

            return $digits === '' ? null : '+'.$digits;
        }

        $digits = preg_replace('/\D/', '', $trimmed);
        if ($digits === '' || $digits === null) {
            return null;
        }

        // Local 10-digit Nepal mobile (98XXXXXXXX / 97XXXXXXXX).
        if (strlen($digits) === 10 && str_starts_with($digits, '9')) {
            return '+977'.$digits;
        }

        // Local number with trunk zero (098XXXXXXXX) — drop the zero, add +977.
        if (strlen($digits) === 11 && str_starts_with($digits, '0')) {
            $withoutTrunk = substr($digits, 1);
            if (strlen($withoutTrunk) === 10 && str_starts_with($withoutTrunk, '9')) {
                return '+977'.$withoutTrunk;
            }
        }

        // International number without + (e.g. 97798XXXXXXXX).
        if (strlen($digits) > 10 && str_starts_with($digits, '977')) {
            return '+'.$digits;
        }

        // Unknown shape — reject rather than guess a country.
        return null;
    }

    /**
     * How long the single-use code handed to /auth/callback stays redeemable.
     */
    private const GOOGLE_CODE_EXPIRY_MINUTES = 5;

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            // Uniqueness is per persona: the same email may also exist as a
            // vendor and/or admin account, but only once as a customer.
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->where('role', 'customer')],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->where('role', 'customer'), 'regex:/^\+?[0-9\s\-()]{7,20}$/'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'channel' => ['required', 'in:email,phone'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'ward' => ['nullable', 'string', 'max:20'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        $validator->after(function ($validator) use ($request) {
            $hasEmail = ! empty($request->email);
            $hasPhone = ! empty($request->phone);

            if ($request->channel === 'email' && ! $hasEmail) {
                $validator->errors()->add('email', 'Email is required when channel is email.');
            }

            if ($request->channel === 'phone') {
                if (! $hasPhone) {
                    $validator->errors()->add('phone', 'Phone is required when channel is phone.');
                } elseif (! $this->normalizePhone($request->phone)) {
                    $validator->errors()->add('phone', 'Enter a valid phone number in E.164 format, e.g. +97798XXXXXXXX.');
                }
            }

            if (! $hasEmail && ! $hasPhone) {
                $validator->errors()->add('email', 'Either email or phone is required.');
                $validator->errors()->add('phone', 'Either email or phone is required.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $normalizedPhone = $this->normalizePhone($request->phone);
        if ($request->phone && ! $normalizedPhone) {
            return response()->json(['errors' => ['phone' => ['Enter a valid phone number in E.164 format, e.g. +97798XXXXXXXX.']]], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $normalizedPhone,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'city' => $request->city,
            'province' => $request->province,
            'district' => $request->district,
            'municipality' => $request->municipality,
            'ward' => $request->ward,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'role' => 'customer',
            'status' => 'active',
        ]);

        if ($request->channel === 'email') {
            try {
                $this->generateAndSendOtp($user->email, $user->id, 'email_verification');
            } catch (\Throwable $e) {
                $user->delete();
                report($e);

                return response()->json(['message' => 'Could not send the verification email. Please try again.'], 502);
            }
        } elseif ($request->channel === 'phone' && $user->phone) {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            OtpCode::create([
                'user_id' => $user->id,
                'email' => null,
                'phone' => $user->phone,
                'code' => $code,
                'type' => 'phone_verification',
                'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),
            ]);

            if (! (new SmsService)->sendOtp($user->phone, $code)) {
                $user->delete();

                return response()->json(['message' => 'Could not send the verification SMS. Please check the number and try again.'], 502);
            }

            $otp = $code;
        }

        return response()->json([
            'message' => 'Registration successful. Please verify your '.($request->channel === 'email' ? 'email' : 'phone').'.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'channel' => $request->channel,
            ],
        ], 201);
    }

    public function verifyEmailOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'customer')->where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.'], 422);
        }

        $otp = OtpCode::where('email', $request->email)
            ->where('type', 'email_verification')
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (! $otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);
        $user->update(['email_verified_at' => Carbon::now()]);

        $token = null;
        if ($user->phone_verified_at) {
            $token = $user->createToken('auth_token')->plainTextToken;
        }

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'email_verified' => true,
                'phone_verified' => ! is_null($user->phone_verified_at),
            ],
            'token' => $token,
        ]);
    }

    public function sendPhoneOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['nullable', 'exists:users,id'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $validator->after(function ($validator) use ($request) {
            if (! $request->user_id && ! $request->email) {
                $validator->errors()->add('user_id', 'Either user_id or email is required.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = null;
        if ($request->user_id) {
            $user = User::findOrFail($request->user_id);
        } elseif ($request->email) {
            $user = User::where('role', 'customer')->where('email', $request->email)->first();
        }

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->filled('phone')) {
            $user->update(['phone' => $request->phone]);
        }

        if (! $user->phone) {
            return response()->json(['message' => 'Phone number not provided.'], 422);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id' => $user->id,
            'phone' => $user->phone,
            'code' => $code,
            'type' => 'phone_verification',
            'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),
        ]);

        $sms = new SmsService;
        $sent = $sms->sendOtp($user->phone, $code);

        if (! $sent) {
            return response()->json([
                'message' => 'OTP generated but SMS delivery failed. Please try again.',
                'phone' => $this->maskPhone($user->phone),
                'dev_code' => $code,
            ], 422);
        }

        return response()->json([
            'message' => 'OTP sent to your phone number.',
            'phone' => $this->maskPhone($user->phone),
        ]);
    }

    public function verifyPhoneOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'exists:users,id'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($request->user_id);

        $otp = OtpCode::where('user_id', $user->id)
            ->where('phone', $user->phone)
            ->where('type', 'phone_verification')
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (! $otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);
        $user->update(['phone_verified_at' => Carbon::now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Phone number verified successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'email_verified' => ! is_null($user->email_verified_at),
                'phone_verified' => true,
            ],
            'token' => $token,
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'type' => ['required', 'in:email_verification,phone_verification,password_reset'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'customer')->where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->type === 'email_verification') {
            $this->generateAndSendOtp($user->email, $user->id, 'email_verification');

            return response()->json(['message' => 'OTP sent to your email.']);
        }

        if ($request->type === 'phone_verification' && $user->phone) {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            OtpCode::create([
                'user_id' => $user->id,
                'phone' => $user->phone,
                'code' => $code,
                'type' => 'phone_verification',
                'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),
            ]);

            $sms = new SmsService;
            $sent = $sms->sendOtp($user->phone, $code);

            if (! $sent) {
                return response()->json([
                    'message' => 'OTP generated but SMS delivery failed. Please try again.',
                    'phone' => $this->maskPhone($user->phone),
                    'dev_code' => $code,
                ], 422);
            }

            return response()->json([
                'message' => 'OTP sent to your phone number.',
                'phone' => $this->maskPhone($user->phone),
            ]);
        }

        if ($request->type === 'password_reset') {
            $this->generateAndSendOtp($user->email, $user->id, 'password_reset');

            return response()->json(['message' => 'Password reset OTP sent to your email.']);
        }

        return response()->json(['message' => 'Invalid request.'], 422);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'password' => ['required', 'string'],
            // Which persona is signing in: shop/frontend customers (default),
            // or the admin portal which sends role=admin.
            'role' => ['nullable', 'in:customer,vendor,admin'],
        ]);

        $validator->after(function ($validator) use ($request) {
            if (! $request->filled('identifier') && ! $request->filled('email')) {
                $validator->errors()->add('identifier', 'Either identifier or email is required.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $identifier = $request->identifier ?: $request->email;
        $role = $request->input('role', 'customer');

        $user = User::where('role', $role)
            ->where(function ($q) use ($identifier) {
                $q->where('email', $identifier)->orWhere('phone', $identifier);
            })
            ->first();

        if (! $user) {
            return response()->json(['message' => 'No account found with that identifier.'], 404);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password.'], 401);
        }

        if ($user->status === 'banned') {
            return response()->json(['message' => 'Your account has been banned.'], 403);
        }

        // The OTP phone-verification gate only applies to customer accounts.
        // Vendors sign in through the vendor portal and admins are created by
        // other admins, so blocking them here would lock valid accounts out.
        if ($user->role === 'customer' && ! $user->phone_verified_at) {
            return response()->json([
                'message' => 'Phone verification is required before login.',
                'requires_phone_verification' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'email_verified' => ! is_null($user->email_verified_at),
                    'phone_verified' => false,
                ],
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
                'email_verified' => ! is_null($user->email_verified_at),
                'phone_verified' => ! is_null($user->phone_verified_at),
            ],
            'token' => $token,
        ]);
    }

    public function googleRedirect(Request $request)
    {
        $request->session()->put('google_auth_redirect_url', $this->googleReturnOrigin($request->input('redirect_to')));

        return Socialite::driver('google')->redirect();
    }

    public function googleCallback(Request $request)
    {
        $origin = $request->session()->pull('google_auth_redirect_url') ?? $this->googleReturnOrigin(null);

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            return redirect($origin.'/auth/callback?error=google_auth_failed');
        }

        // Google sign-in always resolves the *customer* persona. An email that
        // already belongs to a vendor or admin account gets its own customer
        // account created here — the shared email links the personas.
        $user = User::where('role', 'customer')
            ->where(function ($q) use ($googleUser) {
                $q->where('google_id', $googleUser->getId())
                    ->orWhere('email', $googleUser->getEmail());
            })
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'role' => 'customer',
                'status' => 'active',
            ]);
        } elseif (! $user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        // Hand the browser a single-use code rather than the token itself: the
        // callback page POSTs it to /auth/google/exchange, so the credential
        // never lands in browser history, access logs or Referer headers.
        $code = bin2hex(random_bytes(32));

        GoogleAuthCode::create([
            'code_hash' => hash('sha256', $code),
            'user_id' => $user->id,
            'requires_profile_completion' => ! $user->phone_verified_at || ! $user->address,
            'requires_phone_verification' => ! $user->phone_verified_at,
            'expires_at' => now()->addMinutes(self::GOOGLE_CODE_EXPIRY_MINUTES),
        ]);

        return redirect("{$origin}/auth/callback?code={$code}");
    }

    public function googleExchange(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'code' => ['required', 'string'],
        ])->validate();

        $record = GoogleAuthCode::where('code_hash', hash('sha256', $validated['code']))
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            return response()->json(['message' => 'This sign-in link has expired. Please try again.'], 422);
        }

        // Single use: burn the code before anything is handed back.
        $record->update(['used_at' => now()]);

        $user = $record->user;
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
                'email_verified' => ! is_null($user->email_verified_at),
                'phone_verified' => ! is_null($user->phone_verified_at),
            ],
            'token' => $token,
            'requires_profile_completion' => (bool) $record->requires_profile_completion,
            'requires_phone_verification' => (bool) $record->requires_phone_verification,
        ]);
    }

    /**
     * Origins the Google round-trip may return to. The browser only ever sends
     * an origin (never a path), so a whitelist keeps this from becoming an open
     * redirect; anything unrecognised falls back to the shop.
     */
    private function googleReturnOrigin(?string $origin): string
    {
        $allowed = array_values(array_filter((array) config('cors.allowed_origins', [])));
        $origin = $origin ? rtrim($origin, '/') : null;

        if ($origin && in_array($origin, $allowed, true)) {
            return $origin;
        }

        foreach ($allowed as $candidate) {
            if (str_contains($candidate, ':3003')) {
                return $candidate;
            }
        }

        return $allowed[0] ?? rtrim((string) config('app.url'), '/');
    }

    public function vendorLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'vendor')->where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        if ($user->role !== 'vendor') {
            return response()->json(['message' => 'Access denied. This portal is for vendors only.'], 403);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password.'], 401);
        }

        if ($user->status === 'banned') {
            return response()->json(['message' => 'Your account has been banned.'], 403);
        }

        $store = VendorStore::where('user_id', $user->id)->first();

        if (! $store) {
            return response()->json(['message' => 'No vendor store found. Please register your store first.'], 403);
        }

        if (! $store->verified || $store->status !== 'active') {
            return response()->json([
                'message' => 'Your vendor account is pending verification. Please wait for the admin to verify your store before logging in.',
                'verified' => (bool) $store->verified,
                'store_status' => $store->status,
            ], 403);
        }

        $token = $user->createToken('vendor_token')->plainTextToken;

        if ($user->must_change_password) {
            return response()->json([
                'message' => 'Password change required.',
                'must_change_password' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'address' => $user->address,
                    'city' => $user->city,
                    'postal_code' => $user->postal_code,
                    'country' => $user->country,
                    'email_verified' => ! is_null($user->email_verified_at),
                ],
                'store' => $this->vendorStorePayload($store),
                'token' => $token,
            ]);
        }

        return response()->json([
            'message' => 'Vendor login successful.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
                'email_verified' => ! is_null($user->email_verified_at),
            ],
            'store' => $this->vendorStorePayload($store),
            'token' => $token,
        ]);
    }

    private function vendorStorePayload(VendorStore $store): array
    {
        $store->rating = (float) (Review::where('vendor_store_id', $store->id)->avg('rating') ?? 0);
        $store->total_products = Product::where('vendor_store_id', $store->id)->count();
        $store->total_orders = OrderItem::where('vendor_store_id', $store->id)->distinct('order_id')->count('order_id');
        $store->total_revenue = (float) (OrderItem::where('vendor_store_id', $store->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->sum('order_items.subtotal') ?? 0);

        return $store->toArray();
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'customer')->where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $this->generateAndSendOtp($user->email, $user->id, 'password_reset');

        return response()->json(['message' => 'Password reset OTP sent to your email.']);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'reset_token' => ['nullable', 'string'],
            'code' => ['nullable', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $validator->after(function ($validator) use ($request) {
            if (! $request->filled('reset_token') && ! $request->filled('code')) {
                $validator->errors()->add('reset_token', 'Either reset_token or code is required.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'customer')->where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->filled('reset_token')) {
            $otp = OtpCode::where('email', $request->email)
                ->where('type', 'password_reset')
                ->where('verified_at', null)
                ->where('expires_at', '>', Carbon::now())
                ->orderByDesc('id')
                ->first();

            if (! $otp || $otp->code !== $request->reset_token) {
                return response()->json(['message' => 'Invalid or expired reset token.'], 422);
            }

            $otp->update(['verified_at' => Carbon::now()]);
            $user->update(['password' => Hash::make($request->password)]);

            return response()->json(['message' => 'Password reset successful.']);
        }

        $otp = OtpCode::where('email', $request->email)
            ->where('type', 'password_reset')
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (! $otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password reset successful.']);
    }

    public function verifyResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'customer')->where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $otp = OtpCode::where('email', $request->email)
            ->where('type', 'password_reset')
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (! $otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);

        $resetToken = bin2hex(random_bytes(32));

        return response()->json([
            'message' => 'OTP verified successfully.',
            'reset_token' => $resetToken,
        ]);
    }

    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            // Which persona to probe: the admin portal asks about admin
            // accounts, the shop (default) about customer ones.
            'role' => ['nullable', 'in:customer,vendor,admin'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = User::where('email', $request->email)
            ->where('role', $request->input('role', 'customer'))
            ->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Email is already registered.' : 'Email is available.',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'ward' => ['nullable', 'string', 'max:20'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Email is used as the account identity and cannot be changed here;
        // everything else is fair game.
        $data = $request->only([
            'name', 'phone', 'address', 'city', 'province',
            'district', 'municipality', 'ward', 'postal_code', 'country',
        ]);

        // A changed phone number has never been verified — clear the flag so
        // the account has to run the OTP flow again for the new number.
        if (array_key_exists('phone', $data) && $data['phone'] !== $user->phone) {
            $user->phone_verified_at = null;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'address' => $user->address,
                'city' => $user->city,
                'province' => $user->province,
                'district' => $user->district,
                'municipality' => $user->municipality,
                'ward' => $user->ward,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
                'email_verified' => ! is_null($user->email_verified_at),
                'phone_verified' => ! is_null($user->phone_verified_at),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function setPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('role', 'vendor')->where('email', $request->email)->first();

        if (! $user || ! $user->must_change_password) {
            return response()->json(['message' => 'Invalid request.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        return response()->json(['message' => 'Password set successfully.']);
    }
    public function me(Request $request)
    {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
                'role' => $request->user()->role,
                'address' => $request->user()->address,
                'city' => $request->user()->city,
                'province' => $request->user()->province,
                'district' => $request->user()->district,
                'municipality' => $request->user()->municipality,
                'ward' => $request->user()->ward,
                'postal_code' => $request->user()->postal_code,
                'country' => $request->user()->country,
                'email_verified' => ! is_null($request->user()->email_verified_at),
                'phone_verified' => ! is_null($request->user()->phone_verified_at),
            ],
        ]);
    }

    /**
     * Change password for an authenticated user. Requires the current password
     * to confirm identity, then sets the new password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    private function generateAndSendOtp(?string $email, ?int $userId, string $type): void
    {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id' => $userId,
            'email' => $email,
            'code' => $code,
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),
        ]);

        if ($email) {
            Mail::to($email)->send(new OtpMail($code, $type));
        }
    }

    private function maskPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) <= 4) {
            return $phone;
        }

        return substr($phone, 0, 2).'****'.substr($phone, -2);
    }
}

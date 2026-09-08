<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use App\Models\VendorStore;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    private const OTP_EXPIRY_MINUTES = 10;

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'channel' => ['required', 'in:email,phone'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        $validator->after(function ($validator) use ($request) {
            $hasEmail = ! empty($request->email);
            $hasPhone = ! empty($request->phone);

            if ($request->channel === 'email' && ! $hasEmail) {
                $validator->errors()->add('email', 'Email is required when channel is email.');
            }

            if ($request->channel === 'phone' && ! $hasPhone) {
                $validator->errors()->add('phone', 'Phone is required when channel is phone.');
            }

            if (! $hasEmail && ! $hasPhone) {
                $validator->errors()->add('email', 'Either email or phone is required.');
                $validator->errors()->add('phone', 'Either email or phone is required.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'role' => 'customer',
            'status' => 'active',
        ]);

        if ($request->channel === 'email') {
            $this->generateAndSendOtp($user->email, $user->id, 'email_verification');
        } elseif ($request->channel === 'phone' && $user->phone) {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            OtpCode::create([
                'user_id' => $user->id,
                'phone' => $user->phone,
                'code' => $code,
                'type' => 'phone_verification',
                'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),
            ]);

            $sms = new SmsService;
            $sms->sendOtp($user->phone, $code);
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

        $user = User::where('email', $request->email)->first();
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
            $user = User::where('email', $request->email)->first();
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

        $user = User::where('email', $request->email)->first();

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

        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
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

        if (! $user->phone_verified_at) {
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
        $request->session()->put('google_auth_redirect_url', $request->input('redirect_to'));

        return Socialite::driver('google')->redirect();
    }

    public function googleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            $redirectUrl = $request->session()->pull('google_auth_redirect_url', null) ?? env('APP_URL');
            return redirect($redirectUrl.'?error=google_auth_failed');
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
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

        $isNew = ! $user->phone_verified_at && ! $user->address;

        if ($isNew || ! $user->phone_verified_at) {
            $token = $user->createToken('auth_token')->plainTextToken;
            $redirectUrl = $request->session()->pull('google_auth_redirect_url', null) ?? env('APP_URL');
            
            if ($isNew) {
                return redirect("{$redirectUrl}?token={$token}&user_id={$user->id}&requires_profile_completion=1");
            }
            
            return redirect("{$redirectUrl}?token={$token}&user_id={$user->id}&requires_phone_verification=1");
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $redirectUrl = $request->session()->pull('google_auth_redirect_url', null) ?? env('APP_URL');

        return redirect("{$redirectUrl}?token={$token}&user_id={$user->id}");
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

        $user = User::where('email', $request->email)->first();

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
                'store' => [
                    'id' => $store->id,
                    'store_name' => $store->store_name,
                    'verified' => (bool) $store->verified,
                    'status' => $store->status,
                ],
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
            'store' => [
                'id' => $store->id,
                'store_name' => $store->store_name,
                'verified' => (bool) $store->verified,
                'status' => $store->status,
            ],
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

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

        $user = User::where('email', $request->email)->first();

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

        $user = User::where('email', $request->email)->first();

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
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Email is already registered.' : 'Email is available.',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update($request->only(['address', 'city', 'postal_code', 'country', 'phone']));

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
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

        $user = User::where('email', $request->email)->first();

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
                'role' => $request->user()->role,
                'address' => $request->user()->address,
                'city' => $request->user()->city,
                'postal_code' => $request->user()->postal_code,
                'country' => $request->user()->country,
                'email_verified' => ! is_null($request->user()->email_verified_at),
                'phone_verified' => ! is_null($request->user()->phone_verified_at),
            ],
        ]);
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

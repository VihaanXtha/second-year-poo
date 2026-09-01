<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use App\Services\SmsService;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'role' => 'customer',
            'status' => 'active',
        ]);

        $this->generateAndSendOtp($user->email, null, 'email_verification');

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
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

        $otp = OtpCode::where('email', $request->email)
            ->where('type', 'email_verification')
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (!$otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->update(['email_verified_at' => Carbon::now()]);
        }

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function sendPhoneOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($request->user_id);

        if (!$user->phone) {
            return response()->json(['message' => 'Phone number not provided.'], 422);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id' => $user->id,
            'phone' => $user->phone,
            'code' => $code,
            'type' => 'phone_verification',
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        $sms = new SmsService();
        $sent = $sms->sendOtp($user->phone, $code);

        if (!$sent) {
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

        if (!$otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);
        $user->update(['phone_verified_at' => Carbon::now()]);

        return response()->json(['message' => 'Phone number verified successfully.']);
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

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->type === 'email_verification') {
            $this->generateAndSendOtp($user->email, null, 'email_verification');
            return response()->json(['message' => 'OTP sent to your email.']);
        }

        if ($request->type === 'phone_verification' && $user->phone) {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            OtpCode::create([
                'user_id' => $user->id,
                'phone' => $user->phone,
                'code' => $code,
                'type' => 'phone_verification',
                'expires_at' => Carbon::now()->addMinutes(10),
            ]);

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
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password.'], 401);
        }

        if ($user->status === 'banned') {
            return response()->json(['message' => 'Your account has been banned.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
                'email_verified' => !is_null($user->email_verified_at),
            ],
            'token' => $token,
        ]);
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

        if (!$user) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        if ($user->role !== 'vendor') {
            return response()->json(['message' => 'Access denied. This portal is for vendors only.'], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password.'], 401);
        }

        if ($user->status === 'banned') {
            return response()->json(['message' => 'Your account has been banned.'], 403);
        }

        // Only verified vendors can login
        $store = \App\Models\VendorStore::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'No vendor store found. Please register your store first.'], 403);
        }

        if (!$store->verified || $store->status !== 'active') {
            return response()->json([
                'message' => 'Your vendor account is pending verification. Please wait for the admin to verify your store before logging in.',
                'verified' => (bool) $store->verified,
                'store_status' => $store->status,
            ], 403);
        }

        $token = $user->createToken('vendor_token')->plainTextToken;

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
                'email_verified' => !is_null($user->email_verified_at),
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

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $this->generateAndSendOtp($user->email, $user->id, 'password_reset');

        return response()->json(['message' => 'Password reset OTP sent to your email.']);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $otp = OtpCode::where('email', $request->email)
            ->where('type', 'password_reset')
            ->where('verified_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (!$otp || $otp->code !== $request->code) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otp->update(['verified_at' => Carbon::now()]);
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password reset successful.']);
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
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update($request->only(['address', 'city', 'postal_code', 'country']));

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
                'email_verified' => !is_null($request->user()->email_verified_at),
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
            'expires_at' => Carbon::now()->addMinutes(10),
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
        return substr($phone, 0, 2) . '****' . substr($phone, -2);
    }
}
<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use App\Models\VendorApplication;
use App\Models\VendorStore;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class VendorApplicationController extends Controller
{
    public function apply(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'store_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'website' => ['nullable', 'url', 'max:255'],
            'pan_number' => ['required', 'string', 'max:50', 'regex:/^[A-Z]{3}[0-9]{7}$|^[0-9]{8,10}$/'],
            'address' => ['nullable', 'string', 'max:500'],
            'country' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'ward' => ['nullable', 'string', 'max:20'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'experience' => ['nullable', 'string', 'max:100'],
        ]);

        $existing = VendorApplication::where('email', $validated['email'])
            ->where('status', '!=', 'rejected')
            ->first();
        if ($existing) {
            return response()->json(['message' => 'An application with this email is already pending verification.'], 422);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $application = VendorApplication::create(array_merge($validated, [
            'otp_code' => $code,
            'otp_expires_at' => Carbon::now()->addMinutes(2),
            'status' => 'pending',
        ]));

        Mail::to($application->email)->send(new OtpMail($code, 'vendor_application'));

        return response()->json([
            'message' => 'Application submitted. Please verify your email with the OTP sent.',
            'application_id' => $application->id,
        ], 201);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $application = VendorApplication::where('email', $validated['email'])
            ->where('status', 'pending')
            ->where('otp_verified_at', null)
            ->where('otp_expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (! $application || $application->otp_code !== $validated['code']) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $application->update(['otp_verified_at' => Carbon::now(), 'status' => 'verified']);

        $tempPassword = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $application->full_name,
            'email' => $application->email,
            'password' => Hash::make($tempPassword),
            'role' => 'vendor',
            'status' => 'active',
            'phone' => $application->phone,
            'address' => $application->address,
            'city' => $application->municipality,
            'province' => $application->province,
            'district' => $application->district,
            'municipality' => $application->municipality,
            'ward' => $application->ward,
            'postal_code' => $application->postal_code,
            'country' => $application->country,
        ]);

        VendorStore::create([
            'user_id' => $user->id,
            'store_name' => $application->store_name,
            'description' => $application->description,
            'address' => $application->address,
            'phone' => $application->phone,
            'status' => 'pending',
            'verified' => false,
        ]);

        Mail::to($user->email)->send(new \App\Mail\VendorCredentialsMail($user->email, $tempPassword));

        return response()->json([
            'message' => 'Email verified successfully. Your vendor account is pending admin approval. Credentials have been sent to your email.',
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $application = VendorApplication::where('email', $validated['email'])
            ->where('status', 'pending')
            ->where('otp_verified_at', null)
            ->orderByDesc('id')
            ->first();

        if (! $application) {
            return response()->json(['message' => 'No pending application found for this email.'], 404);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $application->update([
            'otp_code' => $code,
            'otp_expires_at' => Carbon::now()->addMinutes(2),
        ]);

        Mail::to($application->email)->send(new OtpMail($code, 'vendor_application'));

        return response()->json(['message' => 'OTP resent to your email.']);
    }
}

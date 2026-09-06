<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function sendOtp(string $to, string $code, string $via = 'smskit'): bool
    {
        if ($via === 'smskit') {
            return $this->sendViaSmsKit($to, $code);
        }

        if ($via === 'twilio') {
            return $this->sendViaTwilio($to, $code);
        }

        Log::warning("Unknown SMS gateway: {$via}");

        return false;
    }

    private function sendViaSmsKit(string $to, string $code): bool
    {
        $apiKey = config('services.smskit.api_key');
        $senderId = config('services.smskit.sender_id');

        if (! $apiKey || ! $senderId) {
            Log::warning('SMSKIT credentials not configured.');

            return false;
        }

        $phone = preg_replace('/\D/', '', $to);

        try {
            $response = Http::asForm()->post('https://api.smskit.com/api/sms/send', [
                'api_key' => $apiKey,
                'sender_id' => $senderId,
                'to' => $phone,
                'message' => "Your Circuit Bazaar OTP is: {$code}. It expires in 2 minutes.",
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('SMSKIT SMS failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('SMSKIT SMS exception', [
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function sendViaTwilio(string $to, string $code): bool
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (! $sid || ! $token || ! $from) {
            Log::warning('Twilio credentials not configured.');

            return false;
        }

        try {
            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To' => $to,
                    'Body' => "Your Circuit Bazaar OTP is: {$code}. It expires in 10 minutes.",
                ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Twilio SMS failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Twilio SMS exception', [
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}

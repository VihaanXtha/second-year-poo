<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function sendOtp(string $to, string $code, string $via = 'twilio'): bool
    {
        if ($via === 'twilio') {
            return $this->sendViaTwilio($to, $code);
        }

        Log::warning("Unknown SMS gateway: {$via}");
        return false;
    }

    private function sendViaTwilio(string $to, string $code): bool
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (!$sid || !$token || !$from) {
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
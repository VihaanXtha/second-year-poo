<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /** Kusha SMS (kushasms.com) — Nepal NTC/Ncell gateway. */
    private const ENDPOINT = 'https://kushasms.com/sms/v4/send-user';

    public function sendOtp(string $to, string $code): bool
    {
        $token = config('services.kusha.token');

        if (! $token) {
            Log::warning('Kusha SMS token not configured.');

            return false;
        }

        // Kusha expects plain 10-digit Nepali mobiles (9841XXXXXX).
        $to = $this->toLocal($to);

        try {
            $response = Http::withHeaders(['auth-token' => $token])
                ->post(self::ENDPOINT, [
                    'to' => [$to],
                    'text' => ["Your Circuit Bazaar OTP is: {$code}. It expires in 10 minutes."],
                ]);

            // Kusha: read success from the body, not the HTTP status —
            // responses[0].error must be false and errors[] must be empty.
            $body = $response->json();
            $first = is_array($body) ? ($body['responses'][0] ?? null) : null;
            if ($first !== null && ($first['error'] ?? true) === false && empty($body['errors'])) {
                return true;
            }

            Log::error('Kusha SMS failed', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Kusha SMS exception', [
                'to' => $to,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Convert any stored phone format to the plain 10-digit Nepali mobile
     * Kusha wants: strip +977 / 977 country code and the local trunk '0'.
     */
    private function toLocal(string $phone): string
    {
        $digits = preg_replace('/\D/', '', trim($phone));

        if (str_starts_with($digits, '977') && strlen($digits) > 10) {
            $digits = substr($digits, 3);
        }

        if (str_starts_with($digits, '0') && strlen($digits) === 11) {
            $digits = substr($digits, 1);
        }

        return $digits;
    }
}
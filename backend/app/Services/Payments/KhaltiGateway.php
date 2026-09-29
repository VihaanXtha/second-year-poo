<?php

namespace App\Services\Payments;

use App\Models\Order;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class KhaltiGateway implements PaymentGatewayInterface
{
    /**
     * Sandbox by default (https://dev.khalti.com/api/v2); switch to
     * production (https://khalti.com/api/v2) via KHALTI_BASE_URL.
     */
    public function initiate(Order $order): array
    {
        $secretKey = Config::get('services.khalti.secret_key');
        $baseUrl = rtrim((string) Config::get('services.khalti.base_url', 'https://dev.khalti.com/api/v2'), '/');

        if (! $secretKey) {
            throw new \RuntimeException('Khalti is not configured yet — add KHALTI_SECRET_KEY to the backend .env.');
        }

        $user = $order->user;

        $response = Http::withHeaders(['Authorization' => 'Key '.$secretKey])
            ->post("{$baseUrl}/epayment/initiate/", [
                'return_url' => route('payments.callback.khalti'),
                'website_url' => config('app.url'),
                'amount' => (int) round((float) $order->total * 100),
                'purchase_order_id' => $order->order_number,
                'purchase_order_name' => 'Order '.$order->order_number,
                'customer_info' => array_filter([
                    'name' => $user->name ?? 'Customer',
                    'email' => $user->email ?? 'customer@example.com',
                    'phone' => $user->phone ?? $order->shipping_phone ?? null,
                ]),
            ]);

        $data = $response->json();

        if (! $response->successful() || ! is_array($data) || ! isset($data['payment_url'])) {
            $detail = is_array($data)
                ? ($data['detail'] ?? $data['message'] ?? $response->body())
                : $response->body();

            throw new \RuntimeException('Khalti initiate failed: '.(is_string($detail) ? $detail : json_encode($detail)));
        }

        // REDIRECT shape — the shop just navigates the browser to the URL.
        return [
            'method' => 'REDIRECT',
            'url' => $data['payment_url'],
            'pidx' => $data['pidx'] ?? null,
        ];
    }

    public function verify(array $callbackData): bool
    {
        return $this->status($callbackData) === 'Completed';
    }

    /**
     * Raw lookup status from Khalti (Completed|Pending|Initiated|Refunded|
     * Expired|User canceled|Partially Refunded|null when lookup fails).
     * The controller uses this to distinguish "still pending / hold"
     * (keep the order unpaid) from "terminal failure" (cancel + restock),
     * per https://docs.khalti.com/khalti-epayment/#payment-status-code
     */
    public function status(array $callbackData): ?string
    {
        $secretKey = Config::get('services.khalti.secret_key');
        $baseUrl = rtrim((string) Config::get('services.khalti.base_url', 'https://dev.khalti.com/api/v2'), '/');

        if (! $secretKey || ! isset($callbackData['pidx']) || $callbackData['pidx'] === '') {
            return null;
        }

        try {
            $response = Http::withHeaders(['Authorization' => 'Key '.$secretKey])
                ->post("{$baseUrl}/epayment/lookup/", [
                    'pidx' => $callbackData['pidx'],
                ]);

            $data = $response->json();

            if (! is_array($data) || ! isset($data['status']) || ! is_string($data['status'])) {
                return null;
            }

            return $data['status'];
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }
}

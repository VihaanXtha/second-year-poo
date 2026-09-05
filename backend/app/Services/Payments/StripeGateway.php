<?php

namespace App\Services\Payments;

use App\Models\Order;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class StripeGateway implements PaymentGatewayInterface
{
    public function initiate(Order $order): array
    {
        $secretKey = Config::get('services.stripe.secret_key');
        $baseUrl = Config::get('services.stripe.base_url', 'https://api.stripe.com');

        $response = Http::withToken($secretKey)
            ->asMultipart()
            ->post("{$baseUrl}/v1/payment_intents", [
                ['name' => 'amount', 'contents' => (string) (int) round($order->total * 100)],
                ['name' => 'currency', 'contents' => 'usd'],
                ['name' => 'metadata[order_id]', 'contents' => (string) $order->id],
                ['name' => 'metadata[order_number]', 'contents' => $order->order_number],
                ['name' => 'automatic_payment_methods[enabled]', 'contents' => 'true'],
                ['name' => 'return_url', 'contents' => route('payments.webhook.stripe')],
            ]);

        $data = $response->json();

        if (isset($data['error'])) {
            throw new \RuntimeException('Stripe PaymentIntent creation failed: '.($data['error']['message'] ?? 'Unknown error'));
        }

        return [
            'method' => 'POST',
            'client_secret' => $data['client_secret'] ?? null,
            'payment_intent_id' => $data['id'] ?? null,
            'fields' => $data,
        ];
    }

    public function verify(array $callbackData): bool
    {
        $secretKey = Config::get('services.stripe.secret_key');
        $baseUrl = Config::get('services.stripe.base_url', 'https://api.stripe.com');

        if (! isset($callbackData['id'])) {
            return false;
        }

        $paymentIntentId = $callbackData['id'];

        $response = Http::withToken($secretKey)
            ->get("{$baseUrl}/v1/payment_intents/{$paymentIntentId}");

        $data = $response->json();

        if (isset($data['error'])) {
            return false;
        }

        return isset($data['status']) && $data['status'] === 'succeeded';
    }
}

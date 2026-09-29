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

        if (! $secretKey) {
            throw new \RuntimeException('Stripe is not configured yet — add STRIPE_SECRET_KEY to the backend .env.');
        }

        $baseUrl = rtrim((string) Config::get('services.stripe.base_url', 'https://api.stripe.com'), '/');
        $shop = rtrim((string) config('services.shop.url', 'http://localhost:3003'), '/');

        // Stripe Checkout Session — the hosted payment portal the browser is
        // redirected to. {CHECKOUT_SESSION_ID} is substituted by Stripe itself.
        $params = [
            'mode' => 'payment',
            'client_reference_id' => $order->order_number,
            'metadata[order_id]' => (string) $order->id,
            'metadata[order_number]' => $order->order_number,
            'success_url' => $shop.'/payment/stripe/return?order='.$order->id.'&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $shop.'/order/confirmed?order='.$order->id.'&payment=cancelled',
        ];

        $i = 0;
        foreach ($order->items as $item) {
            $params["line_items[$i][price_data][currency]"] = 'usd';
            $params["line_items[$i][price_data][product_data][name]"] = $item->product_name;
            $params["line_items[$i][price_data][unit_amount]"] = (string) (int) round(((float) $item->unit_price) * 100);
            $params["line_items[$i][quantity]"] = (string) $item->quantity;
            $i++;
        }

        $response = Http::withToken($secretKey)
            ->asForm()
            ->post("{$baseUrl}/v1/checkout/sessions", $params);

        $data = $response->json();

        if (! $response->successful() || isset($data['error'])) {
            throw new \RuntimeException('Stripe Checkout failed: '.($data['error']['message'] ?? $response->body()));
        }

        return [
            'method' => 'REDIRECT',
            'url' => $data['url'] ?? null,
            'session_id' => $data['id'] ?? null,
            'payment_intent_id' => $data['payment_intent'] ?? null,
            'fields' => $data,
        ];
    }

    public function verify(array $callbackData): bool
    {
        $secretKey = Config::get('services.stripe.secret_key');

        if (! $secretKey) {
            return false;
        }

        $baseUrl = rtrim((string) Config::get('services.stripe.base_url', 'https://api.stripe.com'), '/');
        $id = (string) ($callbackData['session_id'] ?? $callbackData['id'] ?? '');

        if ($id === '') {
            return false;
        }

        try {
            // Primary path: a Checkout Session id (browser return / verify endpoint).
            $response = Http::withToken($secretKey)->get("{$baseUrl}/v1/checkout/sessions/{$id}");

            if ($response->successful()) {
                $session = $response->json();

                if (($session['status'] ?? '') !== 'complete' || ($session['payment_status'] ?? '') !== 'paid') {
                    return false;
                }

                // A paid session must belong to the order being resolved.
                $expected = $callbackData['order_number'] ?? null;
                $actual = $session['metadata']['order_number'] ?? null;

                return $expected === null || $actual === $expected;
            }

            // Fallback path: a PaymentIntent id (webhook deliveries).
            $intent = Http::withToken($secretKey)->get("{$baseUrl}/v1/payment_intents/{$id}")->json();

            if (! is_array($intent) || isset($intent['error'])) {
                return false;
            }

            $expected = $callbackData['order_number'] ?? null;
            $actual = $intent['metadata']['order_number'] ?? null;

            return ($intent['status'] ?? '') === 'succeeded'
                && ($expected === null || $actual === $expected);
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }
}
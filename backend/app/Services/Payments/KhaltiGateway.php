<?php

namespace App\Services\Payments;

use App\Models\Order;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class KhaltiGateway implements PaymentGatewayInterface
{
    public function initiate(Order $order): array
    {
        $secretKey = Config::get('services.khalti.secret_key');
        $baseUrl = Config::get('services.khalti.base_url', 'https://dev.khalti.com/api');

        $response = Http::withToken($secretKey)
            ->post("{$baseUrl}/epayment/initiate/", [
                'return_url' => route('payments.callback.khalti'),
                'website_url' => config('app.url'),
                'amount' => (int) round($order->total * 100),
                'order_id' => $order->order_number,
                'order_name' => 'Order '.$order->order_number,
                'customer_info' => [
                    'name' => $order->user->name ?? 'Customer',
                    'email' => $order->user->email ?? 'customer@example.com',
                ],
            ]);

        $data = $response->json();

        return [
            'method' => 'GET',
            'action' => $data['payment_url'] ?? ($baseUrl.'/epayment/initiate/'),
            'fields' => $data,
        ];
    }

    public function verify(array $callbackData): bool
    {
        $secretKey = Config::get('services.khalti.secret_key');
        $baseUrl = Config::get('services.khalti.base_url', 'https://dev.khalti.com/api');

        if (! isset($callbackData['pidx'])) {
            return false;
        }

        $response = Http::withToken($secretKey)
            ->post("{$baseUrl}/epayment/lookup/", [
                'pidx' => $callbackData['pidx'],
            ]);

        $data = $response->json();

        return isset($data['status']) && $data['status'] === 'Completed';
    }
}

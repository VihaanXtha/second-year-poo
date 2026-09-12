<?php

namespace App\Services\Payments;

use App\Models\Order;
use Illuminate\Support\Facades\Config;

class EsewaGateway implements PaymentGatewayInterface
{
    public function initiate(Order $order): array
    {
        $secretKey = Config::get('services.esewa.secret_key');
        $merchantId = Config::get('services.esewa.merchant_id');

        $payload = [
            'amount' => (string) $order->total,
            'tax_amount' => '0',
            'total_amount' => (string) $order->total,
            'transaction_uuid' => $order->order_number,
            'product_code' => $merchantId,
            'product_service_charge' => '0',
            'product_delivery_charge' => '0',
        ];

        $signed = base64_encode(json_encode($payload));
        $signature = $this->sign($signed, $secretKey);

        return [
            'method' => 'POST',
            'action' => 'https://rc.esewa.com.np/api/epay/main/v2/form',
            'fields' => [
                'amount' => (string) $order->total,
                'tax_amount' => '0',
                'total_amount' => (string) $order->total,
                'transaction_uuid' => $order->order_number,
                'product_code' => $merchantId,
                'product_service_charge' => '0',
                'product_delivery_charge' => '0',
                'signed_field_names' => 'total_amount,transaction_uuid,product_code',
                'signature' => $signature,
                'success_url' => route('payments.callback.esewa', ['status' => 'success']),
                'failure_url' => route('payments.callback.esewa', ['status' => 'failure']),
            ],
        ];
    }

    public function verify(array $callbackData): bool
    {
        $secretKey = Config::get('services.esewa.secret_key');

        if (! isset($callbackData['signature'], $callbackData['data'])) {
            return false;
        }

        $receivedSignature = $callbackData['signature'];
        $decodedData = json_decode(base64_decode($callbackData['data']), true);

        if (! is_array($decodedData)) {
            return false;
        }

        $computedSignature = $this->sign($callbackData['data'], $secretKey);

        return hash_equals($computedSignature, $receivedSignature);
    }

    private function sign(string $data, string $secretKey): string
    {
        return hash_hmac('sha256', $data, $secretKey);
    }
}

<?php

namespace App\Services\Payments;

use App\Models\Order;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class EsewaGateway implements PaymentGatewayInterface
{
    public function initiate(Order $order): array
    {
        $secretKey = Config::get('services.esewa.secret_key');
        $merchantId = Config::get('services.esewa.merchant_id');
        $baseUrl = rtrim((string) Config::get('services.esewa.base_url', 'https://rc.esewa.com.np'), '/');

        $total = number_format((float) $order->total, 2, '.', '');

        $fields = [
            'amount' => $total,
            'tax_amount' => '0.00',
            'total_amount' => $total,
            'transaction_uuid' => $order->order_number,
            'product_code' => (string) $merchantId,
            'product_service_charge' => '0.00',
            'product_delivery_charge' => '0.00',
            'signed_field_names' => 'total_amount,transaction_uuid,product_code',
        ];

        // eSewa v2: base64(HMAC-SHA256) over "k=v,k=v" in signed_field_names order.
        $fields['signature'] = $this->sign($this->signedMessage($fields), $secretKey);

        // The order number rides along so the callback can always resolve the
        // order, even on the failure URL where eSewa sends no payload.
        $callback = route('payments.callback.esewa');
        $fields['success_url'] = $callback.'?status=success&order_number='.urlencode($order->order_number);
        $fields['failure_url'] = $callback.'?status=failure&order_number='.urlencode($order->order_number);

        return [
            'method' => 'POST',
            'action' => $baseUrl.'/api/epay/main/v2/form',
            'fields' => $fields,
        ];
    }

    public function verify(array $callbackData): bool
    {
        $secretKey = Config::get('services.esewa.secret_key');
        $merchantId = Config::get('services.esewa.merchant_id');
        $baseUrl = rtrim((string) Config::get('services.esewa.base_url', 'https://rc.esewa.com.np'), '/');

        $decoded = json_decode(base64_decode((string) ($callbackData['data'] ?? '')), true);

        if (! is_array($decoded) || ! isset($decoded['signature'], $decoded['signed_field_names'])) {
            return false;
        }

        $expected = $this->sign($this->signedMessage($decoded), $secretKey);
        if (! hash_equals($expected, (string) $decoded['signature'])) {
            return false;
        }

        // eSewa requires a second confirmation against its transaction status API.
        if (($decoded['status'] ?? '') !== 'COMPLETE') {
            return false;
        }

        try {
            $response = Http::get($baseUrl.'/api/epay/transaction/status/', [
                'product_code' => $merchantId,
                'total_amount' => $decoded['total_amount'] ?? '',
                'transaction_uuid' => $decoded['transaction_uuid'] ?? '',
            ]);

            $body = $response->json();

            return $response->successful()
                && is_array($body)
                && ($body['status'] ?? '') === 'COMPLETE';
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }

    /**
     * Rebuild "k=v,k=v" from the signed_field_names order — used both when
     * signing the outgoing form and when verifying eSewa's callback.
     */
    private function signedMessage(array $data): string
    {
        $parts = [];

        foreach (explode(',', (string) ($data['signed_field_names'] ?? '')) as $name) {
            $name = trim($name);
            if ($name === '') {
                continue;
            }
            if (! array_key_exists($name, $data)) {
                return '';
            }
            $parts[] = $name.'='.$data[$name];
        }

        return implode(',', $parts);
    }

    private function sign(string $message, string $secretKey): string
    {
        return base64_encode(hash_hmac('sha256', $message, (string) $secretKey, true));
    }
}
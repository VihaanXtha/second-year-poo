<?php

namespace App\Services\Payments;

use App\Models\Order;

class CodGateway implements PaymentGatewayInterface
{
    public function initiate(Order $order): array
    {
        return [
            'method' => 'none',
            'action' => null,
            'fields' => [
                'status' => 'pending',
                'message' => 'Cash on delivery. Order will be confirmed upon delivery.',
            ],
        ];
    }

    public function verify(array $callbackData): bool
    {
        return true;
    }
}

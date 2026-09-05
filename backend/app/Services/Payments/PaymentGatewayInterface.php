<?php

namespace App\Services\Payments;

use App\Models\Order;

interface PaymentGatewayInterface
{
    public function initiate(Order $order): array;

    public function verify(array $callbackData): bool;
}

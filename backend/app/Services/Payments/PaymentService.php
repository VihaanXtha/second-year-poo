<?php

namespace App\Services\Payments;

use App\Models\Order;
use InvalidArgumentException;

class PaymentService
{
    public function gateway(string $method): PaymentGatewayInterface
    {
        return match ($method) {
            'esewa' => new EsewaGateway(),
            'khalti' => new KhaltiGateway(),
            'stripe' => new StripeGateway(),
            'cod' => new CodGateway(),
            default => throw new InvalidArgumentException("Unsupported payment method: {$method}"),
        };
    }

    public function initiate(Order $order): array
    {
        return $this->gateway($order->payment_method)->initiate($order);
    }

    public function verify(string $method, array $callbackData): bool
    {
        return $this->gateway($method)->verify($callbackData);
    }
}

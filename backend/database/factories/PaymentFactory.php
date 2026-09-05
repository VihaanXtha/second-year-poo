<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'user_id' => User::factory(),
            'method' => 'cod',
            'status' => 'pending',
            'transaction_id' => null,
            'amount' => 0,
            'payload' => null,
        ];
    }
}

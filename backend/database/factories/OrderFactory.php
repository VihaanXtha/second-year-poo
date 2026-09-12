<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-'.strtoupper(uniqid()),
            'status' => 'pending',
            'total' => 0,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_address' => fake()->address(),
            'shipping_city' => fake()->city(),
            'shipping_phone' => fake()->phoneNumber(),
        ];
    }
}

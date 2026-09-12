<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\VendorStore;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'vendor_store_id' => VendorStore::factory(),
            'product_name' => fake()->words(3, true),
            'product_sku' => strtoupper(fake()->bothify('???-####')),
            'unit_price' => fake()->randomFloat(2, 10, 500),
            'quantity' => fake()->numberBetween(1, 5),
            'subtotal' => 0,
        ];
    }
}

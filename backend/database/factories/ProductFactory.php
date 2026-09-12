<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\VendorStore;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_store_id' => VendorStore::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->words(3, true),
            'sku' => strtoupper(fake()->unique()->bothify('???-####')),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 10, 1000),
            'stock' => fake()->numberBetween(0, 100),
            'image' => fake()->optional()->url(),
            'specs' => null,
            'status' => 'active',
        ];
    }
}

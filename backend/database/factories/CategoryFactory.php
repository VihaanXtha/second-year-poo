<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\VendorStore;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'slug' => fake()->unique()->slug(),
        ];
    }
}

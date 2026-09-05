<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VendorStoreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'store_name' => fake()->company().' Store',
            'description' => fake()->sentence(),
            'status' => 'active',
            'verified' => true,
        ];
    }
}

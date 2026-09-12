<?php

namespace Database\Factories;

use App\Models\CourierInfo;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourierInfoFactory extends Factory
{
    protected $model = CourierInfo::class;

    public function definition(): array
    {
        return [
            'title' => 'Nationwide Delivery',
            'body' => fake()->paragraph(),
            'delivery_zones' => ['Kathmandu', 'Pokhara', 'Biratnagar'],
        ];
    }
}

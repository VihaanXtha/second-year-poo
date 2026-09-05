<?php

namespace Database\Factories;

use App\Models\CareerPost;
use Illuminate\Database\Eloquent\Factories\Factory;

class CareerPostFactory extends Factory
{
    protected $model = CareerPost::class;

    public function definition(): array
    {
        return [
            'title' => fake()->jobTitle(),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->paragraph(),
            'requirements' => [fake()->word(), fake()->word(), fake()->word()],
            'is_published' => true,
        ];
    }
}

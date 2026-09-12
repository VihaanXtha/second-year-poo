<?php

namespace Database\Factories;

use App\Models\HomepageSlider;
use Illuminate\Database\Eloquent\Factories\Factory;

class HomepageSliderFactory extends Factory
{
    protected $model = HomepageSlider::class;

    public function definition(): array
    {
        return [
            'image_url' => fake()->imageUrl(),
            'headline' => fake()->sentence(),
            'link_url' => fake()->optional()->url(),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\BlogPost;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'slug' => fake()->unique()->slug(),
            'cover_image' => fake()->optional()->imageUrl(),
            'body' => fake()->paragraphs(3, true),
            'category' => fake()->randomElement(['Technology', 'Business', 'Science', 'Health']),
            'published_at' => fake()->dateTimeThisYear(),
            'is_published' => true,
        ];
    }
}

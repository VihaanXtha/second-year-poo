<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Aarav Shrestha',
                'slug' => 'aarav-shrestha',
                'role' => 'Software Engineer',
                'company' => 'Tech Nepal',
                'content' => 'Circuit Bazaar made building my first gaming PC effortless. The guides are accurate, the prices are fair, and the vendor verification gave me real confidence.',
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'rating' => 5,
                'is_published' => true,
            ],
            [
                'name' => 'Sneha Maharjan',
                'slug' => 'sneha-maharjan',
                'role' => 'IoT Developer',
                'company' => 'Kathmandu University',
                'content' => 'I ordered ESP32 modules and sensors for a campus project. Delivery was fast, components were genuine, and the product specs matched what was listed.',
                'photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
                'rating' => 5,
                'is_published' => true,
            ],
            [
                'name' => 'Bibek Adhikari',
                'slug' => 'bibek-adhikari',
                'role' => 'Freelance Technician',
                'company' => 'Self-employed',
                'content' => 'As a repair tech, I need reliable parts fast. Circuit Bazaar’s verified vendors and clear stock status save me hours of calling around.',
                'photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                'rating' => 4,
                'is_published' => true,
            ],
            [
                'name' => 'Priya Rai',
                'slug' => 'priya-rai',
                'role' => 'E-commerce Manager',
                'company' => 'Digital Nepal',
                'content' => 'The payment integration and order tracking feel production-grade. It is rare to see a Nepali marketplace this polished.',
                'photo' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
                'rating' => 5,
                'is_published' => true,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(['slug' => $testimonial['slug']], $testimonial);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\JobPosting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JobPostingSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $postings = [
            [
                'title' => 'Frontend Engineer',
                'slug' => 'frontend-engineer',
                'department' => 'Engineering',
                'location' => 'Kathmandu / Remote',
                'employment_type' => 'Full-time',
                'description' => 'Build polished customer and vendor experiences with Next.js, React, and TypeScript. You will own UI performance, accessibility, and design-system consistency across the storefront and portal.',
                'responsibilities' => 'Build polished customer and vendor experiences with Next.js, React, and TypeScript. Own UI performance, accessibility, and design-system consistency across the storefront and portal.',
                'requirements' => [
                    '3+ years of React experience in production',
                    'Strong TypeScript and Next.js App Router skills',
                    'Experience with performance budgets, Lighthouse, and Core Web Vitals',
                    'Comfortable with design handoffs and component libraries',
                ],
                'benefits' => [
                    'Remote-first with flexible hours',
                    'Hardware allowance and tech budget',
                    'Annual team retreats',
                    'Learning stipend for conferences and courses',
                ],
                'application_deadline' => now()->addDays(14)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Backend Engineer',
                'slug' => 'backend-engineer',
                'department' => 'Engineering',
                'location' => 'Kathmandu / Remote',
                'employment_type' => 'Full-time',
                'description' => 'Design Laravel APIs, database schemas, and integration pipelines for payments, logistics, and vendor workflows. You will balance reliability with iteration speed.',
                'responsibilities' => 'Design Laravel APIs, database schemas, and integration pipelines for payments, logistics, and vendor workflows. Balance reliability with iteration speed.',
                'requirements' => [
                    '4+ years of backend engineering experience',
                    'Strong Laravel or similar MVC framework background',
                    'Experience with MySQL, queues, caching, and APIs',
                    'Understanding of payment and logistics integrations',
                ],
                'benefits' => [
                    'Remote-first with flexible hours',
                    'Hardware allowance and tech budget',
                    'Annual team retreats',
                    'Learning stipend for conferences and courses',
                ],
                'application_deadline' => now()->addDays(3)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Product Designer',
                'slug' => 'product-designer',
                'department' => 'Design',
                'location' => 'Kathmandu',
                'employment_type' => 'Full-time',
                'description' => 'Own the end-to-end UX for shop, admin, and vendor flows, from research and wireframes to production polish and design-system maintenance.',
                'responsibilities' => 'Own the end-to-end UX for shop, admin, and vendor flows, from research and wireframes to production polish and design-system maintenance.',
                'requirements' => [
                    '3+ years of product design experience',
                    'Portfolio showing B2C or marketplace UX',
                    'Proficiency in Figma and design systems',
                    'Comfortable working with engineering on feasibility',
                ],
                'benefits' => [
                    'In-office hybrid option',
                    'Creative tooling stipend',
                    'Team workshops and design critiques',
                    'Flexible leave policy',
                ],
                'application_deadline' => now()->addDays(7)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Vendor Success Manager',
                'slug' => 'vendor-success-manager',
                'department' => 'Operations',
                'location' => 'Kathmandu',
                'employment_type' => 'Full-time',
                'description' => 'Onboard new vendors, run verification programs, and improve seller satisfaction and retention. You are the main advocate for vendors inside the company.',
                'responsibilities' => 'Onboard new vendors, run verification programs, and improve seller satisfaction and retention. Be the main advocate for vendors inside the company.',
                'requirements' => [
                    '2+ years in vendor success, account management, or ops',
                    'Excellent communication in Nepali and English',
                    'Comfortable with CRM-style workflows and data review',
                    'Problem-solving mindset with follow-through',
                ],
                'benefits' => [
                    'In-office hybrid option',
                    'Transport and communication allowance',
                    'Performance bonuses',
                    'Health and wellness benefits',
                ],
                'application_deadline' => now()->addDays(21)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Content & Community Writer',
                'slug' => 'content-community-writer',
                'department' => 'Marketing',
                'location' => 'Remote',
                'employment_type' => 'Contract',
                'description' => 'Write buying guides, launch announcements, vendor spotlights, and technical documentation. Help Circuit Bazaar sound like a knowledgeable local expert, not a generic brand.',
                'responsibilities' => 'Write buying guides, launch announcements, vendor spotlights, and technical documentation. Help Circuit Bazaar sound like a knowledgeable local expert, not a generic brand.',
                'requirements' => [
                    '2+ years of technical or lifestyle writing',
                    'Interest in PC hardware, IoT, or networking',
                    'Ability to explain specs without losing readers',
                    'Consistent publishing rhythm and self-editing discipline',
                ],
                'benefits' => [
                    'Fully remote',
                    'Project-based flexibility',
                    'Byline credit and portfolio pieces',
                    'Hardware review units when available',
                ],
                'application_deadline' => now()->subDays(2)->toDateString(),
                'is_active' => true,
            ],
        ];

        foreach ($postings as $posting) {
            JobPosting::updateOrCreate(['slug' => $posting['slug']], $posting);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Faq;
use App\Models\HomepageSlider;
use App\Models\SubCategory;
use App\Models\SuperSubCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $categories = [
            ['name' => 'PC Components', 'slug' => 'pc-components', 'description' => 'Processors, graphics cards, memory, and storage for custom builds.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=PC+Components', 'icon' => 'memory', 'display_order' => 1],
            ['name' => 'IoT Gear', 'slug' => 'iot-gear', 'description' => 'Microcontrollers, sensors, and modules for connected projects.', 'image' => 'https://placehold.co/600x400/0f766e/FFFFFF?text=IoT+Gear', 'icon' => 'sensors', 'display_order' => 2],
            ['name' => 'Laptops', 'slug' => 'laptops', 'description' => 'Work, gaming, and student laptops from trusted brands.', 'image' => 'https://placehold.co/600x400/7c3aed/FFFFFF?text=Laptops', 'icon' => 'laptop_mac', 'display_order' => 3],
            ['name' => 'Networking', 'slug' => 'networking', 'description' => 'Routers, switches, access points, and cabling.', 'image' => 'https://placehold.co/600x400/059669/FFFFFF?text=Networking', 'icon' => 'router', 'display_order' => 4],
            ['name' => 'Cables & Connectors', 'slug' => 'cables-connectors', 'description' => 'USB, HDMI, Ethernet, and power cables.', 'image' => 'https://placehold.co/600x400/d97706/FFFFFF?text=Cables+%26+Connectors', 'icon' => 'cable', 'display_order' => 5],
            ['name' => 'Tools & Equipment', 'slug' => 'tools-equipment', 'description' => 'Soldering irons, multimeters, and workbench essentials.', 'image' => 'https://placehold.co/600x400/b91c1c/FFFFFF?text=Tools+%26+Equipment', 'icon' => 'hardware', 'display_order' => 6],
            ['name' => 'Power Supplies', 'slug' => 'power-supplies', 'description' => 'ATX, UPS, and DC power modules.', 'image' => 'https://placehold.co/600x400/4338ca/FFFFFF?text=Power+Supplies', 'icon' => 'power', 'display_order' => 7],
            ['name' => 'Storage', 'slug' => 'storage', 'description' => 'SSDs, HDDs, and memory cards.', 'image' => 'https://placehold.co/600x400/be185d/FFFFFF?text=Storage', 'icon' => 'storage', 'display_order' => 8],
        ];

        foreach ($categories as $categoryData) {
            Category::updateOrCreate(['slug' => $categoryData['slug']], $categoryData);
        }

        $subCategories = [
            ['category_id' => 1, 'name' => 'Graphics Cards', 'slug' => 'graphics-cards', 'description' => 'GPUs for gaming and AI workloads.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=GPUs', 'display_order' => 1],
            ['category_id' => 1, 'name' => 'Processors', 'slug' => 'processors', 'description' => 'Desktop and server CPUs.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=CPUs', 'display_order' => 2],
            ['category_id' => 1, 'name' => 'Memory', 'slug' => 'memory', 'description' => 'DDR4 and DDR5 RAM kits.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=RAM', 'display_order' => 3],
            ['category_id' => 2, 'name' => 'Microcontrollers', 'slug' => 'microcontrollers', 'description' => 'Arduino, ESP32, Raspberry Pi Pico.', 'image' => 'https://placehold.co/600x400/0f766e/FFFFFF?text=MCUs', 'display_order' => 1],
            ['category_id' => 2, 'name' => 'Sensors', 'slug' => 'sensors', 'description' => 'Temperature, motion, and environmental sensors.', 'image' => 'https://placehold.co/600x400/0f766e/FFFFFF?text=Sensors', 'display_order' => 2],
            ['category_id' => 3, 'name' => 'Gaming Laptops', 'slug' => 'gaming-laptops', 'description' => 'High-performance laptops with dedicated GPUs.', 'image' => 'https://placehold.co/600x400/7c3aed/FFFFFF?text=Gaming+Laptops', 'display_order' => 1],
            ['category_id' => 3, 'name' => 'Ultrabooks', 'slug' => 'ultrabooks', 'description' => 'Lightweight laptops for productivity.', 'image' => 'https://placehold.co/600x400/7c3aed/FFFFFF?text=Ultrabooks', 'display_order' => 2],
        ];

        foreach ($subCategories as $subData) {
            SubCategory::updateOrCreate(['slug' => $subData['slug']], $subData);
        }

        $superSubCategories = [
            ['sub_category_id' => 1, 'name' => 'NVIDIA', 'slug' => 'nvidia', 'description' => 'GeForce and RTX series GPUs.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=NVIDIA', 'display_order' => 1],
            ['sub_category_id' => 1, 'name' => 'AMD', 'slug' => 'amd-gpus', 'description' => 'Radeon graphics cards.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=AMD', 'display_order' => 2],
            ['sub_category_id' => 2, 'name' => 'Intel', 'slug' => 'intel-cpus', 'description' => 'Core i3, i5, i7, and i9 processors.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=Intel', 'display_order' => 1],
            ['sub_category_id' => 2, 'name' => 'AMD Ryzen', 'slug' => 'amd-ryzen', 'description' => 'Ryzen 3, 5, 7, and 9 processors.', 'image' => 'https://placehold.co/600x400/1e293b/FFFFFF?text=Ryzen', 'display_order' => 2],
            ['sub_category_id' => 4, 'name' => 'Arduino', 'slug' => 'arduino', 'description' => 'Official Arduino boards and clones.', 'image' => 'https://placehold.co/600x400/0f766e/FFFFFF?text=Arduino', 'display_order' => 1],
            ['sub_category_id' => 4, 'name' => 'ESP32', 'slug' => 'esp32', 'description' => 'WiFi and Bluetooth enabled microcontrollers.', 'image' => 'https://placehold.co/600x400/0f766e/FFFFFF?text=ESP32', 'display_order' => 2],
        ];

        foreach ($superSubCategories as $superData) {
            SuperSubCategory::updateOrCreate(['slug' => $superData['slug']], $superData);
        }

        $brands = [
            ['name' => 'Arduino', 'slug' => 'arduino', 'logo' => 'https://placehold.co/200x200/00979D/FFFFFF?text=Arduino', 'description' => 'Open-source electronics platform.', 'website' => 'https://arduino.cc'],
            ['name' => 'Raspberry Pi', 'slug' => 'raspberry-pi', 'logo' => 'https://placehold.co/200x200/C51A4A/FFFFFF?text=Pi', 'description' => 'Single-board computers for education and hobbyists.', 'website' => 'https://raspberrypi.com'],
            ['name' => 'Intel', 'slug' => 'intel', 'logo' => 'https://placehold.co/200x100/0071C5/FFFFFF?text=Intel', 'description' => 'Semiconductor manufacturer known for CPUs.', 'website' => 'https://intel.com'],
            ['name' => 'AMD', 'slug' => 'amd', 'logo' => 'https://placehold.co/200x100/ED1C24/FFFFFF?text=AMD', 'description' => 'CPUs, GPUs, and semi-custom SoCs.', 'website' => 'https://amd.com'],
            ['name' => 'TP-Link', 'slug' => 'tp-link', 'logo' => 'https://placehold.co/200x100/00B06B/FFFFFF?text=TP-Link', 'description' => 'Networking equipment and smart home devices.', 'website' => 'https://tp-link.com'],
            ['name' => 'Corsair', 'slug' => 'corsair', 'logo' => 'https://placehold.co/200x100/000000/FFFFFF?text=Corsair', 'description' => 'Gaming and PC component peripherals.', 'website' => 'https://corsair.com'],
        ];

        foreach ($brands as $brandData) {
            Brand::updateOrCreate(['slug' => $brandData['slug']], $brandData);
        }

        $sliders = [
            ['title' => 'Nepal\'s Verified Hardware Marketplace', 'subtitle' => 'Genuine components delivered across Nepal with official warranties.', 'image_url' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80', 'headline' => 'Shop Now', 'link_url' => '/shop', 'sort_order' => 1, 'is_active' => true],
            ['title' => 'Build Your Dream PC', 'subtitle' => 'From GPUs to cooling, source every part from verified vendors.', 'image_url' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1600&q=80', 'headline' => 'Explore Components', 'link_url' => '/shop?category=pc-components', 'sort_order' => 2, 'is_active' => true],
            ['title' => 'IoT Projects Made Easy', 'subtitle' => 'Sensors, boards, and modules for makers and engineers.', 'image_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80', 'headline' => 'Start Building', 'link_url' => '/shop?category=iot-gear', 'sort_order' => 3, 'is_active' => true],
        ];

        foreach ($sliders as $sliderData) {
            HomepageSlider::updateOrCreate(['title' => $sliderData['title']], $sliderData);
        }

        $faqs = [
            ['question' => 'How do I place an order?', 'answer' => 'Browse products, add them to cart, and checkout using Cash on Delivery, eSewa, or Khalti.', 'display_order' => 1, 'is_active' => true],
            ['question' => 'Do you offer warranty?', 'answer' => 'Yes, most products come with official manufacturer warranties. Warranty terms are listed on each product page.', 'display_order' => 2, 'is_active' => true],
            ['question' => 'What payment methods are supported?', 'answer' => 'We support Cash on Delivery, eSewa, Khalti, and bank transfers.', 'display_order' => 3, 'is_active' => true],
            ['question' => 'How can I become a vendor?', 'answer' => 'Apply through the vendor registration form on our frontend. Our team will review and verify your store.', 'display_order' => 4, 'is_active' => true],
            ['question' => 'Where do you deliver?', 'answer' => 'We deliver across Nepal. Shipping costs and delivery times vary by location.', 'display_order' => 5, 'is_active' => true],
            ['question' => 'Can I return a product?', 'answer' => 'Returns are accepted within 7 days for damaged or incorrect items. Contact support for assistance.', 'display_order' => 6, 'is_active' => true],
        ];

        foreach ($faqs as $faqData) {
            Faq::updateOrCreate(['question' => $faqData['question']], $faqData);
        }
    }
}

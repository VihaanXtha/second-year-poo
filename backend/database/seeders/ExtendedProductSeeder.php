<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\SubCategory;
use App\Models\SuperSubCategory;
use Illuminate\Database\Seeder;

class ExtendedProductSeeder extends Seeder
{
    public function run(): void
    {
        // Link existing products to specific subcategories and brands based on category slugs
        $mapping = [
            // PC Components -> Graphics Cards / Processors / Memory
            'pc-components' => [
                'subcategories' => ['graphics-cards', 'processors', 'memory'],
                'brands' => ['nvidia', 'amd'],
            ],
            // IoT Gear -> Microcontrollers / Sensors
            'iot-gear' => [
                'subcategories' => ['microcontrollers', 'sensors'],
                'brands' => ['arduino', 'raspberry-pi', 'espressif'],
            ],
            // Laptops
            'laptops' => [
                'subcategories' => ['gaming-laptops', 'business-laptops'],
                'brands' => ['lenovo', 'dell', 'hp', 'asus', 'apple', 'acer', 'msi'],
            ],
            // Networking
            'networking' => [
                'subcategories' => ['routers', 'switches'],
                'brands' => ['tp-link', 'netgear', 'cisco', 'ubiquiti'],
            ],
            // Cables & Connectors
            'cables-connectors' => [
                'subcategories' => ['usb-cables', 'ethernet-cables', 'power-cables'],
                'brands' => ['belkin', 'logitech'],
            ],
            // Tools & Equipment
            'tools-equipment' => [
                'subcategories' => ['soldering-tools', 'multimeters'],
                'brands' => ['hakko', 'fluke'],
            ],
            // Power Supplies
            'power-supplies' => [
                'subcategories' => ['atx-psus', 'dc-power-modules'],
                'brands' => ['superflower', 'corsair'],
            ],
            // Storage
            'storage' => [
                'subcategories' => ['ssds', 'hdds'],
                'brands' => ['samsung', 'wd', 'seagate', 'crucial'],
            ],
        ];

        foreach ($mapping as $categorySlug => $data) {
            $category = Category::where('slug', $categorySlug)->first();
            if (!$category) continue;

            $subcategories = SubCategory::where('category_id', $category->id)
                ->whereIn('slug', $data['subcategories'])
                ->orderBy('display_order')
                ->get();

            $brands = Brand::whereIn('slug', $data['brands'])->get();

            if ($subcategories->isEmpty() || $brands->isEmpty()) continue;

            // Find products that belong to this category
            $products = Product::where('category_id', $category->id)
                ->whereNull('sub_category_id')
                ->get();

            foreach ($products as $product) {
                // Assign a random subcategory from this category
                $sub = $subcategories->random();
                $product->sub_category_id = $sub->id;

                // Assign a random super-subcategory if available
                $supers = SuperSubCategory::where('sub_category_id', $sub->id)->get();
                if ($supers->isNotEmpty()) {
                    $product->super_sub_category_id = $supers->random()->id;
                }

                // Assign a random brand
                $product->brand_id = $brands->random()->id;

                $product->save();
            }
        }
    }
}
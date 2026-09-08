<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\VendorStore;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $store = VendorStore::first();
        if (!$store) {
            return;
        }

        $products = [
            ['name' => 'Carbon Film Resistor 10kΩ', 'category' => 'resistors', 'price' => 0.05, 'stock' => 5000, 'sku' => 'RES-10K-001'],
            ['name' => 'Electrolytic Capacitor 100µF', 'category' => 'capacitors', 'price' => 0.20, 'stock' => 3000, 'sku' => 'CAP-100U-001'],
            ['name' => 'Arduino Uno R3', 'category' => 'microcontrollers', 'price' => 12.50, 'stock' => 150, 'sku' => 'MCU-ARD-001'],
            ['name' => 'HC-SR04 Ultrasonic Sensor', 'category' => 'sensors', 'price' => 1.80, 'stock' => 800, 'sku' => 'SEN-HC-001'],
            ['name' => 'Soldering Iron 60W', 'category' => 'tools', 'price' => 8.99, 'stock' => 200, 'sku' => 'TOOL-SOL-001'],
            ['name' => 'USB-C Cable 1m', 'category' => 'cables-connectors', 'price' => 2.50, 'stock' => 1000, 'sku' => 'CBL-USB-001'],
        ];

        foreach ($products as $product) {
            $category = Category::where('slug', $product['category'])->first();
            if (!$category) {
                continue;
            }

            Product::updateOrCreate(
                ['sku' => $product['sku']],
                [
                    'vendor_store_id' => $store->id,
                    'category_id' => $category->id,
                    'name' => $product['name'],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'status' => 'active',
                    'specs' => [],
                ]
            );
        }
    }
}

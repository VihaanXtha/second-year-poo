<?php

namespace Database\Seeders;

use App\Models\Advertisement;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SubCategory;
use App\Models\User;
use App\Models\VendorStore;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

// Seeds the storefront homepage content: featured flags on products,
// homepage advertisements (one per link type), and a few paid demo orders
// so the best-selling section ranks on real order_item quantities.
class ShopSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // --- Vendor store the demo products belong to (idempotent) ---
        $vendorUser = User::updateOrCreate(
            ['email' => 'vendor@circuitbazaar.com'],
            ['name' => 'Vendor User', 'password' => bcrypt('vendor123'), 'role' => 'vendor', 'status' => 'active']
        );
        $store = VendorStore::updateOrCreate(
            ['user_id' => $vendorUser->id],
            ['store_name' => 'Test Vendor Store', 'description' => 'A test vendor store for demonstration', 'status' => 'active', 'verified' => true]
        );

        // --- Demo products (skus referenced below by featured flags + orders) ---
        $productDefs = [
            ['name' => 'Carbon Film Resistor 10kΩ', 'sku' => 'RES-10K-001', 'slug' => 'resistors', 'price' => 5, 'stock' => 5000],
            ['name' => 'Electrolytic Capacitor 100µF', 'sku' => 'CAP-100U-001', 'slug' => 'capacitors', 'price' => 20, 'stock' => 3000],
            ['name' => 'Arduino Uno R3', 'sku' => 'MCU-ARD-001', 'slug' => 'microcontrollers', 'price' => 1650, 'stock' => 150],
            ['name' => 'HC-SR04 Ultrasonic Sensor', 'sku' => 'SEN-HC-001', 'slug' => 'sensors', 'price' => 240, 'stock' => 800],
            ['name' => 'Soldering Iron 60W', 'sku' => 'TOOL-SOL-001', 'slug' => 'tools', 'price' => 1199, 'stock' => 200],
            ['name' => 'USB-C Cable 1m', 'sku' => 'CBL-USB-001', 'slug' => 'cables-connectors', 'price' => 350, 'stock' => 1000],
        ];
        foreach ($productDefs as $def) {
            $category = Category::where('slug', $def['slug'])->first();
            if (! $category) {
                $category = Category::create(['name' => ucfirst($def['slug']), 'slug' => $def['slug']]);
            }
            Product::updateOrCreate(
                ['sku' => $def['sku']],
                ['vendor_store_id' => $store->id, 'category_id' => $category->id, 'name' => $def['name'], 'price' => $def['price'], 'stock' => $def['stock'], 'status' => 'active', 'specs' => []]
            );
        }

        // --- Featured products (first six active) ---
        $featuredSkus = ['MCU-ARD-001', 'SEN-HC-001', 'TOOL-SOL-001', 'CBL-USB-001', 'RES-10K-001', 'CAP-100U-001'];
        Product::whereIn('sku', $featuredSkus)->update(['featured' => true]);

        // --- Advertisements (one per link type) ---
        $pcComponents = Category::where('slug', 'pc-components')->first();
        $gpus = SubCategory::where('slug', 'graphics-cards')->first();
        $arduino = Product::where('sku', 'MCU-ARD-001')->first();

        $ads = [
            ['title' => 'Arduino Uno R3 — Maker favourite', 'image' => 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=1200&q=80', 'link_type' => 'product', 'link_target_id' => $arduino?->id, 'external_url' => null, 'sort_order' => 1, 'is_active' => true],
            ['title' => 'PC Components mega sale', 'image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80', 'link_type' => 'category', 'link_target_id' => $pcComponents?->id, 'external_url' => null, 'sort_order' => 2, 'is_active' => true],
            ['title' => 'Graphics cards back in stock', 'image' => 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=1200&q=80', 'link_type' => 'subcategory', 'link_target_id' => $gpus?->id, 'external_url' => null, 'sort_order' => 3, 'is_active' => true],
            ['title' => 'Circuit Bazaar main site', 'image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'link_type' => 'external_url', 'link_target_id' => null, 'external_url' => 'http://localhost:3000', 'sort_order' => 4, 'is_active' => true],
        ];

        foreach ($ads as $ad) {
            Advertisement::updateOrCreate(['title' => $ad['title']], $ad);
        }

        // --- Demo paid orders so best-selling ranks on real units sold ---
        $customer = User::firstOrCreate(
            ['email' => 'demo.customer@circuitbazaar.test'],
            [
                'name' => 'Demo Customer',
                'password' => bcrypt('password'),
                'role' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $orderPlans = [
            ['MCU-ARD-001' => 12, 'SEN-HC-001' => 8],
            ['MCU-ARD-001' => 5, 'TOOL-SOL-001' => 3, 'CBL-USB-001' => 20],
            ['RES-10K-001' => 100, 'CAP-100U-001' => 60, 'SEN-HC-001' => 2],
        ];

        foreach ($orderPlans as $index => $plan) {
            $items = [];
            foreach ($plan as $sku => $qty) {
                $product = Product::where('sku', $sku)->first();
                if (! $product) {
                    continue;
                }
                $items[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'subtotal' => round($product->price * $qty, 2),
                ];
            }

            if (empty($items)) {
                continue;
            }

            $total = collect($items)->sum('subtotal');

            $order = Order::updateOrCreate(
                ['order_number' => 'ORD-SEED' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'user_id' => $customer->id,
                    'status' => 'delivered',
                    'total' => $total,
                    'payment_method' => 'cod',
                    'payment_status' => 'paid',
                    'shipping_address' => 'Kathmandu',
                    'shipping_city' => 'Kathmandu',
                    'shipping_phone' => '9800000000',
                ]
            );

            foreach ($items as $item) {
                OrderItem::updateOrCreate(
                    ['order_id' => $order->id, 'product_id' => $item['product']->id],
                    [
                        'vendor_store_id' => $item['product']->vendor_store_id,
                        'product_name' => $item['product']->name,
                        'product_sku' => $item['product']->sku,
                        'unit_price' => $item['product']->price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['subtotal'],
                    ]
                );
            }
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $posts = [
            [
                'title' => 'How to Choose the Right GPU for 4K Gaming in Nepal',
                'slug' => 'how-to-choose-the-right-gpu-for-4k-gaming-in-nepal',
                'category' => 'Guides',
                'author' => 'Aarav Shrestha',
                'cover_image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
                'body' => "4K gaming in Nepal comes with unique constraints: power availability, room temperature, and import pricing. Start with the GPU that matches your display and PSU reality, not just the benchmark number.\n\nIf you game at 60Hz, an RTX 4070 Ti or RX 7800 XT is often enough. For 144Hz 4K, plan for an RTX 4080 Super or higher. Always check PSU wattage and physical clearance before buying.\n\nLocal stock, warranty validity, and after-sales support matter more than saving a few thousand rupees on an unknown import.",
                'published_at' => '2026-09-02',
                'is_published' => true,
            ],
            [
                'title' => 'The State of PC Components Supply in Kathmandu',
                'slug' => 'the-state-of-pc-components-supply-in-kathmandu',
                'category' => 'Market',
                'author' => 'Sneha Maharjan',
                'cover_image' => 'https://images.unsplash.com/photo-1555617996-f7d6d3f0a4b0?auto=format&fit=crop&w=1200&q=80',
                'body' => "Import timelines for GPUs, CPUs, and storage have improved, but grey-market risk remains high. Buyers should prefer verified vendors with traceable supply chains.\n\nStock transparency is now a competitive advantage. Vendors who show real inventory levels convert better and receive fewer support tickets.\n\nWe are seeing more brands authorize Nepali resellers directly, which shortens warranty claims and improves return logistics.",
                'published_at' => '2026-08-28',
                'is_published' => true,
            ],
            [
                'title' => 'Building a Hackintosh on a Budget: Parts List & Tips',
                'slug' => 'building-a-hackintosh-on-a-budget-parts-list-tips',
                'category' => 'Builds',
                'author' => 'Bibek Adhikari',
                'cover_image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
                'body' => "A Hackintosh build in Nepal works best when you avoid cutting-edge Wi-Fi cards and stick to motherboard ports that macOS supports natively.\n\nFocus on CPU and RAM compatibility first, then add a compatible GPU if you need display acceleration. Many budget builds run fine on integrated graphics.\n\nKeep a bootable USB backup and document your EFI. It saves hours when macOS updates and breaks minor kexts.",
                'published_at' => '2026-08-21',
                'is_published' => true,
            ],
            [
                'title' => 'eSewa vs Khalti: Which Payment Gateway Fits Your Hardware Store?',
                'slug' => 'esewa-vs-khalti-which-payment-gateway-fits-your-hardware-store',
                'category' => 'Business',
                'author' => 'Priya Rai',
                'cover_image' => 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
                'body' => "For hardware stores, settlement speed and dispute resolution matter more than branding. eSewa typically settles faster for standard transactions.\n\nKhalti has stronger mobile wallet adoption in younger demographics. If your catalog targets students and first-time builders, Khalti can lift conversion.\n\nThe best setup is usually both, with COD as the fallback. Track failure rates by method and optimize the weakest one first.",
                'published_at' => '2026-08-15',
                'is_published' => true,
            ],
            [
                'title' => 'ESP32 vs Arduino: Which Board for Your IoT Prototype?',
                'slug' => 'esp32-vs-arduino-which-board-for-your-iot-prototype',
                'category' => 'IoT',
                'author' => 'Nishan Thapa',
                'cover_image' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
                'body' => "Choose ESP32 when you need Wi-Fi, BLE, or decent CPU power for sensor fusion. Choose Arduino Uno when you want simplicity, stable analog inputs, and beginner-friendly docs.\n\nFor Nepal-based IoT prototyping, availability matters. Check local vendor stock before locking a board into a production design.\n\nIf you need long-term maintenance, favor boards with larger communities and better Espressif/Arduino ecosystem support.",
                'published_at' => '2026-08-10',
                'is_published' => true,
            ],
            [
                'title' => 'Why Verified Vendor Status Increases Sales by 3x',
                'slug' => 'why-verified-vendor-status-increases-sales-by-3x',
                'category' => 'Vendors',
                'author' => 'Rojan Shahi',
                'cover_image' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
                'body' => "Buyers on Circuit Bazaar consistently choose verified vendors for high-value items like GPUs, motherboards, and enterprise networking gear.\n\nVerification is not just a badge. It forces sellers to publish structured specs, real stock levels, and clear warranty terms.\n\nVendors who complete their store profile and respond within a few hours see measurably higher conversion and lower order-cancellation rates.",
                'published_at' => '2026-08-04',
                'is_published' => true,
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::updateOrCreate(['slug' => $post['slug']], $post);
        }
    }
}

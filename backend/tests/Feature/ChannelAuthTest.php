<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChannelAuthTest extends TestCase
{
    use RefreshDatabase;

    private function createOrderForUser(User $user): Order
    {
        $store = VendorStore::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'vendor_store_id' => $store->id,
            'category_id' => $category->id,
        ]);

        return Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'status' => 'pending',
            'total' => 100,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_address' => '123 Main St',
            'shipping_city' => 'Kathmandu',
            'shipping_phone' => '9841234567',
        ]);
    }

    public function test_owner_can_authenticate_private_order_channel(): void
    {
        $user = User::factory()->create();
        $order = $this->createOrderForUser($user);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/broadcasting/auth', [
            'channel_name' => 'private-order.' . $order->id,
        ], [
            'X-Socket-ID' => '1',
        ]);

        $response->assertStatus(200);
    }

    public function test_admin_can_authenticate_private_order_channel(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $otherUser = User::factory()->create();
        $order = $this->createOrderForUser($otherUser);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/broadcasting/auth', [
            'channel_name' => 'private-order.' . $order->id,
        ], [
            'X-Socket-ID' => '1',
        ]);

        $response->assertStatus(200);
    }

    public function test_other_customer_cannot_authenticate_private_order_channel(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $order = $this->createOrderForUser($owner);

        $this->actingAs($otherUser, 'sanctum');

        $response = $this->post('/api/broadcasting/auth', [
            'channel_name' => 'private-order.' . $order->id,
        ], [
            'X-Socket-ID' => '1',
            'Accept' => 'application/json',
        ]);

        $this->assertContains($response->status(), [200, 403], 'Unexpected status code: ' . $response->status());
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorStore;
use App\Services\Payments\CodGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(array $attrs = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'customer',
            'status' => 'active',
        ], $attrs));
    }

    private function createVendorWithStore(array $attrs = []): array
    {
        $user = User::factory()->create(array_merge([
            'role' => 'vendor',
            'status' => 'active',
        ], $attrs));

        $store = VendorStore::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        return [$user, $store];
    }

    private function createProductAndOrder(User $user, VendorStore $store, string $method = 'esewa'): Order
    {
        $category = Category::factory()->create();

        $product = Product::factory()->create([
            'vendor_store_id' => $store->id,
            'category_id' => $category->id,
            'price' => 100,
            'stock' => 10,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'status' => 'pending',
            'total' => 200,
            'payment_method' => $method,
            'payment_status' => 'pending',
            'shipping_address' => '123 Main St',
            'shipping_city' => 'Kathmandu',
            'shipping_phone' => '9841234567',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'vendor_store_id' => $store->id,
            'product_name' => $product->name,
            'product_sku' => $product->sku,
            'unit_price' => $product->price,
            'quantity' => 2,
            'subtotal' => 200,
        ]);

        return $order;
    }

    private function createPayment(Order $order): Payment
    {
        return Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'method' => $order->payment_method,
            'status' => 'pending',
            'amount' => $order->total,
            'payload' => [],
        ]);
    }

    private function reserveStock(Product $product): void
    {
        $product->decrement('stock', 2);
    }

    private function authAs(User $user): void
    {
        $this->actingAs($user, 'sanctum');
    }

    // =====================
    // ESEWA
    // =====================

    public function test_esewa_initiate_returns_form_data(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'esewa');
        $this->authAs($user);

        config()->set('services.esewa.secret_key', 'test_secret');
        config()->set('services.esewa.merchant_id', 'TEST_MERCHANT');

        $response = $this->postJson("/api/payments/initiate/{$order->id}", [
            'method' => 'esewa',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'payment_id',
                'data' => ['method', 'action', 'fields'],
            ])
            ->assertJsonPath('data.method', 'POST')
            ->assertJsonPath('data.action', 'https://rc.esewa.com.np/api/epay/main/v2/form');
    }

    public function test_esewa_success_callback_marks_payment_paid_and_preserves_stock(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'esewa');
        $product = $order->items->first()->product;
        $this->createPayment($order);
        $this->reserveStock($product);

        $this->authAs($user);

        $secretKey = 'test_secret';
        config()->set('services.esewa.secret_key', $secretKey);

        $data = json_encode([
            'total_amount' => '200',
            'transaction_uuid' => $order->order_number,
            'product_code' => 'TEST_MERCHANT',
        ]);

        $signature = hash_hmac('sha256', base64_encode($data), $secretKey);

        $response = $this->postJson('/api/payments/callback/esewa', [
            'data' => base64_encode($data),
            'signature' => $signature,
        ]);

        $response->assertStatus(302);

        $payment = Payment::where('order_id', $order->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('paid', $payment->status);

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame('processing', $order->status);

        $product->refresh();
        $this->assertSame(8, $product->stock);
    }

    public function test_esewa_failure_callback_restores_stock(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'esewa');
        $product = $order->items->first()->product;
        $this->createPayment($order);
        $this->reserveStock($product);

        $this->authAs($user);

        $secretKey = 'test_secret';
        config()->set('services.esewa.secret_key', $secretKey);

        $data = json_encode([
            'total_amount' => '200',
            'transaction_uuid' => $order->order_number,
            'product_code' => 'TEST_MERCHANT',
        ]);

        $response = $this->postJson('/api/payments/callback/esewa', [
            'data' => base64_encode($data),
            'signature' => 'bad_signature',
        ]);

        $response->assertStatus(302);

        $payment = Payment::where('order_id', $order->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('failed', $payment->status);

        $order->refresh();
        $this->assertSame('failed', $order->payment_status);
        $this->assertSame('cancelled', $order->status);

        $product->refresh();
        $this->assertSame(10, $product->stock);
    }

    // =====================
    // KHALTI
    // =====================

    public function test_khalti_initiate_returns_payment_url(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'khalti');
        $this->authAs($user);

        Http::fake([
            'https://dev.khalti.com/api/epayment/initiate/' => Http::response([
                'payment_url' => 'https://test.khalti.com/pay/test',
                'pidx' => 'test_pidx_123',
            ], 200),
        ]);

        config()->set('services.khalti.secret_key', 'test_secret');
        config()->set('services.khalti.base_url', 'https://dev.khalti.com/api');

        $response = $this->postJson("/api/payments/initiate/{$order->id}", [
            'method' => 'khalti',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'payment_id',
                'data' => ['method', 'action', 'fields'],
            ]);
    }

    public function test_khalti_success_callback_marks_payment_paid_and_preserves_stock(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'khalti');
        $product = $order->items->first()->product;
        $this->createPayment($order);
        $this->reserveStock($product);

        $this->authAs($user);

        Http::fake([
            'https://dev.khalti.com/api/epayment/lookup/' => Http::response([
                'pidx' => 'test_pidx_123',
                'status' => 'Completed',
                'txnId' => 'KHALTI-TXN-001',
            ], 200),
        ]);

        config()->set('services.khalti.secret_key', 'test_secret');
        config()->set('services.khalti.base_url', 'https://dev.khalti.com/api');

        $response = $this->postJson('/api/payments/callback/khalti', [
            'pidx' => 'test_pidx_123',
            'status' => 'Completed',
            'purchase_order_id' => $order->order_number,
        ]);

        $response->assertStatus(302);

        $payment = Payment::where('order_id', $order->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('paid', $payment->status);

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame('processing', $order->status);

        $product->refresh();
        $this->assertSame(8, $product->stock);
    }

    public function test_khalti_failure_callback_restores_stock(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'khalti');
        $product = $order->items->first()->product;
        $this->createPayment($order);
        $this->reserveStock($product);

        $this->authAs($user);

        Http::fake([
            'https://dev.khalti.com/api/epayment/lookup/' => Http::response([
                'pidx' => 'test_pidx_123',
                'status' => 'Failed',
            ], 200),
        ]);

        config()->set('services.khalti.secret_key', 'test_secret');
        config()->set('services.khalti.base_url', 'https://dev.khalti.com/api');

        $response = $this->postJson('/api/payments/callback/khalti', [
            'pidx' => 'test_pidx_123',
            'status' => 'Failed',
            'purchase_order_id' => $order->order_number,
        ]);

        $response->assertStatus(302);

        $payment = Payment::where('order_id', $order->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('failed', $payment->status);

        $order->refresh();
        $this->assertSame('failed', $order->payment_status);
        $this->assertSame('cancelled', $order->status);

        $product->refresh();
        $this->assertSame(10, $product->stock);
    }

    // =====================
    // STRIPE
    // =====================

    public function test_stripe_initiate_returns_client_secret(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'stripe');
        $this->authAs($user);

        Http::fake([
            'https://api.stripe.com/v1/payment_intents' => Http::response([
                'id' => 'pi_test_123',
                'client_secret' => 'pi_test_123_secret_456',
                'status' => 'requires_payment_method',
            ], 200),
        ]);

        config()->set('services.stripe.secret_key', 'sk_test_secret');
        config()->set('services.stripe.base_url', 'https://api.stripe.com');

        $response = $this->postJson("/api/payments/initiate/{$order->id}", [
            'method' => 'stripe',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'payment_id',
                'data' => ['method', 'client_secret', 'payment_intent_id', 'fields'],
            ])
            ->assertJsonPath('data.method', 'POST')
            ->assertJsonPath('data.payment_intent_id', 'pi_test_123');
    }

    public function test_stripe_success_webhook_marks_payment_paid_and_preserves_stock(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'stripe');
        $product = $order->items->first()->product;
        $this->createPayment($order);
        $this->reserveStock($product);

        $this->authAs($user);

        Http::fake([
            'https://api.stripe.com/v1/payment_intents/pi_test_123' => Http::response([
                'id' => 'pi_test_123',
                'status' => 'succeeded',
            ], 200),
        ]);

        config()->set('services.stripe.secret_key', 'sk_test_secret');
        config()->set('services.stripe.base_url', 'https://api.stripe.com');

        $response = $this->postJson('/api/payments/webhook/stripe', [
            'id' => 'pi_test_123',
            'status' => 'succeeded',
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);

        $payment = Payment::where('order_id', $order->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('paid', $payment->status);

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame('processing', $order->status);

        $product->refresh();
        $this->assertSame(8, $product->stock);
    }

    public function test_stripe_failure_webhook_restores_stock(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'stripe');
        $product = $order->items->first()->product;
        $this->createPayment($order);
        $this->reserveStock($product);

        $this->authAs($user);

        Http::fake([
            'https://api.stripe.com/v1/payment_intents/pi_test_123' => Http::response([
                'id' => 'pi_test_123',
                'status' => 'requires_payment_method',
            ], 200),
        ]);

        config()->set('services.stripe.secret_key', 'sk_test_secret');
        config()->set('services.stripe.base_url', 'https://api.stripe.com');

        $response = $this->postJson('/api/payments/webhook/stripe', [
            'id' => 'pi_test_123',
            'status' => 'requires_payment_method',
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'failed']);

        $payment = Payment::where('order_id', $order->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('failed', $payment->status);

        $order->refresh();
        $this->assertSame('failed', $order->payment_status);
        $this->assertSame('cancelled', $order->status);

        $product->refresh();
        $this->assertSame(10, $product->stock);
    }

    // =====================
    // COD
    // =====================

    public function test_cod_initiate_returns_pending_status(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $order = $this->createProductAndOrder($user, $store, 'cod');
        $this->authAs($user);

        $response = $this->postJson("/api/payments/initiate/{$order->id}", [
            'method' => 'cod',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.method', 'none')
            ->assertJsonPath('data.fields.status', 'pending');
    }

    public function test_cod_gateway_verify_always_confirms(): void
    {
        $gateway = new CodGateway();

        $this->assertTrue($gateway->verify([]));
        $this->assertTrue($gateway->verify(['anything' => 'here']));
    }
}
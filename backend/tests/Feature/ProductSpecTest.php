<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorStore;
use App\Services\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSpecTest extends TestCase
{
    use RefreshDatabase;

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

    private function authAs(User $user): void
    {
        $this->actingAs($user, 'sanctum');
    }

    private function mockCloudinary(): void
    {
        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('upload')->andReturn('https://example.com/image.jpg');
        });
    }

    public function test_create_product_rejects_invalid_spec_key(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $this->authAs($user);
        $this->mockCloudinary();

        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
            ],
        ]);

        $response = $this->postJson('/api/vendor/products', [
            'category_id' => $category->id,
            'name' => 'Test CPU',
            'sku' => 'CPU-TEST-001',
            'price' => 100,
            'stock' => 10,
            'status' => 'active',
            'specs' => ['wattage' => '650'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['specs.wattage']);
    }

    public function test_create_product_rejects_invalid_select_value(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $this->authAs($user);
        $this->mockCloudinary();

        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
            ],
        ]);

        $response = $this->postJson('/api/vendor/products', [
            'category_id' => $category->id,
            'name' => 'Test CPU',
            'sku' => 'CPU-TEST-002',
            'price' => 100,
            'stock' => 10,
            'status' => 'active',
            'specs' => ['socket_type' => 'AM4'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['specs.socket_type']);
    }

    public function test_create_product_accepts_valid_specs(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $this->authAs($user);
        $this->mockCloudinary();

        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
                ['key' => 'wattage', 'label' => 'Wattage', 'type' => 'number', 'unit' => 'W'],
            ],
        ]);

        $response = $this->postJson('/api/vendor/products', [
            'category_id' => $category->id,
            'name' => 'Test CPU',
            'sku' => 'CPU-TEST-003',
            'price' => 100,
            'stock' => 10,
            'status' => 'active',
            'specs' => ['socket_type' => 'AM5', 'wattage' => '650'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('product.specs.socket_type', 'AM5')
            ->assertJsonPath('product.specs.wattage', '650');
    }

    public function test_update_product_rejects_invalid_specs(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $this->authAs($user);
        $this->mockCloudinary();

        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
            ],
        ]);

        $product = Product::factory()->create([
            'vendor_store_id' => $store->id,
            'category_id' => $category->id,
        ]);

        $response = $this->putJson("/api/vendor/products/{$product->id}", [
            'category_id' => $category->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'price' => $product->price,
            'stock' => $product->stock,
            'status' => $product->status,
            'specs' => ['socket_type' => 'AM4'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['specs.socket_type']);
    }

    public function test_products_filter_by_spec_select(): void
    {
        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
            ],
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'active',
            'specs' => ['socket_type' => 'AM5'],
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'active',
            'specs' => ['socket_type' => 'LGA1700'],
        ]);

        $response = $this->getJson('/api/products?spec[socket_type]=AM5');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_products_filter_by_spec_number(): void
    {
        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'wattage', 'label' => 'Wattage', 'type' => 'number', 'unit' => 'W'],
            ],
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'active',
            'specs' => ['wattage' => '650'],
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'active',
            'specs' => ['wattage' => '125'],
        ]);

        $response = $this->getJson('/api/products?spec[wattage]=650');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_products_filter_by_combined_specs_and_category(): void
    {
        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
                ['key' => 'wattage', 'label' => 'Wattage', 'type' => 'number', 'unit' => 'W'],
            ],
        ]);

        $otherCategory = Category::factory()->create();

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'active',
            'specs' => ['socket_type' => 'AM5', 'wattage' => '650'],
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'active',
            'specs' => ['socket_type' => 'LGA1700', 'wattage' => '125'],
        ]);

        Product::factory()->create([
            'category_id' => $otherCategory->id,
            'status' => 'active',
            'specs' => ['socket_type' => 'AM5', 'wattage' => '650'],
        ]);

        $response = $this->getJson("/api/products?category={$category->id}&spec[socket_type]=AM5&spec[wattage]=650");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_spec_schema_endpoint_returns_fields(): void
    {
        $category = Category::factory()->create([
            'spec_schema' => [
                ['key' => 'socket_type', 'label' => 'Socket Type', 'type' => 'select', 'options' => ['AM5', 'LGA1700']],
                ['key' => 'wattage', 'label' => 'Wattage', 'type' => 'number', 'unit' => 'W'],
            ],
        ]);

        $response = $this->getJson("/api/categories/{$category->id}/spec-schema");

        $response->assertStatus(200)
            ->assertJsonPath('id', $category->id)
            ->assertJsonPath('spec_schema.0.key', 'socket_type')
            ->assertJsonPath('spec_schema.1.key', 'wattage');
    }
}

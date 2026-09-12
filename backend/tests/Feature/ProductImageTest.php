<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorStore;
use App\Services\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductImageTest extends TestCase
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

    private function createProduct(User $user, VendorStore $store): Product
    {
        $category = Category::factory()->create();

        return Product::factory()->create([
            'vendor_store_id' => $store->id,
            'category_id' => $category->id,
            'price' => 100,
            'stock' => 10,
        ]);
    }

    private function authAs(User $user): void
    {
        $this->actingAs($user, 'sanctum');
    }

    public function test_create_product_with_image_upload_stores_cloudinary_url(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $this->authAs($user);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('upload')
                ->once()
                ->andReturn('https://res.cloudinary.com/demo/image/upload/v1234/product.jpg');
        });

        $file = UploadedFile::fake()->image('product.jpg', 800, 600);

        $response = $this->postJson('/api/vendor/products', [
            'category_id' => Category::factory()->create()->id,
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'description' => 'A test product',
            'price' => 100,
            'stock' => 10,
            'status' => 'active',
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Product created.')
            ->assertJsonPath('product.image', 'https://res.cloudinary.com/demo/image/upload/v1234/product.jpg');
    }

    public function test_update_product_image_upload_stores_cloudinary_url(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $product = $this->createProduct($user, $store);
        $this->authAs($user);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('upload')
                ->once()
                ->andReturn('https://res.cloudinary.com/demo/image/upload/v1234/updated.jpg');
        });

        $file = UploadedFile::fake()->image('updated.jpg', 800, 600);

        $response = $this->putJson("/api/vendor/products/{$product->id}", [
            'category_id' => $product->category_id,
            'name' => $product->name,
            'sku' => $product->sku,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'status' => $product->status,
            'image' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Product updated.')
            ->assertJsonPath('product.image', 'https://res.cloudinary.com/demo/image/upload/v1234/updated.jpg');
    }

    public function test_dedicated_image_endpoint_updates_product_image(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $product = $this->createProduct($user, $store);
        $this->authAs($user);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('upload')
                ->once()
                ->andReturn('https://res.cloudinary.com/demo/image/upload/v1234/dedicated.jpg');
        });

        $file = UploadedFile::fake()->image('dedicated.jpg', 800, 600);

        $response = $this->postJson("/api/vendor/products/{$product->id}/image", [
            'image' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Image updated.',
                'image' => 'https://res.cloudinary.com/demo/image/upload/v1234/dedicated.jpg',
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'image' => 'https://res.cloudinary.com/demo/image/upload/v1234/dedicated.jpg',
        ]);
    }

    public function test_wrong_vendor_cannot_upload_image(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $product = $this->createProduct($user, $store);

        [$otherUser] = $this->createVendorWithStore();
        $this->authAs($otherUser);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldNotHaveReceived('upload');
        });

        $file = UploadedFile::fake()->image('bad.jpg', 800, 600);

        $response = $this->postJson("/api/vendor/products/{$product->id}/image", [
            'image' => $file,
        ]);

        $response->assertStatus(403);
    }

    public function test_invalid_mime_type_is_rejected(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $product = $this->createProduct($user, $store);
        $this->authAs($user);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldNotHaveReceived('upload');
        });

        $file = UploadedFile::fake()->create('document.pdf', 1000, 'application/pdf');

        $response = $this->postJson("/api/vendor/products/{$product->id}/image", [
            'image' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('image');
    }

    public function test_file_too_large_is_rejected(): void
    {
        [$user, $store] = $this->createVendorWithStore();
        $product = $this->createProduct($user, $store);
        $this->authAs($user);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldNotHaveReceived('upload');
        });

        $file = UploadedFile::fake()->image('huge.jpg', 4000, 3000)->size(2500);

        $response = $this->postJson("/api/vendor/products/{$product->id}/image", [
            'image' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('image');
    }
}

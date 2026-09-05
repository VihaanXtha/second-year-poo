<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\CareerPost;
use App\Models\CourierInfo;
use App\Models\HomepageSlider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function authAsAdmin(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum');
    }

    // =====================
    // BLOG POSTS
    // =====================

    public function test_public_can_list_blog_posts(): void
    {
        BlogPost::factory()->count(3)->create();

        $response = $this->getJson('/api/blog');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'posts');
    }

    public function test_public_can_view_single_blog_post(): void
    {
        $post = BlogPost::factory()->create();

        $response = $this->getJson("/api/blog/{$post->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $post->id);
    }

    public function test_admin_can_create_blog_post(): void
    {
        $this->authAsAdmin();

        $response = $this->postJson('/api/admin/content/blog', [
            'title' => 'Test Blog Post',
            'slug' => 'test-blog-post',
            'body' => 'This is the body of the blog post.',
            'is_published' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('post.title', 'Test Blog Post');

        $this->assertDatabaseHas('blog_posts', [
            'title' => 'Test Blog Post',
            'slug' => 'test-blog-post',
        ]);
    }

    public function test_admin_can_update_blog_post(): void
    {
        $this->authAsAdmin();
        $post = BlogPost::factory()->create(['title' => 'Original Title']);

        $response = $this->putJson("/api/admin/content/blog/{$post->id}", [
            'title' => 'Updated Title',
            'slug' => $post->slug,
            'body' => 'Updated body.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('post.title', 'Updated Title');

        $this->assertDatabaseHas('blog_posts', ['id' => $post->id, 'title' => 'Updated Title']);
    }

    public function test_admin_can_delete_blog_post(): void
    {
        $this->authAsAdmin();
        $post = BlogPost::factory()->create();

        $response = $this->deleteJson("/api/admin/content/blog/{$post->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('blog_posts', ['id' => $post->id]);
    }

    // =====================
    // CAREER POSTS
    // =====================

    public function test_public_can_list_career_posts(): void
    {
        CareerPost::factory()->count(3)->create();

        $response = $this->getJson('/api/careers');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'posts');
    }

    public function test_admin_can_create_career_post(): void
    {
        $this->authAsAdmin();

        $response = $this->postJson('/api/admin/content/careers', [
            'title' => 'Test Career',
            'slug' => 'test-career',
            'description' => 'A test career description.',
            'requirements' => ['PHP', 'Laravel'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('post.title', 'Test Career');
    }

    // =====================
    // COURIER INFO
    // =====================

    public function test_public_can_view_courier_info(): void
    {
        $courier = CourierInfo::factory()->create();

        $response = $this->getJson('/api/courier');

        $response->assertStatus(200)
            ->assertJsonPath('courier.title', $courier->title);
    }

    public function test_admin_can_create_courier_info(): void
    {
        $this->authAsAdmin();

        $response = $this->postJson('/api/admin/content/courier', [
            'title' => 'Nationwide Delivery',
            'body' => 'We deliver across Nepal.',
            'delivery_zones' => ['Kathmandu', 'Pokhara'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('courier.title', 'Nationwide Delivery');
    }

    // =====================
    // HOMEPAGE SLIDERS
    // =====================

    public function test_public_can_view_active_sliders(): void
    {
        HomepageSlider::factory()->count(2)->create(['is_active' => true]);
        HomepageSlider::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/sliders');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'sliders');
    }

    public function test_sliders_are_ordered_by_sort_order(): void
    {
        HomepageSlider::factory()->create(['sort_order' => 2, 'headline' => 'Second']);
        HomepageSlider::factory()->create(['sort_order' => 1, 'headline' => 'First']);

        $response = $this->getJson('/api/sliders');

        $response->assertStatus(200);
        $this->assertEquals('First', $response->json('sliders.0.headline'));
        $this->assertEquals('Second', $response->json('sliders.1.headline'));
    }

    public function test_admin_can_create_slider(): void
    {
        $this->authAsAdmin();

        $response = $this->postJson('/api/admin/content/sliders', [
            'image_url' => 'https://example.com/slide.jpg',
            'headline' => 'New Arrivals',
            'link_url' => '/products',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('slider.headline', 'New Arrivals');
    }

    // =====================
    // AUTHORIZATION
    // =====================

    public function test_non_admin_cannot_create_blog_post(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/admin/content/blog', [
            'title' => 'Hacked',
            'slug' => 'hacked',
            'body' => 'No.',
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_admin_content(): void
    {
        $response = $this->postJson('/api/admin/content/blog', [
            'title' => 'Hacked',
            'slug' => 'hacked',
            'body' => 'No.',
        ]);

        $response->assertStatus(401);
    }
}

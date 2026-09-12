<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_registration_requires_phone_verification_before_login(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'channel' => 'email',
        ]);

        $response->assertStatus(201);
        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->phone_verified_at);

        $loginResponse = $this->postJson('/api/auth/login', [
            'identifier' => 'test@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(403);
        $loginResponse->assertJson([
            'requires_phone_verification' => true,
        ]);
    }

    public function test_phone_registration_requires_phone_verification_before_login(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'phone' => '9841234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'channel' => 'phone',
        ]);

        $response->assertStatus(201);
        $user = User::where('phone', '9841234567')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->phone_verified_at);

        $loginResponse = $this->postJson('/api/auth/login', [
            'identifier' => '9841234567',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(403);
        $loginResponse->assertJson([
            'requires_phone_verification' => true,
        ]);
    }

    public function test_google_registration_requires_phone_verification_before_login(): void
    {
        $user = User::factory()->create([
            'google_id' => 'google123',
            'email' => 'googleuser@example.com',
            'phone_verified_at' => null,
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'identifier' => 'googleuser@example.com',
            'password' => 'password',
        ]);

        $loginResponse->assertStatus(403);
        $loginResponse->assertJson([
            'requires_phone_verification' => true,
        ]);
    }

    public function test_registration_is_complete_only_after_phone_verification(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'complete@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'channel' => 'email',
        ]);

        $user = User::where('email', 'complete@example.com')->first();

        $this->assertNotNull($user);
        $this->assertNull($user->phone_verified_at);

        $loginResponse = $this->postJson('/api/auth/login', [
            'identifier' => 'complete@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(403);

        $user->update(['phone_verified_at' => now()]);

        $loginResponseAfter = $this->postJson('/api/auth/login', [
            'identifier' => 'complete@example.com',
            'password' => 'password123',
        ]);

        $loginResponseAfter->assertStatus(200);
        $loginResponseAfter->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role'],
            'token',
        ]);
    }
}

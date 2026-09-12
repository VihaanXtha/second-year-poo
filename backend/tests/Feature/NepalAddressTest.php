<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NepalAddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_nepal_address_json_is_served(): void
    {
        $response = $this->getJson('/nepal-address.json');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'provinces' => [
                    '*' => ['name', 'districts'],
                ],
            ]);
    }

    public function test_nepal_address_json_contains_seven_provinces(): void
    {
        $data = $this->getJson('/nepal-address.json')->json();

        $this->assertCount(7, $data['provinces']);
        $names = array_column($data['provinces'], 'name');
        $this->assertContains('Koshi', $names);
        $this->assertContains('Madhesh', $names);
        $this->assertContains('Bagmati', $names);
        $this->assertContains('Gandaki', $names);
        $this->assertContains('Lumbini', $names);
        $this->assertContains('Karnali', $names);
        $this->assertContains('Sudurpashchim', $names);
    }

    public function test_user_can_be_created_with_full_nepal_address(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'status' => 'active',
            'phone' => '9841234567',
            'country' => 'Nepal',
            'province' => 'Bagmati',
            'district' => 'Kathmandu',
            'municipality' => 'Kathmandu Metropolitan City',
            'ward' => '5',
            'postal_code' => '44600',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'province' => 'Bagmati',
            'district' => 'Kathmandu',
            'municipality' => 'Kathmandu Metropolitan City',
            'ward' => '5',
            'postal_code' => '44600',
        ]);
    }

    public function test_user_address_fields_are_fillable(): void
    {
        $user = User::create([
            'name' => 'Fillable Test',
            'email' => 'fillable@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'status' => 'active',
            'phone' => '9840000000',
            'province' => 'Koshi',
            'district' => 'Morang',
            'municipality' => 'Biratnagar',
            'ward' => '12',
            'postal_code' => '56613',
        ]);

        $user->refresh();

        $this->assertSame('Koshi', $user->province);
        $this->assertSame('Morang', $user->district);
        $this->assertSame('Biratnagar', $user->municipality);
        $this->assertSame('12', $user->ward);
        $this->assertSame('56613', $user->postal_code);
        $this->assertSame('9840000000', $user->phone);
    }
}

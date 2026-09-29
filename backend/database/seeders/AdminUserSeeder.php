<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@circuitbazaar.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@circuitbazaar.com',
                'password' => Hash::make('admin123'),
                                'role' => 'admin',
                'status' => 'active',
                // Admin accounts are created by other admins (not self-registered),
                // so they shouldn't be blocked behind the customer phone-verification
                // hard-gate in AuthController::login(). Marking it verified lets the
                // seeded admin actually sign in locally.
                'phone_verified_at' => now(),
            ]
        );
    }
}

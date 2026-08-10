<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VendorStore;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class VendorUserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'vendor@circuitbazaar.com'],
            [
                'name' => 'Vendor User',
                'email' => 'vendor@circuitbazaar.com',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
                'status' => 'active',
            ]
        );

        VendorStore::updateOrCreate(
            ['user_id' => $user->id],
            [
                'store_name' => 'Test Vendor Store',
                'description' => 'A test vendor store for demonstration',
                'status' => 'active',
                'verified' => true,
            ]
        );
    }
}

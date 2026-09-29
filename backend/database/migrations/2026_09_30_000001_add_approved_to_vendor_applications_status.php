<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');

            DB::statement('ALTER TABLE vendor_applications RENAME TO vendor_applications_old');

            Schema::create('vendor_applications', function (Blueprint $table) {
                $table->id();
                $table->string('full_name');
                $table->string('email')->unique();
                $table->string('phone')->nullable();
                $table->string('store_name');
                $table->text('description')->nullable();
                $table->string('website')->nullable();
                $table->string('pan_number')->nullable();
                $table->string('address')->nullable();
                $table->string('country')->nullable();
                $table->string('province')->nullable();
                $table->string('district')->nullable();
                $table->string('municipality')->nullable();
                $table->string('ward')->nullable();
                $table->string('postal_code')->nullable();
                $table->string('experience')->nullable();
                $table->string('otp_code')->nullable();
                $table->timestamp('otp_expires_at')->nullable();
                $table->timestamp('otp_verified_at')->nullable();
                $table->string('phone_otp_code')->nullable();
                $table->timestamp('phone_otp_expires_at')->nullable();
                $table->timestamp('phone_otp_verified_at')->nullable();
                $table->enum('status', ['pending', 'verified', 'approved', 'rejected'])->default('pending');
                $table->timestamps();
            });

            DB::statement('INSERT INTO vendor_applications (id, full_name, email, phone, store_name, description, website, pan_number, address, country, province, district, municipality, ward, postal_code, experience, otp_code, otp_expires_at, otp_verified_at, phone_otp_code, phone_otp_expires_at, phone_otp_verified_at, status, created_at, updated_at) SELECT id, full_name, email, phone, store_name, description, website, pan_number, address, country, province, district, municipality, ward, postal_code, experience, otp_code, otp_expires_at, otp_verified_at, phone_otp_code, phone_otp_expires_at, phone_otp_verified_at, status, created_at, updated_at FROM vendor_applications_old');

            DB::statement('DROP TABLE vendor_applications_old');

            DB::statement('PRAGMA foreign_keys=ON');
        } else {
            DB::statement("ALTER TABLE vendor_applications MODIFY status ENUM('pending', 'verified', 'approved', 'rejected') DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');

            DB::statement('ALTER TABLE vendor_applications RENAME TO vendor_applications_old');

            Schema::create('vendor_applications', function (Blueprint $table) {
                $table->id();
                $table->string('full_name');
                $table->string('email')->unique();
                $table->string('phone')->nullable();
                $table->string('store_name');
                $table->text('description')->nullable();
                $table->string('website')->nullable();
                $table->string('pan_number')->nullable();
                $table->string('address')->nullable();
                $table->string('country')->nullable();
                $table->string('province')->nullable();
                $table->string('district')->nullable();
                $table->string('municipality')->nullable();
                $table->string('ward')->nullable();
                $table->string('postal_code')->nullable();
                $table->string('experience')->nullable();
                $table->string('otp_code')->nullable();
                $table->timestamp('otp_expires_at')->nullable();
                $table->timestamp('otp_verified_at')->nullable();
                $table->string('phone_otp_code')->nullable();
                $table->timestamp('phone_otp_expires_at')->nullable();
                $table->timestamp('phone_otp_verified_at')->nullable();
                $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
                $table->timestamps();
            });

            DB::statement("INSERT INTO vendor_applications (id, full_name, email, phone, store_name, description, website, pan_number, address, country, province, district, municipality, ward, postal_code, experience, otp_code, otp_expires_at, otp_verified_at, phone_otp_code, phone_otp_expires_at, phone_otp_verified_at, status, created_at, updated_at) SELECT id, full_name, email, phone, store_name, description, website, pan_number, address, country, province, district, municipality, ward, postal_code, experience, otp_code, otp_expires_at, otp_verified_at, phone_otp_code, phone_otp_expires_at, phone_otp_verified_at, status, created_at, updated_at FROM vendor_applications_old WHERE status IN ('pending', 'verified', 'rejected')");

            DB::statement('DROP TABLE vendor_applications_old');

            DB::statement('PRAGMA foreign_keys=ON');
        } else {
            DB::statement("ALTER TABLE vendor_applications MODIFY status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending'");
        }
    }
};

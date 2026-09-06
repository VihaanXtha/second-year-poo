<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vendor_applications', function (Blueprint $table) {
            if (! Schema::hasColumn('vendor_applications', 'phone_otp_code')) {
                $table->string('phone_otp_code')->nullable()->after('otp_verified_at');
            }
            if (! Schema::hasColumn('vendor_applications', 'phone_otp_expires_at')) {
                $table->timestamp('phone_otp_expires_at')->nullable()->after('phone_otp_code');
            }
            if (! Schema::hasColumn('vendor_applications', 'phone_otp_verified_at')) {
                $table->timestamp('phone_otp_verified_at')->nullable()->after('phone_otp_expires_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_applications', function (Blueprint $table) {
            //
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_stores', function (Blueprint $table) {
            $table->string('pan_number')->nullable()->after('address');
            $table->string('country')->default('Nepal')->after('pan_number');
            $table->string('province')->nullable()->after('country');
            $table->string('district')->nullable()->after('province');
            $table->string('municipality')->nullable()->after('district');
            $table->string('ward')->nullable()->after('municipality');
            $table->string('postal_code')->nullable()->after('ward');
        });
    }

    public function down(): void
    {
        Schema::table('vendor_stores', function (Blueprint $table) {
            $table->dropColumn(['postal_code', 'ward', 'municipality', 'district', 'province', 'country', 'pan_number']);
        });
    }
};

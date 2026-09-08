<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->text('description')->nullable()->after('spec_schema');
            $table->string('image')->nullable()->after('description');
            $table->unsignedInteger('display_order')->default(0)->after('image');
            $table->boolean('is_active')->default(true)->after('display_order');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['description', 'image', 'display_order', 'is_active']);
        });
    }
};

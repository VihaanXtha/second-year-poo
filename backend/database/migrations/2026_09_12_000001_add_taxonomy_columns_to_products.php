<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('sub_category_id')->nullable()->constrained()->nullOnDelete()->after('category_id');
            $table->foreignId('super_sub_category_id')->nullable()->constrained()->nullOnDelete()->after('sub_category_id');
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete()->after('super_sub_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropColumn('brand_id');
            $table->dropForeign(['super_sub_category_id']);
            $table->dropColumn('super_sub_category_id');
            $table->dropForeign(['sub_category_id']);
            $table->dropColumn('sub_category_id');
        });
    }
};
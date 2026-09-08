<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_sliders', function (Blueprint $table) {
            $table->renameColumn('button_text', 'headline');
            $table->renameColumn('button_link', 'link_url');
            $table->renameColumn('display_order', 'sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_sliders', function (Blueprint $table) {
            $table->renameColumn('headline', 'button_text');
            $table->renameColumn('link_url', 'button_link');
            $table->renameColumn('sort_order', 'display_order');
        });
    }
};

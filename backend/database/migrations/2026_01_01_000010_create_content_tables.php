<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('cover_image')->nullable();
            $table->text('body');
            $table->text('excerpt')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('career_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->json('requirements')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('courier_info', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->json('delivery_zones')->nullable();
            $table->timestamps();
        });

        Schema::create('homepage_sliders', function (Blueprint $table) {
            $table->id();
            $table->string('image_url');
            $table->string('headline');
            $table->string('link_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('career_posts');
        Schema::dropIfExists('courier_info');
        Schema::dropIfExists('homepage_sliders');
    }
};

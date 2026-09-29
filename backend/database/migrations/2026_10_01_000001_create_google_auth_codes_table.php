<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Short-lived, single-use codes handed to the browser after a successful
     * Google OAuth callback. The browser POSTs the code to
     * /auth/google/exchange to receive the Sanctum token in a JSON body, so the
     * token itself never travels through a URL (browser history, server access
     * logs and Referer headers all leak query strings).
     */
    public function up(): void
    {
        Schema::create('google_auth_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code_hash', 64)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('requires_profile_completion')->default(false);
            $table->boolean('requires_phone_verification')->default(false);
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('google_auth_codes');
    }
};

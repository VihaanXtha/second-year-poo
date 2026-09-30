<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One email (and one phone) may now belong to up to three personas — one
     * per role (customer / vendor / admin). The email remains the shared key
     * that links a person's accounts, so uniqueness moves from "one account
     * per email" to "one account per email *per role*".
     *
     * Only indexes change here (no table rebuild), which keeps SQLite and the
     * foreign keys of orders, stores, tokens etc. untouched.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique');
            $table->dropUnique('users_phone_unique');
            $table->dropUnique('users_google_id_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique(['email', 'role'], 'users_email_role_unique');
            $table->unique(['phone', 'role'], 'users_phone_role_unique');
            $table->index('google_id', 'users_google_id_index');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Note: restoring the global unique indexes fails if the same email/phone
     * now exists on more than one persona — merge or delete the duplicates
     * before rolling back.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_role_unique');
            $table->dropUnique('users_phone_role_unique');
            $table->dropIndex('users_google_id_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('email', 'users_email_unique');
            $table->unique('phone', 'users_phone_unique');
            $table->unique('google_id', 'users_google_id_unique');
        });
    }
};

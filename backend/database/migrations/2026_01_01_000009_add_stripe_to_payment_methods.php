<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_method', ['esewa', 'khalti', 'cod', 'stripe'])->default('cod')->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('method', ['esewa', 'khalti', 'cod', 'stripe'])->default('cod')->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_method', ['esewa', 'khalti', 'cod'])->default('cod')->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('method', ['esewa', 'khalti', 'cod'])->default('cod')->change();
        });
    }
};

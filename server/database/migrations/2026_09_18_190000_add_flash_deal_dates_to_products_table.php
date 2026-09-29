<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('flash_deal_starts_at')->nullable()->after('is_flash_deal');
            $table->timestamp('flash_deal_ends_at')->nullable()->after('flash_deal_starts_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['flash_deal_starts_at', 'flash_deal_ends_at']);
        });
    }
};

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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('desc')->nullable();
            $table->string('cta')->default('Comprá ahora');
            $table->string('link_url')->nullable();
            $table->string('bg')->default('from-orange-50 via-white to-amber-50');
            $table->string('accent')->default('#FF6A00');
            $table->string('image');
            $table->string('position')->default('hero'); // hero, side_1, side_2, promo
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};

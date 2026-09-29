<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('price');
            $table->string('original_price')->nullable();
            $table->string('tag')->nullable();
            $table->string('sku')->nullable();
            $table->unsignedInteger('stock')->default(10);
            $table->text('description');
            $table->text('long_description')->nullable();
            $table->json('details')->nullable();
            $table->json('sizes')->nullable();
            $table->json('colors')->nullable();
            $table->json('tags')->nullable();
            $table->string('weight')->nullable();
            $table->string('warranty')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

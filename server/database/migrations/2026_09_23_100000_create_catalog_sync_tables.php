<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('supplier_sku')->nullable();
            $table->unique(['supplier_id', 'supplier_sku']);
        });

        Schema::create('supplier_category_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('external_category');
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unique(['supplier_id', 'external_category'], 'supplier_category_unique');
            $table->timestamps();
        });

        Schema::create('catalog_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->index();
            $table->unsignedInteger('step')->default(0);
            $table->json('state')->nullable();
            $table->text('session')->nullable();
            $table->json('counts')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::create('catalog_sync_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_sync_log_id')->constrained()->cascadeOnDelete();
            $table->string('supplier_sku');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('action')->default('pending');
            $table->json('payload');
            $table->json('baseline')->nullable();
            $table->json('issues')->nullable();
            $table->json('images')->nullable();
            $table->unsignedInteger('image_cursor')->default(0);
            $table->boolean('images_ready')->default(false);
            $table->boolean('skipped')->default(false);
            $table->unique(['catalog_sync_log_id', 'supplier_sku'], 'catalog_sync_item_unique');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_sync_items');
        Schema::dropIfExists('catalog_sync_logs');
        Schema::dropIfExists('supplier_category_mappings');
        Schema::table('products', function (Blueprint $table) {
            $table->index('supplier_id', 'products_supplier_id_foreign');
            $table->dropUnique(['supplier_id', 'supplier_sku']);
            $table->dropColumn('supplier_sku');
        });
    }
};

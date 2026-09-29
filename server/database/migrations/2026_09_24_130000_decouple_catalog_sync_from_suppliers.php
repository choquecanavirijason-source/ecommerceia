<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('catalog_sync_logs')->whereIn('status', ['scanning', 'applying'])->exists()) {
            throw new RuntimeException('Esperá a que termine la sincronización activa antes de migrar.');
        }
        Schema::table('products', function (Blueprint $table) {
            $table->string('catalog_source')->nullable();
            $table->index('supplier_id');
            $table->unique(['catalog_source', 'supplier_sku']);
            $table->dropUnique(['supplier_id', 'supplier_sku']);
        });

        $previousSupplierIds = DB::table('suppliers')->where('code', 'REDLENIC')->pluck('id');
        DB::table('products')->whereIn('supplier_id', $previousSupplierIds)->whereNotNull('supplier_sku')
            ->update(['catalog_source' => 'redlenic']);

        Schema::create('catalog_category_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('catalog_source');
            $table->string('external_category');
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unique(['catalog_source', 'external_category'], 'catalog_category_unique');
            $table->timestamps();
        });
        foreach (DB::table('supplier_category_mappings')->whereIn('supplier_id', $previousSupplierIds)->get() as $mapping) {
            DB::table('catalog_category_mappings')->insert([
                'catalog_source' => 'redlenic', 'external_category' => $mapping->external_category,
                'category_id' => $mapping->category_id, 'created_at' => $mapping->created_at, 'updated_at' => $mapping->updated_at,
            ]);
        }
        DB::table('catalog_sync_logs')->whereIn('status', ['ready', 'scanning'])->update([
            'status' => 'cancelled', 'session' => null, 'finished_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_category_mappings');
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['catalog_source', 'supplier_sku']);
            $table->dropColumn('catalog_source');
            $table->unique(['supplier_id', 'supplier_sku']);
            $table->dropIndex(['supplier_id']);
        });
    }
};

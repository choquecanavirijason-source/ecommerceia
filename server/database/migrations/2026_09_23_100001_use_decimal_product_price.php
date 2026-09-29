<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('products')->select('id', 'price')->orderBy('id')->cursor() as $product) {
            if (! preg_match('/^\d{1,10}(\.\d{1,2})?$/D', (string) $product->price)) {
                throw new RuntimeException("Precio no convertible sin pérdida en producto {$product->id}. Corregir antes de migrar.");
            }
        }
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE products ALTER COLUMN price TYPE numeric(12,2) USING price::numeric(12,2)');
        } else {
            Schema::table('products', fn (Blueprint $table) => $table->decimal('price', 12, 2)->change());
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE products ALTER COLUMN price TYPE varchar(255) USING price::varchar(255)');
        } else {
            Schema::table('products', fn (Blueprint $table) => $table->string('price')->change());
        }
    }
};

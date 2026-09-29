<?php

namespace Database\Seeders;

use Illuminate\Database\Query\Builder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryIconSeeder extends Seeder
{
    public function run(): void
    {
        // Claves de la paleta existente del frontend, identificadas por slug.
        $iconsBySlug = [
            '' => 'box', // Categoría existente sin nombre ni slug.
            'accesorios-bebes' => 'box',
            'accesorios-gym' => 'box',
            'auriculares' => 'plug',
            'bazar' => 'house',
            'bazar-y-limpieza' => 'house',
            'belleza-y-cuidado-personal' => 'paintbrush',
            'blanqueria' => 'house',
            'calefaccion' => 'fire',
            'camaras-y-seguridad' => 'plug',
            'celulares' => 'plug',
            'cocinas' => 'fire',
            'electrodomesticos' => 'plug',
            'escolar' => 'box',
            'griferia' => 'droplet',
            'herramientas-y-acc' => 'screwdriver-wrench',
            'hogar' => 'house',
            'hornos-y-microondas' => 'fire',
            'humidificadoresiluminacion' => 'lightbulb',
            'indumentaria' => 'box',
            'juguetes-y-juegos' => 'box',
            'libreria' => 'box',
            'licuadoras-y-exprimidores' => 'plug',
            'marroquineria' => 'box',
            'mesas-y-sillas' => 'house',
            'muebles-y-placares' => 'house',
            'parlantes' => 'plug',
            'rodados-y-acc' => 'gear',
            'smart-tvs' => 'plug',
            'sommiers' => 'house',
            'soportes' => 'screwdriver-wrench',
            'tecnologia-y-acc' => 'plug',
            'termos-botellas-vasos' => 'snowflake',
            'termotanques' => 'fire',
            'varios' => 'box',
        ];

        $updated = DB::transaction(function () use ($iconsBySlug): int {
            $updated = 0;

            foreach ($iconsBySlug as $slug => $icon) {
                // Query Builder conserva updated_at y no crea categorías ausentes.
                $updated += DB::table('categories')
                    ->where('slug', $slug)
                    ->where(function (Builder $query) use ($icon): void {
                        $query->whereNull('icon')->orWhere('icon', '!=', $icon);
                    })
                    ->update(['icon' => $icon]);
            }

            return $updated;
        });

        $this->command?->info("Iconos de categorías actualizados: {$updated}.");
    }
}

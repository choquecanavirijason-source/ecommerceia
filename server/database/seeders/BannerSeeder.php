<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Banner;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => "Comprá fácil,\nrápido y seguro",
                'subtitle' => 'TODO LO QUE NECESITAS, MÁS CERCA',
                'desc' => 'Miles de productos con precios imperdibles y envíos a todo el país. Viví una experiencia de compra simple y confiable.',
                'cta' => 'Comprá ahora',
                'link_url' => '/categorias',
                'bg' => 'from-orange-50 via-white to-amber-50',
                'accent' => '#FF6A00',
                'image' => 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=700&h=500&fit=crop&auto=format',
                'position' => 'hero',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title' => "Elegí, comprá\ny recibí",
                'subtitle' => 'SIMPLE, RÁPIDO Y CONFIABLE',
                'desc' => 'Las mejores marcas y ofertas exclusivas todos los días. Calidad garantizada en cada compra.',
                'cta' => 'Descubrí ofertas',
                'link_url' => '/ofertas',
                'bg' => 'from-teal-50 via-white to-cyan-50',
                'accent' => '#0fa39f',
                'image' => 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=700&h=500&fit=crop&auto=format',
                'position' => 'hero',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'title' => "Renová tus espacios\nal mejor precio",
                'subtitle' => 'APROVECHÁ HOY',
                'desc' => 'Promociones y cuotas sin interés en productos seleccionados para tu hogar y proyectos.',
                'cta' => 'Aprovechá hoy',
                'link_url' => '/categorias',
                'bg' => 'from-orange-50 via-white to-teal-50',
                'accent' => '#FF6A00',
                'image' => 'https://images.unsplash.com/photo-1622308023558-2130696ec5cd?w=700&h=500&fit=crop&auto=format',
                'position' => 'hero',
                'order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $b) {
            Banner::updateOrCreate(
                ['title' => $b['title'], 'position' => $b['position']],
                $b
            );
        }
    }
}

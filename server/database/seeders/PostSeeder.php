<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'id' => 1,
                'slug' => 'elegir-taladro-inalambrico',
                'title' => 'Cómo elegir tu primer taladro inalámbrico: Guía definitiva',
                'category' => 'Herramientas',
                'category_color' => '#18D6D1',
                'tag_bg' => 'bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30',
                'excerpt' => 'Descubrí qué potencia, voltaje y tipo de batería necesitás según el uso que le vas a dar en tu hogar o taller, sin pagar de más.',
                'content' => "Elegir un taladro inalámbrico no tiene por qué ser complicado. Para uso hogareño ocasional, un modelo de 12V es más que suficiente para colgar cuadros, armar muebles o perforar mampostería ligera. Si buscás realizar proyectos de carpintería o remodelación constante, te recomendamos dar el salto a un equipo de 18V o 20V con batería de litio de al menos 2.0Ah. Asegurate de que cuente con embrague de torsión ajustable y función percutora.",
                'image' => null,
                'read_time' => '4 min de lectura',
                'icon' => 'Wrench',
                'banner_gradient' => 'from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent',
                'is_published' => true,
                'published_at' => '2026-09-15 10:00:00',
            ],
            [
                'id' => 2,
                'slug' => 'comprar-seguro-online',
                'title' => '5 claves para comprar por internet de forma simple y 100% segura',
                'category' => 'Guía UNO',
                'category_color' => '#FF6A00',
                'tag_bg' => 'bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/30',
                'excerpt' => 'Consejos infalibles para proteger tus datos, verificar comercios confiables y seguir tus envíos en tiempo real sin complicaciones.',
                'content' => "Comprar por internet en UNO COMPRAS es una experiencia transparente. Verificá siempre que el sitio cuente con certificado SSL (el candado verde en la barra del navegador), utilizá pasarelas de pago reconocidas y nunca compartas tus contraseñas o datos bancarios por canales informales. En UNO COMPRAS todos los envíos cuentan con número de seguimiento para que sepas exactamente dónde está tu paquete en cada momento.",
                'image' => null,
                'read_time' => '3 min de lectura',
                'icon' => 'ShieldCheck',
                'banner_gradient' => 'from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent',
                'is_published' => true,
                'published_at' => '2026-09-12 14:30:00',
            ],
            [
                'id' => 3,
                'slug' => 'kit-herramientas-esenciales',
                'title' => 'El kit básico de herramientas que no puede faltar en ningún hogar',
                'category' => 'Hogar & Taller',
                'category_color' => '#18D6D1',
                'tag_bg' => 'bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30',
                'excerpt' => 'Desde destornilladores magnéticos hasta pinzas universales: el equipamiento indispensable para resolver cualquier imprevisto.',
                'content' => "Un hogar bien equipado ahorra tiempo y dolores de cabeza ante cualquier imprevisto. El kit inicial debe incluir: un martillo carpintero de peso balanceado, juego de destornilladores planos y Phillips, una pinza universal aislada, cinta métrica de al menos 5 metros, nivel de mano y un juego de llaves Allen. Con estos elementos básicos podrás encarar el 90% de las reparaciones cotidianas.",
                'image' => null,
                'read_time' => '5 min de lectura',
                'icon' => 'Home',
                'banner_gradient' => 'from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent',
                'is_published' => true,
                'published_at' => '2026-09-08 09:15:00',
            ],
            [
                'id' => 4,
                'slug' => 'tendencias-herramientas-2026',
                'title' => 'Herramientas a batería con motor brushless: ¿Por qué valen la pena?',
                'category' => 'Tecnología',
                'category_color' => '#FF6A00',
                'tag_bg' => 'bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/30',
                'excerpt' => 'Analizamos la eficiencia energética, durabilidad y rendimiento de la nueva generación de motores sin escobillas para bricolaje y uso profesional.',
                'content' => "Los motores sin escobillas (brushless) representan el mayor salto tecnológico en herramientas electroportátiles. Al eliminar la fricción mecánica de los carbones tradicionales, entregan hasta un 50% más de autonomía por carga de batería, no sufren calentamiento excesivo y prolongan la vida útil de la herramienta por muchos años.",
                'image' => null,
                'read_time' => '6 min de lectura',
                'icon' => 'Sparkles',
                'banner_gradient' => 'from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent',
                'is_published' => true,
                'published_at' => '2026-09-01 11:00:00',
            ],
        ];

        foreach ($posts as $postData) {
            Post::updateOrCreate(
                ['slug' => $postData['slug']],
                $postData
            );
        }
    }
}

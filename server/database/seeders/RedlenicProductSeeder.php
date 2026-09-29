<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RedlenicProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->command->info('RedLénic: limpiando datos previos...');

        DB::table('cart_items')->delete();
        DB::table('reviews')->delete();
        DB::table('order_items')->delete();
        DB::table('orders')->delete();
        DB::table('products')->delete();
        DB::table('categories')->delete();

        $path = database_path('seeders/data/redlenic_products.json');
        $entries = json_decode(file_get_contents($path), true);

        if (!is_array($entries)) {
            $this->command->error("No se pudo decodificar el JSON en {$path}");

            return;
        }

        $categoryNames = [];
        foreach ($entries as $item) {
            $cat = $this->normalizeText($item['category'] ?? '');
            if ($cat === '') {
                $cat = 'Varios';
            }
            $categoryNames[$cat] = true;
        }

        $categoryIds = [];
        $usedSlugs = [];
        foreach (array_keys($categoryNames) as $name) {
            $slug = Str::slug($name);
            $base = $slug;
            $i = 1;
            while (in_array($slug, $usedSlugs, true)) {
                $slug = $base . '-' . (++$i);
            }
            $usedSlugs[] = $slug;
            $categoryIds[$name] = Category::create(['name' => $name, 'slug' => $slug])->id;
        }

        $perCategoryCount = [];
        $flashCount = 0;

        foreach ($entries as $item) {
            $name = $this->normalizeText($item['name']);
            $rawCat = $this->normalizeText($item['category'] ?? '');
            $category = $rawCat === '' ? 'Varios' : $rawCat;

            $images = [['url' => $item['image'], 'alt' => $name]];
            foreach ($item['additional_images'] ?? [] as $extra) {
                $images[] = ['url' => $this->absoluteUrl($extra), 'alt' => $name];
            }

            $details = [];
            if (!empty($item['quantity_per_package'])) {
                $details[] = 'Cantidad por paquete: ' . $item['quantity_per_package'];
            }

            $slug = Str::slug($name . '-' . $item['id']);
            if ($slug === '') {
                $slug = 'producto-' . $item['id'];
            }

            $catCount = $perCategoryCount[$category] ?? 0;
            $perCategoryCount[$category] = $catCount + 1;

            // Marcar los primeros 4 productos de cada categoría o los nuevos como destacados
            $isFeatured = $catCount < 4 || !empty($item['is_new']);

            // Marcar productos nuevos como ofertas flash (hasta 16) con descuento visible
            $isFlashDeal = false;
            $originalPrice = null;
            $flashStartsAt = null;
            $flashEndsAt = null;
            $tag = !empty($item['is_new']) ? 'Nuevo' : null;

            $priceFloat = (float) $item['price'];
            if (!empty($item['is_new']) && $flashCount < 16) {
                $isFlashDeal = true;
                $flashCount++;
                $originalPrice = number_format($priceFloat * 1.25, 2, '.', '');
                $flashStartsAt = now()->subHours(2);
                $flashEndsAt = now()->addDays(5);
                $tag = 'Oferta';
            }

            Product::create([
                'slug' => $slug,
                'name' => $name,
                'category_id' => $categoryIds[$category],
                'price' => number_format($priceFloat, 2, '.', ''),
                'original_price' => $originalPrice,
                'tag' => $tag,
                'sku' => (string) $item['id'],
                'stock' => 15,
                'description' => $name,
                'long_description' => $name,
                'details' => $details,
                'sizes' => [],
                'colors' => [],
                'tags' => [],
                'images' => $images,
                'is_active' => true,
                'is_featured' => $isFeatured,
                'is_flash_deal' => $isFlashDeal,
                'flash_deal_starts_at' => $flashStartsAt,
                'flash_deal_ends_at' => $flashEndsAt,
            ]);
        }

        $this->command->info('RedLénic: ' . count($categoryIds) . ' categorías y ' . count($entries) . ' productos sembrados (Destacados y Ofertas configurados).');
    }

    private function normalizeText(string $value): string
    {
        $value = trim($value);
        $value = strtr($value, [
            'Ã³' => 'ó',
            'Ã©' => 'é',
            'Ã¡' => 'á',
            'Ãº' => 'ú',
            'Ã±' => 'ñ',
            'Ã¼' => 'ü',
            'Ã¢' => 'â',
            'Ã´' => 'ô',
            'Ãª' => 'ê',
            'Ã¬' => 'ì',
            'Ã§' => 'ç',
            'Ã' => 'À',
            'Â' => '',
        ]);

        return trim($value);
    }

    private function absoluteUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '' || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return 'https://www.redlenic.uno/' . ltrim($url, '/');
    }
}
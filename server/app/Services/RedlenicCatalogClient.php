<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class RedlenicCatalogClient
{
    private CookieJar $cookies;

    public function __construct()
    {
        $this->cookies = new CookieJar;
    }

    public function restoreSession(?array $cookies): void
    {
        $this->cookies = new CookieJar(false, $cookies ?? []);
    }

    public function session(): array
    {
        return $this->cookies->toArray();
    }

    public function login(): void
    {
        $password = config('catalog_sync.password');
        if (! is_string($password) || $password === '') {
            throw new RuntimeException('Falta configurar REDLENIC_CLAVE en el servidor.');
        }
        $this->request('https://www.redlenic.uno/');
        $this->request('https://www.redlenic.uno/index.php', ['clave' => $password, 'enviar' => 'Ingresar']);
    }

    public function page(string $category): array
    {
        $base = strtok((string) config('catalog_sync.url'), '?#');
        if ($base !== 'https://www.redlenic.uno/catalogo2024.php' || ! ctype_digit($category)) {
            throw new RuntimeException('La URL de Red Lenic debe apuntar a su catálogo HTTPS.');
        }
        $html = $this->request($base.'?rub='.$category);
        if (preg_match('/sesion.*expirado|name=["\']clave["\']/iu', $html)) {
            $this->login();
            $html = $this->request($base.'?rub='.$category);
        }

        return $this->parse($html);
    }

    private function request(string $url, ?array $form = null): string
    {
        try {
            for ($redirect = 0; $redirect < 4; $redirect++) {
                $this->assertOrigin($url);
                if (! in_array(parse_url($url, PHP_URL_PATH), ['/', '/index.php', '/catalogo2024.php'], true)) {
                    throw new RuntimeException('La sesión redirigió fuera del catálogo.');
                }
                usleep(max(400, (int) config('catalog_sync.delay_ms')) * 1000);
                $request = Http::connectTimeout(5)->timeout(20)->withOptions([
                    'cookies' => $this->cookies,
                    'verify' => config('catalog_sync.ca_bundle') ?: true,
                    'allow_redirects' => false,
                    'progress' => static function ($total, $downloaded) {
                        if (max($total, $downloaded) > 40 * 1024 * 1024) {
                            throw new RuntimeException('Respuesta demasiado grande.');
                        }
                    },
                ]);
                $response = $form === null ? $request->get($url) : $request->asForm()->post($url, $form);
                if ($response->redirect()) {
                    $url = $this->absoluteUrl($response->header('Location'));
                    $form = null;

                    continue;
                }
                if (! $response->successful()) {
                    throw new RuntimeException('Respuesta HTTP inválida.');
                }

                return $response->body();
            }
        } catch (Throwable) {
            // Never propagate request bodies, session cookies or the login password to logs/HTTP responses.
            throw new RuntimeException('No se pudo leer Red Lenic. Revisá la conexión y la clave; el catálogo local no fue modificado.');
        }
        throw new RuntimeException('Red Lenic devolvió demasiadas redirecciones.');
    }

    public function parse(string $html): array
    {
        if (! str_contains(strtolower($html), '</html>')) {
            throw new RuntimeException('El catálogo llegó incompleto; no se calcularán bajas.');
        }
        $previous = libxml_use_internal_errors(true);
        $document = new DOMDocument;
        try {
            $document->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NONET | LIBXML_COMPACT);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
        $xpath = new DOMXPath($document);
        $categories = [];
        foreach ($xpath->query('//select[@id="lista_rubros"]/option') as $option) {
            $key = $option->getAttribute('value');
            if (ctype_digit($key) && ! in_array($key, ['0', '88888', '99999'], true)) {
                $categories[$key] = $this->cleanText($option->textContent);
            }
        }
        if (! $categories) {
            throw new RuntimeException('No se reconoció el catálogo. La sesión puede haber expirado o el sitio cambió.');
        }
        $products = [];
        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " contenedor_producto ")]') as $block) {
            $text = $this->cleanText($block->textContent);
            if (! preg_match('/Cód\.:\s*(\d{1,255})(?=\s|$)/u', $text, $code)) {
                throw new RuntimeException('Un producto no tiene código reconocible. El escaneo no es completo.');
            }
            $read = fn (string $path) => $this->cleanText($xpath->query($path, $block)->item(0)?->textContent ?? '');
            $name = preg_replace('/[\s.\-–]+$/u', '', $read('.//h1'));
            $category = preg_replace('/\s*\(NOVEDADES\)\s*$/u', '', $read('.//p[@class="rubro_centrado"]'));
            $price = $this->parsePrice($read('.//p[@class="datos"]/strong'));
            $stock = preg_match('/Cant\.\s*p\/bulto:\s*(\d+)(?=\s|$)/u', $text, $quantity) ? (int) $quantity[1] : null;
            if ($stock !== null && $stock > 2147483647) {
                $stock = null;
            }
            $images = [];
            foreach ($xpath->query('.//*[contains(concat(" ", normalize-space(@class), " "), " carousel-inner ")]//img', $block) as $image) {
                try {
                    $url = $this->absoluteUrl($image->getAttribute('src'));
                    $this->assertImageUrl($url);
                    $images[] = $url;
                } catch (RuntimeException) {
                    // Missing/unsafe images are represented by the local placeholder, never fetched elsewhere.
                }
            }
            $product = ['supplier_sku' => $code[1], 'name' => $name, 'category' => $category,
                'price' => $price, 'stock' => $stock, 'source_images' => array_values(array_unique($images))];
            if (isset($products[$code[1]]) && $products[$code[1]] !== $product) {
                throw new RuntimeException('Hay códigos duplicados con datos distintos en una página.');
            }
            $products[$code[1]] = $product;
        }

        return ['categories' => $categories, 'products' => array_values($products)];
    }

    public function parsePrice(string $value): ?string
    {
        $value = preg_replace('/[\s\x{00a0}$]/u', '', $value);
        if (! preg_match('/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{2}$/D', $value)) {
            return null;
        }
        $value = str_replace(',', '.', str_replace('.', '', $value));
        if (strlen(explode('.', $value)[0]) > 10) {
            return null;
        }

        return $value;
    }

    public function cleanText(string $text): string
    {
        $text = strtr($text, ['Ã³' => 'ó', 'Ã©' => 'é', 'Ã¡' => 'á', 'Ãº' => 'ú', 'Ã±' => 'ñ', 'Ã¼' => 'ü', 'Ã­' => 'í', 'Â' => '']);

        return trim(preg_replace('/\s+/u', ' ', $text));
    }

    private function absoluteUrl(string $url): string
    {
        $url = trim($url);
        if (str_starts_with($url, '//')) {
            return 'https:'.$url;
        }

        return preg_match('/^https?:\/\//i', $url) ? $url : 'https://www.redlenic.uno/'.ltrim($url, '/');
    }

    private function assertOrigin(string $url): void
    {
        $parts = parse_url($url);
        if (! $parts || ($parts['scheme'] ?? '') !== 'https' || ($parts['host'] ?? '') !== 'www.redlenic.uno'
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) {
            throw new RuntimeException('Destino externo no permitido.');
        }
    }

    private function assertImageUrl(string $url): void
    {
        $this->assertOrigin($url);
        if (! preg_match('~^/(?:fotos|archivos_recibidos)/[a-zA-Z0-9_ .()\-]+\.(?:jpg|jpeg|png|webp)$~i', rawurldecode(parse_url($url, PHP_URL_PATH) ?? ''))) {
            throw new RuntimeException('Ruta de imagen no permitida.');
        }
    }

    public function downloadImage(string $url, string $name): ?array
    {
        try {
            $this->assertImageUrl($url);
            $path = $this->imagePath($url);
            $disk = Storage::disk('public');
            if (! $disk->exists($path) || $disk->lastModified($path) < now()->subDay()->timestamp) {
                usleep(max(400, (int) config('catalog_sync.delay_ms')) * 1000);
                $response = Http::connectTimeout(4)->timeout(12)->withOptions([
                    'verify' => config('catalog_sync.ca_bundle') ?: true,
                    'allow_redirects' => false,
                    'progress' => static function ($total, $downloaded) {
                        if (max($total, $downloaded) > 8 * 1024 * 1024) {
                            throw new RuntimeException('Imagen demasiado grande.');
                        }
                    },
                ])->get($url);
                $info = $response->successful() ? @getimagesizefromstring($response->body()) : false;
                if (! $info || ! in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)) {
                    return null;
                }
                if (! $disk->put($path, $response->body())) {
                    return null;
                }
            }

            return ['url' => asset($disk->url($path)), 'alt' => $name];
        } catch (Throwable) {
            return null;
        }
    }

    public function imagePath(string $url): string
    {
        return 'products/redlenic/'.hash('sha256', $url).'.'.strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
    }
}

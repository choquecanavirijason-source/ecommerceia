<?php

return [
    'password' => env('REDLENIC_CLAVE'),
    'url' => env('REDLENIC_CATALOG_URL', 'https://www.redlenic.uno/catalogo2024.php'),
    // Optional trusted CA bundle for PHP installations without an OS certificate bundle.
    'ca_bundle' => env('REDLENIC_CA_BUNDLE'),
    'queue' => 'catalog-sync',
    'delay_ms' => 400,
    'preview_minutes' => 15,
];

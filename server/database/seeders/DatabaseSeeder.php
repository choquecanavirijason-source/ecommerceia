<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            AssignRolePermissionSeeder::class,
            MarketplaceSeeder::class,
            BannerSeeder::class,
            PostSeeder::class,
            RedlenicProductSeeder::class,
            CategoryIconSeeder::class,
        ]);
    }
}
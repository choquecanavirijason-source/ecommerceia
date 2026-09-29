<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Product;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'Bosch Argentina S.A.',
                'code' => 'CUIT 30-50284729-4',
                'contact_name' => 'Roberto Sánchez',
                'email' => 'ventas@bosch-herramientas.com.ar',
                'phone' => '+54 11 4778-9000',
                'address' => 'Av. Blanco Encalada 250, San Isidro, Buenos Aires',
                'website' => 'https://www.bosch-professional.com',
                'notes' => 'Proveedor oficial de herramientas eléctricas industriales e inalámbricas.',
                'is_active' => true,
            ],
            [
                'name' => 'Stanley Black & Decker',
                'code' => 'CUIT 30-61928374-1',
                'contact_name' => 'Mariana Gómez',
                'email' => 'comercial@stanleyblackanddecker.com',
                'phone' => '+54 11 5239-1100',
                'address' => 'Panamericana Km 34, Malvinas Argentinas',
                'website' => 'https://www.stanleytools.com.ar',
                'notes' => 'Distribuidor exclusivo de herramientas manuales y cajas de almacenamiento.',
                'is_active' => true,
            ],
            [
                'name' => 'Makita Latin America',
                'code' => 'CUIT 30-71029384-9',
                'contact_name' => 'Carlos Benítez',
                'email' => 'contacto@makita.com.ar',
                'phone' => '+54 11 4890-4422',
                'address' => 'Av. Corrientes 1580, CABA',
                'website' => 'https://www.makita.com.ar',
                'notes' => 'Línea pesada de construcción, rotomartillos y sierras.',
                'is_active' => true,
            ],
            [
                'name' => 'DeWalt Industrial',
                'code' => 'CUIT 30-68930214-5',
                'contact_name' => 'Eduardo Funes',
                'email' => 'proyectos@dewalt-ar.com',
                'phone' => '+54 11 4123-5588',
                'address' => 'Ruta 8 Km 52, Parque Industrial Pilar',
                'website' => 'https://www.dewalt.com.ar',
                'notes' => 'Herramientas de alta potencia con garantía extendida de 3 años.',
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $data) {
            $supplier = Supplier::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }

        // Asociar algunos productos existentes a los proveedores según su marca o nombre
        $bosch = Supplier::where('name', 'like', '%Bosch%')->first();
        $stanley = Supplier::where('name', 'like', '%Stanley%')->first();
        $makita = Supplier::where('name', 'like', '%Makita%')->first();
        $dewalt = Supplier::where('name', 'like', '%DeWalt%')->first();

        if ($bosch) {
            Product::where('name', 'like', '%Bosch%')->orWhere('name', 'like', '%Taladro%')->update(['supplier_id' => $bosch->id]);
        }
        if ($stanley) {
            Product::where('name', 'like', '%Stanley%')->orWhere('name', 'like', '%Kit%')->orWhere('name', 'like', '%Caja%')->update(['supplier_id' => $stanley->id]);
        }
        if ($makita) {
            Product::where('name', 'like', '%Makita%')->orWhere('name', 'like', '%Sierra%')->orWhere('name', 'like', '%Amoladora%')->update(['supplier_id' => $makita->id]);
        }
        if ($dewalt) {
            Product::where('name', 'like', '%DeWalt%')->orWhere('name', 'like', '%Rotomartillo%')->update(['supplier_id' => $dewalt->id]);
        }

        // Asignar los restantes al primer proveedor para que todos tengan proveedor
        if ($bosch) {
            Product::whereNull('supplier_id')->limit(15)->update(['supplier_id' => $bosch->id]);
        }
    }
}

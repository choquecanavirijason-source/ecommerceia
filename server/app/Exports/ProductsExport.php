<?php

namespace App\Exports;

use App\Exports\Styles\ExcelTableStyle;
use App\Services\ProductService;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Events\AfterSheet;

class ProductsExport implements FromCollection, WithColumnFormatting, WithColumnWidths, WithCustomStartCell, WithEvents, WithHeadings, WithMapping, WithStrictNullComparison
{
    private array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function startCell(): string
    {
        return ExcelTableStyle::startCell();
    }

    public function collection()
    {
        return app(ProductService::class)
            ->adminExportQuery($this->filters)
            ->get();
    }

    public function headings(): array
    {
        return [
            'Producto',
            'SKU',
            'Categoría',
            'Precio',
            'Stock',
            'Estado',
        ];
    }

    /**
     * @param  \App\Models\Product  $product
     */
    public function map($product): array
    {
        return [
            $product->name,
            $product->sku ?? 'Sin SKU',
            $product->category?->name ?? '—',
            $product->price_value,
            $product->stock ?? 0,
            $product->is_active ? 'Activo' : 'Inactivo',
        ];
    }

    public function columnFormats(): array
    {
        // Conserva el precio numérico para ordenar en Excel y muestra el formato actual.
        return ['D' => '"$"#,##0.00'];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 40,
            'B' => 16,
            'C' => 22,
            'D' => 16,
            'E' => 12,
            'F' => 14,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                (new ExcelTableStyle)->apply(
                    $event->sheet->getDelegate(),
                    $this->resolveTableName(),
                    count($this->headings()),
                );
            },
        ];
    }

    private function resolveTableName(): string
    {
        if (! empty($this->filters['is_featured'])) {
            return 'Catálogo de Productos — Destacados Home';
        }

        if (! empty($this->filters['is_flash_deal'])) {
            return 'Catálogo de Productos — Ofertas Flash';
        }

        return 'Catálogo de Productos';
    }
}

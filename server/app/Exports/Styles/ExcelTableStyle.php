<?php

namespace App\Exports\Styles;

use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Diseño compartido para exportaciones tabulares con encabezados en una sola fila.
 * Cada exportación conserva sus datos, títulos de columnas y anchos.
 */
final class ExcelTableStyle
{
    public const HEADER_ROW = 7;

    private const BRAND_NAME = 'UNO COMPRAS';

    private const PRIMARY_COLOR = 'FF6A00';

    private const TEXT_COLOR = '151515';

    public static function startCell(): string
    {
        return 'A' . self::HEADER_ROW;
    }

    public function apply(Worksheet $sheet, string $title, int $columnCount): void
    {
        if ($columnCount < 1 || $columnCount > 16384) {
            throw new InvalidArgumentException('La tabla debe tener entre 1 y 16384 columnas.');
        }

        $lastColumn = Coordinate::stringFromColumnIndex($columnCount);
        $lastRow = max(self::HEADER_ROW, $sheet->getHighestDataRow());

        $this->applyBrandHeader($sheet, $title, $lastColumn, $columnCount);
        $this->applyTableHeader($sheet, $lastColumn);
        $this->applyDataRows($sheet, $lastColumn, $lastRow);

        $tableRange = 'A' . self::HEADER_ROW . ":{$lastColumn}{$lastRow}";
        // Incluye todas las filas para ordenar registros completos desde los encabezados.
        $sheet->setAutoFilter($tableRange);

        $sheet->getStyle($tableRange)->applyFromArray([
            'borders' => [
                'outline' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
        ]);
    }

    private function applyBrandHeader(Worksheet $sheet, string $title, string $lastColumn, int $columnCount): void
    {
        $logoPath = public_path('images/logo.png');
        if (file_exists($logoPath)) {
            $drawing = new Drawing;
            $drawing->setName('Logo');
            $drawing->setDescription(self::BRAND_NAME);
            $drawing->setPath($logoPath);
            $drawing->setHeight(50);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(5);
            $drawing->setOffsetY(5);
            $drawing->setWorksheet($sheet);
        }

        foreach ([1 => 55, 2 => 6, 3 => 22, 4 => 20, 5 => 22, 6 => 8] as $row => $height) {
            $sheet->getRowDimension($row)->setRowHeight($height);
        }

        // En tablas pequeñas, la marca ocupa la fila libre bajo la fecha y el logo.
        $brandCell = $columnCount >= 3 ? 'C1' : 'A4';
        if ($columnCount < 3) {
            $sheet->getRowDimension(4)->setRowHeight(26);
        }
        $sheet->setCellValue($brandCell, self::BRAND_NAME);
        $sheet->getStyle($brandCell)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 18,
                'color' => ['rgb' => self::PRIMARY_COLOR],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $this->mergeAcross($sheet, $brandCell, $lastColumn . ($columnCount >= 3 ? '1' : '4'));

        $sheet->setCellValue('A3', 'Fecha de generación: ' . now()->format('d/m/Y H:i:s'));
        $sheet->getStyle('A3')->applyFromArray([
            'font' => [
                'size' => 10,
                'color' => ['rgb' => '8A8A8A'],
            ],
        ]);
        $this->mergeAcross($sheet, 'A3', "{$lastColumn}3");

        $sheet->setCellValue('A5', $title);
        $sheet->getStyle('A5')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => self::TEXT_COLOR],
            ],
        ]);
        $this->mergeAcross($sheet, 'A5', "{$lastColumn}5");
    }

    private function applyTableHeader(Worksheet $sheet, string $lastColumn): void
    {
        $sheet->getStyle('A' . self::HEADER_ROW . ':' . $lastColumn . self::HEADER_ROW)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 11,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => self::PRIMARY_COLOR],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'horizontal' => Alignment::HORIZONTAL_LEFT,
            ],
        ]);
        $sheet->getRowDimension(self::HEADER_ROW)->setRowHeight(28);
    }

    private function applyDataRows(Worksheet $sheet, string $lastColumn, int $lastRow): void
    {
        $firstDataRow = self::HEADER_ROW + 1;
        if ($lastRow < $firstDataRow) {
            return;
        }

        $sheet->getStyle("A{$firstDataRow}:{$lastColumn}{$lastRow}")->applyFromArray([
            'font' => [
                'size' => 10,
                'color' => ['rgb' => self::TEXT_COLOR],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'bottom' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E5E5'],
                ],
            ],
        ]);

        for ($row = $firstDataRow; $row <= $lastRow; $row++) {
            $sheet->getRowDimension($row)->setRowHeight(22);

            if (($row - $firstDataRow) % 2 === 0) {
                $sheet->getStyle("A{$row}:{$lastColumn}{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F3F3F3'],
                    ],
                ]);
            }
        }
    }

    private function mergeAcross(Worksheet $sheet, string $start, string $end): void
    {
        if ($start !== $end) {
            $sheet->mergeCells("{$start}:{$end}");
        }
    }
}

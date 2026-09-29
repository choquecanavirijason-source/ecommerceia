<?php

namespace App\Support;

use Closure;
use Illuminate\Database\Eloquent\Builder;

final class AdminTableSort
{
    /**
     * Las claves públicas se traducen a columnas o callbacks definidos por el servidor.
     * sortBy se conserva para los consumidores anteriores de estos listados.
     *
     * @param  array<string, string|Closure>  $columns
     */
    public static function apply(
        Builder $query,
        array $filters,
        array $columns,
        string $defaultColumn = 'id',
        string $defaultDirection = 'desc',
    ): Builder {
        $legacy = is_array($filters['sortBy'] ?? null) ? $filters['sortBy'] : [];
        $sort = $filters['sort'] ?? $legacy['sort'] ?? null;
        $direction = $filters['direction'] ?? $legacy['order'] ?? 'asc';
        $direction = is_string($direction) && strtolower($direction) === 'desc' ? 'desc' : 'asc';

        if (! is_string($sort) || ! isset($columns[$sort])) {
            $query->orderBy($defaultColumn, $defaultDirection);
        } elseif ($columns[$sort] instanceof Closure) {
            $columns[$sort]($query, $direction);
        } else {
            $query->orderBy($columns[$sort], $direction);
        }

        // Evita que los empates cambien de página entre peticiones.
        return $query->orderBy($query->getModel()->qualifyColumn('id'), $defaultDirection);
    }
}

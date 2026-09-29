import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { SortDirection } from "@/domain/entities/TableSort";
import { cn } from "@/shared/lib/utils";

export type { SortDirection } from "@/domain/entities/TableSort";

interface SortableHeaderProps {
    label: string;
    column: string;
    activeColumn: string | null;
    direction: SortDirection | null;
    onSort: (column: string) => void;
    className?: string;
    align?: "left" | "center" | "right";
    sortLabel?: string;
}

export function SortableHeader({ label, column, activeColumn, direction, onSort, className, align = "left", sortLabel = label }: SortableHeaderProps) {
    const isActive = activeColumn === column;
    const ariaSort = isActive ? (direction === "asc" ? "ascending" : "descending") : "none";
    const Icon = !isActive ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown;

    return (
        <th scope="col" aria-sort={ariaSort} className={cn("px-5 py-3 font-semibold", { "text-left": align === "left", "text-center": align === "center", "text-right": align === "right" }, className)}>
            <button
                type="button"
                title={`Ordenar por ${sortLabel}`}
                aria-label={`${sortLabel}: ${!isActive ? "ordenar ascendente" : direction === "asc" ? "ordenar descendente" : "restablecer orden original"}`}
                onClick={() => onSort(column)}
                className={`inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${isActive ? "text-primary" : ""
                    }`}
            >
                {label}
                <Icon aria-hidden className={`size-3.5 ${isActive ? "" : "opacity-50"}`} />
            </button>
        </th>
    );
}

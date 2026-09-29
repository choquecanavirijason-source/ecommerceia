import { describe, expect, it } from "vitest";
import type { CartItem } from "@/domain/entities/Cart";
import { GetCartSummaryUseCase } from "./GetCartSummaryUseCase";

function item(id: number, price: number, qty: number): CartItem {
  return {
    id,
    name: `Producto ${id}`,
    price,
    qty,
    rating: 0,
    reviews: 0,
    image: "",
    category: "Pruebas",
    inStock: true,
  };
}

describe("GetCartSummaryUseCase (comportamiento existente)", () => {
  it("devuelve total y cantidad cero para un carrito vacío", () => {
    expect(new GetCartSummaryUseCase().execute([])).toEqual({ total: 0, count: 0 });
  });

  it("suma importes y unidades de productos con cantidades distintas", () => {
    const items = [item(1, 12.5, 2), item(2, 4, 3)];

    expect(new GetCartSummaryUseCase().execute(items)).toEqual({ total: 37, count: 5 });
  });

  it("cuenta las unidades de un producto gratuito sin aumentar el importe", () => {
    expect(new GetCartSummaryUseCase().execute([item(1, 0, 2)])).toEqual({
      total: 0,
      count: 2,
    });
  });
});

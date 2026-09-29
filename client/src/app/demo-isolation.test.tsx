import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import { Providers } from "./providers";

vi.mock("next/navigation", () => ({ usePathname: () => "/agentes/" }));
vi.mock("@/presentation/organisms/SiteHeader", () => ({
  SiteHeader: () => { throw new Error("La demo no debe montar la navegación del ecommerce"); },
}));
vi.mock("@/presentation/hooks/useCatalogSync", () => ({
  CatalogSyncProvider: () => { throw new Error("La demo no debe sincronizar el ecommerce"); },
}));

it("monta el recorrido demo sin navegación ni sincronización del ecommerce", () => {
  render(<Providers><AppShell><h1>Catálogo local</h1></AppShell></Providers>);
  expect(screen.getByRole("heading", { name: "Catálogo local" })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /explorar agentes/i })[0]).toHaveAttribute("href", "/agentes");
  expect(screen.queryByRole("link", { name: /carrito|mis pedidos/i })).not.toBeInTheDocument();
});

import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import { Providers } from "./providers";

const route = vi.hoisted(() => ({ pathname: "/agentes/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/presentation/organisms/SiteHeader", () => ({
  SiteHeader: () => { throw new Error("La demo no debe montar la navegación del ecommerce"); },
}));
vi.mock("@/presentation/hooks/useCatalogSync", () => ({
  CatalogSyncProvider: () => { throw new Error("La demo no debe sincronizar el ecommerce"); },
}));

it.each(["/agentes/", "/chat/"])("aísla %s de la navegación y sincronización del ecommerce", pathname => {
  route.pathname = pathname;
  render(<Providers><AppShell><h1>Catálogo local</h1></AppShell></Providers>);
  expect(screen.getByRole("heading", { name: "Catálogo local" })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /explorar agentes/i })[0]).toHaveAttribute("href", "/agentes");
  expect(screen.queryByRole("link", { name: /carrito|mis pedidos/i })).not.toBeInTheDocument();
});

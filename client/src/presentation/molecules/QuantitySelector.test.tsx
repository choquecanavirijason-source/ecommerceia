import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantitySelector } from "./QuantitySelector";

function ControlledQuantity({ initial = 1 }: { initial?: number }) {
  const [qty, setQty] = useState(initial);
  return <QuantitySelector qty={qty} onChange={setQty} />;
}

describe("QuantitySelector (comportamiento existente)", () => {
  it("aumenta y disminuye la cantidad visible", async () => {
    const user = userEvent.setup();
    render(<ControlledQuantity initial={2} />);

    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(screen.getByText("3")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(screen.getByText("2")).toBeVisible();
  });

  it("mantiene el mínimo de una unidad al disminuir repetidamente", async () => {
    const user = userEvent.setup();
    render(<ControlledQuantity />);

    await user.dblClick(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(screen.getByText("1")).toBeVisible();
  });

  it("permite operar con teclado sin enviar el formulario contenedor", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(<form onSubmit={onSubmit}><ControlledQuantity /></form>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Disminuir cantidad" })).toHaveFocus();
    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByText("2")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

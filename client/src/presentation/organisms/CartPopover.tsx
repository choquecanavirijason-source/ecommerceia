"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/presentation/hooks/useCart";
import { useHasMounted } from "@/presentation/hooks/useHasMounted";
import { CartLineItem } from "@/presentation/molecules/CartLineItem";
import { formatPrice } from "@/shared/lib/format";
import { isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";

export interface CartPopoverProps {
  variant?: "default" | "minimal";
}

export function CartPopover({ variant = "minimal" }: CartPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { items, total, count, updateQty, removeFromCart } = useCart();
  const mounted = useHasMounted();

  const handleCheckout = () => {
    setOpen(false);
    if (isCustomerAuthenticated()) {
      router.push("/checkout");
    } else {
      router.push("/cuenta/ingresar?redirect=/checkout");
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      {variant === "minimal" ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex size-10 items-center justify-center p-2 text-neutral-800 hover:text-primary transition-colors focus:outline-none"
          aria-label={`Carrito de compras, ${count} productos`}
        >
          <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
          {mounted && count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FF6A00] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {count}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Carrito</span>
          {mounted && count > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-6rem))] bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm">Carrito de Compras ({count})</h3>
            <button type="button" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onUpdateQty={(delta) => updateQty(item.id, delta)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full bg-[#FF6A00] text-white py-3 rounded-full text-sm font-bold font-subheading hover:bg-orange-600 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Comprá ahora →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

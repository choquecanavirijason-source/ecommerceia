"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { Button } from "@/presentation/atoms/button";

export default function ArrepentimientoPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  return (
    <StorefrontTemplate>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        <header className="mb-8">
          <SectionEyebrow icon={RotateCcw}>Defensa del Consumidor</SectionEyebrow>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground font-heading tracking-tight mt-2">
            Botón de Arrepentimiento
          </h1>
          <div className="w-16 h-1 bg-[#FF6A00] rounded-full mt-2.5" />
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            De acuerdo con el Artículo 34 de la Ley 24.240 y la Resolución 424/2020, podés solicitar la cancelación de tu compra o revocación de aceptación dentro de los 10 (diez) días corridos desde recibido el producto.
          </p>
        </header>

        {submitted ? (
          <div className="bg-card rounded-3xl border border-border p-8 text-center max-w-lg mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground font-heading">Solicitud recibida con éxito</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Tu solicitud de arrepentimiento para la orden <strong>{orderNumber}</strong> ha sido ingresada. Te enviamos un código de seguimiento a <strong>{email}</strong> y nos contactaremos dentro de las 24 horas hábiles.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-subheading font-medium px-6 py-2.5 rounded-full text-sm"
            >
              Volver a la tienda
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Número de orden o pedido</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: UNO-2026-8941"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Correo electrónico registrado en la compra</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Motivo de la revocación (opcional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Comentanos brevemente el motivo de la devolución..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary min-h-24"
              />
            </div>

            <div className="p-4 rounded-xl bg-secondary/60 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Información importante:</p>
              <p>• El reintegro de dinero se realizará por el mismo medio de pago utilizado para la compra.</p>
              <p>• Los costos de flete o retiro por arrepentimiento dentro del plazo legal son asumidos por UNO COMPRAS.</p>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Enviar solicitud de arrepentimiento
            </Button>
          </form>
        )}
      </div>
    </StorefrontTemplate>
  );
}

"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/infrastructure/http/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      await apiRequest("/newsletter/subscribe", {
        method: "POST",
        body: { email: email.trim() },
      });
      setSubscribed(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Error al suscribirse. Intentá nuevamente.");
      } else {
        setSubscribed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="inline-flex items-center gap-2 bg-[#18D6D1]/20 border border-[#18D6D1]/40 text-[#008f8a] font-subheading font-medium px-6 py-3 rounded-full text-sm">
        <CheckCircle2 className="w-4 h-4 text-[#00a6a0]" />
        ¡Te sumaste a la comunidad! Revisá tu correo.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresá tu correo electrónico"
          disabled={loading}
          className="w-full sm:flex-1 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 rounded-full px-5 py-3 text-sm outline-none focus:border-[#18D6D1] focus:ring-2 focus:ring-[#18D6D1]/20 shadow-xs transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#FF6A00] hover:bg-[#e65f00] text-white font-subheading font-medium px-7 py-3 rounded-full transition-all duration-200 shadow-md active:scale-95 inline-flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Suscribirme</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
}

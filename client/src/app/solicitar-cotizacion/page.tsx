import { Suspense } from "react";
import { InquiryPreview } from "@/presentation/organisms/InquiryPreview";

export const metadata = { title: "Solicitar cotización | Catálogo de agentes" };

export default function QuoteRequestPage() {
  return <Suspense fallback={<p className="p-8" role="status">Cargando selección…</p>}><InquiryPreview type="cotización" /></Suspense>;
}

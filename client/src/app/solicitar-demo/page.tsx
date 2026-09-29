import { Suspense } from "react";
import { InquiryPreview } from "@/presentation/organisms/InquiryPreview";

export const metadata = { title: "Solicitar demo | Catálogo de agentes" };

export default function DemoRequestPage() {
  return <Suspense fallback={<p className="p-8" role="status">Cargando selección…</p>}><InquiryPreview type="demo" /></Suspense>;
}

import type { Metadata } from "next";
import { AccessForm } from "@/presentation/organisms/AccessForm";

export const metadata: Metadata = { title: "Entrar | Demo de agentes" };

export default function AccesoPage() {
  return <AccessForm modo="cliente" />;
}

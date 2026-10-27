import type { Metadata } from "next";
import { AccessForm } from "@/presentation/organisms/AccessForm";

export const metadata: Metadata = { title: "Acceso del equipo | Demo de agentes" };

export default function AccesoAdminPage() {
  return <AccessForm modo="admin" />;
}

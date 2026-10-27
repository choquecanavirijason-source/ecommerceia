import type { Metadata } from "next";
import { SessionPanel } from "@/presentation/organisms/SessionPanel";

export const metadata: Metadata = { title: "Panel del equipo | Demo de agentes" };

export default function PanelPage() {
  return <SessionPanel requiereAdmin />;
}

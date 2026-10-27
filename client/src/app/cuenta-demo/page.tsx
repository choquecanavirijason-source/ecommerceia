import type { Metadata } from "next";
import { SessionPanel } from "@/presentation/organisms/SessionPanel";

export const metadata: Metadata = { title: "Tu cuenta | Demo de agentes" };

export default function CuentaDemoPage() {
  return <SessionPanel />;
}

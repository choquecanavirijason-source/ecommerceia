import type { ReactNode } from "react";
import { CuentaLayoutClient } from "./CuentaLayoutClient";

export default function CuentaLayout({ children }: { children: ReactNode }) {
  return <CuentaLayoutClient>{children}</CuentaLayoutClient>;
}

import type { ReactNode } from "react";
import { Providers } from "./providers";
import { AppShell } from "./AppShell";
import "./globals.css";

export const metadata = {
  title: "Catálogo de agentes | Demo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isExtensionError(event) {
                  var reason = event.reason;
                  var stack = (reason && reason.stack) || '';
                  var message = (reason && reason.message) || String(reason || '');
                  return stack.includes('chrome-extension://') || message.includes('chrome-extension://') || message.includes('M_ID');
                }
                window.addEventListener('unhandledrejection', function(event) {
                  if (isExtensionError(event)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
                window.addEventListener('error', function(event) {
                  var filename = event.filename || '';
                  var message = event.message || '';
                  if (filename.includes('chrome-extension://') || message.includes('M_ID')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body
        className="font-reading antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

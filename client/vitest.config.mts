import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const minimumCoverage = { lines: 80, branches: 80, functions: 80, statements: 80 };

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Keep local Windows runs bounded; fork startup timed out on this host.
    pool: "threads",
    maxWorkers: 2,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**"],
      // Report the whole legacy app, but gate only the P0 characterization scope.
      // Add every new/modified production module here as subsequent phases land.
      thresholds: {
        "src/application/cart/GetCartSummaryUseCase.ts": minimumCoverage,
        "src/presentation/molecules/QuantitySelector.tsx": minimumCoverage,
        "src/presentation/atoms/QuantityButton.tsx": minimumCoverage,
        "src/shared/lib/utils.ts": minimumCoverage,
      },
    },
  },
});

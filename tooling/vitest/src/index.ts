import path from "path";
import { ViteUserConfig } from "vitest/config";

export const sharedConfig: ViteUserConfig = {
  resolve: {
    alias: {
      "~": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: "istanbul" as const,
      reporter: [
        [
          "json",
          {
            file: `../coverage.json`,
          },
        ],
      ] as const,
      enabled: true,
    },
  },
};

// Re-export specific configs for backwards compatibility
export { baseConfig } from "./configs/base-config.js";
export { uiConfig } from "./configs/ui-config.js";

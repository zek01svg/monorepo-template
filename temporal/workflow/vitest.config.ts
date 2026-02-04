import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest";

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    // Package-specific overrides if needed
  },
});

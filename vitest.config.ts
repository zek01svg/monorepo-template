import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest";

export default defineConfig({
  ...sharedConfig,
  test: {
    projects: [
      {
        root: "./packages",
        test: {
          ...sharedConfig.test,
          // Project-specific configuration for packages
          // ...
        },
      },
      {
        root: "./apps/backend",
        test: {
          ...sharedConfig.test,
          // Project-specific configuration for apps
          environment: "node",
        },
      },
      {
        root: "./apps/frontend",
        test: {
          ...sharedConfig.test,
          // Project-specific configuration for apps
          environment: "jsdom",
        },
      },
      {
        root: "./temporal",
        test: {
          ...sharedConfig.test,
          // Project-specific configuration for apps
          environment: "node",
        },
      },
    ],
  },
});

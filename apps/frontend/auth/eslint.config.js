import baseConfig, { restrictEnvAccess } from "@repo/eslint-config/base";
import reactConfig from "@repo/eslint-config/react";

export default [
  ...baseConfig,
  ...reactConfig,
  ...restrictEnvAccess,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];

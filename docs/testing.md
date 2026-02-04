# Testing Framework

This monorepo uses [Vitest](https://vitest.dev/) as the primary testing framework, configured for optimal performance and developer experience across all packages and applications.

## 🧪 Vitest Configuration

### Centralized Testing Tooling

The testing setup is managed through the `@repo/vitest` package located in `tooling/vitest/`, which provides:

- **Shared configurations** for consistent testing across all packages
- **Coverage collection** with Istanbul provider
- **Multiple environment support** (Node.js and jsdom)
- **Turborepo integration** for optimized test execution

### Configuration Architecture

```
@repo/vitest/
├── src/
│   ├── index.ts              # Main exports and shared config
│   ├── configs/
│   │   ├── base-config.ts    # Base configuration for Node.js environments
│   │   └── ui-config.ts      # UI/Frontend configuration with jsdom
│   └── scripts/
│       └── collect-json-outputs.ts  # Coverage collection script
```

#### Shared Configuration (`src/index.ts`)

```typescript
export const sharedConfig: ViteUserConfig = {
  resolve: {
    alias: {
      "~": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: "istanbul",
      reporter: [["json", { file: `../coverage.json` }]],
      enabled: true,
    },
  },
};
```

#### Base Configuration (`configs/base-config.ts`)

Optimized for backend services and packages:

```typescript
export const baseConfig = defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: [["json", { file: `../coverage.json` }]],
      enabled: true,
    },
  },
});
```

#### UI Configuration (`configs/ui-config.ts`)

Extends base config with jsdom environment for frontend testing:

```typescript
export const uiConfig = mergeConfig(
  baseConfig,
  defineProject({
    test: {
      environment: "jsdom",
    },
  }),
);
```

## 📁 Project-Level Configuration

### Root Configuration (`vitest.config.ts`)

The root configuration uses Vitest's project feature to organize tests by workspace type:

```typescript
export default defineConfig({
  ...sharedConfig,
  test: {
    projects: [
      {
        root: "./packages",
        test: {
          ...sharedConfig.test,
          // Package-specific configuration
        },
      },
      {
        root: "./apps",
        test: {
          ...sharedConfig.test,
          environment: "jsdom", // Apps may need DOM environment
        },
      },
    ],
  },
});
```

### Individual Project Configuration

Each package/app can extend the shared configuration:

```typescript
// apps/backend/order/vitest.config.ts
import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest";

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    // Project-specific overrides if needed
  },
});
```

## 🎯 Testing Patterns

### API Testing with Hono

For backend services using Hono framework:

```typescript
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import { app } from "~/index";

describe("API Route", () => {
  const client = testClient(app);

  it("should handle valid requests", async () => {
    const response = await client.endpoint.$post({
      json: { data: "test" },
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ expected: "result" });
  });
});
```

### Unit Testing

Standard unit tests using Vitest's Jest-compatible API:

```typescript
import { expect, test } from "vitest";

test("unit test example", () => {
  expect(1 + 2).toBe(3);
});
```

### Test Organization

```
package-name/
├── src/           # Source code
├── tests/         # Test files
│   ├── api/       # API integration tests
│   ├── unit/      # Unit tests
│   └── *.test.ts  # General test files
└── vitest.config.ts
```

## 📊 Coverage Collection

### Automated Coverage Collection

The monorepo includes scripts for collecting coverage from all packages:

```bash
# Collect coverage reports from all packages
pnpm turbo test

# Collect and merge coverage reports
cd tooling/vitest
pnpm collect-json-reports
pnpm merge-json-reports
pnpm report
```

### Coverage Script (`scripts/collect-json-outputs.ts`)

Automatically discovers and collects `coverage.json` files from:

- `apps/*` - All application packages
- `packages/*` - All shared packages

The script:

1. Searches for `coverage.json` files in each package
2. Copies them to `tooling/vitest/coverage/raw/`
3. Provides merged coverage reports

## 🚀 Running Tests

### Development Commands

```bash
# Run all tests across the monorepo
pnpm test:projects

# Watch mode for all tests
pnpm test:projects:watch

# Run tests for a specific package
cd apps/backend/order
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Open Vitest UI
pnpm test -- --ui
```

### Turborepo Integration

Tests are integrated into the Turborepo pipeline:

```json
{
  "test": {
    "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/vitest.config.ts"],
    "dependsOn": ["transit", "@repo/vitest#build"],
    "outputs": ["coverage.json"]
  }
}
```

This ensures:

- Tests run after dependencies are built
- Coverage outputs are cached
- Tests can run in parallel across packages

## 🛠 Dependencies

### Core Testing Dependencies

```json
{
  "dependencies": {
    "vitest": "catalog:vitest",
    "vite-tsconfig-paths": "^5.1.4"
  },
  "devDependencies": {
    "@vitest/coverage-istanbul": "catalog:vitest",
    "@vitest/ui": "catalog:vitest",
    "jsdom": "^26.0.0"
  }
}
```

### Package Dependencies

Each package that uses testing includes:

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "@repo/vitest": "workspace:*",
    "vitest": "catalog:vitest"
  }
}
```

## 🎨 IDE Integration

### VS Code Configuration

For optimal testing experience in VS Code, install:

- **Vitest Extension**: Real-time test execution and debugging
- **Test Explorer**: Visual test management

### Path Aliases

All configurations include the `~` alias pointing to `src/`:

```typescript
resolve: {
  alias: {
    "~": path.resolve(process.cwd(), "src"),
  },
}
```

## 📈 Best Practices

### Writing Tests

1. **Use descriptive test names** that explain the expected behavior
2. **Group related tests** using `describe` blocks
3. **Test both success and error cases** for comprehensive coverage
4. **Use type-safe testing** with TypeScript
5. **Mock external dependencies** appropriately

### Test Organization

1. **Keep tests close to source code** in dedicated `tests/` directories
2. **Separate unit tests from integration tests** using subdirectories
3. **Use consistent naming** with `.test.ts` or `.spec.ts` extensions
4. **Group API tests** by endpoint or feature

### Performance

1. **Leverage Turborepo caching** for faster test execution
2. **Use parallel execution** with Vitest's built-in concurrency
3. **Cache test dependencies** through proper build pipelines
4. **Optimize coverage collection** for CI/CD environments

## 🔧 Troubleshooting

### Common Issues

**Path resolution errors:**

- Ensure `vite-tsconfig-paths` is installed
- Verify `~` alias configuration in `vitest.config.ts`

**Coverage not collected:**

- Check that `@vitest/coverage-istanbul` is installed
- Verify coverage configuration in shared config

**jsdom errors in backend tests:**

- Use base configuration for Node.js environments
- Reserve UI configuration for frontend packages

### Debug Mode

```bash
# Run tests with debug information
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test -- tests/api/hello.test.ts

# Debug with VS Code
# Use the Vitest extension's debug functionality
```

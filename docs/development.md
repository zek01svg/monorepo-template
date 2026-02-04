# Development Guide

This guide covers the development workflow, tooling, and best practices for working with this monorepo.

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 22.14.0
- **pnpm** >= 9.6.0
- **Docker** (for containerized services)
- **PostgreSQL** (for local database development)

### Initial Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd monorepo-template
   pnpm install
   ```

2. **Environment configuration:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup:**

   ```bash
   pnpm db:push     # Push schema to database
   pnpm db:studio   # Open Drizzle Studio (optional)
   ```

4. **Start development:**
   ```bash
   pnpm dev         # Start all services
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
AUTH_POSTGRES_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
AUTH_SECRET=your_32_character_secret

# Temporal (local runner)
TEMPORAL_NAMESPACE=default
TEMPORAL_SERVER=temporal-server.127.0.0.1.nip.io:80
```

## 🛠 Development Commands

### Global Commands (Root Level)

```bash
# Development
pnpm dev                    # Start all services in development mode
pnpm build                  # Build all packages and applications
pnpm clean                  # Clean all build artifacts
pnpm clean:workspaces       # Clean all workspace dependencies

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix              # Fix linting issues
pnpm format                # Check code formatting
pnpm format:fix            # Fix formatting issues
pnpm typecheck             # Type check all packages

# Testing
pnpm test:projects         # Run all tests
pnpm test:projects:watch   # Run tests in watch mode

# Database
pnpm db:push               # Push schema changes
pnpm db:studio             # Open Drizzle Studio

# Generators
pnpm turbo gen package     # Generate new package
pnpm turbo gen backend     # Generate new backend service
pnpm turbo gen frontend    # Generate new frontend app
pnpm turbo gen database    # Generate new database package
```

### Package-Specific Commands

Each package includes standard scripts:

```bash
cd apps/backend/auth       # Navigate to specific package

# Development
pnpm dev                   # Start development server
pnpm build                 # Build the package
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Lint this package
pnpm format                # Format this package
pnpm typecheck             # Type check this package

# Testing
pnpm test                  # Run tests for this package
pnpm test:watch            # Run tests in watch mode
pnpm test:coverage         # Run tests with coverage

# Utilities
pnpm clean                 # Clean build artifacts
```

## 🎨 Code Generation

### Package Generator

Create new shared packages:

```bash
pnpm turbo gen package
```

**Prompts:**

- Package name (e.g., `utils`, `validation`)
- Dependencies to install
- Package description

**Generated structure:**

```
packages/your-package/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── eslint.config.js
└── vitest.config.ts
```

### Backend Service Generator

Create new backend microservices:

```bash
pnpm turbo gen backend
```

**Prompts:**

- Service name (e.g., `user`, `notification`)
- Port number
- Dependencies to install

**Generated structure:**

```
apps/backend/your-service/
├── src/
│   ├── index.ts
│   ├── env.ts
│   ├── factory.ts
│   ├── types.ts
│   └── routes/
│       └── hello.ts
├── tests/
│   └── api/
│       └── hello.test.ts
├── package.json
├── tsconfig.json
├── eslint.config.js
├── vitest.config.ts
├── turbo.json
└── Dockerfile
```

### Frontend Application Generator

Create new frontend applications:

```bash
pnpm turbo gen frontend
```

**Prompts:**

- Application name (e.g., `admin`, `dashboard`)
- Port number
- Additional dependencies

**Generated structure:**

```
apps/frontend/your-app/
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── env.ts
│   └── routes/
│       ├── __root.tsx
│       └── index.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── Dockerfile
```

### Database Package Generator

Create new database packages:

```bash
pnpm turbo gen database
```

**Prompts:**

- Database name (e.g., `user`, `product`)
- Database URL environment variable

**Generated structure:**

```
orms/db-your-name/
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── env.ts
│   └── schema.ts
├── tests/
│   └── index.ts
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── eslint.config.js
```

## 🔧 Development Workflow

### 1. Creating New Features

1. **Generate boilerplate** (if needed):

   ```bash
   pnpm turbo gen <type>
   ```

2. **Install in workspace** (for new packages):

   ```bash
   # Add to specific app/package
   cd apps/backend/auth
   pnpm add @repo/your-new-package
   ```

3. **Develop with hot reload**:

   ```bash
   pnpm dev  # Start all services
   ```

4. **Test continuously**:
   ```bash
   pnpm test:projects:watch
   ```

### 2. Working with Databases

1. **Modify schema** in `orms/*/src/schema.ts`

2. **Push changes**:

   ```bash
   pnpm db:push
   ```

3. **Inspect with Drizzle Studio**:

   ```bash
   pnpm db:studio
   ```

4. **Generate migrations** (production):
   ```bash
   cd orms/db-auth
   pnpm drizzle-kit generate
   ```

### 3. Adding Dependencies

#### Workspace Dependencies

```bash
# Add shared package to all workspaces
pnpm add -w some-package

# Add to specific workspace
pnpm add --filter @repo/auth some-package

# Add dev dependency
pnpm add -D --filter apps/backend/auth @types/node
```

#### Catalog Dependencies

For packages used across multiple workspaces, add to catalog in `pnpm-workspace.yaml`:

```yaml
catalog:
  react: ^19.1.0
  typescript: ^5.8.3
  vitest: ^3.2.2
```

Then reference with:

```json
{
  "dependencies": {
    "react": "catalog:react"
  }
}
```

### 4. Code Quality Workflow

#### Pre-commit Checks

```bash
# Run full quality check
pnpm lint && pnpm format && pnpm typecheck
```

#### Fixing Issues

```bash
# Auto-fix linting issues
pnpm lint:fix

# Auto-format code
pnpm format:fix

# Check TypeScript errors
pnpm typecheck
```

### 5. Testing Workflow

#### Running Tests

```bash
# All tests
pnpm test:projects

# Specific package
cd apps/backend/auth
pnpm test

# With coverage
pnpm test -- --coverage

# Watch mode
pnpm test:projects:watch
```

#### Writing Tests

1. **Create test files** in `tests/` directory
2. **Follow naming convention**: `*.test.ts` or `*.spec.ts`
3. **Use shared configurations** from `@repo/vitest`

Example test:

```typescript
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import { app } from "~/index";

describe("API Endpoint", () => {
  const client = testClient(app);

  it("should return success response", async () => {
    const response = await client.endpoint.$get();
    expect(response.status).toBe(200);
  });
});
```

## 🏗 Build and Deployment

### Local Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter @repo/auth

# Build with dependencies
pnpm build --filter apps/backend/auth...
```

### Docker Development

```bash
# Build service image
cd apps/backend/auth
docker build -t auth-service .

# Run with docker-compose
docker-compose up -d
```

### Production Build

```bash
# Clean build for production
pnpm clean
pnpm install --frozen-lockfile
pnpm build
```

## 🔍 Debugging

### VS Code Setup

1. **Install recommended extensions**:
   - TypeScript and JavaScript Language Features
   - ESLint
   - Prettier
   - Vitest
   - Turborepo

### Common Issues

#### Port Conflicts

```bash
# Check what's running on port
lsof -ti:3000

# Kill process on port
kill -9 $(lsof -ti:3000)
```

#### Package Resolution

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### TypeScript Errors

```bash
# Clear TypeScript cache
pnpm clean

# Rebuild packages in order
pnpm build --filter @repo/tsconfig
pnpm build
```

## 📚 Best Practices

### Code Organization

1. **Keep packages focused** - Single responsibility
2. **Use barrel exports** - Clean public APIs
3. **Consistent naming** - kebab-case for packages, camelCase for code
4. **Proper imports** - Use workspace protocol for internal packages

### Performance

1. **Leverage Turborepo caching** - Configure cache outputs properly
2. **Optimize bundle size** - Tree-shake unused code
3. **Use dynamic imports** - For code splitting
4. **Profile builds** - Use `pnpm build --profile`

### Security

1. **Validate environment variables** - Use `@t3-oss/env-core`
2. **Sanitize inputs** - Use Zod schemas
3. **Secure secrets** - Never commit secrets to git
4. **Update dependencies** - Regular security updates

This development guide should help you get productive quickly while following established patterns and best practices.

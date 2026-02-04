# Code Generators

This monorepo includes powerful Turbo generators for quickly scaffolding new packages and applications with consistent structure and configuration. Generators save time by automating boilerplate setup and ensuring all new code follows established patterns.

## 🎯 Overview

All generators are located in `turbo/generators/` and use Handlebars templates to create consistent project structures. Each generator:

- **Follows established patterns** from existing packages
- **Installs latest dependencies** automatically
- **Configures tooling** (ESLint, Prettier, TypeScript, etc.)
- **Provides next steps** for integration

## 📦 Package Generator

Create new shared packages in the `packages/` directory.

### Usage

```bash
pnpm turbo gen package
```

### Interactive Prompts

- **Package name**: The name of your package (e.g., `utils`, `validation`, `logger`)
- **Package description**: Brief description of the package purpose
- **Dependencies**: Space-separated list of dependencies to install

### Generated Structure

```
packages/your-package/
├── src/
│   └── index.ts              # Main entry point with example export
├── package.json              # Package configuration with workspace setup
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
└── vitest.config.ts          # Testing configuration
```

### Example Package Configuration

```json
{
  "name": "@repo/your-package",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint .",
    "format": "prettier --check .",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/prettier-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@repo/vitest": "workspace:*"
  }
}
```

### Next Steps After Generation

1. **Implement your package logic** in `src/index.ts`
2. **Add to consuming packages**:
   ```bash
   cd apps/backend/auth
   pnpm add @repo/your-package
   ```
3. **Export from main index** if it's a utility package

## 🔧 Backend Service Generator

Create new backend microservices in the `apps/backend/` directory using Hono framework.

### Usage

```bash
pnpm turbo gen backend
```

### Interactive Prompts

- **Service name**: Name of your microservice (e.g., `user`, `notification`, `order`)
- **Port number**: Port for the development server (default: auto-assigned)
- **Dependencies**: Additional dependencies beyond the default stack

### Generated Structure

```
apps/backend/your-service/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── env.ts                # Environment variable validation
│   ├── factory.ts            # Hono app factory with middleware
│   ├── types.ts              # TypeScript type definitions
│   └── routes/
│       └── hello.ts          # Example API route
├── tests/
│   └── api/
│       └── hello.test.ts     # API integration tests
├── package.json              # Service configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
├── vitest.config.ts          # Testing configuration
├── turbo.json                # Turborepo task configuration
└── Dockerfile                # Container configuration
```

### Default Technology Stack

- **Framework**: Hono with Node.js adapter
- **Validation**: Zod for request/response validation
- **Environment**: `@t3-oss/env-core` for validated env vars
- **Testing**: Vitest with Hono testing utilities
- **Type Safety**: Full TypeScript with strict configuration

### Example API Route

```typescript
// src/routes/hello.ts
import { Hono } from "hono";
import { z } from "zod";

const hello = new Hono();

const HelloSchema = z.object({
  name: z.string().min(1),
});

hello.post("/", async (c) => {
  const body = await c.req.json();
  const { name } = HelloSchema.parse(body);

  return c.json({
    message: `Hello, ${name}!`,
  });
});

export { hello };
```

### Next Steps After Generation

1. **Register in service discovery**:

   ```typescript
   // packages/service-discovery/src/config.ts
   export const services = {
     // ... existing services
     yourService: {
       development: "http://localhost:YOUR_PORT",
       production: process.env.YOUR_SERVICE_URL,
     },
   };
   ```

2. **Configure environment variables**:

   ```env
   # .env
   YOUR_SERVICE_PORT=3002
   YOUR_SERVICE_URL=https://your-service.domain.com
   ```

3. **Start development**:
   ```bash
   cd apps/backend/your-service
   pnpm dev
   ```

## 🎨 Frontend Application Generator

Create new React applications in the `apps/frontend/` directory with modern tooling.

### Usage

```bash
pnpm turbo gen frontend
```

### Interactive Prompts

- **Application name**: Name of your frontend app (e.g., `admin`, `dashboard`, `mobile`)
- **Port number**: Development server port (default: auto-assigned)
- **Dependencies**: Additional UI libraries or utilities

### Generated Structure

```
apps/frontend/your-app/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── index.css             # Global styles and Tailwind imports
│   ├── env.ts                # Environment variable validation
│   ├── routes/
│   │   ├── __root.tsx        # Root layout component
│   │   └── index.tsx         # Home page route
│   └── routeTree.gen.ts      # Generated route tree (auto-generated)
├── public/
│   ├── fonts/                # Custom Helvetica Neue fonts
│   └── vite.svg              # Default Vite icon
├── server/
│   ├── index.ts              # Production server setup
│   └── env.ts                # Server environment validation
├── package.json              # Application configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.node.json        # Node.js TypeScript config
├── vite.config.ts            # Vite build configuration
├── vitest.config.ts          # Testing configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.cjs        # PostCSS configuration
├── eslint.config.js          # ESLint configuration
├── turbo.json                # Turborepo task configuration
├── Dockerfile                # Container configuration
├── index.html                # HTML template
└── 404.html                  # 404 error page
```

### Default Technology Stack

- **React**: Latest version (19.1.0) with modern features
- **Router**: TanStack Router for type-safe routing
- **Styling**: Tailwind CSS with custom theme
- **Components**: Radix UI primitives
- **Build Tool**: Vite for fast development and building
- **Testing**: Vitest with jsdom environment

### Example Route Structure

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  ),
});

// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Welcome to Your App</h1>
    </div>
  ),
});
```

### Next Steps After Generation

1. **Add to main navigation** if integrating with existing apps
2. **Configure service integration**:

   ```typescript
   // src/lib/api.ts
   import { serviceConfig } from "@repo/service-discovery";

   const apiClient = new APIClient(serviceConfig.yourService);
   ```

3. **Start development**:
   ```bash
   cd apps/frontend/your-app
   pnpm dev
   ```

## 🗄 Database Package Generator

Create new database packages in the `orms/` directory with Drizzle ORM setup.

### Usage

```bash
pnpm turbo gen database
```

### Interactive Prompts

- **Database name**: Name of your database package (e.g., `user`, `product`, `analytics`)
- **Database URL env var**: Environment variable name for database connection

### Generated Structure

```
orms/db-your-name/
├── src/
│   ├── index.ts              # Main exports
│   ├── client.ts             # Database client configuration
│   ├── env.ts                # Environment variable validation
│   └── schema.ts             # Database schema definitions
├── tests/
│   └── index.ts              # Database connection tests
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
├── drizzle.config.ts         # Drizzle Kit configuration
└── eslint.config.js          # ESLint configuration
```

### Environment Variable Handling

The generator automatically converts database names to environment variables:

- `user` → `USER_DATABASE_URL`
- `product-catalog` → `PRODUCT_CATALOG_DATABASE_URL`
- `order-management` → `ORDER_MANAGEMENT_DATABASE_URL`

### Example Schema

```typescript
// src/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Example Client Configuration

```typescript
// src/client.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env";
import * as schema from "./schema";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

### Next Steps After Generation

1. **Configure environment variables**:

   ```env
   # .env
   YOUR_DATABASE_URL=postgresql://user:password@localhost:5432/your_db
   ```

2. **Define your schema** in `src/schema.ts`

3. **Push schema to database**:

   ```bash
   cd orms/db-your-name
   pnpm db:push
   ```

4. **Use in applications**:

   ```typescript
   import { db, users } from "@repo/db-your-name";

   const allUsers = await db.select().from(users);
   ```

## 🔧 Customizing Generators

### Template Locations

All templates are in `turbo/generators/templates/`:

```
templates/
├── backend/           # Backend service templates
├── db/               # Database package templates
├── frontend/         # Frontend app templates
├── package/          # Shared package templates
└── tests/            # Test file templates
```

### Handlebars Helpers

Generators include custom Handlebars helpers:

- `{{slug}}`: Converts names to kebab-case
- `{{pascalCase}}`: Converts to PascalCase
- `{{camelCase}}`: Converts to camelCase
- `{{upperCase}}`: Converts to UPPER_CASE

### Modifying Templates

1. **Edit template files** in `turbo/generators/templates/`
2. **Update generator configuration** in `turbo/generators/`
3. **Test with a new generation**:
   ```bash
   pnpm turbo gen <type>
   ```

### Creating Custom Generators

1. **Create generator file** in `turbo/generators/`:

   ```typescript
   // turbo/generators/custom.ts
   import type { PlopTypes } from "@turbo/gen";

   export default function generator(plop: PlopTypes.NodePlopAPI): void {
     plop.setGenerator("custom", {
       description: "Custom generator",
       prompts: [
         {
           type: "input",
           name: "name",
           message: "What is the name?",
         },
       ],
       actions: [
         {
           type: "add",
           path: "custom/{{name}}/package.json",
           templateFile: "templates/custom/package.json.hbs",
         },
       ],
     });
   }
   ```

2. **Create template directory** in `templates/custom/`

3. **Register in main config**:

   ```typescript
   // turbo/generators/config.ts
   import custom from "./custom";

   export default function generator(plop: PlopTypes.NodePlopAPI): void {
     // ... existing generators
     custom(plop);
   }
   ```

## 📋 Generator Best Practices

### Template Design

1. **Include comprehensive examples** in generated code
2. **Add helpful comments** explaining patterns
3. **Use consistent naming conventions** across all templates
4. **Include proper TypeScript types** for all generated code

### Configuration

1. **Extend shared configurations** rather than duplicating
2. **Use workspace protocol** for internal dependencies
3. **Include necessary dev dependencies** for immediate productivity
4. **Configure proper build outputs** for Turborepo caching

### Documentation

1. **Include README files** in generated packages when appropriate
2. **Add JSDoc comments** to public APIs
3. **Provide usage examples** in generated code
4. **Document environment variables** and configuration

The generator system ensures consistent project structure and saves significant development time by automating repetitive setup tasks while maintaining high code quality standards.

# Technology Stack

This document provides a comprehensive overview of all technologies, frameworks, and tools used in this monorepo.

## 🏗 Core Infrastructure

### Package Management & Build System

| Technology                                    | Version    | Purpose                                           |
| --------------------------------------------- | ---------- | ------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | >= 9.6.0   | Package management with workspaces                |
| [Turborepo](https://turbo.build/)             | Latest     | Optimized builds, caching, and task orchestration |
| [Node.js](https://nodejs.org/)                | >= 22.14.0 | JavaScript runtime                                |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3      | Type-safe development                             |

**Key Features:**

- **Workspace Protocol**: Internal packages use `workspace:*` for optimal linking
- **Catalog Dependencies**: Centralized version management in `pnpm-workspace.yaml`
- **Incremental Builds**: Turborepo caches and parallelizes builds
- **Strict TypeScript**: Type-safe development across all packages

## 🔧 Backend Technologies

### API Framework & Server

| Technology                                                 | Version | Purpose                                       |
| ---------------------------------------------------------- | ------- | --------------------------------------------- |
| [Hono](https://hono.dev/)                                  | Latest  | Ultra-fast web framework for APIs             |
| [@hono/node-server](https://github.com/honojs/node-server) | Latest  | Node.js adapter for Hono                      |
| [Zod](https://zod.dev/)                                    | 4.0.10  | Runtime type validation and schema definition |

**Features:**

- **High Performance**: Built for speed with minimal overhead
- **Type Safety**: Full TypeScript support with automatic type inference
- **Middleware Ecosystem**: Rich set of middleware for common functionality
- **Testing Support**: Built-in testing utilities with `hono/testing`

### Authentication

| Technology                                  | Version | Purpose                         |
| ------------------------------------------- | ------- | ------------------------------- |
| [Better Auth](https://www.better-auth.com/) | 1.2.9   | Modern authentication solution  |
| **OAuth Providers**                         | -       | OAuth integration               |
| **JWT**                                     | -       | Stateless authentication tokens |

**Features:**

- **OAuth Integration**: Pre-built Discord OAuth support
- **Type Safety**: Full TypeScript integration
- **Security**: Built-in CSRF protection and secure defaults
- **Extensible**: Plugin architecture for custom authentication flows

### Database & ORM

| Technology                                                | Version | Purpose                               |
| --------------------------------------------------------- | ------- | ------------------------------------- |
| [PostgreSQL](https://www.postgresql.org/)                 | Latest  | Primary database                      |
| [Drizzle ORM](https://orm.drizzle.team/)                  | 0.44.1  | Type-safe ORM and query builder       |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Latest  | Database migrations and introspection |

**Features:**

- **Type Safety**: End-to-end type safety from database to application
- **Performance**: Optimized queries with minimal overhead
- **Migrations**: Version-controlled schema changes
- **Development Tools**: Drizzle Studio for database inspection

### Environment & Configuration

| Technology                                   | Version | Purpose                         |
| -------------------------------------------- | ------- | ------------------------------- |
| [@t3-oss/env-core](https://env.t3.gg/)       | Latest  | Validated environment variables |
| [dotenv](https://github.com/motdotla/dotenv) | Latest  | Environment variable loading    |

**Features:**

- **Runtime Validation**: Zod-based environment variable validation
- **Type Safety**: TypeScript types for environment variables
- **Development Security**: Prevents missing or invalid environment variables

## 🎨 Frontend Technologies

### React Ecosystem

| Technology                                                          | Version | Purpose                           |
| ------------------------------------------------------------------- | ------- | --------------------------------- |
| [React](https://react.dev/)                                         | 19.1.0  | UI framework with latest features |
| [TanStack Router](https://tanstack.com/router)                      | Latest  | Type-safe routing for React       |
| [React Hook Form](https://react-hook-form.com/)                     | Latest  | Performant form handling          |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | Latest  | Form validation resolvers         |

**Features:**

- **React 19**: Latest React features including concurrent rendering
- **Type-Safe Routing**: Compile-time route validation and type inference
- **Performance**: Optimized form handling with minimal re-renders
- **Validation Integration**: Seamless Zod integration for form validation

### UI Components & Styling

| Technology                                                | Version | Purpose                            |
| --------------------------------------------------------- | ------- | ---------------------------------- |
| [Radix UI](https://www.radix-ui.com/)                     | Latest  | Unstyled, accessible UI primitives |
| [Tailwind CSS](https://tailwindcss.com/)                  | 3.4.15  | Utility-first CSS framework        |
| [@radix-ui/react-icons](https://icons.radix-ui.com/)      | Latest  | Icon library                       |
| [next-themes](https://github.com/pacocoursey/next-themes) | Latest  | Dark/light theme management        |

**Features:**

- **Accessibility**: WCAG-compliant components out of the box
- **Customization**: Fully customizable with Tailwind CSS
- **Design System**: Consistent design tokens and components
- **Theme Support**: Automatic dark/light mode switching

### Styling Utilities

| Technology                                                  | Version | Purpose                            |
| ----------------------------------------------------------- | ------- | ---------------------------------- |
| [class-variance-authority](https://cva.style/docs)          | Latest  | Component variant management       |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Latest  | Intelligent Tailwind class merging |
| [clsx](https://github.com/lukeed/clsx)                      | Latest  | Conditional className utility      |

**Features:**

- **Variant Management**: Type-safe component variants
- **Class Optimization**: Automatic duplicate class removal
- **Conditional Styling**: Clean conditional className handling

### User Experience

| Technology                              | Version | Purpose                        |
| --------------------------------------- | ------- | ------------------------------ |
| [Sonner](https://sonner.emilkowal.ski/) | Latest  | Toast notifications            |
| [Vite](https://vitejs.dev/)             | Latest  | Fast build tool and dev server |
| [PostCSS](https://postcss.org/)         | Latest  | CSS processing                 |

**Features:**

- **Fast Development**: Hot module replacement with Vite
- **User Feedback**: Beautiful, accessible toast notifications
- **CSS Processing**: Modern CSS features and optimizations

## 🧪 Development Tools

### Code Quality

| Technology                                                 | Version | Purpose                       |
| ---------------------------------------------------------- | ------- | ----------------------------- |
| [ESLint](https://eslint.org/)                              | 9.28.0  | JavaScript/TypeScript linting |
| [Prettier](https://prettier.io/)                           | 3.5.3   | Code formatting               |
| [@typescript-eslint/parser](https://typescript-eslint.io/) | Latest  | TypeScript ESLint integration |

**Configurations:**

- **Base Config**: Core linting rules for all packages
- **React Config**: React-specific rules and hooks linting
- **Next.js Config**: Next.js optimizations and best practices
- **Import Sorting**: Consistent import organization

### Testing Framework

| Technology                                                          | Version | Purpose                     |
| ------------------------------------------------------------------- | ------- | --------------------------- |
| [Vitest](https://vitest.dev/)                                       | 3.2.2   | Fast unit testing framework |
| [@vitest/ui](https://vitest.dev/guide/ui.html)                      | Latest  | Visual test interface       |
| [@vitest/coverage-istanbul](https://vitest.dev/guide/coverage.html) | Latest  | Code coverage reporting     |
| [jsdom](https://github.com/jsdom/jsdom)                             | 26.0.0  | DOM environment for testing |

**Features:**

- **Fast Execution**: Native ESM support and parallel testing
- **TypeScript Support**: First-class TypeScript integration
- **Coverage Reports**: Comprehensive coverage analysis
- **UI Testing**: jsdom environment for frontend component testing

### Build Tools

| Technology                                                               | Version | Purpose                          |
| ------------------------------------------------------------------------ | ------- | -------------------------------- |
| [tsx](https://github.com/esbuild-kit/tsx)                                | Latest  | TypeScript execution for Node.js |
| [vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths) | 5.1.4   | TypeScript path mapping for Vite |
| [tsup](https://tsup.egoist.dev/)                                         | Latest  | TypeScript bundler               |

**Features:**

- **Fast Compilation**: esbuild-powered TypeScript compilation
- **Path Resolution**: Automatic TypeScript path mapping
- **Bundle Optimization**: Tree-shaking and code splitting

## 🚀 DevOps & Infrastructure

### Containerization

| Technology                                                                                          | Version | Purpose                      |
| --------------------------------------------------------------------------------------------------- | ------- | ---------------------------- |
| [Docker](https://www.docker.com/)                                                                   | Latest  | Application containerization |
| [Multi-stage builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/) | -       | Optimized production images  |

**Features:**

- **Lightweight Images**: Alpine-based Node.js images
- **Build Optimization**: Multi-stage builds for smaller production images
- **Development Consistency**: Consistent environments across team

### Infrastructure as Code

| Technology                                      | Version | Purpose                       |
| ----------------------------------------------- | ------- | ----------------------------- |
| [Terraform](https://www.terraform.io/)          | Latest  | Infrastructure provisioning   |
| [AWS EKS](https://aws.amazon.com/eks/)          | Latest  | Kubernetes cluster management |
| [Gateway API](https://gateway-api.sigs.k8s.io/) | Latest  | Ingress/egress (HTTP/gRPC)    |

**AWS Modules:**

- **EKS**: Managed Kubernetes clusters
- **VPC**: Network infrastructure
- **Route53**: DNS management
- **IAM**: Identity and access management

### Kubernetes Ecosystem

| Technology                                | Version | Purpose                      |
| ----------------------------------------- | ------- | ---------------------------- |
| [ArgoCD](https://argo-cd.readthedocs.io/) | Latest  | GitOps continuous deployment |
| [Karpenter](https://karpenter.sh/)        | Latest  | Kubernetes node autoscaling  |
| [Prometheus](https://prometheus.io/)      | Latest  | Metrics collection           |
| [Grafana](https://grafana.com/)           | Latest  | Metrics visualization        |

**Features:**

- **GitOps**: Declarative deployment with ArgoCD
- **Auto-scaling**: Intelligent node provisioning with Karpenter
- **Observability**: Complete metrics and monitoring stack
- **Gateway API**: HTTPRoute/GRPCRoute for app ingress

### Workflow Orchestration

| Technology                               | Version | Purpose                     |
| ---------------------------------------- | ------- | --------------------------- |
| [Temporal](https://temporal.io/)         | Latest  | Durable workflows           |
| [Temporal UI](https://docs.temporal.io/) | Latest  | Workflow visibility/control |

## 📊 Monitoring & Observability

### Metrics & Logging

| Technology                                              | Version | Purpose                      |
| ------------------------------------------------------- | ------- | ---------------------------- |
| [Prometheus Operator](https://prometheus-operator.dev/) | Latest  | Kubernetes-native monitoring |
| [Flagger](https://flagger.app/)                         | Latest  | Progressive delivery         |
| [Kiali](https://kiali.io/)                              | Latest  | Service mesh observability   |

**Features:**

- **Service Mesh Metrics**: Automatic service-to-service metrics
- **Progressive Deployment**: Canary and blue-green deployments
- **Visual Topology**: Service mesh visualization with Kiali

## 🔧 Development Tooling

### Shared Configurations

| Package                 | Purpose                                |
| ----------------------- | -------------------------------------- |
| `@repo/eslint-config`   | Shared ESLint configurations           |
| `@repo/prettier-config` | Unified code formatting                |
| `@repo/tailwind-config` | Tailwind configurations for web/native |
| `@repo/tsconfig`        | TypeScript configurations              |
| `@repo/vitest`          | Testing framework configurations       |

### Code Generation

| Technology                                                                                | Purpose                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------- |
| [Turbo Generators](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation) | Package and application scaffolding |
| [Handlebars](https://handlebarsjs.com/)                                                   | Template engine for generators      |

**Generator Types:**

- **Package Generator**: Shared packages with TypeScript setup
- **Backend Generator**: Hono-based microservices
- **Frontend Generator**: React applications with TanStack Router
- **Database Generator**: Drizzle ORM database packages

## 📦 Dependency Management

### Catalog Strategy

Version management through `pnpm-workspace.yaml` catalog:

```yaml
catalog:
  # Core
  typescript: ^5.8.3

  # React
  react: ^19.1.0

  # Testing
  vitest: ^3.2.2

  # Validation
  zod: ^4.0.0
```

**Benefits:**

- **Consistency**: Same versions across all packages
- **Maintenance**: Single place to update versions
- **Performance**: Reduced duplicate installations

### Workspace Protocol

Internal packages use `workspace:*` protocol:

```json
{
  "dependencies": {
    "@repo/auth": "workspace:*",
    "@repo/ui": "workspace:*"
  }
}
```

**Benefits:**

- **Development**: Hot reloading across packages
- **Production**: Optimized bundling and tree-shaking
- **Type Safety**: Immediate TypeScript feedback

This technology stack provides a modern, scalable foundation for building full-stack TypeScript applications with excellent developer experience and production readiness.

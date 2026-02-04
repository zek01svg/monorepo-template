# Monorepo Template

A modern, full-stack TypeScript monorepo template built with cutting-edge technologies for scalable development.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 22.14.0
- **pnpm** >= 9.6.0

### Installation & Setup

```bash
# Clone and install
pnpm install

# Configure environment
cp .env.example .env  # Edit with your configuration

# Initialize database
pnpm db:push

# Start development
pnpm dev
```

## 🏗 Architecture Overview

This monorepo implements a **microservices architecture** with:

- **Backend Services**: Hono-based APIs with Better Auth
- **Frontend Apps**: React 19 with TanStack Router
- **Shared Packages**: Reusable components and utilities
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Development Tooling**: Unified ESLint, Prettier, TypeScript, and Vitest configs

```
apps/                    # Applications
├── backend/            # Microservices (Hono + TypeScript)
└── frontend/           # React applications

packages/               # Shared packages
├── auth/              # Authentication utilities
├── ui/                # React component library
└── service-discovery/ # Service registry

orms/              # Database packages
└── db-auth/           # Authentication database (Drizzle ORM)

tooling/               # Development tooling
├── eslint/           # Shared ESLint configs
├── vitest/           # Testing framework setup
└── typescript/       # TypeScript configurations
```

## 🎨 Code Generation

Quickly scaffold new code with Turbo generators:

```bash
pnpm turbo gen package     # Create shared package
pnpm turbo gen backend     # Create backend service
pnpm turbo gen frontend    # Create React application
pnpm turbo gen database    # Create database package
```

Each generator creates production-ready code with:

- **Consistent configuration** (ESLint, Prettier, TypeScript)
- **Testing setup** with Vitest
- **Proper workspace integration**
- **Docker configuration** for deployment

## 🧪 Testing Framework

Comprehensive testing setup with **Vitest**:

```bash
pnpm test:projects        # Run all tests
pnpm test:projects:watch  # Watch mode
```

**Features:**

- **Shared configurations** via `@repo/vitest`
- **Coverage collection** across all packages
- **API testing** with Hono testing utilities
- **Frontend testing** with jsdom environment

## 📚 Documentation

For detailed information, see the comprehensive documentation:

| Guide                                           | Description                                |
| ----------------------------------------------- | ------------------------------------------ |
| **[📖 Complete Documentation](docs/)**          | **Main documentation hub**                 |
| [🧪 Testing Framework](docs/testing.md)         | Vitest setup, patterns, and best practices |
| [🏗 Architecture](docs/architecture.md)         | System design and microservices patterns   |
| [🚀 Development Guide](docs/development.md)     | Workflow, tooling, and commands            |
| [⚡ Technology Stack](docs/technology-stack.md) | Complete technology overview               |
| [🎨 Code Generators](docs/generators.md)        | Using Turbo generators effectively         |

## 💻 Essential Commands

```bash
# Development
pnpm dev                 # Start all services
pnpm build               # Build all packages
pnpm clean               # Clean build artifacts

# Code Quality
pnpm lint                # Lint all packages
pnpm format              # Format all code
pnpm typecheck           # Type check all packages

# Testing
pnpm test:projects       # Run all tests
pnpm test:projects:watch # Test in watch mode

# Database
pnpm db:push             # Push schema changes
pnpm db:studio           # Open Drizzle Studio
```

## 🔧 Key Technologies

### Core Stack

- **[Turborepo](https://turbo.build/)** - Build system with caching
- **[pnpm](https://pnpm.io/)** - Fast package manager
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Backend

- **[Hono](https://hono.dev/)** - Fast web framework
- **[Better Auth](https://www.better-auth.com/)** - Authentication
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database
- **[Zod](https://zod.dev/)** - Schema validation

### Frontend

- **[React 19](https://react.dev/)** - UI framework
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Radix UI](https://www.radix-ui.com/)** - Accessible components

### Testing & Quality

- **[Vitest](https://vitest.dev/)** - Fast testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

## 🚀 Production Ready

This template includes:

- **🐳 Docker** configurations for all services
- **☸️ Kubernetes** deployment with Terraform
- **🔄 GitOps** with ArgoCD
- **📊 Monitoring** with Prometheus & Grafana
- **🔒 Security** with Istio service mesh

## 📈 Next Steps

1. **[Read the Documentation](docs/)** - Comprehensive guides and tutorials
2. **Generate Your First Service** - `pnpm turbo gen backend`
3. **Set Up Authentication** - Configure Discord OAuth
4. **Deploy to Production** - Use included Terraform modules

---

**For detailed implementation guides, troubleshooting, and best practices, visit the [complete documentation](docs/).**

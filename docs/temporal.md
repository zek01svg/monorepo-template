# Temporal Workflows

This repo includes a full Temporal setup: code packages for activities and workflows, a worker runner, and Kubernetes manifests for the Temporal server and UI.

## Packages

```
temporal/
├── common/        # Client/connection helpers and shared constants
├── activities/    # Activity implementations
├── workflow/      # Workflow definitions
└── runner/        # Worker that executes workflows & activities
```

### `@repo/temporal-common`

- Validates env via `@t3-oss/env-core` and `@repo/service-discovery/env`.
- Exposes `connectToTemporal()` and `namespace`/`taskQueue` helpers.
- Env vars:

```env
# For local runner outside the cluster use the GRPCRoute host
TEMPORAL_NAMESPACE=default
TEMPORAL_SERVER=temporal-server.127.0.0.1.nip.io:80

# If running inside the cluster (e.g., in a Pod)
# TEMPORAL_SERVER=temporal:7233
```

Key files:

```typescript
// temporal/common/src/connection.ts
export const namespace = env.TEMPORAL_NAMESPACE;
export function getConnectionOptions() {
  return { address: env.TEMPORAL_SERVER };
}

// temporal/common/src/client.ts
export async function connectToTemporal() {
  return new Client({
    connection: await Connection.connect(getConnectionOptions()),
    namespace,
  });
}
```

### `@repo/temporal-activities`

Activity implementations (example Stripe-like order flow):

```typescript
// temporal/activities/src/order.ts
export async function createStripeCustomer(email: string) {
  /* ... */
}
export async function createStripeCheckoutSession(
  amount: number,
  customerId: string,
) {
  /* ... */
}
export async function getStripePaymentStatus(sessionId: string) {
  /* ... */
}
export async function updateOrderStatus(orderId: string, status: string) {
  /* ... */
}
```

### `@repo/temporal-workflow`

Workflows use `@temporalio/workflow` with signals and activity proxies:

```typescript
// temporal/workflow/src/order.ts
const {
  createStripeCustomer,
  createStripeCheckoutSession,
  getStripePaymentStatus,
  updateOrderStatus,
} = proxyActivities({
  startToCloseTimeout: "1m",
  retry: { maximumInterval: "1m" },
});
export async function order(order: {
  id: string;
  amount: number;
  email: string;
}) {
  /* ... */
}
```

### `@repo/temporal-runner`

Worker that runs workflows and activities. In dev it loads workflows from source; in prod it bundles them:

```typescript
// temporal/runner/src/index.ts
const connection = await NativeConnection.connect(getConnectionOptions());
const worker = await Worker.create({
  activities,
  connection,
  namespace,
  taskQueue,
  ...workflowOption,
});
await worker.run();
```

Commands:

```bash
# Start the worker locally (loads .env from repo root)
pnpm --filter @repo/temporal-runner dev

# Prod-like run (bundles workflows)
NODE_ENV=production pnpm --filter @repo/temporal-runner start
```

## Starting a Workflow from Application Code

Minimal example:

```typescript
import type * as workflows from "@repo/temporal-workflow";
import { connectToTemporal, taskQueue } from "@repo/temporal-common";

const client = await connectToTemporal();
const handle = await client.workflow.start(workflows.order, {
  taskQueue,
  args: [{ id: "order_1", amount: 1999, email: "test@example.com" }],
  workflowId: `order-${Date.now()}`,
});
console.log("Started workflow", handle.workflowId);
```

## Kubernetes Infrastructure

Manifests live in `argocd/services/temporal/`:

- `base/temporal-deployment.yaml`: `temporalio/auto-setup` connected to CNPG (`cnpg-cluster-rw:5432`).
- `base/temporal-service.yaml`: ClusterIP service on 7233 with `appProtocol: kubernetes.io/h2c`.
- `base/ui-deployment.yaml`, `ui-service.yaml`, `ui-httproute.yaml`: Temporal UI exposed via Gateway API.
- `envs/dev/temporal-grpcroute.yaml`: gRPC host `temporal-server.127.0.0.1.nip.io` to the Temporal service.

Access:

- Temporal UI: `http://temporal.127.0.0.1.nip.io`
- Temporal gRPC: `temporal-server.127.0.0.1.nip.io:80`

Apply (dev) via ArgoCD ApplicationSet or directly with kustomize:

```bash
kubectl apply -k argocd/services/temporal/envs/dev/
```

## Env and Networking Notes

- If you run the worker on your laptop, use the GRPCRoute host: `TEMPORAL_SERVER=temporal-server.127.0.0.1.nip.io:80`.
- If you run the worker as a Pod, use the ClusterIP service: `TEMPORAL_SERVER=temporal:7233`.
- Default namespace is `default` (change via `TEMPORAL_NAMESPACE`).

## Observability

Temporal UI provides runtime visibility for workflows/activities and can send signals, terminate, or query workflows.

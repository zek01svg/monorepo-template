import { createFileRoute, Outlet } from "@tanstack/react-router";

import { authClient } from "~/lib/auth";

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      throw new Error("Unauthorized");
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}

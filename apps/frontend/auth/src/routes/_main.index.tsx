import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { Badge } from "@repo/ui/components/badge.tsx";
import { Button } from "@repo/ui/components/button.tsx";

import { env } from "~/env";
import { useOrganizations } from "~/hooks";
import { authClient } from "~/lib/auth";

export const Route = createFileRoute("/_main/")({
  component: Index,
});

function Index() {
  const { data } = authClient.useSession();
  const router = useRouter();
  const { data: organizations = [] } = useOrganizations();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.navigate({ to: "/sign-in" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome to Auth Portal
          </h1>
          <p className="text-lg text-gray-600">
            Your identity and access management hub
          </p>
        </div>

        {/* Main Content */}
        {data?.session ? (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                Welcome back, {data.user.name || data.user.email}!
              </h2>
              {data.session.activeOrganizationId && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Active Organization:</p>
                  <Badge variant="default" className="mt-1">
                    {organizations.find(
                      (org) => org.id === data.session.activeOrganizationId,
                    )?.name ?? data.session.activeOrganizationId}
                  </Badge>
                </div>
              )}
              <p className="mb-6 text-gray-600">
                You are successfully signed in. Manage your account and access
                your profile.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/profile">
                  <Button variant="default" size="lg">
                    View Profile
                  </Button>
                </Link>
                <Link to="/organizations">
                  <Button variant="outline" size="lg">
                    Organizations
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="lg">
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Account Status
                </h3>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Email Status
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {data.user.emailVerified ? "Verified" : "Pending"}
                </p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Member Since
                </h3>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(data.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-center">
            {/* Call to Action */}
            <div className="rounded-lg bg-white p-8 shadow">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Get Started
              </h2>
              <p className="mb-6 text-gray-600">
                Sign in to your account or create a new one to access all
                features.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/sign-in">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Secure Authentication
                </h3>
                <p className="text-gray-600">
                  State-of-the-art security with encrypted passwords and secure
                  sessions.
                </p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Profile Management
                </h3>
                <p className="text-gray-600">
                  Easily manage your personal information and account settings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info (can be removed in production) */}
        {env.NODE_ENV === "development" && (
          <div className="mt-12 rounded-lg bg-gray-100 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Debug Info:
            </h3>
            <p className="text-xs text-gray-600">App URL: {env.VITE_APP_URL}</p>
            <p className="text-xs text-gray-600">
              Session: {data?.session ? "Active" : "None"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

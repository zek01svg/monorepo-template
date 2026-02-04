import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { Button } from "@repo/ui/components/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card.tsx";

import { useAcceptInvitation } from "~/hooks/useOrganizations";
import { authClient } from "~/lib/auth";

export const Route = createFileRoute("/accept-invitation/$inviteId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { inviteId } = Route.useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptInvitationMutation = useAcceptInvitation();

  const checkAuthAndLoadInvitation = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await authClient.getSession();

      if (!session.data?.user) {
        // If not authenticated, redirect to sign-in with return URL
        router.navigate({
          to: "/sign-in",
          search: {
            redirect: `/accept-invitation/${inviteId}`,
          },
        });
        return;
      }

      // Try to get invitation details if there's an API for it
      // For now, we'll just proceed with the invitation ID
      setInvitation({ id: inviteId });
    } catch (err) {
      setError("Failed to load invitation details");
      console.error("Error loading invitation:", err);
    } finally {
      setIsLoading(false);
    }
  }, [inviteId, router]);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthAndLoadInvitation();
  }, [checkAuthAndLoadInvitation]);

  const handleAcceptInvitation = async () => {
    try {
      await acceptInvitationMutation.mutateAsync(inviteId);

      // Redirect to the main dashboard or organizations page
      router.navigate({ to: "/" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to accept invitation";
      setError(errorMessage);
    }
  };

  const handleDecline = () => {
    // Navigate back to main page or sign out
    router.navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              There was a problem with this invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{error}</p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.navigate({ to: "/" })}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Would you like to accept this invitation to join the organization?
          </p>
          {invitation && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Invitation ID:</p>
              <p className="font-mono text-sm break-all">{invitation.id}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={acceptInvitationMutation.isPending}
            className="flex-1"
          >
            Decline
          </Button>
          <Button
            onClick={handleAcceptInvitation}
            disabled={acceptInvitationMutation.isPending}
            className="flex-1"
          >
            {acceptInvitationMutation.isPending
              ? "Accepting..."
              : "Accept Invitation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

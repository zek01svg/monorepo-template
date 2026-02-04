import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@repo/ui/components/button.tsx";
import { toast } from "@repo/ui/components/sonner.tsx";

import type { Organization } from "~/hooks";
import {
  EditOrganizationDialog,
  MembersDialog,
  OrganizationsList,
} from "~/components/organizations";
import {
  useDeleteOrganization,
  useLeaveOrganization,
  useOrganizationMembers,
  useOrganizations,
  useSetActiveOrganization,
  useUpdateOrganization,
  useUserMemberships,
} from "~/hooks";
import { authClient } from "~/lib/auth";

interface OrganizationForm {
  name: string;
  slug?: string;
}

export const Route = createFileRoute("/_main/organizations/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  // Query hooks
  const { data: organizations = [], isLoading: isLoadingOrganizations } =
    useOrganizations();

  const { data: members = [], isLoading: isLoadingMembers } =
    useOrganizationMembers(
      selectedOrg?.id ?? "",
      !!selectedOrg && isMembersDialogOpen,
    );

  const { data: userMemberships = {} } = useUserMemberships();

  // Mutation hooks
  const updateOrganizationMutation = useUpdateOrganization();
  const leaveOrganizationMutation = useLeaveOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();
  const setActiveOrganizationMutation = useSetActiveOrganization();

  // Check if user is authenticated
  const { data: session } = authClient.useSession();

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setIsEditDialogOpen(true);
  };

  const handleViewMembers = (org: Organization) => {
    setSelectedOrg(org);
    setIsMembersDialogOpen(true);
  };

  const handleUpdateOrganization = async (data: OrganizationForm) => {
    if (!selectedOrg) return;

    try {
      await updateOrganizationMutation.mutateAsync({
        organizationId: selectedOrg.id,
        data: {
          name: data.name,
          slug: data.slug ?? undefined,
        },
      });
      setIsEditDialogOpen(false);
    } catch {
      // Error is handled by the mutation in the hook
    }
  };

  const handleLeaveOrganization = async (orgId: string) => {
    if (!confirm("Are you sure you want to leave this organization?")) {
      return;
    }

    if (!session?.user.id) {
      toast.error("User ID not available");
      return;
    }

    await leaveOrganizationMutation.mutateAsync({
      organizationId: orgId,
      userId: session.user.id,
    });
  };

  const handleSetActiveOrganization = async (orgId: string) => {
    await setActiveOrganizationMutation.mutateAsync(orgId);
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone and will remove all data associated with the organization.",
      )
    ) {
      return;
    }

    await deleteOrganizationMutation.mutateAsync(orgId);
  };

  // Show loading state
  if (isLoadingOrganizations) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Organizations
            </h1>
            <p className="mt-2 text-gray-600">
              Manage the organizations you're part of
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  ← Back to Home
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Organizations List */}
          <OrganizationsList
            organizations={organizations}
            activeOrganizationId={session?.session.activeOrganizationId}
            userMemberships={userMemberships}
            onSetActive={handleSetActiveOrganization}
            onEdit={handleEditOrganization}
            onViewMembers={handleViewMembers}
            onLeave={handleLeaveOrganization}
            onDelete={handleDeleteOrganization}
            isSettingActive={setActiveOrganizationMutation.isPending}
            isDeleting={deleteOrganizationMutation.isPending}
            isLeaving={leaveOrganizationMutation.isPending}
          />

          {/* Dialogs */}
          <EditOrganizationDialog
            organization={selectedOrg}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={handleUpdateOrganization}
            isLoading={updateOrganizationMutation.isPending}
          />

          <MembersDialog
            organization={selectedOrg}
            members={members}
            isOpen={isMembersDialogOpen}
            onClose={() => setIsMembersDialogOpen(false)}
            isLoadingMembers={isLoadingMembers}
          />
        </div>
      </div>
    </div>
  );
}

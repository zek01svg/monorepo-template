import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@repo/ui/components/sonner.tsx";

import { authClient } from "~/lib/auth";

// Types
interface Organization {
  id: string;
  name: string;
  slug?: string;
  createdAt: Date | string;
  metadata?: string;
  logo?: string | null;
}

interface Member {
  id: string;
  role: string;
  userId: string;
  organizationId: string;
  createdAt: Date | string;
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationId: string;
  inviterId: string;
  expiresAt: Date | string;
}

// Query Keys
export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (filters: string) =>
    [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  members: (id: string) => [...organizationKeys.detail(id), "members"] as const,
};

// Hooks
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: async () => {
      const result = await authClient.organization.list();
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to load organizations");
      }
      return result.data;
    },
  });
}

export function useOrganizationMembers(organizationId: string, enabled = true) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId),
    queryFn: async () => {
      const result = await authClient.organization.listMembers();
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to load members");
      }
      return result.data.members;
    },
    enabled,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: { name: string; slug?: string };
    }) => {
      const result = await authClient.organization.update({
        organizationId,
        data,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to update organization",
        );
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Organization updated successfully!");
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update organization",
      );
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      userId,
    }: {
      organizationId: string;
      userId: string;
    }) => {
      const result = await authClient.organization.removeMember({
        organizationId,
        memberIdOrEmail: userId,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to leave organization");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Left organization successfully!");
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to leave organization",
      );
    },
  });
}

export function useSetActiveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await authClient.organization.setActive({
        organizationId,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to set active organization",
        );
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Active organization updated successfully!");
      // Invalidate session to refresh active organization
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to set active organization",
      );
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await authClient.organization.delete({
        organizationId,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to delete organization",
        );
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully!");
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
      );
    },
  });
}

export function useUserMemberships() {
  return useQuery({
    queryKey: [...organizationKeys.all, "userMemberships"],
    queryFn: async () => {
      const session = await authClient.getSession();
      if (!session.data?.user.id) {
        throw new Error("User not authenticated");
      }

      const organizationsResult = await authClient.organization.list();
      if (organizationsResult.error) {
        throw new Error(
          organizationsResult.error.message ?? "Failed to get organizations",
        );
      }

      const organizations = organizationsResult.data;
      const membershipsMap: Record<string, string> = {};

      // Get role for each organization the user is part of
      for (const org of organizations) {
        const membersResult = await authClient.organization.getFullOrganization(
          {
            query: {
              organizationId: org.id,
            },
          },
        );

        if (!membersResult.error) {
          const userMember = membersResult.data.members.find(
            (member) => member.userId === session.data?.user.id,
          );
          if (userMember) {
            membershipsMap[org.id] = userMember.role;
          }
        }
      }

      return membershipsMap;
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      email,
      role = "member",
    }: {
      organizationId: string;
      email: string;
      role?: "member" | "admin" | "owner";
    }) => {
      const result = await authClient.organization.inviteMember({
        organizationId,
        email,
        role,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to invite member");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Member invited successfully!");
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite member",
      );
    },
  });
}

export function useListInvitations(organizationId?: string) {
  return useQuery({
    queryKey: [...organizationKeys.all, "invitations", organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listInvitations({
        query: {
          organizationId,
        },
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to load invitations");
      }
      return result.data;
    },
    enabled: !!organizationId,
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to cancel invitation");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel invitation",
      );
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to accept invitation");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully!");
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation",
      );
    },
  });
}

// Hook to check if user has permission to invite members
export function useCanInviteMembers(organizationId: string) {
  const { data: userMemberships = {} } = useUserMemberships();
  const userRole = userMemberships[organizationId];

  // Only owners and admins can invite members by default
  return userRole === "owner" || userRole === "admin";
}

// Export types for use in components
export type { Invitation, Member, Organization };

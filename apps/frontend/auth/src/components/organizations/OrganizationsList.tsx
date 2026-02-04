import type { Organization } from "~/hooks";
import { OrganizationCard } from "./OrganizationCard";

interface OrganizationsListProps {
  organizations: Organization[];
  activeOrganizationId?: string | null;
  userMemberships: Record<string, string>;
  onSetActive: (orgId: string) => void;
  onEdit: (org: Organization) => void;
  onViewMembers: (org: Organization) => void;
  onLeave: (orgId: string) => void;
  onDelete: (orgId: string) => void;
  isSettingActive: boolean;
  isDeleting: boolean;
  isLeaving: boolean;
}

export function OrganizationsList({
  organizations,
  activeOrganizationId,
  userMemberships,
  onSetActive,
  onEdit,
  onViewMembers,
  onLeave,
  onDelete,
  isSettingActive,
  isDeleting,
  isLeaving,
}: OrganizationsListProps) {
  if (organizations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">
          You're not part of any organizations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => {
        const isActive = activeOrganizationId === org.id;
        const userRole = userMemberships[org.id];

        return (
          <OrganizationCard
            key={org.id}
            organization={org}
            isActive={isActive}
            userRole={userRole}
            onSetActive={() => onSetActive(org.id)}
            onEdit={() => onEdit(org)}
            onViewMembers={() => onViewMembers(org)}
            onLeave={() => onLeave(org.id)}
            onDelete={() => onDelete(org.id)}
            isSettingActive={isSettingActive}
            isDeleting={isDeleting}
            isLeaving={isLeaving}
          />
        );
      })}
    </div>
  );
}

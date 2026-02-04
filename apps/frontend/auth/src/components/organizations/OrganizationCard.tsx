import { Badge } from "@repo/ui/components/badge.tsx";
import { Button } from "@repo/ui/components/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card.tsx";

import type { Organization } from "~/hooks";

interface OrganizationCardProps {
  organization: Organization;
  isActive: boolean;
  userRole?: string;
  onSetActive: () => void;
  onEdit: () => void;
  onViewMembers: () => void;
  onLeave: () => void;
  onDelete: () => void;
  isSettingActive: boolean;
  isDeleting: boolean;
  isLeaving: boolean;
}

export function OrganizationCard({
  organization,
  isActive,
  userRole,
  onSetActive,
  onEdit,
  onViewMembers,
  onLeave,
  onDelete,
  isSettingActive,
  isDeleting,
  isLeaving,
}: OrganizationCardProps) {
  const isOwner = userRole === "owner";

  return (
    <Card className={isActive ? "ring-2 ring-indigo-500" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {organization.name}
            {isActive && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
            {userRole && (
              <Badge
                variant={isOwner ? "destructive" : "outline"}
                className="text-xs"
              >
                {userRole}
              </Badge>
            )}
          </span>
          {organization.slug && (
            <Badge variant="secondary" className="text-xs">
              {organization.slug}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Created{" "}
          {organization.createdAt instanceof Date
            ? organization.createdAt.toLocaleDateString()
            : new Date(organization.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {!isActive && (
            <Button
              variant="default"
              size="sm"
              onClick={onSetActive}
              disabled={isSettingActive}
            >
              {isSettingActive ? "Setting Active..." : "Set as Active"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onViewMembers}>
            View Members
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit Organization
          </Button>
          {isOwner ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={onLeave}
              disabled={isLeaving}
            >
              {isLeaving ? "Leaving..." : "Leave Organization"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

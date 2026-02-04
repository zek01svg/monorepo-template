import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@repo/ui/components/badge.tsx";
import { Button } from "@repo/ui/components/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form.tsx";
import { Input } from "@repo/ui/components/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select.tsx";
import { Separator } from "@repo/ui/components/separator.tsx";

import type { Member, Organization } from "~/hooks";
import {
  useCancelInvitation,
  useCanInviteMembers,
  useInviteMember,
  useListInvitations,
} from "~/hooks";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["member", "admin", "owner"], {
    message: "Please select a role",
  }),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface MembersDialogProps {
  organization: Organization | null;
  members: Member[];
  isOpen: boolean;
  onClose: () => void;
  isLoadingMembers: boolean;
}

export function MembersDialog({
  organization,
  members,
  isOpen,
  onClose,
  isLoadingMembers,
}: MembersDialogProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Hooks for member invitation
  const canInviteMembers = useCanInviteMembers(organization?.id ?? "");
  const inviteMemberMutation = useInviteMember();
  const { data: invitations = [] } = useListInvitations(organization?.id);
  const cancelInvitationMutation = useCancelInvitation();

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const handleInvite = async (data: InviteForm) => {
    if (!organization) return;

    await inviteMemberMutation.mutateAsync({
      organizationId: organization.id,
      email: data.email,
      role: data.role,
    });

    form.reset();
    setShowInviteForm(false);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    await cancelInvitationMutation.mutateAsync(invitationId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Members of {organization?.name}</DialogTitle>
          <DialogDescription>
            View and manage members and invitations for this organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Members Section */}
          {canInviteMembers && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Invite Members</h3>
                {!showInviteForm && (
                  <Button size="sm" onClick={() => setShowInviteForm(true)}>
                    Invite Member
                  </Button>
                )}
              </div>

              {showInviteForm && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleInvite)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="user@example.com"
                              disabled={inviteMemberMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={inviteMemberMutation.isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={inviteMemberMutation.isPending}
                      >
                        {inviteMemberMutation.isPending
                          ? "Inviting..."
                          : "Send Invitation"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowInviteForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Pending Invitations</h4>
                  <div className="space-y-2">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-gray-500">
                            Invited as {invitation.role}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Pending</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCancelInvitation(invitation.id)
                            }
                            disabled={cancelInvitationMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Members</h3>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <Badge
                    variant={member.role === "admin" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
              {members.length === 0 && !isLoadingMembers && (
                <p className="py-8 text-center text-gray-500">
                  No members found in this organization.
                </p>
              )}
              {isLoadingMembers && (
                <p className="py-8 text-center text-gray-500">
                  Loading members...
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

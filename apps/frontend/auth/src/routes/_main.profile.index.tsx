import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@repo/ui/components/badge.tsx";
import { Button } from "@repo/ui/components/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card.tsx";
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
import { toast } from "@repo/ui/components/sonner.tsx";

import { useOrganizations, useSetActiveOrganization } from "~/hooks";
import { authClient } from "~/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const Route = createFileRoute("/_main/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Use the reactive session hook
  const { data: sessionData, isPending: isSessionLoading } =
    authClient.useSession();
  const user = sessionData?.user;

  // Organizations data and active organization functionality
  const { data: organizations = [] } = useOrganizations();
  const setActiveOrganizationMutation = useSetActiveOrganization();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);

    try {
      const result = await authClient.updateUser({
        name: data.name,
      });

      if (result.error) {
        toast.error(result.error.message ?? "An error occurred");
        return;
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      // The session will automatically refresh due to the useSession hook
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.navigate({ to: "/sign-in" });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      name: user?.name ?? "",
    });
  };

  const handleChangeActiveOrganization = async (organizationId: string) => {
    await setActiveOrganizationMutation.mutateAsync(organizationId);
  };

  if (isSessionLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your account information
            </p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and edit your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="default"
                    >
                      Edit Profile
                    </Button>
                    <Link to="/organizations">
                      <Button variant="outline">Organizations</Button>
                    </Link>
                    <Button onClick={handleSignOut} variant="outline">
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="Enter your full name"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Email changes require separate verification
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Organization Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>Manage your active organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Active Organization
                  </label>
                  {sessionData.session.activeOrganizationId ? (
                    <div className="space-y-2">
                      <Badge variant="default">
                        {organizations.find(
                          (org) =>
                            org.id === sessionData.session.activeOrganizationId,
                        )?.name ?? sessionData.session.activeOrganizationId}
                      </Badge>
                      <Select
                        value={sessionData.session.activeOrganizationId}
                        onValueChange={handleChangeActiveOrganization}
                        disabled={setActiveOrganizationMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Change active organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        No active organization
                      </p>
                      <Select
                        onValueChange={handleChangeActiveOrganization}
                        disabled={setActiveOrganizationMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Set active organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {organizations.length === 0 && (
                    <p className="text-sm text-gray-500">
                      You're not part of any organizations yet.{" "}
                      <Link
                        to="/organizations"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        Manage organizations
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Details about your current session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    User ID:
                  </span>
                  <span className="ml-2 font-mono text-sm text-gray-900">
                    {user.id}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Email Verified:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {user.emailVerified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

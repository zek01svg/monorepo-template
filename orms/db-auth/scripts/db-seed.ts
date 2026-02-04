import { hashPassword } from "better-auth/crypto";

import { db } from "../src/client";
import { accounts, members, organizations, users } from "../src/schema";

await db.transaction(async (tx) => {
  await tx
    .insert(users)
    .values({
      id: "admin",
      name: "Admin",
      email: "admin@test.com",
      emailVerified: true,
    })
    .onConflictDoNothing();
  await tx
    .insert(accounts)
    .values({
      id: "admin",
      accountId: "admin",
      userId: "admin",
      providerId: "credential",
      password: await hashPassword("password"),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  const orgId = "admin-org";
  await tx
    .insert(organizations)
    .values({
      id: orgId,
      name: "Admin Org",
      slug: "admin-org",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  await tx.insert(members).values({
    id: "admin-org-member",
    organizationId: orgId,
    userId: "admin",
    createdAt: new Date(),
    role: "owner",
  });
});

process.exit(0);

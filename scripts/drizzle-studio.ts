import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(__dirname, "..");
const ENV_FILE = join(ROOT_DIR, ".env");
const DRIZZLE_API_URL = "http://drizzle.127.0.0.1.nip.io";

interface DatabaseSlot {
  id: string;
  name: string;
  dialect: "postgresql";
  credentials: {
    url: string;
  };
}

interface SlotSyncPayload {
  type: "slots:sync";
  data: {
    slot: DatabaseSlot;
  };
}

function readEnvFile(): Record<string, string> {
  if (!existsSync(ENV_FILE)) {
    console.log("No .env file found, continuing without environment variables");
    return {};
  }

  const envContent = readFileSync(ENV_FILE, "utf-8");
  const envVars: Record<string, string> = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts
          .join("=")
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }
  });

  return envVars;
}

function createDatabaseSlots(): DatabaseSlot[] {
  const envVars = readEnvFile();
  const postgresVars = Object.entries(envVars)
    .filter(([key]) => key.endsWith("_POSTGRES_URL"))
    .filter(([, value]) => value && value.trim() !== "");

  return postgresVars.map(([key, url]) => {
    const id = key;
    // Convert env var name to display name (remove _POSTGRES_URL suffix and format)
    const name = key
      .replace(/_POSTGRES_URL$/, "")
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Replace hostname with cnpg-cluster-rw.services
    const modifiedUrl = url.replace(/(@[^:/]+)/, "@cnpg-cluster-rw.services");

    return {
      id,
      name,
      dialect: "postgresql",
      credentials: { url: modifiedUrl },
    };
  });
}

async function syncSlotToAPI(slot: DatabaseSlot): Promise<void> {
  const payload: SlotSyncPayload = {
    type: "slots:sync",
    data: { slot },
  };

  try {
    const response = await fetch(DRIZZLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`✅ Synced slot "${slot.name}" (${slot.id})`);
  } catch (error) {
    console.error(`❌ Failed to sync slot "${slot.name}":`, error);
    throw error;
  }
}

async function syncAllSlots(): Promise<void> {
  const slots = createDatabaseSlots();

  if (slots.length === 0) {
    console.log("No PostgreSQL databases found in environment variables");
    return;
  }

  console.log(`Found ${slots.length} PostgreSQL database(s) to sync:`);
  slots.forEach((slot) => {
    console.log(
      `  - ${slot.name} (${slot.credentials.url.split("@")[1]?.split("/")[0] || "unknown host"})`,
    );
  });

  console.log("\nSyncing slots to Drizzle Studio...");

  for (const slot of slots) {
    await syncSlotToAPI(slot);
  }

  console.log(`\n🎉 Successfully synced ${slots.length} database slot(s)!`);
  console.log("🌐 Access Drizzle Studio at: " + DRIZZLE_API_URL);
}

async function main() {
  console.log("🚀 Starting Drizzle Studio slot sync...\n");

  try {
    await syncAllSlots();
  } catch (error) {
    console.error("❌ Failed to sync slots:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

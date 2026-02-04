import { exec } from "node:child_process";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Updates or adds an environment variable in the content
 */
function updateEnvVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*`, "m");
  const newLine = `${key}=${value}`;

  if (regex.test(content)) {
    // Update existing variable
    return content.replace(regex, newLine);
  } else {
    // Add new variable
    return `${content + (content.endsWith("\n") ? "" : "\n") + newLine}\n`;
  }
}

/**
 * Generates a new PostgreSQL URL with updated username and password
 */
function updatePostgresUrl(
  originalUrl: string,
  newUsername: string,
  newPassword: string,
): string {
  try {
    const url = new URL(originalUrl);
    url.username = newUsername;
    url.password = newPassword;
    return url.toString();
  } catch (error) {
    console.error(`Failed to parse PostgreSQL URL: ${originalUrl}`, error);
    return originalUrl;
  }
}

(async () => {
  const db_password = await execAsync(
    `kubectl get secret -n services cnpg-cluster-admin -o jsonpath="{.data.password}" | base64 -d`,
  );
  console.log("Retrieved DB_PASSWORD");

  const db_user = await execAsync(
    `kubectl get secret -n services cnpg-cluster-admin -o jsonpath="{.data.username}" | base64 -d`,
  );
  console.log("Retrieved DB_USER");

  // Path to .env and .env.example
  const envPath = join(process.cwd(), ".env");
  const envExamplePath = join(process.cwd(), ".env.example");

  try {
    // If .env doesn't exist, copy from .env.example
    try {
      await readFile(envPath);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        await copyFile(envExamplePath, envPath);
        console.log(".env created from .env.example");
      } else {
        throw error;
      }
    }

    // Read existing file
    let envContent = await readFile(envPath, "utf-8");

    envContent = updateEnvVar(
      envContent,
      "DB_PASSWORD",
      db_password.stdout.trim(),
    );
    envContent = updateEnvVar(envContent, "DB_USER", db_user.stdout.trim());

    // Update all PostgreSQL URLs with new username and password
    const postgresUrlRegex = /^(\w+_POSTGRES_URL)=(.*)$/gm;
    let match;
    while ((match = postgresUrlRegex.exec(envContent)) !== null) {
      const [, varName, currentUrl] = match;
      // Remove quotes if present
      const cleanUrl = currentUrl.replace(/^["']|["']$/g, "");
      const updatedUrl = updatePostgresUrl(
        cleanUrl,
        db_user.stdout.trim(),
        db_password.stdout.trim(),
      );
      // Preserve quotes if they were present
      const quotedUrl = currentUrl.startsWith('"')
        ? `"${updatedUrl}"`
        : updatedUrl;
      envContent = updateEnvVar(envContent, varName, quotedUrl);
      console.log(`Updated ${varName} with new credentials`);
    }

    // Write the updated content back to the file
    await writeFile(envPath, envContent);
    console.log(".env updated successfully");
  } catch (error) {
    console.error("Error updating .env:", error);
  }
})();

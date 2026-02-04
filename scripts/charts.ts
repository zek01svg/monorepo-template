import { exec } from "node:child_process";
import crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { checkbox } from "@inquirer/prompts";
import { glob } from "glob";
import semver from "semver";
import yaml from "yaml";

const execAsync = promisify(exec);

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force") || args.includes("-f");
  const patch = args.includes("--patch");
  const yes = args.includes("--yes") || args.includes("-y");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const chartMap = new Map<
    string,
    {
      yaml: yaml.Document;
      chartName: string;
      chartVersion: string;
      newVersion: string;
    }
  >();

  const rootDir = path.resolve(__dirname, "..");
  const chartsPattern = path.join(rootDir, "charts/*/Chart.yaml");
  const chartFiles = await glob(chartsPattern);

  for (const file of chartFiles) {
    const chartYaml = await fs.promises.readFile(file, "utf-8");
    const chartDocument = yaml.parseDocument(chartYaml);
    const chartName = chartDocument.get("name") as string;
    const chartVersion = chartDocument.get("version") as string;
    if (!chartName) {
      console.error(`Chart name not found in ${file}`);
      continue;
    }
    let newVersion = "";
    if (force) {
      newVersion = chartVersion;
    } else if (patch) {
      newVersion = semver.inc(chartVersion, "patch") as string;
    } else {
      const randomBytes = crypto.randomBytes(32);
      const hash = crypto.createHash("sha256");
      hash.update(randomBytes);
      const randomHex = hash.digest("hex").slice(0, 7);

      const parsed = semver.parse(chartVersion)!;
      if (parsed.prerelease.length) {
        newVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}-${randomHex}`;
      } else {
        newVersion = semver.inc(
          chartVersion,
          "prerelease",
          randomHex,
          false,
        ) as string;
      }
    }
    chartMap.set(chartName, {
      yaml: chartDocument,
      chartName,
      chartVersion,
      newVersion,
    });
  }

  let selectedCharts: string[] = [];
  if (yes) {
    selectedCharts = [...chartMap.keys()];
  } else {
    selectedCharts = await checkbox({
      message: "Select charts",
      choices: [...chartMap.entries()].map(
        ([name, { chartVersion, newVersion }]) => ({
          checked: true,
          value: name,
          name:
            chartVersion === newVersion
              ? `${name} (${chartVersion})`
              : `${name} (${chartVersion} -> ${newVersion})`,
        }),
      ),
    });
  }

  if (selectedCharts.length === 0) {
    console.error("No charts selected");
    process.exit(1);
  }

  for (const chartName of selectedCharts) {
    // biome-ignore lint/style/noNonNullAssertion: map has the chartName
    const { yaml, newVersion } = chartMap.get(chartName)!;
    yaml.set("version", newVersion);

    await fs.promises.writeFile(
      `charts/${chartName}/Chart.yaml`,
      yaml.toString(),
    );
    const filename = `${chartName}-${newVersion}.tgz`;

    console.log("");
    console.log(`+ helm package --dependency-update charts/${chartName}`);
    await execAsync(`helm package --dependency-update charts/${chartName}`);

    console.log(
      `+ helm push --ca-file terraform/kind-local/certs/ca.crt ${filename} oci://registry.127.0.0.1.nip.io`,
    );
    await execAsync(
      `helm push --ca-file terraform/kind-local/certs/ca.crt ${filename} oci://registry.127.0.0.1.nip.io`,
    );

    console.log(`+ rm ${filename}`);
    await execAsync(`rm ${filename}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

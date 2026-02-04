import { writeFile } from "fs/promises";
import { bundleWorkflowCode } from "@temporalio/worker";

async function buildBundle(path: string, outputPath: string) {
  const bundle = await bundleWorkflowCode({
    workflowsPath: path,
  });

  await writeFile(outputPath, bundle.code);

  return outputPath;
}

export default buildBundle;

import path from "path";
import { NativeConnection, Worker } from "@temporalio/worker";

import * as activities from "@repo/temporal-activities";
import {
  getConnectionOptions,
  namespace,
  taskQueue,
} from "@repo/temporal-common";

import buildBundle from "./buildBundle";

const workflowsSrcPath = path.join(process.cwd(), "..", "workflow", "src");

async function getWorkflowOption() {
  if (process.env.NODE_ENV === "production") {
    return {
      workflowBundle: {
        codePath: await buildBundle(workflowsSrcPath, "workflow-bundle.js"),
      },
    };
  }
  return { workflowsPath: workflowsSrcPath.replace("file:", "") };
}

async function run() {
  const workflowOption = await getWorkflowOption();
  const connection = await NativeConnection.connect(getConnectionOptions());
  try {
    const worker = await Worker.create({
      ...workflowOption,
      activities,
      connection,
      namespace,
      taskQueue,
    });

    await worker.run();
  } finally {
    // Close the connection once the worker has stopped
    await connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { PlopTypes } from "@turbo/gen";

import { PackageJson } from "./config";

export default function frontendGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("frontend", {
    description: "Generate a new frontend app for the monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the frontend app?",
      },
      {
        type: "input",
        name: "port",
        message:
          "What port should this frontend app run on? Even number between 4000 and 4998",
        validate: (input: string) => {
          const port = parseInt(input);
          if (isNaN(port)) {
            return "Port must be a valid number";
          }
          if (!input.startsWith("4")) {
            return "Frontend app ports must start with 4 (e.g., 4000, 4001, 4002)";
          }
          if (port < 4000 || port > 4999) {
            return "Frontend app ports must be between 4000-4999";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
    ],
    actions: [
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          if (answers.name.startsWith("@repo/")) {
            answers.name = answers.name.replace("@repo/", "");
          }
        }
        if ("port" in answers && typeof answers.port === "string") {
          (answers as Record<string, unknown>).backendPort =
            parseInt(answers.port) + 1;
        }
        return "Config sanitized";
      },
      async () => {
        // Create apps/frontend folder if it doesn't exist
        const frontendDir = path.join(process.cwd(), "apps", "frontend");
        if (!fs.existsSync(frontendDir)) {
          fs.mkdirSync(frontendDir, { recursive: true });
        }
        return "Folder created";
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/package.json",
        templateFile: "templates/frontend/package.json.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/Dockerfile",
        templateFile: "templates/frontend/Dockerfile.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/index.html",
        templateFile: "templates/frontend/index.html.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/404.html",
        templateFile: "templates/frontend/404.html.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/.gitignore",
        templateFile: "templates/frontend/.gitignore.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/eslint.config.js",
        templateFile: "templates/frontend/eslint.config.js.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/tsconfig.json",
        templateFile: "templates/frontend/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/tsconfig.app.json",
        templateFile: "templates/frontend/tsconfig.app.json.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/tsconfig.node.json",
        templateFile: "templates/frontend/tsconfig.node.json.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/turbo.json",
        templateFile: "templates/frontend/turbo.json.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/postcss.config.mjs",
        templateFile: "templates/frontend/postcss.config.mjs.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/components.json",
        templateFile: "templates/frontend/components.json.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/vite.config.ts",
        templateFile: "templates/frontend/vite.config.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/src/main.tsx",
        templateFile: "templates/frontend/src/main.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/src/env.ts",
        templateFile: "templates/frontend/src/env.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/src/vite-env.d.ts",
        templateFile: "templates/frontend/src/vite-env.d.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/src/routeTree.gen.ts",
        templateFile: "templates/frontend/src/routeTree.gen.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/src/routes/__root.tsx",
        templateFile: "templates/frontend/src/routes/__root.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/src/routes/index.tsx",
        templateFile: "templates/frontend/src/routes/index.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/server/env.ts",
        templateFile: "templates/frontend/server/env.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/server/index.ts",
        templateFile: "templates/frontend/server/index.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/public/vite.svg",
        templateFile: "templates/frontend/public/vite.svg",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/vitest.config.ts",
        templateFile: "templates/frontend/vitest.config.ts.hbs",
      },
      {
        type: "add",
        path: "apps/frontend/{{ name }}/tests/math.test.ts",
        templateFile: "templates/tests/math.test.ts.hbs",
      },
      {
        type: "modify",
        path: "apps/frontend/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson;
            for (const dep of answers.deps.split(" ").filter(Boolean)) {
              const version = await fetch(
                `https://registry.npmjs.org/-/package/${dep}/dist-tags`,
              )
                .then((res) => res.json())
                .then((json) => json.latest);
              if (!pkg.dependencies) pkg.dependencies = {};
              pkg.dependencies[dep] = `^${version}`;
            }
            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          execSync("pnpm i", { stdio: "inherit" });
          execSync(
            `pnpm prettier --write apps/frontend/${answers.name}/** --list-different`,
          );
          console.log("\n🎉 Frontend app scaffolded successfully!");
          console.log("\n📝 Next steps:");
          console.log(
            `   1. If this frontend needs to call backend services, register any new services:`,
          );
          console.log(
            `      File: ${path.join(process.cwd(), "packages", "service-discovery", "src", "config.ts")}`,
          );
          console.log(`   2. Add service names to the SERVICES array`);
          console.log(
            `   3. Add the service URLs to all three service maps (LOCAL, KUBERNETES, PRODUCTION)`,
          );
          console.log(`\n   Example:`);
          console.log(`   SERVICES = ["auth", "your-service"] as const;`);
          console.log(
            `   LOCAL_SERVICE_MAP = { ..., "your-service": "http://localhost:XXXX" }`,
          );
          return "Frontend app scaffolded";
        }
        return "Frontend app not scaffolded";
      },
    ],
  });
}

import type { PlopTypes } from "@turbo/gen";

import backendGenerator from "./backend";
import databaseGenerator from "./database";
import frontendGenerator from "./frontend";
import packageGenerator from "./package";

export interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  packageGenerator(plop);
  frontendGenerator(plop);
  backendGenerator(plop);
  databaseGenerator(plop);
}

#!/usr/bin/env node

import { execSync } from "node:child_process";
import fileSystem from "node:fs";
import path from "node:path";

function run() {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageData = JSON.parse(fileSystem.readFileSync(packagePath, "utf8"));

  const tag = `v${packageData.version}`;

  exec(`git tag ${tag}`);
  exec("git push");
  exec("git push --tags");

  console.log(`Released ${tag}`);
}

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

run();

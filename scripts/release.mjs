#!/usr/bin/env node

import { execSync } from "node:child_process";
import fileSystem from "node:fs";
import path from "node:path";

const VALID_TYPES = ["patch", "minor", "major"];

function run() {
  const bumpType = process.argv[2] ?? "patch";

  if (!VALID_TYPES.includes(bumpType)) {
    console.error(`Usage: release.mjs <${VALID_TYPES.join("|")}>`);
    process.exit(1);
  }

  const packagePath = path.join(process.cwd(), "package.json");
  const packageData = JSON.parse(fileSystem.readFileSync(packagePath, "utf8"));

  const nextVersion = bumpVersion(packageData.version, bumpType);
  packageData.version = nextVersion;
  fileSystem.writeFileSync(packagePath, `${JSON.stringify(packageData, null, 2)}\n`);

  const tag = `v${nextVersion}`;

  exec("git add package.json");
  exec(`git commit -m "chore: release ${tag}"`);
  exec(`git tag ${tag}`);
  exec("git push");
  exec("git push --tags");

  console.log(`Released ${tag}`);
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split(".").map(Number);

  const bumpers = {
    major: () => `${major + 1}.0.0`,
    minor: () => `${major}.${minor + 1}.0`,
    patch: () => `${major}.${minor}.${patch + 1}`,
  };

  return bumpers[type]();
}

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

run();

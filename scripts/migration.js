// @ts-check
import { $, glob } from "zx";
import { parseArgs } from "node:util";
import { parse } from "@iarna/toml";

const opts = parseArgs({
  options: {
    production: { type: "boolean", short: "p" },
  },
});

const cwd = process.cwd();
const { stdout: wranglerTomlRaw } = await $`cat wrangler.toml`;
/** @type {import("./migration").WranglerToml} */
const wranglerToml = /** @type {any} */ (parse(wranglerTomlRaw));
const database = wranglerToml.d1_databases[0];
if (!database) {
  console.error("No database found");
  process.exit(1);
} else {
  console.log("[d1 database detected]", database);
}

const migrationDir = database.migrations_dir;
await $`rm -r ${migrationDir}; mkdir -p ${migrationDir}`;

const migrations = await glob("./prisma/migrations/*/migration.sql", { cwd });
for (const prismaPath of migrations) {
  const migrationName = prismaPath.split("/")[3];
  const migrationPath = `${migrationDir}/${migrationName}.sql`;
  await $`cp ${prismaPath} ${migrationPath}`;
}

if (opts.values.production) {
  await $`pnpm wrangler d1 migrations apply ${database.database_name}`;
} else {
  await $`pnpm wrangler d1 migrations apply ${database.database_name} --local`;
}

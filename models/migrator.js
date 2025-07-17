import { resolve } from "node:path";
import { runner as migrationRunner } from "node-pg-migrate";

const defaultMigrationOptions = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: true,
  table: "pgmigrations",
};

async function listPendingMigrations() {
  const pendingMigrations = await migrationRunner(defaultMigrationOptions);
  return pendingMigrations;
}

async function runPendingMigrations() {
  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });
  return migratedMigrations;
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;

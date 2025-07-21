import { resolve } from "node:path";
import { runner as migrationRunner } from "node-pg-migrate";

function getDefaultMigrationOptions() {
  return {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    log: () => {},
    table: "pgmigrations",
  };
}

async function listPendingMigrations() {
  const pendingMigrations = await migrationRunner(getDefaultMigrationOptions());
  return pendingMigrations;
}

async function runPendingMigrations() {
  const migratedMigrations = await migrationRunner({
    ...getDefaultMigrationOptions(),
    dryRun: false,
  });
  return migratedMigrations;
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;

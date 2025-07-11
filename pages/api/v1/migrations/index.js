import { resolve } from "node:path";
import { runner as migrationRunner } from "node-pg-migrate";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}"not allowed`,
    });
  }
  try {
    const defaultMigrationOptions = {
      databaseUrl: process.env.DATABASE_URL,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      log: true,
      table: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error("Erro ao rodar migrations ", error);
    return response.status(500).json({ error: error.message });
  }
}

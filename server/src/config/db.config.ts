import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import entities from "./entities";

const { POSTGRES_URL } = process.env;

let pg: DataSource;

console.log(
  "\x1b[44m%s\x1b[0m",
  "server/src/config/db.config.ts:10 POSTGRES_URL",
  POSTGRES_URL,
);

if (POSTGRES_URL) {
  pg = new DataSource({
    type: "postgres",
    url: POSTGRES_URL,
    synchronize: true,
    entities,
    migrationsTableName: "migration_table",
  });
} else {
  console.warn("POSTGRES_URL not provided. Falling back to SQLite.");
  pg = new DataSource({
    type: "sqlite",
    database: "sqlite.db",
    synchronize: true,
    entities,
    migrationsTableName: "migration_table",
  });
}

export default pg;

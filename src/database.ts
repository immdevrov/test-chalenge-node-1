import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

pool.on("error", (err) => {
  console.error("DB POOL ERROR: ", err);
  process.exit(-1);
});

const MIGRATIONS_PATH = "../migrations";
const SEEDS_PATH = "../seeds";

async function getMigrationsFromTable(p: Pool, migrationName: string) {
  const tableExists = await pool.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'migrations'
  );
`);

  if (!tableExists.rows[0].exists) {
    return [];
  }

  const { rows } = await pool.query(
    "SELECT id FROM migrations WHERE name = $1",
    [migrationName]
  );
  return rows;
}

export async function init() {
  try {
    const migrationFiles = fs
      .readdirSync(path.join(__dirname, MIGRATIONS_PATH))
      .sort();

    for (const migrationFile of migrationFiles) {
      const migrationName = migrationFile.split(".")[0];

      const rows = await getMigrationsFromTable(pool, migrationName);

      if (rows.length === 0) {
        console.log(`Running migration: ${migrationName}`);
        const sql = fs.readFileSync(
          path.join(__dirname, MIGRATIONS_PATH, migrationFile),
          "utf8"
        );

        await pool.query(sql);
        await pool.query("INSERT INTO migrations (name) VALUES ($1)", [
          migrationName,
        ]);
      }
    }

    const seedFiles = fs.readdirSync(path.join(__dirname, SEEDS_PATH)).sort();

    for (const seedFile of seedFiles) {
      console.log(`Running seed: ${seedFile}`);
      const sql = fs.readFileSync(
        path.join(__dirname, SEEDS_PATH, seedFile),
        "utf8"
      );
      await pool.query(sql);
    }

    console.log("[DB INIT COMPLETE]");
  } catch (error) {
    console.error("DB INIT ERROR: ", error);
    throw error;
  }
}

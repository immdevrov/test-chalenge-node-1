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

async function checkIfMigrationsExist(p: Pool) {
  const { rows } = await p.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'migrations'
  );
`);

  return !rows[0].exists;
}

async function createMigrationsTable(p: Pool) {
  const q = `CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
  await p.query(q);
}

export async function init() {
  try {
    const migrationFiles = fs
      .readdirSync(path.join(__dirname, MIGRATIONS_PATH))
      .sort();

    const isFirstRun = await checkIfMigrationsExist(pool);

    if (isFirstRun) {
      await createMigrationsTable(pool);
    }

    for (const migrationFile of migrationFiles) {
      const migrationName = migrationFile.split(".")[0];
      const { rows } = await pool.query(
        "SELECT id FROM migrations WHERE name = $1",
        [migrationName]
      );

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

    if (isFirstRun) {
      const seedFiles = fs.readdirSync(path.join(__dirname, SEEDS_PATH)).sort();

      for (const seedFile of seedFiles) {
        console.log(`Running seed: ${seedFile}`);
        const sql = fs.readFileSync(
          path.join(__dirname, SEEDS_PATH, seedFile),
          "utf8"
        );
        await pool.query(sql);
      }
    }

    console.log("[DB INIT COMPLETE]");
  } catch (error) {
    console.error("DB INIT ERROR: ", error);
    throw error;
  }
}

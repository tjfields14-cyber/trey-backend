import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set. DB routes will fail.");
}

export const pool = new Pool({
  connectionString
});

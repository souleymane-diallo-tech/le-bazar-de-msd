import pg from "pg";
if (process.env.CI !== "true")
  throw new Error("Script réservé à la CI isolée.");
const client = new pg.Client({
  connectionString: process.env.TEST_DATABASE_URL,
});
await client.connect();
try {
  await client.query('CREATE DATABASE "msd_dev"');
} finally {
  await client.end();
}

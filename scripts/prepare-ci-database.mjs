import { readFile } from "node:fs/promises"
import process from "node:process"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const client = new pg.Client({ connectionString })
await client.connect()
try {
  for (const file of ["../deploy/schema.sql", "../deploy/seed.sql"]) {
    const sql = await readFile(new URL(file, import.meta.url), "utf8")
    await client.query(sql)
  }
} finally {
  await client.end()
}

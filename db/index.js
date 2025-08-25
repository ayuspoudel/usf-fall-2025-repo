// db/index.js
// Migration runner: applies all scripts in db/migrations in lexical order
// Author: Ayush Poudel | Date: Aug 25, 2025

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not defined. Please set it in your environment.");
  process.exit(1);
}

const DB_NAME = "usf_fall_2025";

// Resolve migrations directory relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "migrations");

async function runMigrations() {
  const client = new MongoClient(MONGO_URI, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log(`Connected to MongoDB, database: ${DB_NAME}`);

    const db = client.db(DB_NAME);
    const migrationsCol = db.collection("_migrations");
    await migrationsCol.createIndex({ name: 1 }, { unique: true });

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith(".js"))
      .sort();

    for (const file of files) {
      const already = await migrationsCol.findOne({ name: file });
      if (already) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`Applying ${file}`);
      const migration = await import(pathToFileURL(path.join(MIGRATIONS_DIR, file)));

      if (typeof migration.default === "function") {
        await migration.default(db);
      } else {
        console.warn(`Migration ${file} does not export default async function`);
      }

      await migrationsCol.insertOne({ name: file, appliedAt: new Date() });
      console.log(`${file} applied`);
    }

    console.log("All migrations complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runMigrations();

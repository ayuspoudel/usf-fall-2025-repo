// db/index.js
// Migration runner: runs all scripts in db/migrations in order
// Author: Ayush Poudel | Date: Aug 25, 2025

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "usf_fall_2025";
const MIGRATIONS_DIR = path.resolve("./db/migrations");

async function runMigrations() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Ensure we have a migrations tracking collection
    const migrationsCol = db.collection("_migrations");
    await migrationsCol.createIndex({ name: 1 }, { unique: true });

    // List all migration scripts
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith(".js"))
      .sort();

    for (const file of files) {
      const alreadyRun = await migrationsCol.findOne({ name: file });
      if (alreadyRun) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const migrationFn = await import(path.join(MIGRATIONS_DIR, file));
      if (typeof migrationFn.default === "function") {
        await migrationFn.default(db);
      } else {
        console.warn(`Migration ${file} does not export default async function`);
      }

      await migrationsCol.insertOne({ name: file, appliedAt: new Date() });
    }

    console.log("All migrations complete");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runMigrations();

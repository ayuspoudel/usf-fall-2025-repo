// db/index.js
// Migration runner: applies all scripts inside db/migrations in lexical order
// Author: Ayush Poudel | Date: Aug 25, 2025

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "usf_fall_2025";
const MIGRATIONS_DIR = path.resolve("./db/migrations");

async function runMigrations() {
  const client = new MongoClient(MONGO_URI, {
    tls: MONGO_URI.startsWith("mongodb+srv://"), // required for Atlas
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log(`Connected to ${DB_NAME}`);

    const db = client.db(DB_NAME);

    // track applied migrations
    const migrationsCol = db.collection("_migrations");
    await migrationsCol.createIndex({ name: 1 }, { unique: true });

    // load and sort migration scripts
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith(".js"))
      .sort();

    for (const file of files) {
      const exists = await migrationsCol.findOne({ name: file });
      if (exists) {
        console.log(`→ ${file} already applied, skipping`);
        continue;
      }

      console.log(`→ applying ${file}`);
      const migration = await import(path.join(MIGRATIONS_DIR, file));

      if (typeof migration.default === "function") {
        await migration.default(db);
      } else {
        console.warn(`⚠ ${file} does not export default async function`);
      }

      await migrationsCol.insertOne({ name: file, appliedAt: new Date() });
      console.log(`✓ ${file} applied`);
    }

    console.log("All migrations complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runMigrations();

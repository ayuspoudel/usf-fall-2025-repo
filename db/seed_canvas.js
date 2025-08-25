// db/seed_canvas.js
// Seed canvas_events collection from reports/canvas_events.json
// Author: Ayush Poudel | Date: Aug 25, 2025

import { MongoClient } from "mongodb";
import fs from "fs";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "usf_fall_2025";
const FILE_PATH = "./reports/canvas_events.json";

async function run() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  const client = new MongoClient(MONGO_URI, {
    tls: MONGO_URI.startsWith("mongodb+srv://"),
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log(`Connected to ${DB_NAME}`);

    const db = client.db(DB_NAME);
    const col = db.collection("canvas_events");

    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const events = JSON.parse(raw);

    if (!Array.isArray(events)) {
      throw new Error("Expected an array in canvas_events.json");
    }

    for (const ev of events) {
      await col.updateOne(
        { uid: ev.uid },
        { $set: ev },
        { upsert: true }
      );
    }

    console.log(`Inserted/updated ${events.length} events`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();

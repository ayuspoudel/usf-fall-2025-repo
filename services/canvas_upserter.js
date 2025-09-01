// Ayush Poudel | Sep 2025
// Parses Canvas .ics feed, upserts events into MongoDB

import ical from "node-ical";
import { MongoClient } from "mongodb";

const MONGO_URI   = process.env.MONGO_URI;
const DB_NAME     = "usf_fall_2025";
const EVENTS_COL  = "canvas_events";
const META_COL    = "sync_meta";

let cachedDb = null;
async function connectToMongo() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGO_URI, {
    tls: MONGO_URI.startsWith("mongodb+srv://"),
  });
  await client.connect();
  cachedDb = client.db(DB_NAME);
  return cachedDb;
}

export const handler = async (event) => {
  const { ics, etag } = event;

  if (!ics) {
    console.log("No ICS data passed to Upserter.");
    return { upserts: 0 };
  }

  const db = await connectToMongo();
  const eventsCol = db.collection(EVENTS_COL);
  const metaCol = db.collection(META_COL);

  // Parse the ICS
  const parsed = ical.sync.parseICS(ics);

  let upserts = 0;
  for (const key of Object.keys(parsed)) {
    const ev = parsed[key];
    if (ev.type !== "VEVENT") continue;

    const doc = {
      uid: ev.uid,
      title: ev.summary || "Untitled",
      description: ev.description || "",
      url: ev.url || "",
      course: ev.categories?.[0] || "Unknown",
      type: ev.categories?.[1] || "Assignment",
      due_date: ev.start?.toISOString(),
      last_modified: ev.lastmodified?.toISOString(),
      github_issue_id: null, // mark as unsynced
    };

    const resUp = await eventsCol.updateOne(
      { uid: doc.uid },
      { $set: doc },
      { upsert: true }
    );

    if (resUp.upsertedCount > 0 || resUp.modifiedCount > 0) {
      upserts++;
    }
  }

  // Save latest etag in meta
  if (etag) {
    await metaCol.updateOne(
      { _id: "calendar" },
      { $set: { etag, lastFetched: new Date() } },
      { upsert: true }
    );
  }

  console.log(`Upserted/updated ${upserts} events`);
  return { upserts };
};

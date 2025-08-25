// db/verify-seed.js
// Verify that canvas_events collection is seeded properly
// Author: Ayush Poudel | Date: Aug 25, 2025

import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "usf_fall_2025";

async function verifySeed() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI");
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection("canvas_events");

    // Total count
    const total = await col.countDocuments();
    console.log(`Total documents: ${total}`);

    // Group by course
    const byCourse = await col.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log("\nCount by course:");
    byCourse.forEach(row => {
      console.log(`  ${row._id}: ${row.count}`);
    });

    // Show one sample doc
    const sample = await col.findOne();
    console.log("\nSample document:");
    console.log(JSON.stringify(sample, null, 2));

    console.log("\nVerification complete.");
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifySeed();

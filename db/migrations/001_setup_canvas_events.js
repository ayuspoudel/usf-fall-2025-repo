// db/migrations/001_setup_canvas_events.js
// Creates canvas_events collection with schema validator + indexes
// Author: Ayush Poudel | Date: Aug 25, 2025

export default async function (db) {
  // Create collection with schema validator
  await db.createCollection("canvas_events", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["uid", "title", "course", "type", "due_date", "url"],
        properties: {
          uid: { bsonType: "string", description: "Unique Canvas UID" },
          title: { bsonType: "string", description: "Event title" },
          course: { bsonType: "string", description: "Course code e.g. COP4600" },
          type: {
            enum: ["Quiz", "Assignment", "Exam", "Discussion", "Other"],
            description: "Event type"
          },
          description: { bsonType: "string" },
          due_date: { bsonType: "string", description: "ISO date" },
          url: { bsonType: "string", description: "Canvas event link" }
        }
      }
    }
  }).catch(err => {
    if (err.codeName === "NamespaceExists") {
      console.log("canvas_events collection already exists, skipping createCollection");
    } else {
      throw err;
    } 
  });

  // Create indexes.   
  await db.collection("canvas_events").createIndex({ uid: 1 }, { unique: true });
  await db.collection("canvas_events").createIndex({ due_date: 1 });
  await db.collection("canvas_events").createIndex({ course: 1 });
}

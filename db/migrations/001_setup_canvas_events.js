// 001_setup_canvas_events.js
// Creates canvas_events collection with schema validator + indexes

db.createCollection("canvas_events", {
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
});

// Indexes
db.canvas_events.createIndex({ uid: 1 }, { unique: true });
db.canvas_events.createIndex({ due_date: 1 });
db.canvas_events.createIndex({ course: 1 });

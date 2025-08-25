# Database Migrations

This folder contains scripts that enforce schema validators and indexes in MongoDB.

## How to Run

From your terminal:

```bash
mongosh "mongodb+srv://<username>:<password>@cluster0.nhkxxpy.mongodb.net/usf_fall_2025" db/migrations/001_setup_canvas_events.js

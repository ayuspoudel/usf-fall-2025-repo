// services/db_watcher.js
// Ayush Poudel | Aug 25, 2025
// listens for new canvas_events, creates GitHub issue + project item, writes back metadata

import { MongoClient } from "mongodb";
import fetch from "node-fetch";

// env vars
const MONGO_URI       = process.env.MONGO_URI;
const DB_NAME         = "usf_fall_2025";
const COL_NAME        = "canvas_events";

const GH_TOKEN        = process.env.TOKEN_GITHUB;
const GH_PROJECT_ID   = process.env.GH_PROJECT_ID;
const GH_REPO_ID      = process.env.GH_REPO_ID;

// field ids
const FIELD_IDS = {
  dueDate: process.env.GH_FIELD_DUE_DATE,
  course:  process.env.GH_FIELD_COURSE,
  type:    process.env.GH_FIELD_TYPE,
};

// option ids
const TYPE_OPTIONS = {
  Quiz:       process.env.GH_OPTION_QUIZ,
  Assignment: process.env.GH_OPTION_ASSIGNMENT,
  Exam:       process.env.GH_OPTION_EXAM,
  Project:    process.env.GH_OPTION_PROJECT,
};

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${GH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors, null, 2));
  return data.data;
}

function getTypeOptionId(type) {
  return TYPE_OPTIONS[type] || null;
}

async function handleNewEvent(col, event) {
  if (event.github_issue_id) {
    console.log(`already synced: ${event.title}`);
    return;
  }

  // create issue
  const issueRes = await gql(
    `
    mutation($repo:ID!, $title:String!, $body:String!) {
      createIssue(input:{repositoryId:$repo, title:$title, body:$body}) {
        issue { id number url }
      }
    }`,
    {
      repo: GH_REPO_ID,
      title: `[${event.course}] ${event.title}`,
      body: `**Course:** ${event.course}\n**Type:** ${event.type}\n**Due:** ${event.due_date}\n\n${event.description}\n\n[Canvas Link](${event.url})`,
    }
  );
  const issue = issueRes.createIssue.issue;

  // add to project
  const itemRes = await gql(
    `
    mutation($project:ID!, $content:ID!) {
      addProjectV2ItemById(input:{projectId:$project, contentId:$content}) {
        item { id }
      }
    }`,
    { project: GH_PROJECT_ID, content: issue.id }
  );
  const itemId = itemRes.addProjectV2ItemById.item.id;

  // set due date
  if (FIELD_IDS.dueDate) {
    await gql(
      `
      mutation($project:ID!, $item:ID!, $field:ID!, $value:ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(input:{
          projectId:$project, itemId:$item, fieldId:$field, value:$value
        }) { projectV2Item { id } }
      }`,
      { project: GH_PROJECT_ID, item: itemId, field: FIELD_IDS.dueDate, value: { date: event.due_date } }
    );
  }

  // set course
  if (FIELD_IDS.course) {
    await gql(
      `
      mutation($project:ID!, $item:ID!, $field:ID!, $value:String!) {
        updateProjectV2ItemFieldValue(input:{
          projectId:$project, itemId:$item, fieldId:$field, value:{text:$value}
        }) { projectV2Item { id } }
      }`,
      { project: GH_PROJECT_ID, item: itemId, field: FIELD_IDS.course, value: event.course }
    );
  }

  // set type
  const typeId = getTypeOptionId(event.type);
  if (FIELD_IDS.type && typeId) {
    await gql(
      `
      mutation($project:ID!, $item:ID!, $field:ID!, $optionId:String!) {
        updateProjectV2ItemFieldValue(input:{
          projectId:$project, itemId:$item, fieldId:$field, value:{singleSelectOptionId:$optionId}
        }) { projectV2Item { id } }
      }`,
      { project: GH_PROJECT_ID, item: itemId, field: FIELD_IDS.type, optionId: typeId }
    );
  }

  // write back issue metadata
  await col.updateOne(
    { _id: event._id },
    { $set: { github_issue_id: issue.id, github_issue_number: issue.number, github_issue_url: issue.url } }
  );

  console.log(`synced: ${event.title} → #${issue.number}`);
}

// event handler for lambda
export async function handler() {
  const client = new MongoClient(MONGO_URI, { tls: MONGO_URI.startsWith("mongodb+srv://") });
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection(COL_NAME);

  console.log("watching canvas_events inserts...");
  const changeStream = col.watch([{ $match: { operationType: "insert" } }]);

  for await (const change of changeStream) {
    await handleNewEvent(col, change.fullDocument);
  }
}

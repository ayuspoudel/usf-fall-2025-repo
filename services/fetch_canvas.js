// Ayush Poudel | Sep 2025
// Fetches Canvas .ics feed with ETag and returns {changed, etag, ics}

import fetch from "node-fetch";

const FEED_URL = process.env.CANVAS_FEED_URL;

export const handler = async () => {
  if (!FEED_URL) {
    throw new Error("Missing env var CANVAS_FEED_URL");
  }

  // Later we can enhance: read last etag from Mongo/SSM, pass If-None-Match
  const res = await fetch(FEED_URL);

  if (res.status === 304) {
    console.log("Canvas feed not modified.");
    return { changed: false };
  }

  if (res.status !== 200) {
    throw new Error(`Unexpected Canvas response: ${res.status} ${res.statusText}`);
  }

  const etag = res.headers.get("etag") || null;
  const ics = await res.text();

  console.log("Fetched Canvas feed", {
    etag,
    bytes: ics.length
  });

  return {
    changed: true,
    etag,
    ics
  };
};

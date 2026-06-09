const KV_URL = "https://boss-sponge-145154.upstash.io";
const KV_TOKEN = "gQAAAAAAjcCAAIgcDJhMjA0Nzk5MzdjYTI0OGI1OTgwMWU5YmEzM2QxMjc3NQ";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Use pipeline format for reading too
    const r = await fetch(KV_URL + "/pipeline", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + KV_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([["GET", "einladungen"]])
    });

    const results = await r.json();
    const value = results[0]?.result;

    if (!value) return res.status(200).json({ events: [], customPersons: [] });

    // Parse once or twice if double-encoded
    let parsed = value;
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch(e) {}
    }
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch(e) {}
    }

    return res.status(200).json(parsed);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

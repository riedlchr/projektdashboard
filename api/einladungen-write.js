const KV_URL = "https://boss-sponge-145154.upstash.io";
const KV_TOKEN = "gQAAAAAAjcCAAIgcDJhMjA0Nzk5MzdjYTI0OGI1OTgwMWU5YmEzM2QxMjc3NQ";
const WRITE_SECRET = "caritas-einladungen-2026";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Write-Secret");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Simple secret check so only your dashboard can write
  if (req.headers["x-write-secret"] !== WRITE_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    await fetch(KV_URL + "/set/einladungen", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + KV_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["einladungen", body])
    });
    return res.status(200).json({ ok: true });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

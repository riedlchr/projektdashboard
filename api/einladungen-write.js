export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Write-Secret");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (req.headers["x-write-secret"] !== "caritas-einladungen-2026") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: "KV not configured", url: !!KV_URL, token: !!KV_TOKEN });
  }

  try {
    const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const r = await fetch(KV_URL + "/pipeline", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + KV_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([["SET", "einladungen", bodyStr]])
    });

    const result = await r.json();
    return res.status(200).json({ ok: true, result });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

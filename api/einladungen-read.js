export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: "KV not configured", url: !!KV_URL, token: !!KV_TOKEN });
  }

  try {
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

    let parsed = value;
    if (typeof parsed === "string") { try { parsed = JSON.parse(parsed); } catch(e) {} }
    if (typeof parsed === "string") { try { parsed = JSON.parse(parsed); } catch(e) {} }

    return res.status(200).json(parsed);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

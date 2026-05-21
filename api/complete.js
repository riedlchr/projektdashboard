export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.ASANA_TOKEN;
  if (!token) return res.status(500).json({ error: "ASANA_TOKEN not set" });

  const { gid } = req.query;
  if (!gid) return res.status(400).json({ error: "Missing gid" });

  try {
    const r = await fetch(`https://app.asana.com/api/1.0/tasks/${gid}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: { completed: true } })
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

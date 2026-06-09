export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: "KV not configured", url: !!KV_URL, token: !!KV_TOKEN });
  }

  try {
    const writeRes = await fetch(KV_URL + "/pipeline", {
      method: "POST",
      headers: { Authorization: "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify([["SET", "test-key", "hello-world"]])
    });
    const writeData = await writeRes.json();

    const readRes = await fetch(KV_URL + "/pipeline", {
      method: "POST",
      headers: { Authorization: "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify([["GET", "test-key"], ["GET", "einladungen"]])
    });
    const readData = await readRes.json();

    return res.status(200).json({
      kvConfigured: true,
      writeResult: writeData,
      testKeyValue: readData[0]?.result,
      einladungenPreview: readData[1]?.result ? String(readData[1].result).substring(0, 100) : null
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

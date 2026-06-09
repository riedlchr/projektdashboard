const KV_URL = "https://boss-sponge-145154.upstash.io";
const KV_TOKEN = "gQAAAAAAjcCAAIgcDJhMjA0Nzk5MzdjYTI0OGI1OTgwMWU5YmEzM2QxMjc3NQ";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Step 1: Write a simple test value
    const writeRes = await fetch(KV_URL + "/pipeline", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + KV_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([["SET", "test-key", "hello-world"]])
    });
    const writeData = await writeRes.json();

    // Step 2: Read it back
    const readRes = await fetch(KV_URL + "/pipeline", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + KV_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([["GET", "test-key"], ["GET", "einladungen"]])
    });
    const readData = await readRes.json();

    return res.status(200).json({
      writeResult: writeData,
      readResult: readData,
      einladungenValue: readData[1]?.result ? readData[1].result.substring(0, 200) : null
    });
  } catch(e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}

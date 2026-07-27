const SKS_BASE = "https://sks-leitungsdashboard.vercel.app";

async function forward(path, options) {
  const KEY = process.env.SKS_INTEGRATION_API_KEY;
  if (!KEY) throw new Error("SKS_INTEGRATION_API_KEY not set");
  const res = await fetch(SKS_BASE + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { status: res.status, data };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { status, data } = await forward("/api/data");
      return res.status(status).json(data);
    }

    if (req.method === "PATCH") {
      const { type, projectId, todoId, ...fields } = req.body || {};
      let path;
      if (type === "project" && projectId) path = `/api/projects/${projectId}`;
      else if (type === "todo" && projectId && todoId) path = `/api/projects/${projectId}/todos/${todoId}`;
      else return res.status(400).json({ error: "Ungültiger Patch-Typ" });
      const { status, data } = await forward(path, { method: "PATCH", body: JSON.stringify(fields) });
      return res.status(status).json(data);
    }

    if (req.method === "DELETE") {
      const { projectId, todoId } = req.query || {};
      if (!projectId || !todoId) return res.status(400).json({ error: "projectId/todoId fehlt" });
      const { status, data } = await forward(`/api/projects/${projectId}/todos/${todoId}`, { method: "DELETE" });
      return res.status(status).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

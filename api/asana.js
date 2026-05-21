export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const token = process.env.ASANA_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "ASANA_TOKEN not set" });
  }

  try {
    const meRes = await fetch("https://app.asana.com/api/1.0/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    const userId = meData.data?.gid;
    if (!userId) return res.status(500).json({ error: "Could not get Asana user" });

    const wsRes = await fetch("https://app.asana.com/api/1.0/workspaces", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const wsData = await wsRes.json();
    const workspaceId = wsData.data?.[0]?.gid;
    if (!workspaceId) return res.status(500).json({ error: "No workspace found" });

    const tasksRes = await fetch(
      `https://app.asana.com/api/1.0/tasks?assignee=${userId}&workspace=${workspaceId}&completed_since=now&opt_fields=name,due_on,projects.name,permalink_url&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tasksData = await tasksRes.json();

    return res.status(200).json({ tasks: tasksData.data || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

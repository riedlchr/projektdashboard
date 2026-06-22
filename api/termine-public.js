export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.ASANA_TOKEN;
  if (!token) return res.status(500).json({ error: "ASANA_TOKEN not set" });

  const PROJECT_ID = "1201164108625475";
  const SECTIONS = ["Termine 2026", "Termine 2027"];

  try {
    const sectRes = await fetch(
      `https://app.asana.com/api/1.0/projects/${PROJECT_ID}/sections?opt_fields=gid,name`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const sectData = await sectRes.json();
    const sections = sectData.data || [];

    const result = {};

    for (const sectionName of SECTIONS) {
      const section = sections.find(s => s.name.trim() === sectionName);
      if (!section) { result[sectionName] = []; continue; }

      const tasksRes = await fetch(
        `https://app.asana.com/api/1.0/sections/${section.gid}/tasks?opt_fields=name,due_on,due_at,completed,permalink_url,assignee.name,notes,custom_fields.name,custom_fields.display_value,custom_fields.text_value,custom_fields.enum_value.name&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tasksData = await tasksRes.json();
      result[sectionName] = (tasksData.data || []).filter(t => !t.completed);
    }

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

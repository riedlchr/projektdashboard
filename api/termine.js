export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.ASANA_TOKEN;
  if (!token) return res.status(500).json({ error: "ASANA_TOKEN not set" });

  const PROJECT_ID = "1201164108625475";
  const SECTION_NAME = "Termine 2026";

  try {
    // Step 1: get sections of the project
    const sectRes = await fetch(
      `https://app.asana.com/api/1.0/projects/${PROJECT_ID}/sections?opt_fields=gid,name`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const sectData = await sectRes.json();
    const sections = sectData.data || [];

    const section = sections.find(s => s.name.trim() === SECTION_NAME);
    if (!section) {
      return res.status(200).json({
        tasks: [],
        warning: `Section "${SECTION_NAME}" not found`,
        available_sections: sections.map(s => s.name)
      });
    }

    // Step 2: get tasks in that section
    const tasksRes = await fetch(
      `https://app.asana.com/api/1.0/sections/${section.gid}/tasks?opt_fields=name,due_on,completed,permalink_url&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tasksData = await tasksRes.json();
    const tasks = (tasksData.data || []).filter(t => !t.completed);

    return res.status(200).json({ tasks });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

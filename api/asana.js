export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const token = process.env.ASANA_TOKEN;
  if (!token) return res.status(500).json({ error: "ASANA_TOKEN not set" });

  const PRIO_SECTION_NAME = "Prio 1";

  try {
    // Step 1: get current user
    const meRes = await fetch("https://app.asana.com/api/1.0/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    const userId = meData.data?.gid;
    if (!userId) return res.status(500).json({ error: "Could not get user" });

    // Step 2: get workspaces
    const wsRes = await fetch("https://app.asana.com/api/1.0/workspaces", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const wsData = await wsRes.json();
    const workspaceId = wsData.data?.[0]?.gid;
    if (!workspaceId) return res.status(500).json({ error: "No workspace found" });

    // Step 3: get user task list
    const utlRes = await fetch(
      `https://app.asana.com/api/1.0/users/${userId}/user_task_list?workspace=${workspaceId}&opt_fields=gid,name`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const utlData = await utlRes.json();
    const taskListId = utlData.data?.gid;
    if (!taskListId) return res.status(500).json({ error: "No task list found" });

    // Step 4: get sections using the task list endpoint
    const sectRes = await fetch(
      `https://app.asana.com/api/1.0/user_task_lists/${taskListId}/sections?opt_fields=gid,name`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const sectData = await sectRes.json();
    const sections = sectData.data || [];

    // Return section names for debugging if needed
    const sectionNames = sections.map(s => s.name);

    // Step 5: find Prio 1 section (trim whitespace to be safe)
    const prioSection = sections.find(s => s.name.trim() === PRIO_SECTION_NAME.trim());
    if (!prioSection) {
      return res.status(200).json({ 
        tasks: [], 
        warning: `Section "${PRIO_SECTION_NAME}" not found`,
        available_sections: sectionNames
      });
    }

    // Step 6: get tasks in Prio 1 section
    const tasksRes = await fetch(
      `https://app.asana.com/api/1.0/sections/${prioSection.gid}/tasks?opt_fields=name,due_on,completed,permalink_url&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tasksData = await tasksRes.json();
    const tasks = (tasksData.data || []).filter(t => !t.completed);

    return res.status(200).json({ tasks });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

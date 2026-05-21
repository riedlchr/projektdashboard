export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://riedlchr.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

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

    // Step 3: get user task list gid
    const utlRes = await fetch(
      `https://app.asana.com/api/1.0/users/${userId}/user_task_list?workspace=${workspaceId}&opt_fields=gid`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const utlData = await utlRes.json();
    const taskListGid = utlData.data?.gid;
    if (!taskListGid) return res.status(500).json({ error: "No task list found" });

    // Step 4: get all incomplete tasks with memberships (includes section info)
    const tasksRes = await fetch(
      `https://app.asana.com/api/1.0/tasks?assignee=${userId}&workspace=${workspaceId}&completed_since=now&opt_fields=name,due_on,completed,permalink_url,memberships.section.name,memberships.project.gid&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tasksData = await tasksRes.json();
    const allTasks = tasksData.data || [];

    // Step 5: filter to tasks where any membership section is "Prio 1"
    const prioTasks = allTasks.filter(t => {
      if (t.completed) return false;
      const memberships = t.memberships || [];
      return memberships.some(m => m.section?.name?.trim() === PRIO_SECTION_NAME);
    });

    // Debug: also return all unique section names seen
    const sectionNames = [...new Set(
      allTasks.flatMap(t => (t.memberships || []).map(m => m.section?.name).filter(Boolean))
    )];

    return res.status(200).json({ tasks: prioTasks, debug_sections: sectionNames });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

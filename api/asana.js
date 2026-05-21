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
    if (!workspaceId) return res.status(500).json({ error: "No workspace" });

    // Step 3: get user task list
    const utlRes = await fetch(
      `https://app.asana.com/api/1.0/users/${userId}/user_task_list?workspace=${workspaceId}&opt_fields=gid`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const utlData = await utlRes.json();
    const taskListGid = utlData.data?.gid;
    if (!taskListGid) return res.status(500).json({ error: "No task list" });

    // Step 4: get ALL tasks from the user task list with their sections
    const tasksRes = await fetch(
      `https://app.asana.com/api/1.0/user_task_lists/${taskListGid}/tasks?opt_fields=name,due_on,completed,permalink_url,assignee_section.name&completed_since=now&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tasksData = await tasksRes.json();
    const allTasks = tasksData.data || [];

    // Debug: show all unique section names
    const sectionNames = [...new Set(
      allTasks.map(t => t.assignee_section?.name).filter(Boolean)
    )];

    // Step 5: filter to Prio 1 section only
    const prioTasks = allTasks.filter(t =>
      !t.completed && t.assignee_section?.name?.trim() === PRIO_SECTION_NAME
    );

    return res.status(200).json({ tasks: prioTasks, debug_sections: sectionNames });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

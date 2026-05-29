export const statusFromState = (state) => {
  if (state === 2) return "Waiting";
  if (state === 3) return "Completed";
  if (state === 4) return "Rejected";
  if (state === 5) return "Cancelled";
  return "Draft";
};

export const groupPettyCashItems = (items = []) => {
  const groups = new Map();

  items.forEach((item, index) => {
    const projectID = item.project_id || item.ProjectID || item.project?.id || item.project?.ID || "project";
    const reasonID = item.reason_id || item.ReasonID || item.reason?.id || item.reason?.ID || "reason";
    const key = `${projectID}:${reasonID}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        project_id: projectID === "project" ? "" : projectID,
        reason_id: reasonID === "reason" ? "" : reasonID,
        project: item.project?.project_name || item.project?.projectname || item.project?.ProjectName || item.project?.name || item.project || "-",
        reason: item.reason?.reasonname || item.reason?.reason_name || item.reason?.reasonName || item.reason?.ReasonName || item.reason?.name || item.reason || "-",
        receipt_url: item.attachments?.[0]?.file_path || item.attachments?.[0]?.filePath || item.receipt_url || "",
        items: [],
      });
    }

    groups.get(key).items.push({
      ...item,
      id: item.id || item.ID || `${key}-${index}`,
      amount: item.amount || item.total,
      date: item.date || item.Date,
      attachments: item.attachments || [],
    });
  });

  return Array.from(groups.values());
};

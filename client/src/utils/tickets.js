export function priorityBadge(priority) {
  if (priority === "Critical") return "badge critical";
  if (priority === "High") return "badge high";
  if (priority === "Medium") return "badge medium";
  return "badge low";
}

export function statusBadge(status) {
  return `status ${status.toLowerCase().replaceAll(" ", "-")}`;
}

export function isSlaRisk(ticket, thresholdHours = 48) {
  const created = new Date(ticket.created_at).getTime();
  const ageHours = (Date.now() - created) / 3600000;
  return ticket.status !== "Resolved" && ticket.status !== "Closed" && ageHours > thresholdHours;
}

export function requiresAccessFlag(ticket) {
  return ticket.category === "Access" && ["High", "Critical"].includes(ticket.priority);
}

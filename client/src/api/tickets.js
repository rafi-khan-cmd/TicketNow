import { http } from "./http";

export const getDashboard = () => http("/dashboard");
export const getAgents = () => http("/agents");
export const listAssets = () => http("/assets");

export function listTickets(params) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return http(`/tickets${query ? `?${query}` : ""}`);
}

export async function downloadTicketsCsv(params) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
  const response = await fetch(`${baseUrl}/tickets/export/csv${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error("Failed to export tickets");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const getTicket = (id) => http(`/tickets/${id}`);
export const createTicket = (payload) => http("/tickets", { method: "POST", body: JSON.stringify(payload) });
export const updateTicket = (id, payload) =>
  http(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const addNote = (payload) => http("/notes", { method: "POST", body: JSON.stringify(payload) });
export const createAsset = (payload) => http("/assets", { method: "POST", body: JSON.stringify(payload) });
export const updateAsset = (id, payload) => http(`/assets/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export function listKnowledgeBase(params) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return http(`/knowledge-base${query ? `?${query}` : ""}`);
}

export const createKnowledgeBase = (payload) =>
  http("/knowledge-base", { method: "POST", body: JSON.stringify(payload) });
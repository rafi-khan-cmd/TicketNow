import { env } from "../config/env.js";
import {
  addNoteSchema,
  createAssetSchema,
  createKbArticleSchema,
  createTicketSchema,
  kbListQuerySchema,
  ticketListQuerySchema,
  updateAssetSchema,
  updateTicketSchema
} from "../validators/ticketValidator.js";
import {
  createAsset,
  createKnowledgeBaseArticle,
  createNote,
  createTicket,
  getAgents,
  getDashboardStats,
  getKbSuggestionsForTicket,
  getTicketById,
  getTicketHistory,
  getTicketNotes,
  listAssets,
  listKnowledgeBase,
  listTickets,
  updateAsset,
  updateTicket
} from "../services/ticketService.js";

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return result.data;
}

export async function healthCheck(req, res) {
  res.json({ status: "ok", service: "ticketnow-api" });
}

export async function fetchAgents(req, res) {
  const agents = await getAgents();
  res.json(agents);
}

export async function fetchDashboard(req, res) {
  const stats = await getDashboardStats(env.agingThresholdHours);
  res.json(stats);
}

export async function fetchTickets(req, res) {
  const query = parse(ticketListQuerySchema, req.query);
  const tickets = await listTickets(query);
  res.json(tickets);
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  if (raw.includes(",") || raw.includes("\"") || raw.includes("\n")) {
    return `"${raw.replaceAll("\"", "\"\"")}"`;
  }
  return raw;
}

export async function exportTicketsCsv(req, res) {
  const query = parse(ticketListQuerySchema, req.query);
  const tickets = await listTickets(query);
  const headers = [
    "id",
    "title",
    "category",
    "priority",
    "status",
    "impact",
    "urgency",
    "requester_name",
    "requester_email",
    "department",
    "assigned_agent_name",
    "asset_tag",
    "created_at",
    "updated_at",
    "resolved_at"
  ];

  const lines = [headers.join(",")];
  for (const ticket of tickets) {
    const row = headers.map((key) => escapeCsv(ticket[key]));
    lines.push(row.join(","));
  }

  const filename = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(lines.join("\n"));
}

export async function fetchTicket(req, res) {
  const id = Number(req.params.id);
  const ticket = await getTicketById(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  const [notes, history, kbSuggestions] = await Promise.all([
    getTicketNotes(id),
    getTicketHistory(id),
    getKbSuggestionsForTicket(id)
  ]);
  res.json({ ticket, notes, history, kbSuggestions });
}

export async function createTicketHandler(req, res) {
  const payload = parse(createTicketSchema, req.body);
  const ticket = await createTicket(payload);
  res.status(201).json(ticket);
}

export async function updateTicketHandler(req, res) {
  const id = Number(req.params.id);
  const payload = parse(updateTicketSchema, req.body);
  const ticket = await updateTicket(id, payload);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  res.json(ticket);
}

export async function addNoteHandler(req, res) {
  const payload = parse(addNoteSchema, req.body);
  const note = await createNote(payload);
  res.status(201).json(note);
}

export async function fetchAssets(req, res) {
  const assets = await listAssets();
  res.json(assets);
}

export async function createAssetHandler(req, res) {
  const payload = parse(createAssetSchema, req.body);
  const asset = await createAsset(payload);
  res.status(201).json(asset);
}

export async function updateAssetHandler(req, res) {
  const id = Number(req.params.id);
  const payload = parse(updateAssetSchema, req.body);
  const asset = await updateAsset(id, payload);
  if (!asset) {
    return res.status(404).json({ message: "Asset not found" });
  }
  res.json(asset);
}

export async function fetchKnowledgeBase(req, res) {
  const query = parse(kbListQuerySchema, req.query);
  const articles = await listKnowledgeBase(query);
  res.json(articles);
}

export async function createKnowledgeBaseHandler(req, res) {
  const payload = parse(createKbArticleSchema, req.body);
  const article = await createKnowledgeBaseArticle(payload);
  res.status(201).json(article);
}

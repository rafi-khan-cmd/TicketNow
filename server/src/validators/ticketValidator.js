import { z } from "zod";

const categories = ["Software", "Hardware", "Network", "Access", "Other"];
const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Open", "In Progress", "Waiting on User", "Resolved", "Closed"];

export const createTicketSchema = z.object({
  // v1: allow minimal input as long as required fields are not empty
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(3000),
  category: z.enum(categories),
  priority: z.enum(priorities),
  requester_name: z.string().min(1).max(120),
  requester_email: z.string().min(1).max(254),
  department: z.string().min(1).max(120),
  impact: z.enum(["Low", "Medium", "High"]).optional(),
  urgency: z.enum(["Low", "Medium", "High"]).optional(),
  asset_id: z.number().int().nullable().optional(),
  // v1: accept any string (or empty) and store as-is; can tighten later if needed
  attachment_url: z.string().optional().or(z.literal(""))
});

export const updateTicketSchema = z.object({
  status: z.enum(statuses).optional(),
  assigned_to: z.number().int().nullable().optional(),
  impact: z.enum(["Low", "Medium", "High"]).optional(),
  urgency: z.enum(["Low", "Medium", "High"]).optional(),
  asset_id: z.number().int().nullable().optional(),
  resolution_notes: z.string().max(3000).optional(),
  escalation_notes: z.string().max(3000).optional()
});

export const addNoteSchema = z.object({
  ticket_id: z.number().int(),
  agent_id: z.number().int().nullable().optional(),
  note_type: z.enum(["Internal", "Escalation", "Resolution"]),
  content: z.string().min(2).max(3000)
});

export const ticketListQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "oldest", "highest_priority"]).optional()
});

export const createAssetSchema = z.object({
  asset_tag: z.string().min(1).max(80),
  asset_type: z.enum(["Laptop", "Desktop", "Mobile", "Printer", "Network Device", "Other"]),
  model: z.string().min(1).max(120),
  serial_number: z.string().min(1).max(120),
  assigned_to_name: z.string().max(120).optional(),
  department: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  status: z.enum(["In Use", "In Stock", "Repair", "Retired"]).optional(),
  warranty_expiry: z.string().optional()
});

export const updateAssetSchema = createAssetSchema.partial();

export const createKbArticleSchema = z.object({
  title: z.string().min(3).max(180),
  category: z.enum(categories),
  tags: z.array(z.string().min(1).max(40)).optional(),
  content: z.string().min(10).max(5000),
  author_id: z.number().int().nullable().optional(),
  is_published: z.boolean().optional()
});

export const kbListQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional()
});

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
  // v1: accept any string (or empty) and store as-is; can tighten later if needed
  attachment_url: z.string().optional().or(z.literal(""))
});

export const updateTicketSchema = z.object({
  status: z.enum(statuses).optional(),
  assigned_to: z.number().int().nullable().optional(),
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

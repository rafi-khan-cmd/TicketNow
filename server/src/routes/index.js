import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import {
  addNoteHandler,
  createAssetHandler,
  createKnowledgeBaseHandler,
  createTicketHandler,
  exportTicketsCsv,
  fetchAgents,
  fetchAssets,
  fetchDashboard,
  fetchKnowledgeBase,
  fetchTicket,
  fetchTickets,
  healthCheck,
  updateAssetHandler,
  updateTicketHandler
} from "../controllers/ticketController.js";

export const apiRouter = Router();

apiRouter.get("/health", asyncHandler(healthCheck));
apiRouter.get("/dashboard", asyncHandler(fetchDashboard));
apiRouter.get("/agents", asyncHandler(fetchAgents));
apiRouter.get("/tickets", asyncHandler(fetchTickets));
apiRouter.get("/tickets/export/csv", asyncHandler(exportTicketsCsv));
apiRouter.get("/tickets/:id", asyncHandler(fetchTicket));
apiRouter.post("/tickets", asyncHandler(createTicketHandler));
apiRouter.patch("/tickets/:id", requireRole(["Agent", "Admin"]), asyncHandler(updateTicketHandler));
apiRouter.post("/notes", requireRole(["Agent", "Admin"]), asyncHandler(addNoteHandler));

apiRouter.get("/assets", asyncHandler(fetchAssets));
apiRouter.post("/assets", requireRole(["Agent", "Admin"]), asyncHandler(createAssetHandler));
apiRouter.patch("/assets/:id", requireRole(["Admin"]), asyncHandler(updateAssetHandler));

apiRouter.get("/knowledge-base", asyncHandler(fetchKnowledgeBase));
apiRouter.post("/knowledge-base", requireRole(["Agent", "Admin"]), asyncHandler(createKnowledgeBaseHandler));

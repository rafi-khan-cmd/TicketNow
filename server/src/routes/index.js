import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  addNoteHandler,
  createTicketHandler,
  exportTicketsCsv,
  fetchAgents,
  fetchDashboard,
  fetchTicket,
  fetchTickets,
  healthCheck,
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
apiRouter.patch("/tickets/:id", asyncHandler(updateTicketHandler));
apiRouter.post("/notes", asyncHandler(addNoteHandler));

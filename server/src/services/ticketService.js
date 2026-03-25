import { pool } from "../db/pool.js";

const priorityRank = "CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END";

const matrixPriority = {
  "High-High": "Critical",
  "High-Medium": "High",
  "High-Low": "High",
  "Medium-High": "High",
  "Medium-Medium": "Medium",
  "Medium-Low": "Medium",
  "Low-High": "Medium",
  "Low-Medium": "Low",
  "Low-Low": "Low"
};

function derivePriority(impact, urgency, fallbackPriority) {
  if (!impact || !urgency) return fallbackPriority;
  return matrixPriority[`${impact}-${urgency}`] || fallbackPriority;
}

function computeSlaDates(priority) {
  const now = Date.now();
  const responseHours = priority === "Critical" ? 1 : priority === "High" ? 4 : priority === "Medium" ? 8 : 24;
  const resolutionHours = priority === "Critical" ? 8 : priority === "High" ? 24 : priority === "Medium" ? 48 : 72;
  return {
    responseDueAt: new Date(now + responseHours * 3600000),
    resolutionDueAt: new Date(now + resolutionHours * 3600000)
  };
}

export async function getAgents() {
  const { rows } = await pool.query("SELECT id, name, email, role FROM agents ORDER BY name ASC");
  return rows;
}

export async function createTicket(payload) {
  const priority = derivePriority(payload.impact, payload.urgency, payload.priority);
  const sla = computeSlaDates(priority);
  const query = `
    INSERT INTO tickets (
      title, description, category, priority, requester_name, requester_email,
      department, attachment_url, impact, urgency, response_due_at, resolution_due_at, asset_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
  `;

  const values = [
    payload.title,
    payload.description,
    payload.category,
    priority,
    payload.requester_name,
    payload.requester_email,
    payload.department,
    payload.attachment_url || null,
    payload.impact || null,
    payload.urgency || null,
    sla.responseDueAt,
    sla.resolutionDueAt,
    payload.asset_id || null
  ];

  const { rows } = await pool.query(query, values);
  await pool.query(
    "INSERT INTO ticket_status_history (ticket_id, from_status, to_status, changed_by) VALUES ($1, $2, $3, $4)",
    [rows[0].id, null, "Open", null]
  );
  return rows[0];
}

export async function listTickets(filters) {
  const where = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    where.push(`t.status = $${params.length}`);
  }
  if (filters.priority) {
    params.push(filters.priority);
    where.push(`t.priority = $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    where.push(`t.category = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    where.push(`(t.title ILIKE $${params.length} OR t.requester_name ILIKE $${params.length})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sort =
    filters.sort === "oldest"
      ? "t.created_at ASC"
      : filters.sort === "highest_priority"
        ? `${priorityRank} ASC, t.created_at DESC`
        : "t.created_at DESC";

  const query = `
    SELECT t.*, a.name AS assigned_agent_name,
           ast.asset_tag, ast.asset_type,
           (t.status IN ('Open','In Progress','Waiting on User') AND t.resolution_due_at IS NOT NULL AND NOW() > t.resolution_due_at) AS computed_sla_breached
    FROM tickets t
    LEFT JOIN agents a ON a.id = t.assigned_to
    LEFT JOIN assets ast ON ast.id = t.asset_id
    ${whereSql}
    ORDER BY ${sort}
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getTicketById(id) {
  const { rows } = await pool.query(
    `SELECT t.*, a.name AS assigned_agent_name,
            ast.asset_tag, ast.asset_type, ast.model AS asset_model,
            (t.status IN ('Open','In Progress','Waiting on User') AND t.resolution_due_at IS NOT NULL AND NOW() > t.resolution_due_at) AS computed_sla_breached
     FROM tickets t
     LEFT JOIN agents a ON a.id = t.assigned_to
     LEFT JOIN assets ast ON ast.id = t.asset_id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getTicketNotes(ticketId) {
  const { rows } = await pool.query(
    `SELECT n.*, a.name AS agent_name
     FROM ticket_notes n LEFT JOIN agents a ON a.id = n.agent_id
     WHERE ticket_id = $1 ORDER BY created_at DESC`,
    [ticketId]
  );
  return rows;
}

export async function getTicketHistory(ticketId) {
  const { rows } = await pool.query(
    `SELECT h.*, a.name AS changed_by_name
     FROM ticket_status_history h LEFT JOIN agents a ON a.id = h.changed_by
     WHERE ticket_id = $1 ORDER BY changed_at DESC`,
    [ticketId]
  );
  return rows;
}

export async function updateTicket(id, payload) {
  const current = await getTicketById(id);
  if (!current) return null;

  const nextImpact = payload.impact ?? current.impact;
  const nextUrgency = payload.urgency ?? current.urgency;
  const nextPriority = derivePriority(nextImpact, nextUrgency, current.priority);
  const nextStatus = payload.status ?? current.status;
  const resolvedAt =
    nextStatus === "Resolved" && !current.resolved_at ? new Date() : nextStatus !== "Resolved" ? null : current.resolved_at;
  const firstRespondedAt =
    ["In Progress", "Waiting on User", "Resolved", "Closed"].includes(nextStatus) && !current.first_responded_at
      ? new Date()
      : current.first_responded_at;

  const query = `
    UPDATE tickets
    SET status = $1,
        assigned_to = $2,
        impact = $3,
        urgency = $4,
        priority = $5,
        asset_id = $6,
        resolution_notes = COALESCE($7, resolution_notes),
        escalation_notes = COALESCE($8, escalation_notes),
        first_responded_at = $9,
        resolved_at = $10,
        sla_breached = CASE WHEN status IN ('Open','In Progress','Waiting on User') AND resolution_due_at IS NOT NULL AND NOW() > resolution_due_at THEN TRUE ELSE FALSE END,
        updated_at = NOW()
    WHERE id = $11
    RETURNING *
  `;

  const values = [
    nextStatus,
    payload.assigned_to === undefined ? current.assigned_to : payload.assigned_to,
    nextImpact,
    nextUrgency,
    nextPriority,
    payload.asset_id === undefined ? current.asset_id : payload.asset_id,
    payload.resolution_notes,
    payload.escalation_notes,
    firstRespondedAt,
    resolvedAt,
    id
  ];

  const { rows } = await pool.query(query, values);

  if (payload.status && payload.status !== current.status) {
    await pool.query(
      "INSERT INTO ticket_status_history (ticket_id, from_status, to_status, changed_by) VALUES ($1, $2, $3, $4)",
      [id, current.status, payload.status, payload.assigned_to ?? current.assigned_to ?? null]
    );
  }

  return rows[0];
}

export async function createNote(payload) {
  const { rows } = await pool.query(
    `INSERT INTO ticket_notes (ticket_id, agent_id, note_type, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [payload.ticket_id, payload.agent_id || null, payload.note_type, payload.content]
  );
  return rows[0];
}

export async function getDashboardStats(agingThresholdHours) {
  const [totals, byPriority, byCategory, byStatus, avgResolution, deptOpen, recentActivity, atRisk, slaBreaches] =
    await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status IN ('Open','In Progress','Waiting on User'))::int AS open,
                COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved
         FROM tickets`
      ),
      pool.query("SELECT priority, COUNT(*)::int AS count FROM tickets GROUP BY priority"),
      pool.query("SELECT category, COUNT(*)::int AS count FROM tickets GROUP BY category"),
      pool.query("SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status"),
      pool.query(
        `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 0)::float AS avg_resolution_hours
         FROM tickets WHERE resolved_at IS NOT NULL`
      ),
      pool.query(
        `SELECT department, COUNT(*)::int AS count
         FROM tickets
         WHERE status IN ('Open', 'In Progress', 'Waiting on User')
         GROUP BY department
         ORDER BY count DESC`
      ),
      pool.query(
        `SELECT id, title, status, priority, updated_at
         FROM tickets ORDER BY updated_at DESC LIMIT 8`
      ),
      pool.query(
        `SELECT id, title, category, priority, status, created_at,
        (EXTRACT(EPOCH FROM (NOW() - created_at))/3600)::int AS age_hours
        FROM tickets
        WHERE status IN ('Open','In Progress','Waiting on User')
        AND (
          (priority IN ('High','Critical')) OR
          EXTRACT(EPOCH FROM (NOW() - created_at))/3600 > $1
        )
        ORDER BY priority DESC, created_at ASC LIMIT 10`,
        [agingThresholdHours]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS breached
         FROM tickets
         WHERE status IN ('Open','In Progress','Waiting on User')
         AND resolution_due_at IS NOT NULL
         AND NOW() > resolution_due_at`
      )
    ]);

  return {
    totals: totals.rows[0],
    byPriority: byPriority.rows,
    byCategory: byCategory.rows,
    byStatus: byStatus.rows,
    avgResolutionHours: Number(avgResolution.rows[0].avg_resolution_hours || 0),
    openByDepartment: deptOpen.rows,
    recentActivity: recentActivity.rows,
    atRiskTickets: atRisk.rows,
    slaBreached: slaBreaches.rows[0].breached
  };
}

export async function listAssets() {
  const { rows } = await pool.query("SELECT * FROM assets ORDER BY updated_at DESC");
  return rows;
}

export async function createAsset(payload) {
  const { rows } = await pool.query(
    `INSERT INTO assets (
      asset_tag, asset_type, model, serial_number, assigned_to_name, department, location, status, warranty_expiry, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
    RETURNING *`,
    [
      payload.asset_tag,
      payload.asset_type,
      payload.model,
      payload.serial_number,
      payload.assigned_to_name || null,
      payload.department || null,
      payload.location || null,
      payload.status || "In Use",
      payload.warranty_expiry || null
    ]
  );
  return rows[0];
}

export async function updateAsset(id, payload) {
  const currentRows = await pool.query("SELECT * FROM assets WHERE id = $1", [id]);
  if (!currentRows.rows[0]) return null;
  const current = currentRows.rows[0];

  const merged = {
    ...current,
    ...payload,
    updated_at: new Date()
  };

  const { rows } = await pool.query(
    `UPDATE assets
     SET asset_tag = $1,
         asset_type = $2,
         model = $3,
         serial_number = $4,
         assigned_to_name = $5,
         department = $6,
         location = $7,
         status = $8,
         warranty_expiry = $9,
         updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [
      merged.asset_tag,
      merged.asset_type,
      merged.model,
      merged.serial_number,
      merged.assigned_to_name,
      merged.department,
      merged.location,
      merged.status,
      merged.warranty_expiry,
      id
    ]
  );
  return rows[0];
}

export async function listKnowledgeBase(filters) {
  const where = ["is_published = TRUE"];
  const params = [];

  if (filters.category) {
    params.push(filters.category);
    where.push(`category = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    where.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
  }

  const { rows } = await pool.query(
    `SELECT kb.*, a.name AS author_name
     FROM knowledge_base_articles kb
     LEFT JOIN agents a ON a.id = kb.author_id
     WHERE ${where.join(" AND ")}
     ORDER BY kb.updated_at DESC`,
    params
  );
  return rows;
}

export async function createKnowledgeBaseArticle(payload) {
  const { rows } = await pool.query(
    `INSERT INTO knowledge_base_articles (title, category, tags, content, author_id, is_published)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [payload.title, payload.category, payload.tags || [], payload.content, payload.author_id || null, payload.is_published ?? true]
  );
  return rows[0];
}

export async function getKbSuggestionsForTicket(ticketId) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return [];
  const terms = ticket.title
    .toLowerCase()
    .split(/\s+/)
    .filter((x) => x.length > 3)
    .slice(0, 4);

  const { rows } = await pool.query(
    `SELECT id, title, category, tags, updated_at
     FROM knowledge_base_articles
     WHERE is_published = TRUE
       AND category = $1
       AND (
         title ILIKE ANY($2::text[])
         OR EXISTS (
           SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE ANY($2::text[])
         )
       )
     ORDER BY updated_at DESC
     LIMIT 5`,
    [ticket.category, terms.length ? terms.map((t) => `%${t}%`) : ["%"]]
  );
  return rows;
}

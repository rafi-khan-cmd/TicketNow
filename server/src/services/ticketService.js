import { pool } from "../db/pool.js";

const priorityRank = "CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END";

export async function getAgents() {
  const { rows } = await pool.query("SELECT id, name, email, role FROM agents ORDER BY name ASC");
  return rows;
}

export async function createTicket(payload) {
  const query = `
    INSERT INTO tickets (title, description, category, priority, requester_name, requester_email, department, attachment_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `;
  const values = [
    payload.title,
    payload.description,
    payload.category,
    payload.priority,
    payload.requester_name,
    payload.requester_email,
    payload.department,
    payload.attachment_url || null
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
    SELECT t.*, a.name AS assigned_agent_name
    FROM tickets t
    LEFT JOIN agents a ON a.id = t.assigned_to
    ${whereSql}
    ORDER BY ${sort}
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getTicketById(id) {
  const { rows } = await pool.query(
    `SELECT t.*, a.name AS assigned_agent_name
     FROM tickets t LEFT JOIN agents a ON a.id = t.assigned_to WHERE t.id = $1`,
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

  const nextStatus = payload.status ?? current.status;
  const resolvedAt =
    nextStatus === "Resolved" && !current.resolved_at ? new Date() : nextStatus !== "Resolved" ? null : current.resolved_at;

  const query = `
    UPDATE tickets
    SET status = $1,
        assigned_to = $2,
        resolution_notes = COALESCE($3, resolution_notes),
        escalation_notes = COALESCE($4, escalation_notes),
        resolved_at = $5,
        updated_at = NOW()
    WHERE id = $6
    RETURNING *
  `;

  const values = [
    nextStatus,
    payload.assigned_to === undefined ? current.assigned_to : payload.assigned_to,
    payload.resolution_notes,
    payload.escalation_notes,
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
  const [totals, byPriority, byCategory, byStatus, avgResolution, deptOpen, recentActivity, atRisk] = await Promise.all([
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
    atRiskTickets: atRisk.rows
  };
}

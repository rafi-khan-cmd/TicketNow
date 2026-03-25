import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { downloadTicketsCsv, listTickets } from "../api/tickets";
import { isSlaRisk, priorityBadge, requiresAccessFlag, statusBadge } from "../utils/tickets";

const initialFilters = { status: "", priority: "", category: "", q: "", sort: "newest" };

export function TicketsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listTickets(filters)
      .then((rows) => {
        setTickets(rows);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const [exporting, setExporting] = useState(false);

  async function handleExportCsv() {
    try {
      setExporting(true);
      await downloadTicketsCsv(filters);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }

  const filteredCountText = useMemo(() => `${tickets.length} ticket(s)`, [tickets]);

  return (
    <section>
      <div className="filters">
        <input placeholder="Search by title or requester" value={filters.q} onChange={(e) => updateFilter("q", e.target.value)} />
        <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option value="">All Statuses</option><option>Open</option><option>In Progress</option><option>Waiting on User</option><option>Resolved</option><option>Closed</option>
        </select>
        <select value={filters.priority} onChange={(e) => updateFilter("priority", e.target.value)}>
          <option value="">All Priorities</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
          <option value="">All Categories</option><option>Software</option><option>Hardware</option><option>Network</option><option>Access</option><option>Other</option>
        </select>
        <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="highest_priority">Highest Priority</option>
        </select>
      </div>

      {loading ? <p>Loading tickets...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error && tickets.length === 0 ? <p className="muted">No tickets found for selected filters.</p> : null}
      <p className="muted">{filteredCountText}</p>
      <button type="button" onClick={handleExportCsv} disabled={exporting}>
        {exporting ? "Exporting..." : "Export CSV"}
      </button>

      <table>
        <thead>
          <tr><th>ID</th><th>Title</th><th>Requester</th><th>Department</th><th>Priority</th><th>Status</th><th>Flags</th></tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{ticket.id}</td>
              <td><Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link></td>
              <td>{ticket.requester_name}</td>
              <td>{ticket.department}</td>
              <td><span className={priorityBadge(ticket.priority)}>{ticket.priority}</span></td>
              <td><span className={statusBadge(ticket.status)}>{ticket.status}</span></td>
              <td>
                {requiresAccessFlag(ticket) ? <span className="flag">Access + High Priority</span> : null}
                {isSlaRisk(ticket) ? <span className="flag risk">SLA Risk</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

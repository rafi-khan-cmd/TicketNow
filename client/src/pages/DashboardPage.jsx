import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboard } from "../api/tickets";
import { StatCard } from "../components/StatCard";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading dashboard...</p>;

  return (
    <section>
      <div className="stats-grid">
        <StatCard label="Total Incidents" value={data.totals.total} />
        <StatCard label="Open Tickets" value={data.totals.open} hint="Active triage queue" />
        <StatCard label="Resolved Tickets" value={data.totals.resolved} />
        <StatCard label="Avg Resolution (hrs)" value={data.avgResolutionHours.toFixed(1)} />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.byCategory} dataKey="count" nameKey="category" outerRadius={90} fill="#10b981" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Open Tickets by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.openByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Overdue / SLA Risk</h3>
          {data.atRiskTickets.length === 0 ? (
            <p className="muted">No SLA risk tickets right now.</p>
          ) : (
            data.atRiskTickets.map((t) => (
              <div key={t.id} className="list-row">
                <span>#{t.id} {t.title}</span>
                <strong>{t.priority} | {t.age_hours}h</strong>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <h3>Recent Activity</h3>
          {data.recentActivity.map((r) => (
            <div key={r.id} className="list-row">
              <span>{r.title}</span>
              <small>{r.status}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

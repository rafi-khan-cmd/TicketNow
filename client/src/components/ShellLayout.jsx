import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ShellLayout() {
  const { user } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>TicketNow</h1>
        <p className="subtitle">IT Support Portal</p>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          <NavLink to="/tickets/new">Submit Ticket</NavLink>
          <NavLink to="/assets">Assets</NavLink>
          <NavLink to="/knowledge-base">Knowledge Base</NavLink>
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <strong>Support Operations</strong>
            <p>Active workspace for triage and incident resolution</p>
          </div>
          <div className="topbar-chip">Signed in as {user.name} • {user.role}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

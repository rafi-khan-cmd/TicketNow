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
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <strong>Support Dashboard</strong>
            <p>Role: {user.role}</p>
          </div>
          <div className="topbar-chip">Assigned Agent: {user.name}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

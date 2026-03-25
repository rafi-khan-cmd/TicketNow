import { useState } from "react";
import { createTicket } from "../api/tickets";

const initialState = {
  title: "",
  description: "",
  category: "Software",
  priority: "Medium",
  requester_name: "",
  requester_email: "",
  department: "",
  attachment_url: ""
};

export function NewTicketPage() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const ticket = await createTicket(form);
      setMessage(`Ticket #${ticket.id} submitted successfully.`);
      setError("");
      setForm(initialState);
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  }

  return (
    <section className="panel">
      <h2>Submit Support Ticket</h2>
      <form className="stack" onSubmit={submit}>
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
          <option>Software</option><option>Hardware</option><option>Network</option><option>Access</option><option>Other</option>
        </select>
        <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <input required placeholder="Requester name" value={form.requester_name} onChange={(e) => setForm((p) => ({ ...p, requester_name: e.target.value }))} />
        <input required type="email" placeholder="Requester email" value={form.requester_email} onChange={(e) => setForm((p) => ({ ...p, requester_email: e.target.value }))} />
        <input required placeholder="Department/team" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
        <input placeholder="Attachment URL (optional)" value={form.attachment_url} onChange={(e) => setForm((p) => ({ ...p, attachment_url: e.target.value }))} />
        <button type="submit">Create Ticket</button>
      </form>
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}

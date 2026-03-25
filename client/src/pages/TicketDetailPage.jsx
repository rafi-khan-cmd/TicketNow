import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addNote, getAgents, getTicket, updateTicket } from "../api/tickets";

export function TicketDetailPage() {
  const { id } = useParams();
  const [agents, setAgents] = useState([]);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ status: "", assigned_to: "", resolution_notes: "", escalation_notes: "" });
  const [newNote, setNewNote] = useState({ note_type: "Internal", content: "" });
  const [error, setError] = useState("");

  async function load() {
    const [ticketData, agentData] = await Promise.all([getTicket(id), getAgents()]);
    setData(ticketData);
    setAgents(agentData);
    setForm({
      status: ticketData.ticket.status,
      assigned_to: ticketData.ticket.assigned_to || "",
      resolution_notes: ticketData.ticket.resolution_notes || "",
      escalation_notes: ticketData.ticket.escalation_notes || ""
    });
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    await updateTicket(id, {
      ...form,
      assigned_to: form.assigned_to === "" ? null : Number(form.assigned_to)
    });
    await load();
  }

  async function handleNote(e) {
    e.preventDefault();
    await addNote({
      ticket_id: Number(id),
      note_type: newNote.note_type,
      content: newNote.content,
      agent_id: form.assigned_to === "" ? null : Number(form.assigned_to)
    });
    setNewNote((p) => ({ ...p, content: "" }));
    await load();
  }

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading ticket...</p>;

  return (
    <section className="detail-grid">
      <article className="panel">
        <h2>Ticket #{data.ticket.id}</h2>
        <p><strong>{data.ticket.title}</strong></p>
        <p>{data.ticket.description}</p>
        <p>Requester: {data.ticket.requester_name} ({data.ticket.requester_email})</p>
        <p>Department: {data.ticket.department}</p>

        <form onSubmit={handleUpdate} className="stack">
          <h3>Lifecycle Update</h3>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option>Open</option><option>In Progress</option><option>Waiting on User</option><option>Resolved</option><option>Closed</option>
          </select>
          <select value={form.assigned_to} onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))}>
            <option value="">Unassigned</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <textarea placeholder="Resolution notes" value={form.resolution_notes} onChange={(e) => setForm((p) => ({ ...p, resolution_notes: e.target.value }))} />
          <textarea placeholder="Escalation notes" value={form.escalation_notes} onChange={(e) => setForm((p) => ({ ...p, escalation_notes: e.target.value }))} />
          <button type="submit">Save Update</button>
        </form>
      </article>

      <article className="panel">
        <h3>Internal Notes</h3>
        <form onSubmit={handleNote} className="stack">
          <select value={newNote.note_type} onChange={(e) => setNewNote((p) => ({ ...p, note_type: e.target.value }))}>
            <option>Internal</option><option>Escalation</option><option>Resolution</option>
          </select>
          <textarea required placeholder="Add triage or resolution details" value={newNote.content} onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))} />
          <button type="submit">Add Note</button>
        </form>

        {data.notes.map((note) => (
          <div key={note.id} className="note-item">
            <strong>{note.note_type}</strong>
            <p>{note.content}</p>
          </div>
        ))}

        <h3>Status History</h3>
        {data.history.map((h) => (
          <div key={h.id} className="list-row">
            <span>{h.from_status || "None"} {"->"} {h.to_status}</span>
          </div>
        ))}
      </article>
    </section>
  );
}

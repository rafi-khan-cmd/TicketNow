import { useEffect, useState } from "react";
import { createAsset, listAssets } from "../api/tickets";
import { useAuth } from "../context/AuthContext";

const initialAsset = {
  asset_tag: "",
  asset_type: "Laptop",
  model: "",
  serial_number: "",
  assigned_to_name: "",
  department: "",
  location: "",
  status: "In Use",
  warranty_expiry: ""
};

export function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(initialAsset);
  const [error, setError] = useState("");

  async function load() {
    try {
      const rows = await listAssets();
      setAssets(rows);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await createAsset(form);
      setForm(initialAsset);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-title">
        <h2>Asset Registry</h2>
        <p>Track endpoint inventory and link devices to support incidents.</p>
      </div>

      {user.role === "Admin" || user.role === "Agent" ? (
        <article className="panel form-card">
          <h3>Add Asset</h3>
          <form className="stack" onSubmit={submit}>
            <input required placeholder="Asset Tag" value={form.asset_tag} onChange={(e) => setForm((p) => ({ ...p, asset_tag: e.target.value }))} />
            <select value={form.asset_type} onChange={(e) => setForm((p) => ({ ...p, asset_type: e.target.value }))}>
              <option>Laptop</option><option>Desktop</option><option>Mobile</option><option>Printer</option><option>Network Device</option><option>Other</option>
            </select>
            <input required placeholder="Model" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
            <input required placeholder="Serial Number" value={form.serial_number} onChange={(e) => setForm((p) => ({ ...p, serial_number: e.target.value }))} />
            <input placeholder="Assigned To" value={form.assigned_to_name} onChange={(e) => setForm((p) => ({ ...p, assigned_to_name: e.target.value }))} />
            <input placeholder="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            <button type="submit">Add Asset</button>
          </form>
        </article>
      ) : (
        <p className="muted">Switch to Agent or Admin in Mock Login to add assets.</p>
      )}

      {error ? <p className="error">{error}</p> : null}

      <table>
        <thead>
          <tr><th>Tag</th><th>Type</th><th>Model</th><th>Serial</th><th>Status</th><th>Department</th><th>Assigned</th></tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>{asset.asset_tag}</td>
              <td>{asset.asset_type}</td>
              <td>{asset.model}</td>
              <td>{asset.serial_number}</td>
              <td>{asset.status}</td>
              <td>{asset.department || "-"}</td>
              <td>{asset.assigned_to_name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

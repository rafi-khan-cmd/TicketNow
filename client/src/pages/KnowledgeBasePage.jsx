import { useEffect, useState } from "react";
import { createKnowledgeBase, listKnowledgeBase } from "../api/tickets";
import { useAuth } from "../context/AuthContext";

const initialArticle = {
  title: "",
  category: "Software",
  tags: "",
  content: ""
};

export function KnowledgeBasePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialArticle);
  const [error, setError] = useState("");

  async function load(search = "") {
    try {
      const rows = await listKnowledgeBase({ q: search });
      setArticles(rows);
      setSelectedArticle(rows[0] || null);
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
      await createKnowledgeBase({
        title: form.title,
        category: form.category,
        tags: form.tags.split(",").map((x) => x.trim()).filter(Boolean),
        content: form.content
      });
      setForm(initialArticle);
      await load(query);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-title">
        <h2>Knowledge Base</h2>
        <p>Document common resolutions for recurring incidents.</p>
      </div>

      <div className="panel" style={{ marginBottom: "12px" }}>
        <input placeholder="Search articles" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" style={{ marginTop: "8px" }} onClick={() => load(query)}>Search</button>
      </div>

      {user.role === "Admin" || user.role === "Agent" ? (
        <article className="panel form-card" style={{ marginBottom: "12px" }}>
          <h3>Create Article</h3>
          <form className="stack" onSubmit={submit}>
            <input required placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              <option>Software</option><option>Hardware</option><option>Network</option><option>Access</option><option>Other</option>
            </select>
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
            <textarea required placeholder="Resolution steps" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
            <button type="submit">Publish Article</button>
          </form>
        </article>
      ) : (
        <p className="muted">Switch to Agent or Admin in Mock Login to publish KB articles.</p>
      )}

      {error ? <p className="error">{error}</p> : null}

      <div className="detail-grid">
        <article className="panel stack">
          <h3>Articles</h3>
          {articles.length === 0 ? <p className="muted">No KB articles found.</p> : null}
          {articles.map((article) => (
            <button
              key={article.id}
              type="button"
              className="note-item kb-list-item"
              style={{ textAlign: "left", background: selectedArticle?.id === article.id ? "#eff6ff" : "#fff" }}
              onClick={() => setSelectedArticle(article)}
            >
              <strong>{article.title}</strong>
              <p className="muted">{article.category} | {(article.tags || []).join(", ")}</p>
            </button>
          ))}
        </article>
        <article className="panel">
          <h3>Article Details</h3>
          {!selectedArticle ? <p className="muted">Select an article to read full content.</p> : null}
          {selectedArticle ? (
            <div className="stack">
              <strong>{selectedArticle.title}</strong>
              <p className="muted">{selectedArticle.category} | {(selectedArticle.tags || []).join(", ")}</p>
              <p>{selectedArticle.content}</p>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}

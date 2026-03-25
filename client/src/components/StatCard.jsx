export function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

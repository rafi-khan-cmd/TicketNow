import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function MockLoginPage() {
  const [name, setName] = useState("Avery Campbell");
  const [role, setRole] = useState("Agent");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  function login(e) {
    e.preventDefault();
    const userId = role === "Admin" ? 1 : role === "Agent" ? 2 : null;
    setUser({ name, role, userId });
    navigate("/dashboard");
  }

  return (
    <section className="login-page">
      <form className="panel stack" onSubmit={login}>
        <h2>Mock Login</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Requester</option>
          <option>Agent</option>
          <option>Admin</option>
        </select>
        <button type="submit">Enter Dashboard</button>
      </form>
    </section>
  );
}

import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialUser =
    JSON.parse(window.localStorage.getItem("ticketnow_user") || "null") || {
      role: "Agent",
      name: "Avery Campbell",
      userId: 1
    };
  const [user, setUserState] = useState(initialUser);

  const setUser = (next) => {
    setUserState(next);
    window.localStorage.setItem("ticketnow_user", JSON.stringify(next));
  };

  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

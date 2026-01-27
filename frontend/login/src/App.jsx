import { useMemo, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <div className="app-shell">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

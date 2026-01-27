import { useState } from "react";
import "./Login.css";

const API_BASE = "http://localhost:3000/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [mode, setMode] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const endpoint =
        mode === "signup" ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fallback =
          mode === "signup" ? "Signup failed" : "Login failed";
        setMessage({ type: "error", text: data.message || fallback });
        return;
      }

      if (mode === "signup") {
        setMessage({
          type: "success",
          text: "Account created! Please log in.",
        });
        setMode("login");
        setPassword("");
        return;
      }

      onLogin?.(data.token);
      setMessage({ type: "success", text: "Login successful ✅" });
    } catch (error) {
      setMessage({ type: "error", text: "Server error" });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card__intro">
          <p className="login-card__eyebrow">Inventory Suite</p>
          <h1>Log in to manage your products</h1>
          <p>
            Keep your store organized with real-time inventory tracking and a
            clean dashboard experience.
          </p>
          <div className="login-card__highlights">
            <span>✔ Fast product entry</span>
            <span>✔ Instant stock totals</span>
            <span>✔ Clean visual analytics</span>
          </div>
        </div>
        <div className="login-card__form">
          <h2>{mode === "signup" ? "Create an account" : "Welcome back"}</h2>
          <p className="login-card__subtitle">
            {mode === "signup"
              ? "Sign up to start tracking your inventory."
              : "Enter your account credentials to continue."}
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Username
              <input
                type="text"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit">
              {mode === "signup" ? "Create account" : "Login"}
            </button>
          </form>

          {message.text && (
            <p className={`login-message login-message--${message.type}`}>
              {message.text}
            </p>
          )}

          <button
            className="login-card__toggle"
            type="button"
            onClick={() => {
              setMessage({ type: "", text: "" });
              setMode((prev) => (prev === "login" ? "signup" : "login"));
            }}
          >
            {mode === "signup"
              ? "Already have an account? Log in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Login failed" });
        return;
      }

      console.log("Login successful:", data);

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
          <h2>Welcome back</h2>
          <p className="login-card__subtitle">
            Enter your account credentials to continue.
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

            <button type="submit">Login</button>
          </form>

          {message.text && (
            <p className={`login-message login-message--${message.type}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;

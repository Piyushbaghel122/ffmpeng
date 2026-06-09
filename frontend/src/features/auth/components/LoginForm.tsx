import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
  const { handleLogin, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLogin({ username, password });
  }

  return (
    <form className="auth-card" onSubmit={onSubmit}>
      <div className="brand-mark">F</div>
      <p className="eyebrow">Frameflow</p>
      <h1>Welcome back.</h1>
      <p className="muted">
        Sign in to upload reels and watch BullMQ process them.
      </p>

      <label>
        Username
        <input
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="piyush"
          required
        />
      </label>

      <label>
        Password
        <input
          autoComplete="current-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter any password for development"
          required
        />
      </label>

      {error ? <p className="error-message">{error}</p> : null}

      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="form-note">
        Development auth endpoint accepts any non-empty username and password.
      </p>
    </form>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (signErr) throw signErr;
      setSuccessMsg("Check your email to confirm your account.");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f1a] px-4">
      <div className="w-full max-w-md rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-8 shadow-[0_0_40px_rgba(124,58,237,0.12)]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-vscode-text">LearnPath AI</h1>
          <p className="mt-1 text-sm text-vscode-muted">
            Create your learning account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-vscode-muted">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border border-vscode-border bg-vscode-bg px-3 py-2 text-vscode-text outline-none focus:border-vscode-accent"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-vscode-muted">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-vscode-border bg-vscode-bg px-3 py-2 text-vscode-text outline-none focus:border-vscode-accent"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-vscode-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-vscode-border bg-vscode-bg px-3 py-2 text-vscode-text outline-none focus:border-vscode-accent"
              autoComplete="new-password"
            />
          </div>
          {error ? (
            <p className="text-sm text-vscode-error">{error}</p>
          ) : null}
          {successMsg ? (
            <p className="text-sm text-vscode-success">{successMsg}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 font-medium text-white transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-vscode-muted">
          Already have an account?{" "}
          <Link to="/" className="text-vscode-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

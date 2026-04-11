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
    <div className="flex min-h-screen items-center justify-center bg-vscode-bg px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-slate-950/95 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-slate-800">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-vscode-muted">
            Create your account
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Start building your course
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Signup and begin learning with personalized AI content.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
              autoComplete="new-password"
            />
          </div>
          {error ? <p className="text-sm text-vscode-error">{error}</p> : null}
          {successMsg ? (
            <p className="text-sm text-vscode-success">{successMsg}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-vscode-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-vscode-accent/90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-vscode-accent hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

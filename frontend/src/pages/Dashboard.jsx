import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getUserTopics } from "../api/learnpath";
import Navbar from "../components/Navbar";

function levelBadgeClass(level) {
  if (level === "Beginner")
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (level === "Intermediate")
    return "bg-amber-500/20 text-amber-200 border-amber-500/40";
  return "bg-red-500/20 text-red-300 border-red-500/40";
}

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      setError("");
      setLoading(true);
      try {
        const list = await getUserTopics(user.id);
        if (!cancelled) setTopics(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled)
          setError(
            e.response?.data?.error || e.message || "Failed to load topics",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-vscode-bg">
      <Navbar userEmail={user?.email} onLogout={handleLogout} />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[250px] shrink-0 flex-col border-r border-vscode-border bg-vscode-sidebar">
          <div className="border-b border-vscode-border p-3">
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-lg" aria-hidden>
                🧠
              </span>
              <span className="font-semibold text-vscode-text">
                LearnPath AI
              </span>
            </div>
            <Link
              to="/new-topic"
              className="block w-full rounded bg-vscode-accent py-2 text-center text-sm font-medium text-white hover:opacity-90"
            >
              New Topic
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-vscode-muted">
              Recent Topics
            </p>
            {loading ? (
              <p className="px-2 text-sm text-vscode-muted">Loading…</p>
            ) : error ? (
              <p className="px-2 text-sm text-vscode-error">{error}</p>
            ) : topics.length === 0 ? (
              <p className="px-2 text-sm text-vscode-muted">No topics yet</p>
            ) : (
              <ul className="space-y-1">
                {topics.map((t) => (
                  <li key={t._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${t._id}`)}
                      className="flex w-full flex-col gap-1 rounded border border-transparent px-2 py-2 text-left hover:border-vscode-border hover:bg-vscode-panel/50"
                    >
                      <span className="truncate text-sm font-medium text-vscode-text">
                        {t.topic_name}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${levelBadgeClass(t.level)}`}
                        >
                          {t.level}
                        </span>
                        <span className="text-[10px] text-vscode-muted">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString()
                            : ""}
                        </span>
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${t.completed ? "bg-vscode-success" : "bg-vscode-muted"}`}
                          title={t.completed ? "Completed" : "In progress"}
                        />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        <main className="flex flex-1 flex-col overflow-y-auto bg-vscode-bg p-8">
          {topics.length === 0 && !loading ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h2 className="mb-2 text-3xl font-semibold text-vscode-text">
                Welcome to LearnPath AI
              </h2>
              <p className="mb-8 max-w-md text-vscode-muted">
                Create your first learning topic to get started
              </p>
              <Link
                to="/new-topic"
                className="rounded-lg bg-vscode-accent px-8 py-3 font-medium text-white hover:opacity-90"
              >
                Create New Topic
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-medium text-vscode-text">
                Continue learning
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topics.slice(0, 6).map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => navigate(`/learn/${t._id}`)}
                    className="rounded-lg border border-vscode-border bg-vscode-sidebar p-4 text-left transition hover:border-vscode-accent/50"
                  >
                    <h3 className="mb-2 truncate font-medium text-vscode-text">
                      {t.topic_name}
                    </h3>
                    <p className="text-sm text-vscode-muted">
                      {t.completed
                        ? `Score: ${t.total_score ?? 0} / ${t.max_score ?? 0}`
                        : "In progress"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

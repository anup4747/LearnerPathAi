import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getUserTopics } from "../api/learnpath";
import Navbar from "../components/Navbar";
import FeedbackForm from "../components/FeedbackForm";

function levelBadgeClass(level) {
  if (level === "Beginner") return "bg-emerald-500/10 text-emerald-300";
  if (level === "Intermediate") return "bg-amber-500/10 text-amber-300";
  return "bg-rose-500/10 text-rose-300";
}

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

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

  function handleFeedback() {
    setShowFeedback(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-vscode-bg text-vscode-text">
      <Navbar userEmail={user?.email} onLogout={handleLogout} onFeedback={handleFeedback} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-[300px] shrink-0 border-r border-slate-800 bg-slate-950/95 px-6 py-6 max-h-screen overflow-y-auto">
          <div className="mb-8 rounded-[2rem] bg-slate-900/90 p-5 ring-1 ring-slate-800">
            <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
              Workspace
            </p>
            <h2 className="mt-3 text-lg font-semibold text-white">
              Your topics
            </h2>
            <Link
              to="/new-topic"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-vscode-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90"
            >
              + New Topic
            </Link>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
              Recent
            </p>
            {loading ? (
              <p className="text-sm text-vscode-muted">Loading topics…</p>
            ) : error ? (
              <p className="text-sm text-vscode-error">{error}</p>
            ) : topics.length === 0 ? (
              <p className="text-sm text-vscode-muted">No topics yet</p>
            ) : (
              <div className="space-y-3">
                {topics.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => navigate(`/learn/${t._id}`)}
                    className="w-full rounded-[1.75rem] bg-slate-900 px-4 py-4 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium truncate">
                        {t.topic_name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${levelBadgeClass(t.level)}`}
                      >
                        {t.level}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{t.completed ? "Completed" : "In progress"}</span>
                      <span>
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
        <main className="flex flex-1 flex-col min-h-0 overflow-y-auto px-8 py-8">
          {topics.length === 0 && !loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] bg-slate-950/95 p-12 ring-1 ring-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <h2 className="mb-4 text-3xl font-semibold text-white">
                Welcome to EduGen AI
              </h2>
              <p className="mb-8 max-w-xl text-center text-sm leading-7 text-slate-400">
                Create your first learning topic and let the system generate a
                full roadmap, lessons, and quizzes.
              </p>
              <Link
                to="/new-topic"
                className="rounded-full bg-vscode-accent px-7 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90"
              >
                Create topic
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-[2rem] bg-slate-950/95 p-8 ring-1 ring-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
                      Continue learning
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Pick up where you left off
                    </h2>
                  </div>
                  <Link
                    to="/new-topic"
                    className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    New topic
                  </Link>
                </div>
              </section>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {topics.slice(0, 6).map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => navigate(`/learn/${t._id}`)}
                    className="rounded-[2rem] bg-slate-950/95 p-6 text-left ring-1 ring-slate-800 shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-white truncate">
                        {t.topic_name}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${levelBadgeClass(t.level)}`}
                      >
                        {t.level}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-400">
                      {t.completed
                        ? `Score: ${t.total_score ?? 0} / ${t.max_score ?? 0}`
                        : "Continue this topic"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-[2rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <FeedbackForm user={user} onClose={() => setShowFeedback(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

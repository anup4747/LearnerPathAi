import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTopic } from "../api/learnpath";

const LEVELS = [
  { id: "Beginner", label: "Beginner", active: "bg-emerald-600/30 border-emerald-500 text-emerald-300" },
  { id: "Intermediate", label: "Intermediate", active: "bg-amber-600/30 border-amber-500 text-amber-200" },
  { id: "Advanced", label: "Advanced", active: "bg-red-600/30 border-red-500 text-red-300" },
];

export default function NewTopic({ user }) {
  const navigate = useNavigate();
  const [topicText, setTopicText] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!user?.id || !topicText.trim() || !level) return;
    setError("");
    setLoading(true);
    try {
      const res = await createTopic(user.id, topicText.trim(), level);
      const tid = res.topic_id;
      if (!tid) throw new Error("No topic id returned");
      navigate(`/loading/${tid}`);
    } catch (e) {
      setError(
        e.response?.data?.error || e.message || "Could not create topic",
      );
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = topicText.trim().length > 0 && level && !loading;

  return (
    <div className="min-h-screen bg-vscode-bg px-4 py-10">
      <div className="mx-auto max-w-[600px] rounded-lg border border-vscode-border bg-vscode-sidebar p-8">
        <h1 className="mb-6 text-center text-xl font-semibold text-vscode-text">
          What do you want to learn today?
        </h1>
        <textarea
          value={topicText}
          onChange={(e) => setTopicText(e.target.value)}
          rows={6}
          placeholder="e.g. Python for beginners, Machine Learning, React hooks, Data Structures..."
          className="mb-6 w-full resize-y rounded border border-vscode-border bg-vscode-bg p-4 text-vscode-text placeholder:text-vscode-muted outline-none focus:border-vscode-accent"
        />
        <p className="mb-2 text-xs uppercase tracking-wide text-vscode-muted">
          Level
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              className={`rounded border px-4 py-2 text-sm font-medium transition ${
                level === l.id
                  ? l.active
                  : "border-vscode-border bg-vscode-panel text-vscode-muted hover:border-vscode-accent/50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {error ? (
          <p className="mb-4 text-sm text-vscode-error">{error}</p>
        ) : null}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleGenerate}
          className="w-full rounded bg-gradient-to-r from-violet-600 to-purple-600 py-3 font-medium text-white transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Generating…" : "Generate Learning Path"}
        </button>
      </div>
    </div>
  );
}

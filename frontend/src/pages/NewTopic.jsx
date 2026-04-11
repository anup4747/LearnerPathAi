import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTopic } from "../api/learnpath";

const LEVELS = [
  { id: "Beginner", label: "Beginner" },
  { id: "Intermediate", label: "Intermediate" },
  { id: "Advanced", label: "Advanced" },
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
    <div className="min-h-screen bg-vscode-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-slate-950/95 p-10 ring-1 ring-slate-800 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
            New topic
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Create a tailored learning path.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            Enter what you want to learn and choose a level. The AI will build a
            clean roadmap, chapter content, and quizzes.
          </p>
        </div>
        <div className="space-y-6">
          <label className="block text-sm font-medium text-white">
            Learning topic
          </label>
          <textarea
            value={topicText}
            onChange={(e) => setTopicText(e.target.value)}
            rows={5}
            placeholder="e.g. React hooks, Python for data science, product design fundamentals"
            className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-900 px-5 py-4 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
          />
          <div>
            <p className="mb-3 text-sm font-medium text-white">Difficulty</p>
            <div className="flex flex-wrap gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    level === l.id
                      ? "border-vscode-accent bg-vscode-accent/10 text-vscode-accent"
                      : "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-vscode-error">{error}</p> : null}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleGenerate}
            className="inline-flex w-full items-center justify-center rounded-full bg-vscode-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate learning path"}
          </button>
        </div>
      </div>
    </div>
  );
}

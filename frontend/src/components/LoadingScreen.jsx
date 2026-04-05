import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { checkStatus } from "../api/learnpath";

const STEPS = [
  "Analyzing your topic…",
  "Creating roadmap…",
  "Writing chapter blogs…",
  "Generating quizzes…",
  "Finalizing your course…",
];

export default function LoadingScreen() {
  const { topic_id } = useParams();
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setVisibleSteps((s) => Math.max(s, i + 1)), i * 3000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!topic_id) return undefined;
    let cancelled = false;
    const poll = async () => {
      try {
        const { status } = await checkStatus(topic_id);
        if (cancelled) return;
        if (status === "completed") {
          navigate(`/learn/${topic_id}`, { replace: true });
        } else if (status === "failed") {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [topic_id, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vscode-bg px-6">
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-vscode-accent/40 text-4xl shadow-[0_0_30px_rgba(124,58,237,0.35)]"
        style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
      >
        ✨
      </div>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes bounce-dots {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <h1 className="mb-8 text-center text-xl font-semibold text-vscode-text">
        Building Your Learning Path…
      </h1>
      {failed ? (
        <div className="mb-8 max-w-md text-center">
          <p className="mb-4 text-vscode-error">
            Something went wrong while generating your course. Check your API
            keys and MongoDB, then try creating a topic again.
          </p>
          <Link
            to="/dashboard"
            className="text-vscode-accent hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <ul className="mb-8 w-full max-w-md space-y-3">
          {STEPS.map((label, i) => {
            const show = i < visibleSteps;
            const done = i < visibleSteps - 1 || visibleSteps > i + 1;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded border border-vscode-border bg-vscode-sidebar px-4 py-2 text-sm transition ${
                  show ? "opacity-100" : "opacity-0"
                }`}
              >
                <span
                  className={
                    done
                      ? "text-vscode-success"
                      : show
                        ? "text-vscode-accent"
                        : "text-vscode-muted"
                  }
                >
                  {done ? "✓" : "○"}
                </span>
                <span className="text-vscode-text">{label}</span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mb-4 flex gap-1">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="h-2 w-2 rounded-full bg-vscode-accent"
            style={{
              animation: `bounce-dots 1.2s ease-in-out ${d * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-vscode-muted">
        This may take 1–2 minutes
      </p>
    </div>
  );
}

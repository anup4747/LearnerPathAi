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
      setTimeout(() => setVisibleSteps((s) => Math.max(s, i + 1)), i * 2500),
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-vscode-bg px-6 py-12">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-slate-800">
        <span className="text-4xl">✨</span>
      </div>
      <h1 className="mb-8 text-center text-2xl font-semibold text-white">
        Building your learning path…
      </h1>
      <div className="w-full max-w-xl rounded-[2rem] bg-slate-950/95 p-8 ring-1 ring-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        {failed ? (
          <div className="space-y-4 text-center">
            <p className="text-sm leading-7 text-slate-400">
              Something went wrong while generating your course. Refresh and try
              again, or head back to your dashboard.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex rounded-full bg-vscode-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-vscode-accent/90"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {STEPS.map((label, i) => {
              const active = i < visibleSteps;
              const done = i < visibleSteps - 1 || visibleSteps > i + 1;
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between rounded-[1.5rem] px-4 py-4 transition ${
                    done
                      ? "bg-slate-900/80"
                      : active
                        ? "bg-slate-800/80"
                        : "bg-slate-950/70"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {done ? "Completed" : active ? "In progress" : "Waiting"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      done
                        ? "bg-emerald-500/10 text-emerald-300"
                        : active
                          ? "bg-vscode-accent/10 text-vscode-accent"
                          : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {done ? "Done" : active ? "Active" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-10 flex gap-2 text-xs text-slate-500">
        <span className={visibleSteps > 0 ? "text-white" : "text-slate-500"}>
          •
        </span>
        <span className={visibleSteps > 1 ? "text-white" : "text-slate-500"}>
          •
        </span>
        <span className={visibleSteps > 2 ? "text-white" : "text-slate-500"}>
          •
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-400">This may take 1–2 minutes.</p>
    </div>
  );
}

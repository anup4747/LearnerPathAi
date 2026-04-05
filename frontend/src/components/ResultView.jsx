import { useEffect, useState } from "react";
import { completeTopic, getResults } from "../api/learnpath";

function pctColor(pct) {
  if (pct > 70) return "text-vscode-success";
  if (pct >= 50) return "text-vscode-warning";
  return "text-vscode-error";
}

function barColor(pct) {
  if (pct > 70) return "bg-vscode-success";
  if (pct >= 50) return "bg-vscode-warning";
  return "bg-vscode-error";
}

export default function ResultView({ topicId, topicName, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const r = await getResults(topicId);
        if (!cancelled) setData(r);
      } catch (e) {
        if (!cancelled)
          setError(e.response?.data?.error || e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  useEffect(() => {
    if (!data?.all_completed || synced || !topicId) return;
    const max = data.max_score || 0;
    const tot = data.total_score || 0;
    if (max <= 0) return;
    (async () => {
      try {
        await completeTopic(topicId, tot, max);
        setSynced(true);
      } catch {
        /* non-fatal */
      }
    })();
  }, [data, topicId, synced]);

  if (loading) {
    return (
      <div className="p-6 text-vscode-muted">Loading results…</div>
    );
  }
  if (error) {
    return <div className="p-6 text-vscode-error">{error}</div>;
  }

  const assessments = data?.assessments || [];
  const completed = assessments.filter((a) => a.score != null);
  const total = data?.total_score ?? 0;
  const max = data?.max_score ?? 0;
  const pct = max ? Math.round((total / max) * 1000) / 10 : 0;

  let message = "Keep practicing! Review the chapters and try again.";
  if (pct > 80) message = "Outstanding! You have mastered this topic!";
  else if (pct >= 60) message = "Great job! You have a solid understanding!";

  const passedOverall = pct >= 60;

  return (
    <div className="overflow-y-auto p-6 text-vscode-text">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            🏆
          </span>
          <div>
            <h1 className="text-2xl font-bold">Course Completed!</h1>
            <p className="text-sm text-vscode-muted">{topicName}</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-vscode-border px-3 py-1 text-sm text-vscode-muted hover:bg-vscode-panel"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="mb-8 rounded-lg border border-vscode-border bg-vscode-sidebar p-6">
        <p className="text-sm text-vscode-muted">Overall score</p>
        <p className="text-4xl font-bold">
          {total}{" "}
          <span className="text-2xl text-vscode-muted">/ {max}</span>
        </p>
        <p className={`mt-2 text-xl font-semibold ${pctColor(pct)}`}>
          {pct}%
        </p>
        <span
          className={`mt-3 inline-block rounded px-2 py-1 text-sm font-medium ${
            passedOverall
              ? "bg-vscode-success/20 text-vscode-success"
              : "bg-vscode-error/20 text-vscode-error"
          }`}
        >
          {passedOverall ? "Pass" : "Needs review"}
        </span>
      </div>

      <h2 className="mb-3 text-lg font-medium">Breakdown</h2>
      <div className="mb-8 overflow-x-auto rounded border border-vscode-border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-vscode-panel text-vscode-muted">
            <tr>
              <th className="p-3 font-medium">Assessment</th>
              <th className="p-3 font-medium">Score</th>
              <th className="p-3 font-medium">Max</th>
              <th className="p-3 font-medium">%</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((a) => {
              const p = a.percentage ?? 0;
              const pass =
                a.type === "exam"
                  ? a.passed
                  : p >= 60;
              return (
                <tr
                  key={a.id}
                  className="border-t border-vscode-border bg-vscode-sidebar/50"
                >
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.score}</td>
                  <td className="p-3">{a.max_score}</td>
                  <td className={`p-3 font-medium ${pctColor(p)}`}>
                    {a.percentage != null ? `${a.percentage}%` : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        pass
                          ? "text-vscode-success"
                          : "text-vscode-error"
                      }
                    >
                      {pass ? "Pass" : "Fail"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-lg font-medium">Performance</h2>
      <div className="mb-8 flex h-40 items-end gap-2 border-b border-vscode-border pb-1 pl-1">
        {completed.map((a) => {
          const p = a.percentage ?? 0;
          const h = Math.min(100, Math.max(4, p));
          return (
            <div
              key={a.id}
              className="flex min-w-[40px] flex-1 flex-col items-center gap-1"
            >
              <div
                className={`w-full max-w-[48px] rounded-t ${barColor(p)}`}
                style={{ height: `${h}%` }}
                title={`${a.name}: ${p}%`}
              />
              <span className="max-w-full truncate text-[10px] text-vscode-muted">
                {a.name.replace("Exam", "").trim()}
              </span>
            </div>
          );
        })}
      </div>

      <p className="rounded-lg border border-vscode-border bg-vscode-panel/50 p-4 text-center text-vscode-muted">
        {message}
      </p>
    </div>
  );
}

import { useMemo, useState } from "react";
import { submitQuiz } from "../api/learnpath";

export default function QuizView({
  quiz,
  chapterNumber,
  onContinue,
  onRefresh,
}) {
  const questions = quiz?.questions || [];
  const total = questions.length || 5;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => answers[k]).length,
    [answers],
  );

  function selectOption(letter) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [String(current)]: letter }));
  }

  async function handleSubmit() {
    setError("");
    let correct = 0;
    questions.forEach((q, i) => {
      const u = answers[String(i)];
      if (u && q.correct_answer === u) correct += 1;
    });
    setScore(correct);
    setSubmitted(true);
    setSaving(true);
    try {
      await submitQuiz(quiz._id, answers, correct);
      if (onRefresh) await onRefresh();
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const q = questions[current];
  const progress = ((current + 1) / total) * 100;

  if (questions.length === 0) {
    return (
      <div className="p-6 text-vscode-muted">
        Quiz questions are still loading or unavailable. Close this tab and try
        again in a moment.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6 text-vscode-text">
      <h2 className="mb-1 text-xl font-semibold">
        Chapter {chapterNumber} Quiz
      </h2>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded bg-vscode-panel">
        <div
          className="h-full bg-vscode-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!submitted ? (
        <>
          <div className="mb-6 flex-1 rounded-lg border border-vscode-border bg-vscode-sidebar p-6">
            <p className="mb-4 text-sm text-vscode-muted">
              Question {current + 1} of {total}
            </p>
            <p className="mb-6 text-vscode-text">{q?.question}</p>
            <div className="grid gap-2">
              {["A", "B", "C", "D"].map((L) => {
                const text = q?.options?.[L] ?? "";
                const selected = answers[String(current)] === L;
                return (
                  <button
                    key={L}
                    type="button"
                    onClick={() => selectOption(L)}
                    className={`flex gap-3 rounded border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-vscode-accent bg-vscode-accent/20"
                        : "border-vscode-border bg-vscode-bg hover:border-vscode-accent/40"
                    }`}
                  >
                    <span className="font-mono font-bold text-vscode-accent">
                      {L}
                    </span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {error ? (
            <p className="mb-2 text-sm text-vscode-error">{error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="rounded border border-vscode-border bg-vscode-panel px-4 py-2 text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={current >= total - 1}
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              className="rounded border border-vscode-border bg-vscode-panel px-4 py-2 text-sm disabled:opacity-30"
            >
              Next
            </button>
            <button
              type="button"
              disabled={answeredCount < total || saving}
              onClick={handleSubmit}
              className="ml-auto rounded bg-vscode-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {saving ? "Saving…" : "Submit Quiz"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 space-y-4 overflow-y-auto">
            {questions.map((qq, i) => {
              const u = answers[String(i)];
              const ok = u === qq.correct_answer;
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${
                    ok
                      ? "border-vscode-success/50 bg-vscode-success/5"
                      : "border-vscode-error/50 bg-vscode-error/5"
                  }`}
                >
                  <p className="mb-2 font-medium">{qq.question}</p>
                  <p className="text-sm text-vscode-muted">
                    Your answer: <strong>{u || "—"}</strong> — Correct:{" "}
                    <strong>{qq.correct_answer}</strong>
                  </p>
                  <p className="mt-2 text-sm text-vscode-muted">
                    {qq.explanation}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mb-2 text-lg font-semibold">
            Score: {score}/{total}
          </p>
          {score < 3 ? (
            <p className="mb-4 rounded border border-vscode-warning/40 bg-vscode-warning/10 px-3 py-2 text-sm text-vscode-warning">
              We suggest re-reading the chapter before moving on.
            </p>
          ) : null}
          <button
            type="button"
            onClick={onContinue}
            className="rounded bg-vscode-panel px-4 py-2 text-sm ring-1 ring-vscode-border hover:bg-vscode-border/30"
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
}

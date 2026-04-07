import { useMemo, useState } from "react";
import { submitQuiz } from "../api/learnpath";

export default function QuizView({
  quiz,
  chapterNumber,
  onContinue,
  onRefresh,
}) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const total = questions.length || 5;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  const isLastQuestion = current === total - 1;
  const allAnswered = useMemo(
    () =>
      questions.length > 0 &&
      questions.every((_, idx) => Boolean(answers[String(idx)])),
    [questions, answers],
  );

  const canSubmit = !saving && isLastQuestion && Boolean(answers[String(current)]);

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
          <div className="mb-6 flex-1 rounded-[1.75rem] bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Question {current + 1} of {total}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {q?.question}
                </h3>
              </div>
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {allAnswered ? "Complete" : `${answeredCount} answered`}
              </span>
            </div>
            <div className="grid gap-3">
              {["A", "B", "C", "D"].map((L) => {
                const text = q?.options?.[L] ?? "";
                const selected = answers[String(current)] === L;
                return (
                  <button
                    key={L}
                    type="button"
                    onClick={() => selectOption(L)}
                    className={`flex gap-4 rounded-3xl px-4 py-4 text-left text-sm transition ${
                      selected
                        ? "bg-vscode-accent/15 text-white ring-1 ring-vscode-accent"
                        : "bg-slate-900/90 text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 font-mono font-semibold text-slate-300">
                      {L}
                    </span>
                    <span className="max-w-[calc(100%-4rem)] truncate">{text}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {error ? (
            <p className="mb-2 text-sm text-rose-400">{error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={current >= total - 1}
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="ml-auto rounded-full bg-vscode-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-vscode-accent/90 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Submit Quiz"}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {isLastQuestion
              ? allAnswered
                ? "Ready to submit your quiz."
                : "Only the last question can submit the quiz. Unanswered questions will be counted as incorrect."
              : "Only the final question will allow quiz submission."}
          </p>
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
                  className={`rounded-[1.75rem] p-5 transition ${
                    ok
                      ? "bg-slate-950/95 ring-1 ring-emerald-500/10"
                      : "bg-slate-950/90 ring-1 ring-rose-500/10"
                  }`}
                >
                  <p className="mb-3 text-base font-semibold text-white">
                    {qq.question}
                  </p>
                  <p className="text-sm text-slate-400">
                    Your answer: <strong className="text-white">{u || "—"}</strong> — Correct: <strong className="text-white">{qq.correct_answer}</strong>
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {qq.explanation}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mb-4 rounded-[1.75rem] bg-slate-950/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Final result
            </p>
            <div className="mt-3 flex items-center gap-4">
              <p className="text-3xl font-semibold text-white">
                {score}/{total}
              </p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${
                score / total >= 0.75
                  ? "bg-emerald-500/10 text-emerald-300"
                  : score / total >= 0.5
                    ? "bg-amber-500/10 text-amber-300"
                    : "bg-rose-500/10 text-rose-300"
              }`}>
                {Math.round((score / total) * 100)}%
              </span>
            </div>
            {score < 3 ? (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                We recommend revisiting the chapter content before continuing.
              </p>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Great work — you can move to the next chapter with confidence.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-vscode-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90"
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
}

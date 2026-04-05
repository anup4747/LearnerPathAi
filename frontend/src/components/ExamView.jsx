import { useMemo, useState } from "react";
import { submitExam } from "../api/learnpath";

function mcqMarksPerQuestion(exam) {
  const n = (exam?.mcq_questions || []).length;
  if (!n) return 0;
  const totalMcq =
    exam.exam_type === "final" ? 15 : Math.min(10, exam.total_marks || 30);
  return totalMcq / n;
}

export default function ExamView({
  exam,
  topicName,
  onDone,
  onRefresh,
  courseSummary,
}) {
  const mcqs = exam?.mcq_questions || [];
  const shorts = exam?.short_questions || [];
  const isFinal = exam?.exam_type === "final";
  let capstone = exam?.capstone_parsed;
  if (!capstone && exam?.capstone && typeof exam.capstone === "string") {
    try {
      capstone = JSON.parse(exam.capstone);
    } catch {
      capstone = null;
    }
  }
  const practical = exam?.practical_task || null;

  const [phase, setPhase] = useState(0);
  const [mcqIdx, setMcqIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [shortText, setShortText] = useState({});
  const [shortMarks, setShortMarks] = useState([]);
  const [shortRevealed, setShortRevealed] = useState(false);
  const [projectText, setProjectText] = useState("");
  const [projectMarks, setProjectMarks] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const marksEachMcq = useMemo(() => mcqMarksPerQuestion(exam), [exam]);
  const passMarks = exam?.pass_marks ?? (isFinal ? 35 : 20);
  const maxMarks = exam?.total_marks ?? (isFinal ? 50 : 30);

  const mcqScore = useMemo(() => {
    let s = 0;
    mcqs.forEach((q, i) => {
      if (mcqAnswers[String(i)] === q.correct_answer) s += marksEachMcq;
    });
    return Math.round(s * 100) / 100;
  }, [mcqs, mcqAnswers, marksEachMcq]);

  function initShortMarks() {
    setShortMarks(shorts.map((sh) => sh.marks || 5));
  }

  async function finalizeExam() {
    setError("");
    const shortTotal = shortRevealed
      ? shortMarks.reduce((a, b) => a + (Number(b) || 0), 0)
      : 0;
    const projMax = isFinal
      ? capstone?.marks ?? 20
      : practical?.marks ?? 10;
    const projScore = Math.min(Number(projectMarks) || 0, projMax);
    const shortMax = shorts.reduce((a, sh) => a + (sh.marks || 5), 0);
    const shortActual = Math.min(shortTotal, shortMax);
    const total = Math.min(
      maxMarks,
      Math.round((mcqScore + shortActual + projScore) * 100) / 100,
    );
    const user_answers = {
      mcq: mcqAnswers,
      short: shortText,
      short_marks: shortMarks,
      project: projectText,
      project_marks: projScore,
    };
    setSaving(true);
    try {
      await submitExam(exam._id, user_answers, total);
      if (onRefresh) await onRefresh();
      if (onDone)
        await Promise.resolve(onDone(total, maxMarks, passMarks, isFinal));
      setTotalScore(total);
      setSubmitted(true);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const mcq = mcqs[mcqIdx];

  if (submitted && totalScore !== null) {
    const passed = totalScore >= passMarks;
    return (
      <div className="relative overflow-hidden p-6 text-vscode-text">
        {isFinal && passed ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-sm opacity-80"
                style={{
                  left: `${(i * 13) % 100}%`,
                  top: "-10px",
                  background: ["#7c3aed", "#4ec9b0", "#dcdcaa", "#f44747"][
                    i % 4
                  ],
                  animation: `confetti-fall ${2 + (i % 5) * 0.2}s linear forwards`,
                  animationDelay: `${(i % 8) * 0.08}s`,
                }}
              />
            ))}
            <style>{`
              @keyframes confetti-fall {
                to {
                  transform: translateY(120vh) rotate(720deg);
                  opacity: 0.6;
                }
              }
            `}</style>
          </div>
        ) : null}
        <div className="relative z-10">
          <h2 className="mb-4 text-xl font-semibold">Exam results</h2>
          <div className="mb-4 rounded-lg border border-vscode-border bg-vscode-sidebar p-4">
            <p className="text-lg">
              Total score:{" "}
              <strong>
                {totalScore} / {maxMarks}
              </strong>
            </p>
            <p
              className={`mt-2 inline-block rounded px-2 py-1 text-sm font-medium ${
                passed
                  ? "bg-vscode-success/20 text-vscode-success"
                  : "bg-vscode-error/20 text-vscode-error"
              }`}
            >
              {passed ? "Pass" : "Fail"}
            </p>
          </div>
          {isFinal && passed ? (
            <div className="rounded-lg border border-vscode-accent/40 bg-vscode-accent/10 p-6 text-center">
              <h3 className="mb-2 text-2xl font-bold text-vscode-text">
                Course Completed!
              </h3>
              {courseSummary ? (
                <p className="text-sm text-vscode-muted">
                  Overall course score: {courseSummary.total} /{" "}
                  {courseSummary.max} ({courseSummary.pct}%)
                </p>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-vscode-error">{error}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (phase === 0) {
    const n = mcqs.length;
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6 text-vscode-text">
        <h2 className="mb-2 text-xl font-semibold">
          {isFinal ? "Final Exam" : "Midterm Exam"} — MCQ
        </h2>
        <div className="mb-4 h-1.5 w-full rounded bg-vscode-panel">
          <div
            className="h-full bg-vscode-accent transition-all"
            style={{
              width: `${n ? ((mcqIdx + 1) / n) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="mb-6 flex-1 rounded-lg border border-vscode-border bg-vscode-sidebar p-6">
          <p className="mb-4 text-sm text-vscode-muted">
            Question {mcqIdx + 1} of {n}
          </p>
          <p className="mb-6">{mcq?.question}</p>
          <div className="grid gap-2">
            {["A", "B", "C", "D"].map((L) => {
              const text = mcq?.options?.[L] ?? "";
              const selected = mcqAnswers[String(mcqIdx)] === L;
              return (
                <button
                  key={L}
                  type="button"
                  onClick={() =>
                    setMcqAnswers((a) => ({ ...a, [String(mcqIdx)]: L }))
                  }
                  className={`flex gap-3 rounded border px-4 py-3 text-left text-sm ${
                    selected
                      ? "border-vscode-accent bg-vscode-accent/20"
                      : "border-vscode-border bg-vscode-bg"
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
        <div className="flex gap-2">
          <button
            type="button"
            disabled={mcqIdx === 0}
            onClick={() => setMcqIdx((i) => Math.max(0, i - 1))}
            className="rounded border border-vscode-border px-4 py-2 text-sm disabled:opacity-30"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={mcqIdx >= n - 1}
            onClick={() => setMcqIdx((i) => Math.min(n - 1, i + 1))}
            className="rounded border border-vscode-border px-4 py-2 text-sm disabled:opacity-30"
          >
            Next
          </button>
          <button
            type="button"
            disabled={
              Object.keys(mcqAnswers).length < n ||
              Object.keys(mcqAnswers).some((k) => !mcqAnswers[k])
            }
            onClick={() => {
              initShortMarks();
              setPhase(1);
            }}
            className="ml-auto rounded bg-vscode-accent px-4 py-2 text-sm text-white"
          >
            Next section
          </button>
        </div>
      </div>
    );
  }

  if (phase === 1) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 text-vscode-text">
        <h2 className="mb-4 text-xl font-semibold">Short answers</h2>
        <div className="space-y-6">
          {shorts.map((sh, i) => (
            <div
              key={i}
              className="rounded-lg border border-vscode-border bg-vscode-sidebar p-4"
            >
              <p className="mb-2 font-medium">{sh.question}</p>
              <textarea
                value={shortText[String(i)] || ""}
                onChange={(e) =>
                  setShortText((t) => ({ ...t, [String(i)]: e.target.value }))
                }
                disabled={shortRevealed}
                rows={4}
                className="w-full resize-y rounded border border-vscode-border bg-vscode-bg p-2 text-sm text-vscode-text"
              />
              {shortRevealed ? (
                <div className="mt-3 border-t border-vscode-border pt-3">
                  <p className="mb-2 text-xs text-vscode-muted">
                    Expected answer
                  </p>
                  <p className="mb-3 text-sm text-vscode-muted">
                    {sh.expected_answer}
                  </p>
                  <label className="flex items-center gap-3 text-sm">
                    Rate yourself (0 – {sh.marks || 5} marks)
                    <input
                      type="range"
                      min={0}
                      max={sh.marks || 5}
                      value={shortMarks[i] ?? 0}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setShortMarks((m) => {
                          const next = [...m];
                          next[i] = v;
                          return next;
                        });
                      }}
                      className="flex-1"
                    />
                    <span>{shortMarks[i] ?? 0}</span>
                  </label>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          {!shortRevealed ? (
            <>
              <button
                type="button"
                onClick={() => setPhase(0)}
                className="rounded border border-vscode-border px-4 py-2 text-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  initShortMarks();
                  setShortRevealed(true);
                }}
                className="rounded bg-vscode-accent px-4 py-2 text-sm text-white"
              >
                Reveal answers & rate yourself
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPhase(2)}
                className="rounded bg-vscode-accent px-4 py-2 text-sm text-white"
              >
                Next section
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const projMax = isFinal ? capstone?.marks ?? 20 : practical?.marks ?? 10;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 text-vscode-text">
      <h2 className="mb-4 text-xl font-semibold">
        {isFinal ? "Capstone project" : "Practical task"}
      </h2>
      {isFinal && capstone ? (
        <div className="mb-4 rounded-lg border border-vscode-border bg-vscode-sidebar p-4">
          <h3 className="mb-2 font-medium">{capstone.title}</h3>
          <p className="mb-3 text-sm text-vscode-muted">
            {capstone.problem_statement}
          </p>
          <p className="mb-1 text-xs uppercase text-vscode-muted">
            Requirements
          </p>
          <ul className="mb-3 list-inside list-disc text-sm text-vscode-muted">
            {(capstone.requirements || []).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mb-1 text-xs uppercase text-vscode-muted">
            Evaluation criteria
          </p>
          <ul className="list-inside list-disc text-sm text-vscode-muted">
            {(capstone.evaluation_criteria || []).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {!isFinal && practical ? (
        <div className="mb-4 rounded-lg border border-vscode-border bg-vscode-sidebar p-4">
          <p className="mb-2 font-medium">{practical.question}</p>
          <p className="text-sm text-vscode-muted">{practical.description}</p>
        </div>
      ) : null}
      <textarea
        value={projectText}
        onChange={(e) => setProjectText(e.target.value)}
        rows={8}
        placeholder="Write your plan or solution…"
        className="mb-4 w-full resize-y rounded border border-vscode-border bg-vscode-bg p-3 text-sm"
      />
      <label className="mb-6 flex items-center gap-3 text-sm">
        Rate yourself (0 – {projMax} marks)
        <input
          type="range"
          min={0}
          max={projMax}
          value={projectMarks}
          onChange={(e) => setProjectMarks(Number(e.target.value))}
          className="flex-1"
        />
        <span>{projectMarks}</span>
      </label>
      {error ? (
        <p className="mb-2 text-sm text-vscode-error">{error}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPhase(1)}
          className="rounded border border-vscode-border px-4 py-2 text-sm"
        >
          Back
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={finalizeExam}
          className="rounded bg-vscode-accent px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Submit exam"}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ExamView from "../components/ExamView";
import { getExam } from "../api/learnpath";

export default function Exam() {
  const { topic_id, exam_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(location.state?.exam ?? null);
  const [topicName] = useState(location.state?.topicName ?? "");
  const [loading, setLoading] = useState(!exam);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (exam || !exam_id) return;

    const loadExam = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getExam(exam_id);
        if (cancelled) return;
        setExam(data);
      } catch (e) {
        if (!cancelled)
          setError(
            e.response?.data?.error || e.message || "Failed to load exam",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadExam();
    return () => {
      cancelled = true;
    };
  }, [exam, exam_id]);

  return (
    <div className="min-h-screen bg-vscode-bg text-vscode-text">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-vscode-muted">
              Exam preparation for {topicName || "your course"}
            </p>
            <h1 className="text-3xl font-semibold text-white">Exam mode</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/learn/${topic_id}`)}
            className="rounded-full border border-vscode-border bg-vscode-sidebar px-4 py-2 text-sm text-vscode-text transition hover:bg-vscode-panel"
          >
            Back to course
          </button>
        </div>

        <div className="rounded-[2rem] border border-vscode-border bg-vscode-sidebar p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          {loading ? (
            <div className="p-6 text-vscode-muted">Loading exam…</div>
          ) : error ? (
            <div className="space-y-4 p-6">
              <p className="text-vscode-error">{error}</p>
              <button
                type="button"
                onClick={() => navigate(`/learn/${topic_id}`)}
                className="rounded-full bg-vscode-accent px-4 py-2 text-white"
              >
                Return to course
              </button>
            </div>
          ) : (
            <ExamView exam={exam} topicName={topicName} />
          )}
        </div>
      </div>
    </div>
  );
}

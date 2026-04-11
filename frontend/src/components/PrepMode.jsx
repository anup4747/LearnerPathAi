import { useState, useEffect } from "react";
import { generateExam, getExams } from "../api/learnpath";

export default function PrepMode({ topicId, topicName, userId, onStartExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examData = await getExams(topicId);
        setExams(Array.isArray(examData) ? examData : []);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [topicId]);

  async function handleCreateExam() {
    if (!userId) return;
    setMessage("");
    setGenerating(true);
    try {
      const generated = await generateExam(userId, topicId);
      setExams((prev) => [generated, ...prev]);
      setMessage("Exam generated successfully. Starting now...");
      onStartExam(generated);
    } catch (error) {
      console.error("Failed to generate exam:", error);
      setMessage(
        error.response?.data?.error || error.message || "Failed to create exam",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-vscode-bg p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-vscode-text">
          Exam Preparation Mode
        </h2>
        <p className="mb-4 text-vscode-muted">
          Review key concepts and take practice exams for {topicName}.
        </p>
        <button
          onClick={handleCreateExam}
          disabled={generating || loading || !userId}
          className="mb-4 w-full rounded bg-vscode-success px-4 py-2 text-white hover:bg-vscode-success/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "Generating exam…" : "Generate exam from quiz pain points"}
        </button>
        {message ? (
          <p className="mb-4 text-sm text-vscode-muted">{message}</p>
        ) : null}
        {loading ? (
          <p className="text-vscode-muted">Loading exams...</p>
        ) : exams.length > 0 ? (
          <div className="space-y-2">
            {exams.map((exam) => (
              <button
                key={exam._id}
                onClick={() => onStartExam(exam)}
                className="w-full rounded bg-vscode-accent px-4 py-2 text-white hover:bg-vscode-accent/90"
              >
                Start Exam: {exam.title || `Exam ${exam.exam_number}`}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-vscode-muted">No exams available yet.</p>
        )}
        <button
          onClick={() => onStartExam(null)}
          className="mt-4 w-full rounded border border-vscode-border px-4 py-2 text-vscode-text hover:bg-vscode-panel"
        >
          Close
        </button>
      </div>
    </div>
  );
}

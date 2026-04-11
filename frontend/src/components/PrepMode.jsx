import { useState, useEffect } from "react";
import { getExams } from "../api/learnpath";

export default function PrepMode({ topicId, topicName, onStartExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-vscode-bg p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-vscode-text">
          Exam Preparation Mode
        </h2>
        <p className="mb-4 text-vscode-muted">
          Review key concepts and take practice exams for {topicName}.
        </p>
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

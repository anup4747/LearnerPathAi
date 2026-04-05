import ExamCard from "../components/ExamCard";

export default function Exam() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
          <h1 className="text-4xl font-semibold text-white">Exam Experience</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Mid-course and final exams are generated in the same AI-driven flow
            to help you measure progress and retention.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ExamCard
            title="Mid-course Exam"
            description="Ten MCQs, short answers, and a small project task. Total 30 points."
            points={30}
          />
          <ExamCard
            title="Final Exam"
            description="Fifteen MCQs, short answers, and a capstone challenge. Total 50 points."
            points={50}
          />
        </div>
      </div>
    </main>
  );
}

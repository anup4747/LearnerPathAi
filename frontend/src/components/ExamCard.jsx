export default function ExamCard({ title, description, points }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-indigo-300">
        <span>{title}</span>
        <span>{points} pts</span>
      </div>
      <p className="mb-5 text-sm leading-7 text-slate-300">{description}</p>
      <div className="inline-flex rounded-full bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        Designed for mastery progress
      </div>
    </div>
  );
}

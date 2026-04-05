export default function ChapterContent({ title, summary, bullets }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
      <h3 className="mb-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mb-5 text-sm leading-7 text-slate-300">{summary}</p>
      <ul className="space-y-3 text-sm text-slate-300">
        {bullets.map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="mt-1 text-indigo-400">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

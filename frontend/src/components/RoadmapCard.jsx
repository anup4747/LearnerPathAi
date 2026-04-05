export default function RoadmapCard({
  chapter,
  title,
  description,
  estimate,
  difficulty,
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft transition hover:-translate-y-1 hover:border-indigo-500/40">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-indigo-300">
        <span>{chapter}</span>
        <span>{difficulty}</span>
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mb-5 text-sm leading-7 text-slate-300">{description}</p>
      <div className="inline-flex rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        {estimate}
      </div>
    </div>
  );
}

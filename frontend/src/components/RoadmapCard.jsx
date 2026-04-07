export default function RoadmapCard({
  chapter,
  title,
  description,
  estimate,
  difficulty,
  tags = [],
  status,
}) {
  return (
    <article className="rounded-[1.75rem] bg-slate-950/95 p-6 transition duration-200 ease-out hover:bg-slate-900/95">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            {chapter}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-right sm:items-end">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {difficulty}
          </span>
          {status ? (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
              {status}
            </span>
          ) : null}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-900 px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex justify-between text-xs text-slate-500">
        <span>{estimate}</span>
      </div>
    </article>
  );
}

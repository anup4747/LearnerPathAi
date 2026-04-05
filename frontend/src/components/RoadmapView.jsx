function badgeDifficulty(d) {
  if (d === "Beginner") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (d === "Intermediate") return "bg-amber-500/20 text-amber-200 border-amber-500/30";
  return "bg-red-500/20 text-red-300 border-red-500/30";
}

export default function RoadmapView({ topic }) {
  const roadmap = topic?.roadmap;
  const chapters = Array.isArray(roadmap)
    ? roadmap
    : roadmap?.chapters || [];

  return (
    <div className="p-6 text-vscode-text">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{topic?.topic_name}</h1>
        <span
          className={`rounded border px-2 py-0.5 text-xs font-medium ${badgeDifficulty(topic?.level)}`}
        >
          {topic?.level}
        </span>
      </div>
      <p className="mb-8 text-sm text-vscode-muted">
        Your personalized roadmap — read any chapter in any order, then take each
        chapter quiz. Results unlock after you finish every quiz.
      </p>
      <div className="relative">
        <div className="absolute bottom-0 left-[19px] top-8 w-px bg-vscode-border" />
        <ul className="space-y-6">
          {chapters.map((ch, idx) => {
            const n = ch.chapter_number ?? idx + 1;
            return (
              <li key={`ch-${n}`}>
                <div className="relative flex gap-4 pl-1">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-vscode-accent bg-vscode-sidebar text-sm font-bold text-vscode-accent">
                    {n}
                  </div>
                  <div className="min-w-0 flex-1 rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-4">
                    <h3 className="mb-1 font-medium text-vscode-text">
                      {ch.title}
                    </h3>
                    <p className="mb-3 text-sm text-vscode-muted">
                      {ch.description}
                    </p>
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded border border-vscode-border px-2 py-0.5 text-vscode-muted">
                        {ch.reading_time || "—"}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 ${badgeDifficulty(ch.difficulty)}`}
                      >
                        {ch.difficulty || topic?.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(ch.key_concepts || []).map((k) => (
                        <span
                          key={k}
                          className="rounded bg-vscode-panel px-2 py-0.5 text-[11px] text-vscode-muted"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";

function badgeDifficulty(d) {
  if (d === "Beginner") return "bg-slate-800 text-emerald-300";
  if (d === "Intermediate") return "bg-slate-800 text-amber-300";
  return "bg-slate-800 text-rose-300";
}

const sectionBreakpoints = [2, 5];
function buildSections(chapters) {
  const sections = [
    { title: "Foundations", end: sectionBreakpoints[0] },
    { title: "Core Concepts", end: sectionBreakpoints[1] },
    { title: "Advanced", end: Infinity },
  ];

  let start = 0;
  return sections
    .map((section) => {
      const end = Math.min(chapters.length, section.end);
      const items = chapters.slice(start, end);
      start = end;
      return { title: section.title, items };
    })
    .filter((section) => section.items.length);
}

export default function RoadmapView({ topic }) {
  const roadmap = topic?.roadmap;
  const chapters = Array.isArray(roadmap) ? roadmap : roadmap?.chapters || [];
  const sections = useMemo(() => buildSections(chapters), [chapters]);
  const [openChapter, setOpenChapter] = useState(
    chapters[0]?.chapter_number ?? null,
  );

  const getStatus = (ch) => {
    if (ch.locked) return "Locked";
    if (ch.completed) return "Completed";
    return openChapter === ch.chapter_number ? "Active" : "Upcoming";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4 rounded-[2rem] bg-slate-950/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Learning roadmap
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
              {topic?.topic_name || "Your course roadmap"}
            </h1>
          </div>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 shadow-inner">
            {topic?.level || "Structured"}
          </span>
        </div>
        <p className="max-w-3xl text-sm leading-7 text-slate-400">
          A clean, structured learning path with one chapter expanded at a time.
          Each section is built to guide you through foundations, core concepts,
          and advanced work.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {section.title}
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {section.items.length} chapters in this phase
              </h2>
            </div>
            <div className="space-y-4">
              {section.items.map((ch, index) => {
                const chapterNumber = ch.chapter_number ?? index + 1;
                const isActive = openChapter === chapterNumber && !ch.locked;
                const status = getStatus({
                  ...ch,
                  chapter_number: chapterNumber,
                });
                const rowClasses = [
                  "relative overflow-hidden rounded-[1.75rem] bg-slate-950/95 p-6 transition duration-200",
                  ch.locked
                    ? "cursor-not-allowed opacity-70"
                    : "hover:bg-slate-900/95",
                  isActive
                    ? "ring-1 ring-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.45)]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div key={`roadmap-${chapterNumber}`} className={rowClasses}>
                    <button
                      type="button"
                      onClick={() =>
                        !ch.locked && setOpenChapter(chapterNumber)
                      }
                      className="w-full text-left"
                      aria-expanded={isActive}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-slate-300">
                              {chapterNumber}
                            </div>
                            <div className="min-w-0 space-y-2">
                              <h3 className="truncate text-xl font-semibold text-white">
                                {ch.title || `Chapter ${chapterNumber}`}
                              </h3>
                              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                                {ch.description ||
                                  "A concise chapter preview to guide your next step."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          <span
                            className={`rounded-full px-3 py-1 ${badgeDifficulty(ch.difficulty || topic?.level)}`}
                          >
                            {ch.difficulty || topic?.level}
                          </span>
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-400">
                            {ch.reading_time || "—"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 ${
                              status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : status === "Locked"
                                  ? "bg-slate-800 text-slate-500"
                                  : "bg-slate-900 text-slate-400"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(ch.key_concepts || []).slice(0, 4).map((concept) => (
                          <span
                            key={concept}
                            className="rounded-full bg-slate-900/90 px-3 py-1 text-xs text-slate-400"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </button>

                    {isActive && (
                      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900/95 p-5 text-sm leading-7 text-slate-300 transition-all duration-200">
                        <p className="mb-5">
                          {ch.full_description ||
                            ch.description ||
                            "Open the chapter to explore the full learning goals and take the next step."}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                            Open chapter
                          </button>
                          <button className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
                            View details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

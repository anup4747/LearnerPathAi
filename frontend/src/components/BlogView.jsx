import BlogContent from "./BlogContent";

function badgeDifficulty(d) {
  if (d === "Beginner") return "bg-emerald-500/20 text-emerald-300";
  if (d === "Intermediate") return "bg-amber-500/20 text-amber-200";
  return "bg-red-500/20 text-red-300";
}

export default function BlogView({
  chapter,
  roadmapMeta,
  topicName,
  level,
  onTakeQuiz,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  const num = chapter?.chapter_number;
  const meta =
    (roadmapMeta || []).find((c) => (c.chapter_number ?? 0) === num) || {};

  return (
    <article className="max-w-4xl mx-auto px-6 py-8 bg-gray-900 min-h-screen">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400">Chapter {num}</span>
        <h1 className="text-3xl font-bold text-white">{chapter?.title}</h1>
      </div>
      <div className="mb-8 flex flex-wrap gap-2 text-xs">
        {meta.reading_time ? (
          <span className="rounded border border-gray-600 px-3 py-1 text-gray-300">
            {meta.reading_time}
          </span>
        ) : null}
        <span
          className={`rounded border border-transparent px-3 py-1 ${badgeDifficulty(meta.difficulty || level)}`}
        >
          {meta.difficulty || level}
        </span>
      </div>
      <BlogContent content={chapter?.content} />
      <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-700 pt-8">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={onPrev}
          className="rounded border border-gray-600 bg-gray-800 px-6 py-3 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous chapter
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="rounded border border-gray-600 bg-gray-800 px-6 py-3 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next chapter
        </button>
        <button
          type="button"
          onClick={onTakeQuiz}
          className="ml-auto rounded bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Take Quiz
        </button>
      </div>
      <p className="mt-6 text-xs text-gray-500">Topic: {topicName}</p>
    </article>
  );
}

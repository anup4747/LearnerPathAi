import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    (roadmapMeta || []).find(
      (c) => (c.chapter_number ?? 0) === num,
    ) || {};

  return (
    <article className="p-6 text-vscode-text">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-vscode-muted">Chapter {num}</span>
        <h1 className="text-2xl font-semibold">{chapter?.title}</h1>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        {meta.reading_time ? (
          <span className="rounded border border-vscode-border px-2 py-0.5 text-vscode-muted">
            {meta.reading_time}
          </span>
        ) : null}
        <span
          className={`rounded border border-transparent px-2 py-0.5 ${badgeDifficulty(meta.difficulty || level)}`}
        >
          {meta.difficulty || level}
        </span>
      </div>
      <div className="prose prose-invert max-w-none prose-headings:text-vscode-text prose-p:text-vscode-muted prose-li:text-vscode-muted prose-strong:text-vscode-text prose-table:border-vscode-border prose-th:border prose-th:border-vscode-border prose-td:border prose-td:border-vscode-border">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeStr = String(children).replace(/\n$/, "");
              if (!inline && match) {
                return (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md border border-vscode-border !bg-[#1e1e2e]"
                    {...props}
                  >
                    {codeStr}
                  </SyntaxHighlighter>
                );
              }
              return (
                <code
                  className="rounded bg-vscode-panel px-1 py-0.5 text-sm text-vscode-success"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {chapter?.content || ""}
        </ReactMarkdown>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 border-t border-vscode-border pt-6">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={onPrev}
          className="rounded border border-vscode-border bg-vscode-panel px-4 py-2 text-sm disabled:opacity-30"
        >
          Previous chapter
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="rounded border border-vscode-border bg-vscode-panel px-4 py-2 text-sm disabled:opacity-30"
        >
          Next chapter
        </button>
        <button
          type="button"
          onClick={onTakeQuiz}
          className="ml-auto rounded bg-vscode-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Take Quiz
        </button>
      </div>
      <p className="mt-4 text-xs text-vscode-muted">Topic: {topicName}</p>
    </article>
  );
}

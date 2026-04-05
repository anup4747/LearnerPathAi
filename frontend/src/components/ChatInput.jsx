import { useEffect, useState } from "react";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const [rows, setRows] = useState(1);

  useEffect(() => {
    const lineCount = value.split("\n").length;
    setRows(Math.min(5, Math.max(1, lineCount)));
  }, [value]);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-soft">
      <div className="relative flex rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 shadow-inner">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          rows={rows}
          placeholder="Type your topic or question here..."
          className="min-h-[56px] w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          disabled={disabled}
        />
        <span className="pointer-events-none absolute right-4 bottom-4 text-xs text-slate-500">
          {value.length} chars
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">Shift + Enter for new line</p>
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

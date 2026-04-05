import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  const bubbleStyles = isUser
    ? "ml-auto max-w-[85%] rounded-[32px] rounded-br-sm bg-slate-900/95 text-slate-100"
    : "mr-auto max-w-[85%] rounded-[32px] rounded-bl-sm bg-slate-800/95 text-slate-100";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-xl text-indigo-300 shadow-soft">
          {isUser ? "👤" : "🤖"}
        </div>
        <div
          className={`${bubbleStyles} border border-slate-700/90 p-5 shadow-soft`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-7">
              {content}
            </p>
          ) : (
            <div className="markdown-content text-sm leading-7">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <SyntaxHighlighter
                        style={atomOneDark}
                        language={match?.[1] || "text"}
                        PreTag="div"
                        customStyle={{
                          borderRadius: "1rem",
                          padding: "1rem",
                          fontSize: "0.85rem",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="inline-code rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-slate-200"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

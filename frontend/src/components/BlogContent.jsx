import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function BlogContent({ content }) {
  return (
    <div
      className="prose prose-lg prose-invert max-w-none mx-auto leading-relaxed font-sans
                    prose-headings:font-bold prose-headings:text-white
                    prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                    prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
                    prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5
                    prose-p:text-gray-200 prose-p:mb-4 prose-p:leading-7
                    prose-li:text-gray-200 prose-li:mb-2
                    prose-strong:text-white prose-strong:font-semibold
                    prose-code:text-cyan-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0
                    prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-300
                    prose-ul:space-y-2 prose-ol:space-y-2"
    >
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
                  className="rounded-lg border border-gray-700 bg-gray-900 p-4 my-4 overflow-x-auto font-mono text-sm"
                  {...props}
                >
                  {codeStr}
                </SyntaxHighlighter>
              );
            }
            return (
              <code
                className="bg-gray-800 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-cyan-500 pl-4 italic text-gray-300 my-4"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          h1({ children, ...props }) {
            return (
              <h1
                className="text-3xl font-bold text-white mb-6 mt-8"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2
                className="text-2xl font-bold text-white mb-4 mt-6"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-xl font-bold text-white mb-3 mt-5" {...props}>
                {children}
              </h3>
            );
          },
          p({ children, ...props }) {
            return (
              <p className="text-gray-200 mb-4 leading-7" {...props}>
                {children}
              </p>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="space-y-2 mb-4" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="space-y-2 mb-4" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="text-gray-200 mb-2" {...props}>
                {children}
              </li>
            );
          },
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

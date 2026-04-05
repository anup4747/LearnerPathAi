import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getSocketUrl() {
  const env = import.meta.env.VITE_SOCKET_URL;
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export default function ChatBot({ topicName, context }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hi! I am your AI learning assistant for **${topicName || "this topic"}**. Ask me anything about what you are studying!`,
        streaming: false,
      },
    ]);
  }, [topicName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const url = getSocketUrl();
    const socket = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    socketRef.current = socket;

    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => setSocketReady(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) setSocketReady(true);

    const onDelta = ({ text }) => {
      if (text == null || text === "") return;
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last?.streaming) {
          next[next.length - 1] = {
            ...last,
            content: last.content + text,
          };
        }
        return next;
      });
    };

    const onDone = () => {
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last?.streaming) {
          next[next.length - 1] = { ...last, streaming: false };
        }
        return next;
      });
      setLoading(false);
    };

    const onErr = ({ error: err }) => {
      setError(err || "Chat failed");
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last?.streaming) {
          next[next.length - 1] = {
            role: "assistant",
            content:
              last.content ||
              "Sorry, I could not complete that reply. Try again.",
            streaming: false,
          };
        }
        return next;
      });
      setLoading(false);
    };

    socket.on("chat_delta", onDelta);
    socket.on("chat_done", onDone);
    socket.on("chat_error", onErr);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat_delta", onDelta);
      socket.off("chat_done", onDone);
      socket.off("chat_error", onErr);
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, []);

  function handleSend() {
    const text = input.trim();
    const socket = socketRef.current;
    if (!text || loading || !socket?.connected) return;
    setError("");
    setInput("");

    const history = messages
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [
      ...m,
      { role: "user", content: text, streaming: false },
      { role: "assistant", content: "", streaming: true },
    ]);
    setLoading(true);

    socket.emit("chat_stream", {
      topic: topicName || "",
      context: context || "",
      conversation_history: history,
      message: text,
    });
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-vscode-border bg-vscode-sidebar">
      <div className="shrink-0 border-b border-vscode-border p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            🤖
          </span>
          <h3 className="font-semibold text-vscode-text">AI Assistant</h3>
        </div>
        <p className="mt-1 text-xs text-vscode-muted">
          Streaming replies over WebSocket (like ChatGPT)
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" ? (
              <span className="mt-1 text-sm" aria-hidden>
                🤖
              </span>
            ) : null}
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-vscode-accent/90 text-white"
                  : "bg-vscode-panel text-vscode-text"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.streaming ? (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed">
                    {msg.content}
                    <span
                      className="ml-0.5 inline-block w-2 animate-pulse bg-vscode-accent align-text-bottom"
                      style={{ height: "1em" }}
                      aria-hidden
                    />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || "…"}
                    </ReactMarkdown>
                  </div>
                )
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {error ? (
          <p className="text-xs text-vscode-error">{error}</p>
        ) : null}
        {!socketReady && !loading ? (
          <p className="text-xs text-vscode-muted">
            Connecting to chat server…
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>
      <div className="shrink-0 border-t border-vscode-border p-2">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Ask a question…"
            className="min-h-[44px] flex-1 resize-none rounded border border-vscode-border bg-vscode-bg px-2 py-2 text-sm text-vscode-text outline-none focus:border-vscode-accent"
          />
          <button
            type="button"
            disabled={loading || !input.trim() || !socketReady}
            onClick={handleSend}
            className="self-end rounded bg-vscode-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

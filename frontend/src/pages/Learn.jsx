import { useEffect, useRef, useState } from "react";
import { sendMessage, resetSession } from "../api/learnpath";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";

const STORAGE_KEY_TOPICS = "learnpath_topics";

export default function Learn({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOPICS);
    if (saved) {
      setTopics(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const updateTopics = (topic) => {
    const cleaned = topic.trim();
    if (!cleaned) return;
    setTopics((current) => {
      const next = [
        cleaned,
        ...current.filter((item) => item !== cleaned),
      ].slice(0, 6);
      localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(next));
      return next;
    });
  };

  const handleSend = async () => {
    const message = inputText.trim();
    if (!message || isLoading) return;

    const newMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsLoading(true);
    updateTopics(message);

    try {
      const response = await sendMessage(sessionId, message);
      const aiText =
        response?.data?.response ||
        "Sorry, I could not read the response. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiText, timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oops! Something went wrong while connecting to the AI. Please check your backend and try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await resetSession(sessionId);
      setMessages([]);
      setInputText("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Reset failed. Please refresh the page or try again in a moment.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.32fr_0.68fr]">
        <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-soft">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-indigo-300">
                New Topic
              </p>
              <h2 className="text-2xl font-semibold text-white">Chat Coach</h2>
            </div>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-300">
            <p className="mb-3 text-slate-100">Active session</p>
            <div className="break-words rounded-2xl bg-slate-900/80 px-4 py-3 text-xs leading-6 text-slate-400">
              {sessionId}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-sm uppercase tracking-[0.24em] text-indigo-300">
              Past topics
            </h3>
            <div className="space-y-3">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <div
                    key={topic}
                    className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4 text-sm text-slate-200"
                  >
                    {topic}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Start a new learning topic to see it here.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-96px)] flex-col rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-soft">
          <div className="mb-6 rounded-[2rem] border border-slate-800 bg-slate-950/90 p-5 text-slate-300 shadow-inner">
            <h2 className="text-xl font-semibold text-white">
              Your AI study companion
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Ask about any topic and receive a complete learning path, chapter
              lessons, quizzes, and exams.
            </p>
          </div>

          <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/90 p-5">
            <div className="h-full overflow-y-auto pr-2">
              {messages.length === 0 && (
                <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/80 px-6 py-20 text-center text-slate-500">
                  Enter any topic or question to begin your personalized
                  learning journey.
                </div>
              )}
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.role}-${index}-${message.timestamp}`}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <div className="mb-4 flex items-center gap-3 rounded-[32px] rounded-bl-sm bg-slate-800/90 p-5 shadow-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-700 text-xl text-indigo-300">
                    🤖
                  </div>
                  <div className="rounded-3xl bg-slate-950 px-4 py-3 text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="typing-dot" />
                      <span className="typing-dot delay-150" />
                      <span className="typing-dot delay-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </div>

          <div className="mt-6">
            <ChatInput
              value={inputText}
              onChange={setInputText}
              onSend={handleSend}
              disabled={isLoading}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

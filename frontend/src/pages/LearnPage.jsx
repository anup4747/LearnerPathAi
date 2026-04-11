import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  getChapters,
  getQuizzes,
  getResults,
  getTopic,
} from "../api/learnpath";
import BlogView from "../components/BlogView";
import ChatBot from "../components/ChatBot";
import QuizView from "../components/QuizView";
import ResultView from "../components/ResultView";
import RoadmapView from "../components/RoadmapView";

function sortChapters(ch) {
  return [...ch].sort(
    (a, b) => (a.chapter_number || 0) - (b.chapter_number || 0),
  );
}

export default function LearnPage({ user }) {
  const { topic_id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [chatContext, setChatContext] = useState("");

  const refresh = useCallback(async () => {
    if (!topic_id) return;
    const [ch, qz, res] = await Promise.all([
      getChapters(topic_id),
      getQuizzes(topic_id),
      getResults(topic_id).catch(() => null),
    ]);
    setChapters(Array.isArray(ch) ? ch : []);
    setQuizzes(Array.isArray(qz) ? qz : []);
    setResultsData(res);
  }, [topic_id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!topic_id) return;
      setLoading(true);
      setError("");
      try {
        const t = await getTopic(topic_id);
        if (cancelled) return;
        setTopic(t);
        await refresh();
        if (!cancelled) {
          setTabs([{ id: "roadmap", title: "Roadmap", type: "roadmap" }]);
          setActiveTabId("roadmap");
        }
      } catch (e) {
        if (!cancelled)
          setError(e.response?.data?.error || e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topic_id, refresh]);

  const sortedChapters = useMemo(() => sortChapters(chapters), [chapters]);
  const roadmapList = useMemo(() => {
    const r = topic?.roadmap;
    if (Array.isArray(r)) return r;
    if (r?.chapters) return r.chapters;
    return [];
  }, [topic]);

  const quizByChapter = useMemo(() => {
    const m = {};
    quizzes.forEach((q) => {
      m[q.chapter_number] = q;
    });
    return m;
  }, [quizzes]);

  const allQuizzesDone = useMemo(() => {
    if (!quizzes.length) return false;
    return quizzes.every((q) => q.completed);
  }, [quizzes]);

  const completedQuizCount = useMemo(
    () => quizzes.filter((q) => q.completed).length,
    [quizzes],
  );

  const totalScores = useMemo(() => {
    if (!resultsData) return { total: 0, max: 0, pct: 0 };
    return {
      total: resultsData.total_score ?? 0,
      max: resultsData.max_score ?? 0,
      pct: resultsData.percentage ?? 0,
    };
  }, [resultsData]);

  function openTab(tab) {
    setTabs((prev) => {
      if (prev.some((t) => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  }

  function showRoadmap() {
    openTab({ id: "roadmap", title: "Roadmap", type: "roadmap" });
    setChatContext("Course roadmap overview");
  }

  function showChapter(ch, idx) {
    openTab({
      id: `blog-${ch._id}`,
      title: ch.title?.slice(0, 24) || `Ch ${ch.chapter_number}`,
      type: "blog",
      chapter: ch,
      index: idx,
    });
    setChatContext(ch.content?.slice(0, 2000) || ch.title || "");
  }

  function showQuiz(q) {
    openTab({
      id: `quiz-${q._id}`,
      title: `Quiz ${q.chapter_number}`,
      type: "quiz",
      quiz: q,
    });
    setChatContext("Chapter quiz");
  }

  function showResults() {
    openTab({ id: "results", title: "Results", type: "results" });
    setChatContext("Course results and scores");
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-vscode-bg text-vscode-muted">
        Loading course…
      </div>
    );
  }
  if (error || !topic) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-vscode-bg px-4 text-center">
        <p className="text-vscode-error">{error || "Topic not found"}</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="rounded bg-vscode-accent px-4 py-2 text-white"
        >
          Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-vscode-bg text-vscode-text">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-vscode-border bg-vscode-sidebar px-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-vscode-accent hover:underline"
        >
          ← EduGen AI
        </button>
        <div className="flex items-center gap-3">
          <span className="max-w-[160px] truncate text-xs text-vscode-muted">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded border border-vscode-border px-2 py-1 text-xs text-vscode-muted hover:bg-vscode-panel"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-vscode-border bg-vscode-sidebar">
          <div className="shrink-0 p-2">
            <button
              type="button"
              onClick={showRoadmap}
              className="flex w-full items-center justify-center gap-2 rounded border border-vscode-border bg-vscode-panel py-2 text-sm text-vscode-text hover:bg-vscode-border/30"
            >
              <span aria-hidden>🗺</span> ROADMAP
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <p className="px-1 py-2 text-[10px] font-semibold uppercase tracking-wider text-vscode-muted">
              Chapters
            </p>
            <ul className="space-y-0.5">
              {sortedChapters.map((ch, idx) => {
                const qz = quizByChapter[ch.chapter_number];
                const done = qz?.completed;
                return (
                  <li key={ch._id}>
                    <button
                      type="button"
                      onClick={() => showChapter(ch, idx)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-vscode-panel/80"
                    >
                      <span className="w-4 shrink-0 text-center text-xs">
                        {done ? "✓" : "📖"}
                      </span>
                      <span className="truncate">
                        {ch.chapter_number}. {ch.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 px-1 py-2 text-[10px] font-semibold uppercase tracking-wider text-vscode-muted">
              Quizzes
            </p>
            <ul className="space-y-0.5">
              {quizzes.map((q) => (
                <li key={q._id}>
                  <button
                    type="button"
                    onClick={() => showQuiz(q)}
                    className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-vscode-panel/80"
                  >
                    <span className="truncate">Quiz {q.chapter_number}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-vscode-muted">
                      {q.completed ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-vscode-success" />
                          {q.score}/{q.questions?.length || 5}
                        </>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-vscode-muted" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 border-t border-vscode-border bg-vscode-sidebar/80 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-vscode-muted">
              Quiz results
            </p>
            <div className="rounded-3xl bg-[#13161f] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Final score
                  </p>
                  <p className="text-xs text-slate-400">
                    {completedQuizCount}/{quizzes.length} quizzes completed
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${
                    totalScores.pct >= 75
                      ? "bg-emerald-500/10 text-emerald-300"
                      : totalScores.pct >= 50
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {totalScores.pct}%
                </span>
              </div>
              {resultsData ? (
                <>
                  <div className="mb-4 rounded-2xl bg-[#0f1118] p-3 text-sm text-slate-300">
                    <p className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      Total score
                    </p>
                    <p className="font-semibold text-white">
                      {totalScores.total} / {totalScores.max}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={showResults}
                    className="w-full rounded-full bg-vscode-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-vscode-accent/90"
                  >
                    View full results
                  </button>
                </>
              ) : (
                <p className="text-sm leading-6 text-slate-400">
                  Complete at least one quiz to see your final score and
                  progress here.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#0f0f1a]">
          <div className="flex h-9 shrink-0 items-end gap-0 overflow-x-auto border-b border-vscode-border bg-vscode-sidebar/60 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex max-w-[160px] shrink-0 items-center gap-1 border border-b-0 border-transparent px-3 py-1.5 text-xs ${
                  activeTabId === tab.id
                    ? "border-vscode-border border-b-vscode-bg bg-vscode-bg text-vscode-text"
                    : "text-vscode-muted hover:bg-vscode-panel/50"
                }`}
              >
                <span className="truncate">{tab.title}</span>
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-vscode-bg">
            {activeTab?.type === "roadmap" ? (
              <RoadmapView topic={topic} />
            ) : null}
            {activeTab?.type === "blog" && activeTab.chapter ? (
              <BlogView
                chapter={activeTab.chapter}
                roadmapMeta={roadmapList}
                topicName={topic.topic_name}
                level={topic.level}
                hasPrev={activeTab.index > 0}
                hasNext={activeTab.index < sortedChapters.length - 1}
                onPrev={() => {
                  const i = activeTab.index - 1;
                  showChapter(sortedChapters[i], i);
                }}
                onNext={() => {
                  const i = activeTab.index + 1;
                  showChapter(sortedChapters[i], i);
                }}
                onTakeQuiz={() => {
                  const qz = quizByChapter[activeTab.chapter.chapter_number];
                  if (qz) showQuiz(qz);
                }}
              />
            ) : null}
            {activeTab?.type === "quiz" && activeTab.quiz ? (
              <QuizView
                quiz={activeTab.quiz}
                chapterNumber={activeTab.quiz.chapter_number}
                onRefresh={refresh}
                onContinue={() => {
                  setTabs((t) => t.filter((x) => x.id !== activeTab.id));
                  setActiveTabId("roadmap");
                }}
              />
            ) : null}
            {activeTab?.type === "results" ? (
              <ResultView
                topicId={topic_id}
                topicName={topic.topic_name}
                onClose={() => {
                  setTabs((t) => t.filter((x) => x.id !== "results"));
                  setActiveTabId("roadmap");
                }}
              />
            ) : null}
          </div>
        </section>

        <div className="w-[300px] shrink-0">
          <ChatBot topicName={topic.topic_name} context={chatContext} />
        </div>
      </div>
    </div>
  );
}

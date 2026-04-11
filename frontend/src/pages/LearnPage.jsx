import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  getChapters,
  getExams,
  getQuizzes,
  getTopic,
  saveStudySession,
} from "../api/learnpath";
import BlogView from "../components/BlogView";
import ChatBot from "../components/ChatBot";
import QuizView from "../components/QuizView";
import ResultView from "../components/ResultView";
import RoadmapView from "../components/RoadmapView";
import NotesPanel from "../components/NotesPanel";
import PrepMode from "../components/PrepMode";

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
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [chatContext, setChatContext] = useState("");
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showPrepMode, setShowPrepMode] = useState(false);
  const [notesVersion, setNotesVersion] = useState(0);
  const studySecondsRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!topic_id || !user?.id) return;
    const [ch, qz, examList] = await Promise.all([
      getChapters(topic_id),
      getQuizzes(topic_id),
      getExams(topic_id).catch(() => []),
    ]);
    setChapters(Array.isArray(ch) ? ch : []);
    setQuizzes(Array.isArray(qz) ? qz : []);
    setExams(Array.isArray(examList) ? examList : []);
  }, [topic_id, user?.id]);

  const sendStudyTime = useCallback(
    async (seconds) => {
      if (!topic_id || !user?.id || seconds <= 0) return;
      try {
        await saveStudySession(user.id, topic_id, seconds);
      } catch (e) {
        console.error("Error saving study session:", e);
      }
    },
    [topic_id, user?.id],
  );

  useEffect(() => {
    if (!topic_id || !user?.id) return;
    const interval = setInterval(() => {
      studySecondsRef.current += 15;
      if (studySecondsRef.current >= 60) {
        const seconds = studySecondsRef.current;
        studySecondsRef.current = 0;
        sendStudyTime(seconds);
      }
    }, 15000);

    return () => {
      if (studySecondsRef.current > 0) {
        sendStudyTime(studySecondsRef.current);
        studySecondsRef.current = 0;
      }
      clearInterval(interval);
    };
  }, [topic_id, user?.id, sendStudyTime]);

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

  const resultItems = useMemo(() => {
    const quizResults = quizzes.map((q) => ({
      id: q._id,
      title: `Quiz ${q.chapter_number}`,
      detail: q.completed
        ? `${q.score}/${q.questions?.length || 5}`
        : "Pending",
      status: q.completed ? "Completed" : "Open",
      icon: "📝",
      type: "quiz",
      completed: q.completed,
    }));

    const examResults = exams.map((exam) => ({
      id: exam._id,
      title: exam.title || `Exam ${exam.exam_number || ""}`,
      detail: exam.completed
        ? `${exam.score}/${exam.total_marks || 0}`
        : "Ready",
      status: exam.completed ? "Completed" : "Ready",
      icon: "🎯",
      type: "exam",
      completed: exam.completed,
    }));

    return [...quizResults, ...examResults];
  }, [quizzes, exams]);

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
            <button
              type="button"
              onClick={() => setShowNotesPanel(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-vscode-border bg-vscode-panel py-2 text-sm text-vscode-text hover:bg-vscode-border/30"
            >
              <span aria-hidden>📝</span> NOTES
            </button>
            <button
              type="button"
              onClick={() => setShowPrepMode(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-vscode-border bg-vscode-panel py-2 text-sm text-vscode-text hover:bg-vscode-border/30"
            >
              <span aria-hidden>🎯</span> PREP MODE
            </button>
            {exams.length > 0 ? (
              <button
                type="button"
                onClick={() =>
                  navigate(`/learn/${topic_id}/exam/${exams[0]._id}`, {
                    state: { exam: exams[0], topicName: topic?.topic_name },
                  })
                }
                className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-vscode-border bg-vscode-accent px-2 py-2 text-sm font-semibold text-white hover:bg-vscode-accent/90"
              >
                Start exam: {exams[0].title || `Exam ${exams[0].exam_number}`}
              </button>
            ) : (
              <p className="mt-2 px-2 text-xs text-vscode-muted">
                No prep exams are ready yet.
              </p>
            )}
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

            <div className="mt-4 rounded-3xl bg-[#13161f] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-vscode-muted">
                    Results
                  </p>
                  <p className="text-xs text-slate-400">
                    Quiz + exam progress in one place
                  </p>
                </div>
                <button
                  type="button"
                  onClick={showResults}
                  className="rounded-full border border-vscode-border bg-vscode-panel px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-vscode-text hover:bg-vscode-border/30"
                >
                  Full view
                </button>
              </div>
              <ul className="space-y-2">
                {resultItems.length > 0 ? (
                  resultItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={showResults}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-vscode-border bg-vscode-border/20 px-3 py-2 text-left text-sm hover:bg-vscode-panel/80"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="truncate">{item.title}</span>
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{item.detail}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 ${
                              item.completed
                                ? "bg-vscode-success/10 text-vscode-success"
                                : "bg-vscode-muted/10 text-vscode-muted"
                            }`}
                          >
                            {item.status}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <p className="text-sm text-slate-400">
                      No quiz or exam items are available yet.
                    </p>
                  </li>
                )}
              </ul>
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
                user={user}
                topicId={topic_id}
                onNotesChange={() => setNotesVersion((v) => v + 1)}
                onOpenNotes={() => {
                  setShowNotesPanel(true);
                  setNotesVersion((v) => v + 1);
                }}
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

        {/* Notes Panel */}
        {showNotesPanel && (
          <NotesPanel
            user={user}
            topicId={topic_id}
            isOpen={showNotesPanel}
            reload={notesVersion}
            onClose={() => setShowNotesPanel(false)}
          />
        )}

        <div className="w-[300px] shrink-0">
          <ChatBot topicName={topic.topic_name} context={chatContext} />
        </div>
      </div>

      {/* Prep Mode Modal */}
      {showPrepMode && (
        <PrepMode
          topicId={topic_id}
          topicName={topic.topic_name}
          userId={user?.id}
          onStartExam={(exam) => {
            setShowPrepMode(false);
            if (exam) {
              navigate(`/learn/${topic_id}/exam/${exam._id}`, {
                state: { exam, topicName: topic.topic_name },
              });
            }
          }}
        />
      )}
    </div>
  );
}

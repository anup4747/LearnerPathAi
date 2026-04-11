import { Link } from "react-router-dom";

const features = [
  {
    title: "Personalized roadmap",
    subtitle: "AI builds a clear plan tailored to your goals.",
    tags: ["Smart", "Structured", "Tailored"],
  },
  {
    title: "Minimal lessons",
    subtitle: "Readable chapters with sharp hierarchy and clean spacing.",
    tags: ["Markdown", "Examples", "Clarity"],
  },
  {
    title: "Quiz insights",
    subtitle: "Performance tracking without clutter or distraction.",
    tags: ["Progress", "Feedback", "Results"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-vscode-bg text-vscode-text">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 rounded-[2rem] bg-slate-950/95 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-slate-800">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-vscode-muted">
                Notion-style AI learning platform
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Learn smarter with clean AI-powered courses.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
                Build a personalized roadmap, read structured lessons, and take
                quizzes that keep you focused. The full site stays dark, calm,
                and premium.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-vscode-accent px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-vscode-accent/30 transition hover:bg-vscode-accent/90"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-800"
              >
                Signup
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[2rem] bg-slate-950/95 p-8 shadow-[0_18px_50px_rgba(0,0,0,0.3)] ring-1 ring-slate-800"
            >
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                {feature.tags.join(" • ")}
              </div>
              <h2 className="text-2xl font-semibold text-white">
                {feature.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {feature.subtitle}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] bg-slate-950/95 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-slate-800">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Why this feels premium
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Minimal spacing, strong typography, and soft contrast make every
                page feel like a calm workspace.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Focused workflow
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Chapters, quizzes, and progress are presented in simple cards so
                the product feels intuitive and elegant.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Fast start</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Go from signup to topic creation in a few clicks, with all pages
                remaining consistent and easy to scan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

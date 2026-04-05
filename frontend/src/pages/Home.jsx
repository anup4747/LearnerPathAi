import { Link } from "react-router-dom";

const features = [
  {
    title: "Personalized Roadmap",
    icon: "🗺️",
    description:
      "Get a tailored chapter plan keyed to your goals and experience.",
  },
  {
    title: "Blog-style Chapters",
    icon: "📚",
    description:
      "Read polished lessons with examples, analogies and clear takeaways.",
  },
  {
    title: "Quizzes and Exams",
    icon: "✏️",
    description:
      "Stay sharp with chapter quizzes and course-level assessments.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-hero-gradient text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-8">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex rounded-full bg-indigo-500/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-indigo-200">
                Empower your learning journey
              </span>
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Master Any Topic with AI
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                Get a personalized roadmap, chapter-by-chapter blog lessons,
                quizzes and exams — all generated just for you.
              </p>
              <Link
                to="/learn"
                className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:brightness-110 sm:w-auto"
              >
                Start Learning
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
            <div className="mb-6 rounded-3xl bg-slate-900/80 p-6 text-slate-100">
              <p className="text-sm uppercase tracking-[0.24em] text-indigo-300">
                AI learning experience
              </p>
              <h2 className="mt-4 text-3xl font-semibold">
                Your next lesson starts here
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Interactive coaching, structured chapters, and smart assessments
                make every topic feel clear, focused, and motivating.
              </p>
            </div>
            <div className="grid gap-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5 transition hover:border-indigo-500/50"
                >
                  <div className="mb-3 text-3xl">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
        <footer className="mt-16 border-t border-slate-800/80 pt-6 text-sm text-slate-500">
          LearnPath AI — Personalized learning for every skill level.
        </footer>
      </section>
    </main>
  );
}

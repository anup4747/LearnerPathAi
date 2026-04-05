import ChapterContent from "../components/ChapterContent";

export default function Chapter() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
          <h1 className="text-4xl font-semibold text-white">Chapter Content</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Each chapter generates full blog-style lessons with examples,
            subheadings, and clear takeaways.
          </p>
        </div>

        <ChapterContent
          title="Introduction to the topic"
          summary="This chapter explains the most important concepts, why they matter, and how they connect to real work scenarios."
          bullets={[
            "Understand the core terminology and principles.",
            "Review a real example with approachable analogies.",
            "Learn the next steps and how to practice effectively.",
          ]}
        />
      </div>
    </main>
  );
}

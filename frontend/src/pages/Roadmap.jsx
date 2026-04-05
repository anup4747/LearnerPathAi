import RoadmapCard from "../components/RoadmapCard";

const sampleRoadmap = [
  {
    chapter: "Chapter 1",
    title: "Foundations",
    description:
      "Lay the groundwork with core concepts and terminology so you feel confident from the start.",
    estimate: "20 min",
    difficulty: "Beginner",
  },
  {
    chapter: "Chapter 2",
    title: "Technique Deep Dive",
    description:
      "Explore practical workflows and examples that bring the topic to life in real use cases.",
    estimate: "30 min",
    difficulty: "Intermediate",
  },
  {
    chapter: "Chapter 3",
    title: "Practice & Review",
    description:
      "Apply what you learned through review questions and guided problem solving.",
    estimate: "25 min",
    difficulty: "Intermediate",
  },
];

export default function Roadmap() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
          <h1 className="text-4xl font-semibold text-white">
            Personalized Roadmap
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            This page gives a preview of the chapter roadmap structure generated
            for your selected topic.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {sampleRoadmap.map((item) => (
            <RoadmapCard key={item.chapter} {...item} />
          ))}
        </div>
      </div>
    </main>
  );
}

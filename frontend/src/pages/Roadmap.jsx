import RoadmapCard from "../components/RoadmapCard";

const sampleRoadmap = [
  {
    chapter: "Chapter 1",
    title: "Foundations",
    description:
      "Lay the groundwork with core concepts and terminology so you feel confident from the start.",
    estimate: "20 min",
    difficulty: "Beginner",
    tags: ["Basics", "Setup", "Terminology"],
    status: "Completed",
  },
  {
    chapter: "Chapter 2",
    title: "Technique Deep Dive",
    description:
      "Explore practical workflows and examples that bring the topic to life in real use cases.",
    estimate: "30 min",
    difficulty: "Intermediate",
    tags: ["Practice", "Examples", "Tools"],
  },
  {
    chapter: "Chapter 3",
    title: "Practice & Review",
    description:
      "Apply what you learned through review questions and guided problem solving.",
    estimate: "25 min",
    difficulty: "Intermediate",
    tags: ["Review", "Case Study"],
    status: "Locked",
  },
];

export default function Roadmap() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] bg-slate-950/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
          <h1 className="text-4xl font-semibold text-white">
            Personalized Roadmap
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            A clean, structured preview of the chapter roadmap designed for guided learning and clarity.
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

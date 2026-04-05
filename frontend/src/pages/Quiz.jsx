import QuizCard from "../components/QuizCard";

const sampleQuestions = [
  {
    question: "What is the best first step when learning a new topic?",
    options: [
      "Read all articles",
      "Build a roadmap",
      "Memorize definitions",
      "Watch videos",
    ],
  },
  {
    question: "Why are examples important in a chapter?",
    options: [
      "They make content heavier",
      "They help apply concepts",
      "They are optional",
      "They are only for experts",
    ],
  },
  {
    question: "What should a chapter quiz evaluate?",
    options: [
      "Typing speed",
      "Concept understanding",
      "Video watching",
      "Number of chapters read",
    ],
  },
];

export default function Quiz() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
          <h1 className="text-4xl font-semibold text-white">Quiz Preview</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Chapter quizzes help you reinforce learning after each lesson. Use
            them to check your understanding and move forward with confidence.
          </p>
        </div>

        <QuizCard title="Chapter quiz" questions={sampleQuestions} />
      </div>
    </main>
  );
}

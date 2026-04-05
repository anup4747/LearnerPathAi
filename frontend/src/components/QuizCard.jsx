export default function QuizCard({ title, questions }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-indigo-300">
        <span>Quiz</span>
        <span>{questions.length} questions</span>
      </div>
      <h3 className="mb-4 text-xl font-semibold text-white">{title}</h3>
      <ul className="space-y-3 text-sm leading-7 text-slate-300">
        {questions.map((question, index) => (
          <li key={index} className="rounded-2xl bg-slate-950/80 p-4">
            <strong className="block text-slate-100">
              {question.question}
            </strong>
            <div className="mt-2 grid gap-2 text-slate-400 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <span
                  key={optionIndex}
                  className="rounded-2xl bg-slate-900/90 px-3 py-2"
                >
                  {option}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

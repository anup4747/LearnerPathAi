import React, { useState, useEffect } from 'react';
import './Exam.css';

const Exam = ({ exam, onComplete }) => {
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctSubtopics, setCorrectSubtopics] = useState(new Set());
  const [incorrectSubtopics, setIncorrectSubtopics] = useState(new Set());
  const [answersBySubtopic, setAnswersBySubtopic] = useState({});
  const [questions, setQuestions] = useState([]);
  const [answered, setAnswered] = useState({});

  useEffect(() => {
    // Parse exam and extract questions
    const examQuestions = [];
    Object.keys(exam).forEach((key) => {
      if (key.startsWith('exam')) {
        const questionNum = key.match(/\d+/)[0];
        const question = exam[key];
        const subtopic = exam[`subtopic${questionNum}`]?.question_statement || 'Uncategorized';
        const correctAnswer = exam[`answer${questionNum}`]?.question_statement || '';

        examQuestions.push({
          id: key,
          questionNum,
          statement: question.question_statement,
          options: question.options,
          subtopic,
          correctAnswer
        });
      }
    });
    setQuestions(examQuestions);
    setAnswersBySubtopic({});
  }, [exam]);

  const handleAnswer = (questionId, questionNum, option, subtopic, correctAnswer) => {
    if (answered[questionId]) return; // Prevent re-answering

    const isCorrect = option === correctAnswer;
    setAnswered({ ...answered, [questionId]: true });

    // Update answered count
    const newAnswerCount = answeredQuestions + 1;
    setAnsweredQuestions(newAnswerCount);

    // Update subtopic performance
    if (isCorrect) {
      setCorrectSubtopics((prev) => new Set([...prev, subtopic]));
    } else {
      setIncorrectSubtopics((prev) => new Set([...prev, subtopic]));
    }

    // Track answers by subtopic
    setAnswersBySubtopic((prev) => ({
      ...prev,
      [subtopic]: [...(prev[subtopic] || []), isCorrect]
    }));

    // Check if all answered
    if (newAnswerCount === questions.length) {
      setTimeout(() => {
        onComplete({
          correctSubtopics: Array.from(correctSubtopics),
          incorrectSubtopics: Array.from(incorrectSubtopics),
          answersBySubtopic: { ...answersBySubtopic, [subtopic]: [...(answersBySubtopic[subtopic] || []), isCorrect] }
        });
      }, 300);
    }
  };

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>Answer the Questions</h2>
        <p>Questions answered: {answeredQuestions} / {questions.length}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(answeredQuestions / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="exam-content">
        {questions.map((question) => (
          <div key={question.id} className={`question ${answered[question.id] ? 'answered' : ''}`}>
            <p className="question-statement">Q{question.questionNum}: {question.statement}</p>
            <div className="options">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-button ${
                    answered[question.id]
                      ? option === question.correctAnswer
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  }`}
                  onClick={() =>
                    handleAnswer(question.id, question.questionNum, option, question.subtopic, question.correctAnswer)
                  }
                  disabled={answered[question.id]}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="exam-footer">
        <p>{answeredQuestions === questions.length ? 'All questions answered! Scroll down.' : 'Answer all questions to continue.'}</p>
      </div>
    </div>
  );
};

export default Exam;

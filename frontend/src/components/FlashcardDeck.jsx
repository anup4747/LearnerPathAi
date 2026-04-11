import { useState } from "react";

const Flashcard = ({ front, back, onNext, onPrev, isFirst, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full max-w-md h-64 cursor-pointer perspective-1000 mb-6"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-gradient-to-br from-vscode-accent to-vscode-accent/80 rounded-xl shadow-lg flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-white text-lg font-medium mb-2">
                  Question
                </div>
                <div className="text-white text-xl font-semibold">{front}</div>
                <div className="text-white/70 text-sm mt-4">
                  Click to reveal answer
                </div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-slate-800 rounded-xl shadow-lg flex items-center justify-center p-6 border border-slate-700">
              <div className="text-center">
                <div className="text-slate-300 text-lg font-medium mb-2">
                  Answer
                </div>
                <div className="text-white text-xl font-semibold">{back}</div>
                <div className="text-slate-400 text-sm mt-4">
                  Click to see question
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="px-4 py-2 bg-vscode-accent text-white rounded-lg hover:bg-vscode-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const FlashcardDeck = ({ flashcards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 mb-4">
          No flashcards available for this chapter.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
        >
          Close
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Concept Flashcards
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      <div className="mb-4 text-center text-slate-400">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={currentIndex === 0}
        isLast={currentIndex === flashcards.length - 1}
      />

      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          Finish Review
        </button>
      </div>
    </div>
  );
};

export default FlashcardDeck;

import { useState, useRef, useEffect } from "react";
import { createNote, updateNote, deleteNote } from "../api/learnpath";

const TextSelector = ({
  children,
  user,
  topicId,
  chapterNumber,
  onNotesChange,
  onOpenNotes,
}) => {
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showAddButton, setShowAddButton] = useState(false);
  const [noteDraft, setNoteDraft] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [editingNote, setEditingNote] = useState(null);
  const containerRef = useRef(null);
  const addButtonRef = useRef(null);
  const modalRef = useRef(null);

  const clearSelection = () => {
    setSelectedText("");
    setSelectionRange(null);
    setSelectionBox(null);
    setShowAddButton(false);
    setShowNoteModal(false);
    window.getSelection().removeAllRanges();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();

      if (
        text.length > 0 &&
        containerRef.current.contains(range.commonAncestorContainer)
      ) {
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setSelectionRange(range);
        setSelectionBox({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setShowAddButton(true);
        setNoteDraft(null);
        return;
      }
    }

    if (!showNoteModal) {
      clearSelection();
    }
  };

  const handleOpenNoteModal = () => {
    setNoteDraft({
      topicId,
      chapterNumber,
      selectedText,
      highlightColor,
    });
    setShowNoteModal(true);
    setShowAddButton(false);
  };

  const handleSaveNote = async () => {
    if (!noteDraft || !noteDraft.selectedText || !noteText.trim()) return;

    try {
      if (editingNote) {
        await updateNote(editingNote._id, noteText);
      } else {
        await createNote(
          user.id,
          noteDraft.topicId,
          noteDraft.chapterNumber,
          noteDraft.selectedText,
          noteText,
          highlightColor,
        );
      }

      onNotesChange && onNotesChange();
      onOpenNotes && onOpenNotes();
      setShowNoteModal(false);
      setNoteDraft(null);
      setNoteText("");
      setEditingNote(null);
      clearSelection();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleCancel = () => {
    setShowNoteModal(false);
    setNoteDraft(null);
    setNoteText("");
    setEditingNote(null);
    clearSelection();
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!showAddButton || showNoteModal) return;
      if (
        addButtonRef.current?.contains(event.target) ||
        modalRef.current?.contains(event.target)
      ) {
        return;
      }
      const notesPanel = document.querySelector(".notes-panel-root");
      if (notesPanel?.contains(event.target)) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [showAddButton, showNoteModal]);

  const highlightColors = {
    yellow: "bg-yellow-200",
    purple: "bg-purple-200",
    green: "bg-green-200",
    pink: "bg-pink-200",
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleTextSelection}
      className="relative"
    >
      {children}

      {/* Note Modal */}
      {showAddButton && selectionBox && (
        <button
          type="button"
          ref={addButtonRef}
          onClick={handleOpenNoteModal}
          style={{
            position: "fixed",
            top: selectionBox.top - 42,
            left: selectionBox.left + selectionBox.width + 10,
          }}
          className="z-50 rounded-full bg-vscode-accent px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-vscode-accent/90"
        >
          Add Note
        </button>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-slate-900 rounded-[2rem] p-6 max-w-md w-full ring-1 ring-slate-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingNote ? "Edit Note" : "Add Note"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Selected text:</p>
              <div
                className={`p-3 rounded-lg ${highlightColors[highlightColor]} text-gray-900`}
              >
                "{selectedText}"
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Highlight Color
              </label>
              <div className="flex gap-2">
                {Object.entries(highlightColors).map(([color, className]) => (
                  <button
                    key={color}
                    onClick={() => setHighlightColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      highlightColor === color
                        ? "border-white"
                        : "border-slate-600"
                    } ${className}`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Note
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-accent focus:border-transparent resize-vertical"
                rows={4}
                placeholder="Add your thoughts, questions, or insights..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="px-4 py-2 bg-vscode-accent text-white rounded-lg hover:bg-vscode-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingNote ? "Update" : "Save"} Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSelector;

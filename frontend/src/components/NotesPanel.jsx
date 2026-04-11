import { useState, useEffect } from "react";
import { getUserNotes, updateNote, deleteNote } from "../api/learnpath";

const NotesPanel = ({ user, topicId, isOpen, reload, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (isOpen && user?.id) {
      loadNotes();
    }
  }, [isOpen, user?.id, topicId, reload]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const userNotes = await getUserNotes(user.id, topicId);
      setNotes(userNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setEditText(note.note_text);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editText.trim()) return;

    try {
      await updateNote(editingNote._id, editText);
      setEditingNote(null);
      setEditText("");
      loadNotes();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(noteId);
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const highlightColors = {
    yellow: "bg-yellow-200",
    purple: "bg-purple-200",
    green: "bg-green-200",
    pink: "bg-pink-200",
  };

  if (!isOpen) return null;

  return (
    <div className="notes-panel-root fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-800 shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">My Notes</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p className="mb-2">No notes yet</p>
            <p className="text-sm">Select text in chapters to add notes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-slate-800 rounded-lg p-4">
                <div className={`p-3 rounded mb-3 ${highlightColors[note.highlight_color] || highlightColors.yellow} text-gray-900 text-sm`}>
                  "{note.selected_text}"
                </div>

                {editingNote && editingNote._id === note._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-vscode-accent resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-vscode-accent text-white text-sm rounded hover:bg-vscode-accent/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(null);
                          setEditText("");
                        }}
                        className="px-3 py-1 bg-slate-600 text-white text-sm rounded hover:bg-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 text-sm mb-3">{note.note_text}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Chapter {note.chapter_number}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(note)}
                          className="text-vscode-accent hover:text-vscode-accent/80"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(note._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
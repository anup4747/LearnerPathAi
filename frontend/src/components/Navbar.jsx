export default function Navbar({ userEmail, onLogout, onFeedback }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-slate-950/95 px-6 ring-1 ring-slate-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg text-white">
          🧠
        </div>
        <div>
          <p className="text-sm font-semibold text-white">EduGen AI</p>
          <p className="text-xs text-slate-400">{userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onFeedback}
          className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
        >
          Feedback
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

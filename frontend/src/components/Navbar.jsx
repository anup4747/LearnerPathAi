export default function Navbar({ userEmail, onLogout }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-vscode-border bg-vscode-sidebar px-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-vscode-text">
          LearnPath AI
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="max-w-[200px] truncate text-sm text-vscode-muted">
          {userEmail}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded border border-vscode-border bg-vscode-panel px-3 py-1 text-sm text-vscode-text hover:bg-vscode-border/40"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

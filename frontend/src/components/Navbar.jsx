import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function initials(name, fallback) {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }
  return fallback?.slice(0, 2).toUpperCase() || "UE";
}

export default function Navbar({
  userEmail,
  userName,
  userAvatar,
  onLogout,
  onFeedback,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayTitle = userName || userEmail || "Learner";
  const fallbackText = userEmail && userName ? userEmail : "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-slate-950/95 px-6 ring-1 ring-slate-800">
      <Link
        to="/dashboard"
        className="flex items-center gap-3 rounded-full hover:bg-slate-900/80 px-2 py-1 transition"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg text-white">
          🧠
        </div>
        <div>
          <p className="text-sm font-semibold text-white">EduGen AI</p>
          <p className="text-xs text-slate-500">Learning workspace</p>
        </div>
      </Link>

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex items-center gap-3 rounded-full bg-slate-900/80 px-3 py-2 text-left transition hover:bg-slate-800"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-sm font-semibold text-white">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials(userName, userEmail)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {displayTitle}
            </p>
            {fallbackText ? (
              <p className="text-[11px] text-slate-400 truncate">
                {fallbackText}
              </p>
            ) : null}
          </div>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-900"
            >
              <span className="text-lg">👤</span>
              Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onFeedback();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
            >
              <span className="text-lg">💬</span>
              Feedback
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

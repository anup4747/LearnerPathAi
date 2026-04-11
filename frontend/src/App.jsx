import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LearnPage from "./pages/LearnPage";
import Login from "./pages/Login";
import NewTopic from "./pages/NewTopic";
import Signup from "./pages/Signup";

function ProtectedRoute({ user, authLoading, children }) {
  const location = useLocation();
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vscode-bg text-vscode-muted">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function GuestOnlyRoute({ user, authLoading, children }) {
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vscode-bg text-vscode-muted">
        Loading…
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <GuestOnlyRoute user={user} authLoading={authLoading}>
            <Login />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnlyRoute user={user} authLoading={authLoading}>
            <Signup />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <Dashboard user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-topic"
        element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <NewTopic user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loading/:topic_id"
        element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <LoadingScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:topic_id"
        element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <LearnPage user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

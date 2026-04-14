import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import { getProfile } from "./api/learnpath";
import FeedbackForm from "./components/FeedbackForm";
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import Home from "./pages/Home";
import LearnPage from "./pages/LearnPage";
import Login from "./pages/Login";
import NewTopic from "./pages/NewTopic";
import Profile from "./pages/Profile";
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
  return <AuthenticatedLayout user={user}>{children}</AuthenticatedLayout>;
}

function AuthenticatedLayout({ user, children }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setProfileImage("");
      return;
    }

    (async () => {
      try {
        const profile = await getProfile(user.id);
        if (cancelled) return;
        if (profile?.avatar_data) {
          setProfileImage(profile.avatar_data);
        } else if (profile?.avatar_url) {
          setProfileImage(profile.avatar_url);
        } else {
          setProfileImage("");
        }
      } catch (err) {
        console.warn("Could not load profile image", err);
        setProfileImage("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function handleFeedback() {
    setShowFeedback(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-vscode-bg text-vscode-text">
      <Navbar
        userEmail={user?.email}
        userName={user?.user_metadata?.username}
        userAvatar={profileImage || user?.user_metadata?.avatar_url}
        onLogout={handleLogout}
        onFeedback={handleFeedback}
      />
      {children}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-[2rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <FeedbackForm user={user} onClose={() => setShowFeedback(false)} />
          </div>
        </div>
      )}
    </div>
  );
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
        path="/profile"
        element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <Profile user={user} />
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
      <Route
        path="/learn/:topic_id/exam/:exam_id"
        element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <Exam />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getUserTopics, getProfile, updateProfile } from "../api/learnpath";

function levelBadgeClass(level) {
  if (level === "Beginner") return "bg-emerald-500/10 text-emerald-300";
  if (level === "Intermediate") return "bg-amber-500/10 text-amber-300";
  return "bg-rose-500/10 text-rose-300";
}

function renderInitials(name, username) {
  const source = name || username || "Learner";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Profile({ user }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarData, setAvatarData] = useState("");
  const [mongoProfile, setMongoProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const metadata = user.user_metadata || {};
    setFullName(metadata.full_name || "");
    setUsername(metadata.username || "");
    setBio(metadata.bio || "");
    setAvatarUrl(metadata.avatar_url || "");
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;

    (async () => {
      try {
        const profile = await getProfile(user.id);
        if (cancelled || !profile) return;
        setMongoProfile(profile);
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setUsername(profile.username || user.user_metadata?.username || "");
        setBio(profile.bio || user.user_metadata?.bio || "");
        setAvatarUrl(
          profile.avatar_url || user.user_metadata?.avatar_url || "",
        );
        setAvatarData(profile.avatar_data || "");
      } catch (err) {
        console.warn("Could not load backend profile", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      setError("");
      setLoading(true);
      try {
        const list = await getUserTopics(user.id);
        if (!cancelled) setTopics(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled)
          setError(
            e.response?.data?.error ||
              e.message ||
              "Failed to load profile data",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleSaveProfile(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setSaving(true);

    try {
      const profileResponse = await updateProfile(
        user.id,
        fullName,
        username,
        bio,
        avatarData || undefined,
        avatarUrl || undefined,
      );

      if (profileResponse?.profile) {
        setMongoProfile(profileResponse.profile);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username,
          bio,
          avatar_url: avatarUrl,
        },
      });
      if (updateError) throw updateError;

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setFormError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const profileHandle =
    username ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "learner";
  const displayName =
    fullName || user?.user_metadata?.full_name || user?.email || "Learner";
  const bioText =
    bio ||
    user?.user_metadata?.bio ||
    "Add a short bio to tell others about you.";
  const profileImage =
    avatarData || avatarUrl || user?.user_metadata?.avatar_url || "";
  const completedTopics = topics.filter((t) => t.completed).length;

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
        <section className="rounded-[2rem] bg-slate-950/95 p-8 ring-1 ring-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-3xl font-semibold text-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{renderInitials(displayName, profileHandle)}</span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
                  Profile
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  @{profileHandle}
                </h1>
                <p className="mt-1 text-sm text-slate-400">{displayName}</p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                  {bioText}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing((current) => !current)}
              className="rounded-full bg-vscode-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90"
            >
              {isEditing ? "Close settings" : "Edit profile"}
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Topics created
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {topics.length}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Completed topics
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {completedTopics}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Current streak
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">—</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-950/95 p-8 ring-1 ring-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
                Profile settings
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Manage your account details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-vscode-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90"
            >
              Open settings panel
            </button>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-900/80 p-6 text-sm leading-6 text-slate-400">
            Open the editor panel to update your username, bio, full name, and
            profile picture. The panel is available only on this page.
          </div>
        </section>

        {isEditing ? (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsEditing(false)}
            />
            <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-950/95 p-8 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
                    Profile editor
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Edit your profile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
                    placeholder="A short intro for your profile"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Profile picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) {
                        setFormError("Please upload a valid image file.");
                        return;
                      }
                      if (file.size > 1024 * 1024) {
                        setFormError("Avatar file must be 1MB or smaller.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setAvatarData(reader.result);
                          setAvatarUrl("");
                          setAvatarFile(file);
                          setFormError("");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition file:rounded-full file:border-0 file:bg-vscode-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
                  />
                  <p className="text-xs text-slate-500">
                    Upload an image file to store it directly in MongoDB.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Profile picture URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      if (e.target.value) setAvatarData("");
                    }}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-vscode-accent focus:ring-1 focus:ring-vscode-accent/20"
                    placeholder="https://example.com/avatar.jpg"
                    autoComplete="photo"
                  />
                  <p className="text-xs text-slate-500">
                    Or enter a remote image URL if you prefer.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-400 outline-none"
                  />
                </div>
                {formError ? (
                  <p className="text-sm text-red-400">{formError}</p>
                ) : null}
                {success ? (
                  <p className="text-sm text-emerald-400">{success}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-vscode-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-vscode-accent/90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </form>
            </aside>
          </>
        ) : null}

        <section className="rounded-[2rem] bg-slate-950/95 p-8 ring-1 ring-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-vscode-muted">
                Topics overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Your learning dashboard
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-slate-400">Loading your topics…</div>
          ) : error ? (
            <div className="mt-8 text-red-400">{error}</div>
          ) : topics.length === 0 ? (
            <div className="mt-8 text-slate-400">No topics found yet.</div>
          ) : (
            <div className="mt-8 space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="rounded-3xl bg-slate-900/80 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {topic.topic_name}
                      </p>
                      <p className="text-xs text-slate-500">{topic.level}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${levelBadgeClass(topic.level)}`}
                    >
                      {topic.completed ? "Completed" : "In progress"}
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-slate-400 flex flex-wrap gap-4">
                    <span>
                      {topic.created_at
                        ? new Date(topic.created_at).toLocaleDateString()
                        : ""}
                    </span>
                    <span>
                      Score: {topic.total_score ?? 0}/{topic.max_score ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
  );
}

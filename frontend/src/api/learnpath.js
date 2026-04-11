import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export async function createTopic(user_id, topic_name, level) {
  const { data } = await api.post("/topics/create", {
    user_id,
    topic_name,
    level,
  });
  return data;
}

export async function checkStatus(topic_id) {
  const { data } = await api.get(`/topics/status/${topic_id}`);
  return data;
}

export async function getUserTopics(user_id) {
  const { data } = await api.get(`/topics/${user_id}`);
  return data;
}

export async function getTopic(topic_id) {
  const { data } = await api.get(`/topic/${topic_id}`);
  return data;
}

export async function getChapters(topic_id) {
  const { data } = await api.get(`/chapters/${topic_id}`);
  return data;
}

export async function getQuizzes(topic_id) {
  const { data } = await api.get(`/quizzes/${topic_id}`);
  return data;
}

export async function getExams(topic_id) {
  const { data } = await api.get(`/exams/${topic_id}`);
  return data;
}

export async function submitQuiz(quiz_id, user_answers, score) {
  const { data } = await api.post("/quiz/submit", {
    quiz_id,
    user_answers,
    score,
  });
  return data;
}

export async function submitExam(exam_id, user_answers, score) {
  const { data } = await api.post("/exam/submit", {
    exam_id,
    user_answers,
    score,
  });
  return data;
}

export async function getResults(topic_id) {
  const { data } = await api.get(`/results/${topic_id}`);
  return data;
}

export async function getProfile(user_id) {
  const { data } = await api.get(`/profile/${user_id}`);
  return data;
}

export async function updateProfile(
  user_id,
  full_name,
  username,
  bio,
  avatar_data,
  avatar_url,
) {
  const { data } = await api.post(`/profile/update`, {
    user_id,
    full_name,
    username,
    bio,
    avatar_data,
    avatar_url,
  });
  return data;
}

export async function deleteTopic(topic_id, user_id) {
  const { data } = await api.delete(`/topics/delete/${topic_id}`, {
    params: { user_id },
  });
  return data;
}

export async function getAnalytics(user_id, topic_id) {
  const { data } = await api.get(`/analytics/${user_id}/${topic_id}`);
  return data;
}

export async function saveStudySession(user_id, topic_id, seconds) {
  const { data } = await api.post("/analytics/study", {
    user_id,
    topic_id,
    seconds,
  });
  return data;
}

export async function sendChat(topic, context, conversation_history, message) {
  const { data } = await api.post("/chat", {
    topic,
    context,
    conversation_history,
    message,
  });
  return data;
}

export async function completeTopic(topic_id, total_score, max_score) {
  const { data } = await api.post("/topic/complete", {
    topic_id,
    total_score,
    max_score,
  });
  return data;
}

export async function createNote(
  user_id,
  topic_id,
  chapter_number,
  selected_text,
  note_text,
  highlight_color,
) {
  const { data } = await api.post("/notes/create", {
    user_id,
    topic_id,
    chapter_number,
    selected_text,
    note_text,
    highlight_color,
  });
  return data;
}

export async function getUserNotes(user_id, topic_id) {
  const { data } = await api.get(`/notes/${user_id}/${topic_id}`);
  return data;
}

export async function updateNote(note_id, note_text) {
  const { data } = await api.put(`/notes/update/${note_id}`, {
    note_text,
  });
  return data;
}

export async function deleteNote(note_id) {
  const { data } = await api.delete(`/notes/delete/${note_id}`);
  return data;
}

export async function createFlashcards(
  user_id,
  topic_id,
  chapter_number,
  flashcards,
) {
  const { data } = await api.post("/flashcards/create", {
    user_id,
    topic_id,
    chapter_number,
    flashcards,
  });
  return data;
}

export async function getFlashcards(user_id, topic_id) {
  const { data } = await api.get(`/flashcards/${user_id}/${topic_id}`);
  return data;
}

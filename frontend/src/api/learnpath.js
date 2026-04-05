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

export async function sendChat(
  topic,
  context,
  conversation_history,
  message,
) {
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

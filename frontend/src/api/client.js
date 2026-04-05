import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const createExam = async (topic) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create_exam`, { topic });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create exam: ${error.response?.data?.error || error.message}`);
  }
};

export const generateLearningTree = async (mainTopic, subtopics) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate_learning_tree`, {
      mainTopic,
      subtopics
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to generate tree: ${error.response?.data?.error || error.message}`);
  }
};

export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Backend is not available');
  }
};

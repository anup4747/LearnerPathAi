import React, { useState } from 'react';
import { createExam } from '../api/client';
import './TopicForm.css';

const TopicForm = ({ onExamCreated, onLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    onLoading(true);
    try {
      const data = await createExam(topic);
      const exam = JSON.parse(data.exam);
      onExamCreated(exam, topic);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      onLoading(false);
    }
  };

  return (
    <form className="topic-form" onSubmit={handleSubmit}>
      <input
        type="text"
        id="topicInput"
        placeholder="Enter a topic (e.g., Deep Learning)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="topic-input"
      />
      <button type="submit" className="submit-button">
        Start Exam
      </button>
    </form>
  );
};

export default TopicForm;

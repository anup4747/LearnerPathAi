import React, { useState, useEffect } from 'react';
import { generateLearningTree } from '../api/client';
import TreeVisualization from './TreeVisualization';
import './TreeContainer.css';

const TreeContainer = ({ topic, examResults }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const subtopics = Object.keys(examResults.answersBySubtopic).map((name) => ({
          name,
          answers: examResults.answersBySubtopic[name]
        }));

        const data = await generateLearningTree(topic, subtopics);
        const treeData = JSON.parse(data.tree);
        setTree(treeData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [topic, examResults]);

  if (loading) {
    return <div className="tree-loading">Generating your personalized learning tree...</div>;
  }

  if (error) {
    return <div className="tree-error">Error: {error}</div>;
  }

  return (
    <div className="tree-container">
      <h2>Your Personalized Learning Path</h2>
      {tree && (
        <TreeVisualization
          treeData={tree}
          correctSubtopics={examResults.correctSubtopics}
          incorrectSubtopics={examResults.incorrectSubtopics}
        />
      )}
      <div className="tree-legend">
        <div className="legend-item">
          <div className="legend-color correct"></div>
          <span>Strengths</span>
        </div>
        <div className="legend-item">
          <div className="legend-color incorrect"></div>
          <span>Areas for Improvement</span>
        </div>
        <div className="legend-item">
          <div className="legend-color explore"></div>
          <span>To Be Explored</span>
        </div>
      </div>
    </div>
  );
};

export default TreeContainer;

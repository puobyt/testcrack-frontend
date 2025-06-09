import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AssessmentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Get results from navigation state
  const results = location.state?.results;

  // If no results, redirect to assessment
  if (!results) {
    navigate('/assessment');
    return null;
  }

  const handleTryAgain = () => {
    navigate('/assessment');
  };

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceLevel = (speedScore) => {
    if (speedScore >= 200) return { level: 'Excellent', color: '#10b981', message: 'Outstanding reading speed!' };
    if (speedScore >= 150) return { level: 'Good', color: '#f59e0b', message: 'Great job! Keep improving.' };
    if (speedScore >= 100) return { level: 'Average', color: '#6366f1', message: 'You\'re on the right track.' };
    return { level: 'Needs Improvement', color: '#ef4444', message: 'Practice will help you improve.' };
  };

  const performance = getPerformanceLevel(results.speedScore);

  return (
    <div className="results-container">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <span>⚡</span>
          Speed Learning Assessment
        </div>
        <nav className="header-nav">
          <span className="nav-item">Home</span>
          <span className="nav-item">Topics</span>
          <span className="nav-item active">Assessment</span>
          <span className="nav-item">Results</span>
          <button onClick={logout} className="nav-item" style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
            Logout
          </button>
        </nav>
      </header>

      <div className="results-content">
        {/* Results Header */}
        <div className="results-header">
          <h1 className="results-title">Your Results</h1>
          <p className="results-subtitle">
            You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly.
          </p>
        </div>

        {/* Speed Score Section */}
        <div className="speed-score-section">
          <h2 className="speed-score-label">Speed Score</h2>
          <div className="speed-score-value" style={{ color: performance.color }}>
            {results.speedScore}
          </div>
          <p className="encouragement">
            {performance.message} With time, your learning speed will improve.
          </p>
        </div>

        {/* Learning Stats */}
        <div className="stats-section">
          <h3 className="stats-title">Your Learning Stats</h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{Math.round(results.accuracy)}%</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-label">Response Time</div>
              <div className="stat-value">{formatTime(results.questionTime)}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-label">Reading Speed</div>
              <div className="stat-value">{results.wordsPerMinute} WPM</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🧠</div>
              <div className="stat-label">Retention Rate</div>
              <div className="stat-value">{Math.round(results.retentionRate)}%</div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="stats-section">
          <h3 className="stats-title">Performance Breakdown</h3>
          
          <div className="content-card" style={{ textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Reading Time:</span>
              <span>{formatTime(results.readingTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Question Time:</span>
              <span>{formatTime(results.questionTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Total Time:</span>
              <span>{formatTime(results.totalTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Performance Level:</span>
              <span style={{ color: performance.color, fontWeight: 'bold' }}>{performance.level}</span>
            </div>
          </div>
        </div>

        {/* User Progress Summary */}
        {results.userStats && (
          <div className="stats-section">
            <h3 className="stats-title">Your Overall Progress</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-label">Total Assessments</div>
                <div className="stat-value">{results.userStats.totalAssessments}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-label">Average Score</div>
                <div className="stat-value">{results.userStats.averageSpeedScore}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-label">Best Score</div>
                <div className="stat-value">{results.userStats.bestSpeedScore}</div>
              </div>
            </div>
          </div>
        )}

        {/* Improvement Tips */}
        <div className="stats-section">
          <h3 className="stats-title">Tips for Improvement</h3>
          
          <div className="content-card" style={{ textAlign: 'left' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {results.accuracy < 75 && (
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💡</span>
                  <span>Focus on comprehension - slow down slightly to improve accuracy</span>
                </li>
              )}
              {results.wordsPerMinute < 200 && (
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚀</span>
                  <span>Practice speed reading techniques to increase your reading pace</span>
                </li>
              )}
              {results.questionTime > 60 && (
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚡</span>
                  <span>Work on quick recall - practice answering questions faster</span>
                </li>
              )}
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📚</span>
                <span>Regular practice sessions will help improve your overall performance</span>
              </li>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯</span>
                <span>Try the assessment again to track your improvement</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <button className="try-again-btn" onClick={handleTryAgain}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default AssessmentResults;
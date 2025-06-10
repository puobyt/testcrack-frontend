import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SpeedLearning = () => {
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentStep, setCurrentStep] = useState('reading');
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readingTime, setReadingTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Timer for reading
  useEffect(() => {
    let interval;
    if (currentStep === 'reading' && readingStartTime) {
      interval = setInterval(() => {
        setReadingTime(Date.now() - readingStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, readingStartTime]);

  // Load assessment content
  useEffect(() => {
    loadAssessmentContent();
  }, []);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
    console.log(message);
  };

  const loadAssessmentContent = async () => {
    try {
      setLoading(true);
      addDebugInfo('🔄 Starting API call...');
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      addDebugInfo(`🔑 Token exists: ${!!token}`);
      addDebugInfo(`👤 User exists: ${!!user}`);
      addDebugInfo(`🌐 API URL: ${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`);
      
      if (!token) {
        addDebugInfo('❌ No token found - redirecting to login');
        navigate('/login');
        return;
      }

      addDebugInfo('📞 Making API call to /assessment/content');
      const response = await assessmentAPI.getContent();
      
      addDebugInfo(`📊 API Response received: ${JSON.stringify(response).substring(0, 100)}...`);
      
      if (response.success) {
        setAssessmentData(response.data);
        setUserAnswers(new Array(response.data.questions.length).fill(null));
        setReadingStartTime(Date.now());
        addDebugInfo('✅ Assessment loaded successfully');
      } else {
        addDebugInfo(`❌ API returned unsuccessful: ${response.message || 'Unknown error'}`);
        setError('Failed to load assessment content');
      }
    } catch (error) {
      addDebugInfo(`💥 API Error: ${error.message}`);
      addDebugInfo(`💥 Error details: ${JSON.stringify(error.response?.data || 'No response data')}`);
      setError(error.response?.data?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const useTestData = () => {
    addDebugInfo('🧪 Loading test data...');
    const testData = {
      passage: "This is a test passage to verify the component works. Functions are mathematical entities that assign exactly one output to each input. A function can be represented as f(x) where x is the input variable.",
      questions: [
        {
          question: "What can a function be represented as?",
          options: ["f(x)", "g(y)", "h(z)", "None of the above"]
        },
        {
          question: "How many outputs does a function assign to each input?",
          options: ["Zero", "Exactly one", "Two or more", "It varies"]
        }
      ]
    };
    
    setAssessmentData(testData);
    setUserAnswers(new Array(testData.questions.length).fill(null));
    setReadingStartTime(Date.now());
    setLoading(false);
    setError('');
    addDebugInfo('✅ Test data loaded successfully');
  };

  const handleNextTopic = () => {
    if (currentStep === 'reading') {
      setCurrentStep('questions');
      setQuestionStartTime(Date.now());
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessmentData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setCurrentStep('submitting');
      
      const readingTimeSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
      const questionTimeSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
      
      const response = await assessmentAPI.submitAssessment({
        userAnswers,
        readingTimeSeconds,
        questionTimeSeconds
      });
      
      if (response.success) {
        navigate('/results', { state: { results: response.data } });
      } else {
        setError('Failed to submit assessment');
        setCurrentStep('questions');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit assessment');
      setCurrentStep('questions');
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="assessment-container">
        <div className="loading">Loading assessment content...</div>
        <div style={{ margin: '20px', padding: '20px', background: '#f0f0f0', color: '#333' }}>
          <h3>Debug Info:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{debugInfo}</pre>
          <button onClick={useTestData} style={{ margin: '10px', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            🧪 Use Test Data (Skip API)
          </button>
          <button onClick={loadAssessmentContent} style={{ margin: '10px', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
            🔄 Retry API Call
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-container">
        <div className="error-message">{error}</div>
        <div style={{ margin: '20px', padding: '20px', background: '#f0f0f0', color: '#333' }}>
          <h3>Debug Info:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{debugInfo}</pre>
          <button onClick={useTestData} style={{ margin: '10px', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            🧪 Use Test Data (Skip API)
          </button>
          <button onClick={loadAssessmentContent} style={{ margin: '10px', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
            🔄 Retry API Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <span>⚡</span>
          Test Crack
        </div>
        <nav className="header-nav">
          <span className="nav-item">Home</span>
          <span className="nav-item">Topics</span>
          <span className="nav-item active">Speed Learning</span>
          <span className="nav-item">Practice Tests</span>
          <button onClick={logout} className="nav-item" style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
            Logout
          </button>
        </nav>
      </header>

      {/* Timer */}
      {currentStep === 'reading' && (
        <div className="timer">
          Reading Time: {formatTime(readingTime)}
        </div>
      )}

      <div className="speed-learning">
        {/* Mode Header */}
        <div className="mode-header">
          <div className="mode-title">
            <span>⏱️</span>
            Speed Learning Mode
          </div>
          <div className="controls">
            <div className="control-group">
              <span>Pronunciation</span>
              <div className="toggle-switch"></div>
            </div>
            <div className="control-group">
              <span>Speed</span>
              <div className="speed-control">
                <input type="range" className="speed-slider" min="1" max="10" defaultValue="8" />
                <span>8x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Step */}
        {currentStep === 'reading' && (
          <div className="content-card">
            <div className="content-header">
              <h2 className="content-title">Advanced Algebra Concepts</h2>
              <div className="content-actions">
                <button className="icon-btn">🎤</button>
                <button className="icon-btn">▶️</button>
              </div>
            </div>

            <div className="content-text">
              {assessmentData.passage}
            </div>

            <div className="action-bar">
              <div className="read-aloud">
                <button className="read-aloud-btn">
                  🔊 Read Aloud
                </button>
                <input type="range" className="speed-slider" min="0.5" max="3" step="0.1" defaultValue="1" />
              </div>

              <div className="action-buttons">
                <button className="btn btn-secondary">Retention Quiz</button>
                <button className="btn btn-primary" onClick={handleNextTopic}>
                  Next Topic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && (
          <div className="questions-section">
            <div className="content-card">
              <div className="content-header">
                <h2 className="content-title">
                  Question {currentQuestionIndex + 1} of {assessmentData.questions.length}
                </h2>
              </div>

              <div className="question-card">
                <div className="question-text">
                  {assessmentData.questions[currentQuestionIndex].question}
                </div>

                <div className="options-list">
                  {assessmentData.questions[currentQuestionIndex].options.map((option, index) => (
                    <div
                      key={index}
                      className={`option-item ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                    >
                      <div className={`option-radio ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}></div>
                      <div className="option-text">{option}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="action-bar">
                <button 
                  className="btn btn-secondary" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextQuestion}
                  disabled={userAnswers[currentQuestionIndex] === null}
                >
                  {currentQuestionIndex === assessmentData.questions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submitting Step */}
        {currentStep === 'submitting' && (
          <div className="content-card">
            <div className="loading">Calculating your speed score...</div>
          </div>
        )}

        {/* Progress Section */}
        <div className="progress-section">
          <h3 className="progress-header">Your Learning Progress</h3>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / (assessmentData?.questions.length || 1)) * 100}%` }}
            ></div>
          </div>
          
          <div className="progress-level">Level 8</div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Topics Mastered</div>
              <div className="stat-value">12</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-label">Speed Score</div>
              <div className="stat-value">780</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Retention Rate</div>
              <div className="stat-value">92%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedLearning;
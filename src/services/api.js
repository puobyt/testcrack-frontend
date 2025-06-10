import axios from 'axios';

// Base URL for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  signin: async (userData) => {
    const response = await api.post('/auth/signin', userData);
    return response.data;
  },
};

// Enhanced Assessment API calls
export const assessmentAPI = {
  // Get available subjects with performance stats
  getSubjects: async () => {
    const response = await api.get('/assessment/subjects');
    return response.data;
  },
  
  // Get content by subject and level
  getContent: async (subject = 'mathematics', level = 'intermediate') => {
    const response = await api.get(`/assessment/content?subject=${subject}&level=${level}`);
    return response.data;
  },
  
  // Submit assessment with subject and premium features
  submitAssessment: async (assessmentData) => {
    const response = await api.post('/assessment/submit', assessmentData);
    return response.data;
  },
  
  // Premium Features
  useReadAloud: async () => {
    const response = await api.post('/assessment/premium/read-aloud');
    return response.data;
  },
  
  // Credit Management
  purchaseCredits: async (packageType) => {
    const response = await api.post('/assessment/credits/purchase', { 
      package: packageType 
    });
    return response.data;
  },
  
  // Get credit packages available for purchase
  getCreditPackages: () => {
    return {
      basic: { 
        credits: 50, 
        price: 4.99, 
        popular: false,
        description: 'Perfect for occasional use',
        features: ['50 Credits', 'Read Aloud (25 uses)', 'Basic Support']
      },
      standard: { 
        credits: 120, 
        price: 9.99, 
        popular: true,
        description: 'Most popular choice',
        features: ['120 Credits', 'Read Aloud (60 uses)', 'Priority Support', '20% Bonus Credits']
      },
      premium: { 
        credits: 300, 
        price: 19.99, 
        popular: false,
        description: 'Best value for power users',
        features: ['300 Credits', 'Read Aloud (150 uses)', 'Premium Support', '50% Bonus Credits', 'Early Access Features']
      }
    };
  }
};

// User API calls
export const userAPI = {
  getProgress: async () => {
    const response = await api.get('/user/progress');
    return response.data;
  },
  
  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },
  
  // Get user's subject performance
  getSubjectPerformance: async (subject) => {
    const response = await api.get(`/user/performance/${subject}`);
    return response.data;
  }
};

// Subject utility functions
export const subjectUtils = {
  // Get subject info by ID
  getSubjectInfo: (subjectId) => {
    const subjects = {
      'mathematics': { 
        name: 'Mathematics', 
        icon: '🔢', 
        color: '#3B82F6',
        description: 'Algebra, geometry, calculus and more',
        difficulty: 'Medium'
      },
      'physics': { 
        name: 'Physics', 
        icon: '⚛️', 
        color: '#8B5CF6',
        description: 'Laws of motion, energy, and matter',
        difficulty: 'Hard'
      },
      'chemistry': { 
        name: 'Chemistry', 
        icon: '🧪', 
        color: '#10B981',
        description: 'Atoms, molecules, and reactions',
        difficulty: 'Hard'
      },
      'biology': { 
        name: 'Biology', 
        icon: '🧬', 
        color: '#F59E0B',
        description: 'Life sciences and living organisms',
        difficulty: 'Medium'
      },
      'literature': { 
        name: 'Literature', 
        icon: '📚', 
        color: '#EF4444',
        description: 'Literary analysis and comprehension',
        difficulty: 'Medium'
      },
      'history': { 
        name: 'History', 
        icon: '🏛️', 
        color: '#8B5A2B',
        description: 'Historical events and civilizations',
        difficulty: 'Easy'
      },
      'computer-science': { 
        name: 'Computer Science', 
        icon: '💻', 
        color: '#6366F1',
        description: 'Programming and algorithms',
        difficulty: 'Hard'
      },
      'economics': { 
        name: 'Economics', 
        icon: '📈', 
        color: '#059669',
        description: 'Economic principles and markets',
        difficulty: 'Medium'
      },
      'psychology': { 
        name: 'Psychology', 
        icon: '🧠', 
        color: '#DC2626',
        description: 'Human behavior and mental processes',
        difficulty: 'Medium'
      },
      'general-knowledge': { 
        name: 'General Knowledge', 
        icon: '🌍', 
        color: '#6B7280',
        description: 'Mixed topics and general facts',
        difficulty: 'Easy'
      }
    };
    
    return subjects[subjectId] || subjects['general-knowledge'];
  },
  
  // Get difficulty color
  getDifficultyColor: (difficulty) => {
    const colors = {
      'Easy': '#10B981',
      'Medium': '#F59E0B', 
      'Hard': '#EF4444'
    };
    return colors[difficulty] || colors['Medium'];
  },
  
  // Format subject performance
  formatPerformance: (performance) => {
    if (!performance || performance.totalAssessments === 0) {
      return {
        level: 'Beginner',
        color: '#6B7280',
        message: 'Start your first assessment!'
      };
    }
    
    const avgScore = performance.averageScore;
    if (avgScore >= 200) {
      return { level: 'Expert', color: '#10B981', message: 'Outstanding performance!' };
    } else if (avgScore >= 150) {
      return { level: 'Advanced', color: '#3B82F6', message: 'Great progress!' };
    } else if (avgScore >= 100) {
      return { level: 'Intermediate', color: '#F59E0B', message: 'Keep improving!' };
    } else {
      return { level: 'Beginner', color: '#EF4444', message: 'Practice makes perfect!' };
    }
  }
};

// Premium feature utilities
export const premiumUtils = {
  // Check if user can afford a feature
  canAfford: (userCredits, featureCost) => {
    return userCredits >= featureCost;
  },
  
  // Get feature costs
  getFeatureCosts: () => {
    return {
      readAloud: 2,
      speedBoost: 3,
      hints: 1,
      customContent: 5,
      advancedAnalytics: 4
    };
  },
  
  // Format credits display
  formatCredits: (credits) => {
    if (credits >= 1000) {
      return `${(credits / 1000).toFixed(1)}k`;
    }
    return credits.toString();
  },
  
  // Get credit status color
  getCreditStatusColor: (credits) => {
    if (credits >= 50) return '#10B981'; // Green
    if (credits >= 20) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  },
  
  // Calculate savings for credit packages
  calculateSavings: (packageType) => {
    const packages = assessmentAPI.getCreditPackages();
    const pkg = packages[packageType];
    if (!pkg) return 0;
    
    const regularPrice = (pkg.credits * 0.15); // $0.15 per credit normally
    const savings = ((regularPrice - pkg.price) / regularPrice) * 100;
    return Math.round(savings);
  }
};

// Local storage utilities for user preferences
export const storageUtils = {
  // Save user's last selected subject
  setLastSubject: (subject) => {
    localStorage.setItem('lastSubject', subject);
  },
  
  getLastSubject: () => {
    return localStorage.getItem('lastSubject') || 'mathematics';
  },
  
  // Save user's preferred difficulty
  setPreferredDifficulty: (difficulty) => {
    localStorage.setItem('preferredDifficulty', difficulty);
  },
  
  getPreferredDifficulty: () => {
    return localStorage.getItem('preferredDifficulty') || 'intermediate';
  },
  
  // Save assessment settings
  setAssessmentSettings: (settings) => {
    localStorage.setItem('assessmentSettings', JSON.stringify(settings));
  },
  
  getAssessmentSettings: () => {
    const settings = localStorage.getItem('assessmentSettings');
    return settings ? JSON.parse(settings) : {
      autoAdvance: false,
      showTimer: true,
      soundEffects: true,
      darkMode: false
    };
  }
};

// Helper functions (enhanced)
export const auth = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear user preferences on logout
    localStorage.removeItem('lastSubject');
    localStorage.removeItem('preferredDifficulty');
    localStorage.removeItem('assessmentSettings');
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Enhanced user info with credits
  getUserInfo: () => {
    const user = auth.getUser();
    if (!user) return null;
    
    return {
      ...user,
      creditsStatus: premiumUtils.getCreditStatusColor(user.credits || 0),
      formattedCredits: premiumUtils.formatCredits(user.credits || 0)
    };
  }
};

// Error handling utilities
export const errorUtils = {
  // Handle API errors gracefully
  handleApiError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your connection.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  },
  
  // Check if error is due to insufficient credits
  isInsufficientCredits: (error) => {
    return error.response?.data?.message?.includes('Insufficient credits');
  }
};
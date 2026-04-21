import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Initialize auth from localStorage token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        try {
          setToken(storedToken);
          // Fetch user from backend using token
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          // Token is invalid or expired
          console.error('Auth initialization failed:', err);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = res.data;

      // Only store JWT token in localStorage (not user data)
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setError(null);
      const res = await authAPI.register({ name, email, password, role });
      const { token: newToken, user: userData } = res.data;

      // Only store JWT token in localStorage (not user data)
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // If refresh fails, logout the user
      logout();
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

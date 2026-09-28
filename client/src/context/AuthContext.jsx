import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('temora_token') || localStorage.getItem('focusflow_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('temora_token');
    localStorage.removeItem('focusflow_token');
    localStorage.removeItem('temora_user');
    localStorage.removeItem('focusflow_user');
    setToken(null);
    setUser(null);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('temora_token') || localStorage.getItem('focusflow_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session verify failed:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('temora_token', newToken);
        localStorage.setItem('focusflow_token', newToken);
        setToken(newToken);
        setUser(userData);
        addToast(`Welcome back, ${userData.name}!`, 'success');
        return { success: true, user: userData };
      }
    } catch (err) {
      let message = err.response?.data?.message;
      if (!message) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          message = `Cannot connect to API server (${api.defaults.baseURL}). Please verify your backend is running.`;
        } else if (err.response?.status === 404) {
          message = `API endpoint not found (404) at ${api.defaults.baseURL}.`;
        } else {
          message = err.message || 'Login failed. Please check your credentials.';
        }
      }
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('temora_token', newToken);
        localStorage.setItem('focusflow_token', newToken);
        setToken(newToken);
        setUser(userData);
        addToast(`Welcome to Temora, ${userData.name}!`, 'success');
        return { success: true, user: userData };
      }
    } catch (err) {
      let message = err.response?.data?.message;
      if (!message) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          message = `Cannot connect to API server (${api.defaults.baseURL}). Please verify your backend is running.`;
        } else if (err.response?.status === 404) {
          message = `API endpoint not found (404) at ${api.defaults.baseURL}. Check VITE_API_URL on Vercel.`;
        } else {
          message = err.message || 'Registration failed. Please try again.';
        }
      }
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.data?.success) {
        const updatedUser = { ...user, ...res.data.user };
        setUser(updatedUser);
        localStorage.setItem('temora_user', JSON.stringify(updatedUser));
        localStorage.setItem('focusflow_user', JSON.stringify(updatedUser));
        addToast('Profile updated successfully', 'success');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const updateUserSettings = async (newSettings) => {
    try {
      const res = await api.put('/users/settings', newSettings);
      if (res.data?.success) {
        setUser((prev) => ({ ...prev, settings: res.data.settings }));
        addToast('Settings saved', 'success');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save settings';
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const res = await api.post('/auth/google', googleData);
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('temora_token', newToken);
        localStorage.setItem('focusflow_token', newToken);
        setToken(newToken);
        setUser(userData);
        addToast(`Welcome to Temora, ${userData.name}!`, 'success');
        return { success: true, user: userData };
      }
    } catch (err) {
      let message = err.response?.data?.message;
      if (!message) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          message = `Cannot connect to API server (${api.defaults.baseURL}). Please verify your backend is running.`;
        } else {
          message = err.message || 'Google sign-in failed. Please try again.';
        }
      }
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        updateUserProfile,
        updateUserSettings,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

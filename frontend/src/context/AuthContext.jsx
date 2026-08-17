import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // Sync logout event triggered by Axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [logout]);

  // Initial user validation on load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('auth/me/');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch {
          // If token verification fails and refresh also fails, clear state
          if (!localStorage.getItem('access_token')) {
            logout();
          }
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(access);
      setRefreshToken(refresh);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (username, email, password, passwordConfirm) => {
    try {
      await api.post('auth/register/', {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      // Auto login after successful registration
      return await login(username, password);
    } catch (error) {
      const errors = error.response?.data;
      let errorMsg = 'Registration failed. Please check your inputs.';

      if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        const firstVal = errors[firstKey];
        if (Array.isArray(firstVal)) {
          errorMsg = `${firstKey}: ${firstVal[0]}`;
        } else if (typeof firstVal === 'string') {
          errorMsg = firstVal;
        }
      }

      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

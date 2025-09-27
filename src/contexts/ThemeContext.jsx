import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProfile } from '@/redux/authSlice';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { profile } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState('light');

  // Initialize theme from profile or localStorage
  useEffect(() => {
    const savedTheme = profile?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [profile?.theme]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const changeTheme = async (newTheme) => {
    try {
      // Optimistic update
      setTheme(newTheme);
      applyTheme(newTheme);
      
      // Update in database if user is logged in
      if (profile) {
        const response = await fetch('http://localhost:5000/api/v1/user/appearance-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ theme: newTheme }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            dispatch(setProfile(data.user));
          }
        }
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Revert on error
      const fallbackTheme = profile?.theme || 'light';
      setTheme(fallbackTheme);
      applyTheme(fallbackTheme);
    }
  };

  const value = {
    theme,
    changeTheme,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

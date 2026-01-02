/**
 * ThemeProvider - Application Theme System
 * =========================================
 * 
 * Provides light/dark theme support with smooth transitions
 * and persistent preference storage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme definitions
const themes = {
    light: {
        name: 'light',
        colors: {
            background: '#ffffff',
            surface: '#f8fafc',
            surfaceHighlight: '#f1f5f9',
            primary: '#1e293b',
            secondary: '#64748b',
            accent: '#6366f1',
            accentLight: '#e0e7ff',
            border: '#e2e8f0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        }
    },
    dark: {
        name: 'dark',
        colors: {
            background: '#0f172a',
            surface: '#1e293b',
            surfaceHighlight: '#334155',
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            accent: '#818cf8',
            accentLight: '#312e81',
            border: '#334155',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171'
        }
    }
};

const ThemeContext = createContext({
    theme: themes.light,
    isDark: false,
    toggleTheme: () => { },
    setTheme: () => { }
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('devsavvy_theme');
        if (saved) return saved === 'dark';
        // Then check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const theme = isDark ? themes.dark : themes.light;

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Apply CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Toggle dark class
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save preference
        localStorage.setItem('devsavvy_theme', isDark ? 'dark' : 'light');
    }, [isDark, theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const saved = localStorage.getItem('devsavvy_theme');
            if (!saved) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => setIsDark(!isDark);
    const setTheme = (themeName) => setIsDark(themeName === 'dark');

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;

import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) return null;
      
      if (typeof storedUserInfo === 'object') return storedUserInfo;
      
      const parsedData = JSON.parse(storedUserInfo);
      return parsedData;
    } catch (error) {
      console.error('Error parsing stored user info:', error);
      localStorage.removeItem('userInfo');
      return null;
    }
  });
  const [viewPanel, setViewPanel] = useState(localStorage.getItem('ViewPanel') || 'dashboard');
  const [viewUser, setViewUser] = useState(localStorage.getItem('ViewUser') || 'citizen');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setUserData = (userData) => {
    try {
      setUserInfo(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  };

  const clearUserData = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const contextValue = {
    theme,
    setTheme,
    userInfo,
    setUserInfo,
    viewPanel,
    setViewPanel,
    viewUser,
    setViewUser,
    toggleTheme,
    setUserData,
    clearUserData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

import { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './comps/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ThemeToggle from './comps/ThemeToggle';
import { AppProvider } from './context/AppContext';

const Dashboard = lazy(() => import('./pages/Dashbaord'));
const LandingPage = lazy(() => import('./pages/landing_page'));

function AppRoutes() {
  const token = localStorage.getItem('token');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simply check if token exists
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <ThemeToggle />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Login />} />
          <Route path="/login" element={isAuthenticated ? <Dashboard /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Dashboard /> : <Register />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Dashboard /> : <ForgotPassword />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;

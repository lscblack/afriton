import { useState,Suspense,lazy } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './comps/Loader';
import Login  from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';



const Dashboard = lazy(() => import('./pages/Dashbaord'));
const LandingPage = lazy(() => import('./pages/landing_page'));
function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      {/*  */}
      <Router>
        <Suspense fallback={<Loading/>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  )
}

export default App

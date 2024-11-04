import { useState,Suspense,lazy } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const Dashboard = lazy(() => import('./pages/Dashbaord'));
const LandingPage = lazy(() => import('./pages/landing_page'));
function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      {/*  */}
      <Router>
        <Suspense fallback={"Loading..."}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  )
}

export default App

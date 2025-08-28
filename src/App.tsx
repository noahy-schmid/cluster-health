import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import MembershipPage from './components/MembershipPage';

function App() {
  // Get the basename from PUBLIC_URL environment variable for proper routing in deployed environments
  const basename = process.env.PUBLIC_URL || '';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/membership" element={<MembershipPage />} />
      </Routes>
    </Router>
  );
}

export default App;

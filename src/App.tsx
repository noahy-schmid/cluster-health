import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import MembershipPage from './components/MembershipPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/membership" element={<MembershipPage />} />
      </Routes>
    </Router>
  );
}

export default App;

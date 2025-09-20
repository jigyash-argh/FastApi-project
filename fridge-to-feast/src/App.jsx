import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreateRecipePage from './pages/CreateRecipePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import QuickAdd from './pages/QuickAdd';
import AuthLayout from './layouts/AuthLayout';
import Navbar from './components/Navbar';

const AppContent = () => {
  const location = useLocation();
  // We will show the Navbar on all pages except '/create'
  const showNavbar = location.pathname !== '/create';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quick-add" element={<QuickAdd />} />

        {/* Protected Route using AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/create" element={<CreateRecipePage />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;



import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { LoginPage, RegisterPage } from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import { DietaPage } from './pages/DietaPage';
import { TreinoPage } from './pages/TreinoPage';
import { ProgressoPage, ProgressoPesoPage, ProgressoTreinoPage } from './pages/ProgressoPage';
import PerfilPage from './pages/PerfilPage';
import MainLayout from './app/app/layout';

// A component that protects routes that require authentication.
// If the user is not authenticated, it redirects them to the login page.
const ProtectedLayout: React.FC<{ isAllowed: boolean; onLogout: () => void }> = ({ isAllowed, onLogout }) => {
  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  // If allowed, it renders the main layout, passing the logout handler to it.
  return (
    <MainLayout onLogout={onLogout}>
      <Outlet />
    </MainLayout>
  );
};

const App: React.FC = () => {
  // This state now controls access to the entire authenticated part of the app.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  
  return (
    <Routes>
      {/* --- PUBLIC & ONBOARDING ROUTES --- */}
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* The new, unified onboarding route */}
      <Route path="/onboarding" element={<OnboardingPage onComplete={handleLogin} />} />


      {/* --- PROTECTED MAIN APP ROUTES --- */}
      <Route path="/" element={<ProtectedLayout isAllowed={isAuthenticated} onLogout={handleLogout} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dieta" element={<DietaPage />} />
        <Route path="treino" element={<TreinoPage />} />
        <Route path="progresso" element={<ProgressoPage />} />
        <Route path="progresso/peso" element={<ProgressoPesoPage />} />
        <Route path="progresso/treino" element={<ProgressoTreinoPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        {/* Any other authenticated route will redirect to the dashboard */}
        <Route path="*" element="<Navigate to="/dashboard" replace />" />
      </Route>
    </Routes>
  );
};

export default App;
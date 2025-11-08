import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { OnboardingLayout, AnamnesePage, ObjetivoPage, PreferenciasPage, GerandoPage } from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import { DietaPage, PlanoSemanalDietaPage } from './pages/DietaPage';
import { TreinoPage, ProgramaSemanalTreinoPage } from './pages/TreinoPage';
import { ProgressoPage, ProgressoPesoPage, ProgressoTreinoPage } from './pages/ProgressoPage';
import PerfilPage from './pages/PerfilPage';
import MainLayout from './app/app/layout';

// Wrapper for the onboarding layout to pass the onComplete callback
const OnboardingLayoutRoute: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <OnboardingLayout>
    <Outlet context={{ onComplete }} />
  </OnboardingLayout>
);

// A new component that acts as a "protected route" for the main application.
// It checks if onboarding is complete. If not, it redirects to the onboarding flow.
const ProtectedAppLayout: React.FC<{ isAllowed: boolean }> = ({ isAllowed }) => {
  if (!isAllowed) {
    return <Navigate to="/onboarding/anamnese" replace />;
  }

  // If allowed, it renders the main layout with the nested routes.
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};


const App: React.FC = () => {
  // This state determines whether to show the onboarding or the main app.
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  return (
    <Routes>
      {/* Onboarding Routes (rendered without the main app layout/sidebar) */}
      <Route element={<OnboardingLayoutRoute onComplete={() => setOnboardingComplete(true)} />}>
        <Route path="/onboarding" element={<Navigate to="/onboarding/anamnese" replace />} />
        <Route path="/onboarding/anamnese" element={<AnamnesePage />} />
        <Route path="/onboarding/objetivo" element={<ObjetivoPage />} />
        <Route path="/onboarding/preferencias" element={<PreferenciasPage />} />
        <Route path="/onboarding/gerando" element={<GerandoPage />} />
      </Route>

      {/* Main App Routes (now wrapped in the protected layout) */}
      <Route path="/" element={<ProtectedAppLayout isAllowed={onboardingComplete} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dieta" element={<DietaPage />} />
        <Route path="dieta/plano-semanal" element={<PlanoSemanalDietaPage />} />
        <Route path="treino" element={<TreinoPage />} />
        <Route path="treino/programa-semanal" element={<ProgramaSemanalTreinoPage />} />
        <Route path="progresso" element={<ProgressoPage />} />
        <Route path="progresso/peso" element={<ProgressoPesoPage />} />
        <Route path="progresso/treino" element={<ProgressoTreinoPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

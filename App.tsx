"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from './routing';
import AppLayout from './app/(app)/layout';
import DashboardPage from './app/(app)/dashboard/page';
import DietaPage from './app/(app)/dieta/page';
import TreinoPage from './app/(app)/treino/page';
import ProgressoPage from './app/(app)/progresso/page';
import PerfilPage from './app/(app)/perfil/page';
import DietaMetricasPage from './app/(app)/dieta/metricas/page';
import ProgressoMetricasPage from './app/(app)/progresso/metricas/page';
import TreinoMetricasPage from './app/(app)/treino/metricas/page';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import OnboardingPage from './app/onboarding/page';

const App: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // If the user is at the root, redirect to login.
        if (pathname === '/') {
            router.replace('/login');
        }
    }, [pathname, router]);

    const renderPage = () => {
        switch (pathname) {
            case '/dashboard':
                return <DashboardPage />;
            case '/dieta':
                return <DietaPage />;
            case '/treino':
                return <TreinoPage />;
            case '/progresso':
                return <ProgressoPage />;
            case '/perfil':
                return <PerfilPage />;
            case '/dieta/metricas':
                return <DietaMetricasPage />;
            case '/progresso/metricas':
                return <ProgressoMetricasPage />;
            case '/treino/metricas':
                return <TreinoMetricasPage />;
            case '/login':
                return <LoginPage />;
            case '/register':
                return <RegisterPage />;
            case '/onboarding':
                return <OnboardingPage />;
            default:
                // For any unknown route, redirect to dashboard or login
                // This prevents showing a blank page if the hash is invalid
                if (pathname && pathname !== '/') {
                   router.replace('/login');
                }
                return null;
        }
    };
    
    const isAppPage = [
        '/dashboard', '/dieta', '/treino', '/progresso', '/perfil',
        '/dieta/metricas', '/progresso/metricas', '/treino/metricas'
    ].includes(pathname);


    if (pathname === '/') {
        return <div className="w-screen h-screen flex items-center justify-center bg-gray-50"><div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (isAppPage) {
        return <AppLayout>{renderPage()}</AppLayout>;
    }

    return renderPage();
};

export default App;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, FlameIcon, DumbbellIcon, LineChartIcon, UserIcon, LogOutIcon } from '../../components';

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { path: "/dieta", label: "Dieta", icon: FlameIcon },
  { path: "/treino", label: "Treino", icon: DumbbellIcon },
  { path: "/progresso", label: "Progresso", icon: LineChartIcon },
  { path: "/perfil", label: "Perfil", icon: UserIcon },
];

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-brand-600">NutriCoach</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/50'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <LogOutIcon className="h-5 w-5 mr-3"/>
                    Sair
                </button>
            </div>
        </aside>
    );
};


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
    <div className="hidden md:flex">
      <Sidebar />
    </div>
    <main className="flex-1 overflow-y-auto">
        {children}
    </main>
  </div>
);

export default MainLayout;

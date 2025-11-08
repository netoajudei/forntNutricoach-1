
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

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-20 flex items-center justify-center px-4 border-b border-gray-200">
             <h1 className="text-3xl font-extrabold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
                    NutriCoach
                </span>
            </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                        isActive
                            ? 'bg-green-50 text-green-600'
                            : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                        }`
                    }
                >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                </NavLink>
            ))}
        </nav>
        <div className="px-4 py-6 border-t border-gray-200">
            <button 
                onClick={onLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600"
            >
                <LogOutIcon className="h-5 w-5 mr-3"/>
                Sair
            </button>
        </div>
    </aside>
);

const BottomNavBar: React.FC = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex md:hidden items-center justify-around z-10">
        {navItems.map((item) => (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center text-xs w-full h-full transition-colors ${
                    isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                    }`
                }
            >
                <item.icon className="h-6 w-6 mb-1" />
                <span>{item.label}</span>
            </NavLink>
        ))}
    </nav>
);


const MainLayout: React.FC<{ children: React.ReactNode; onLogout: () => void; }> = ({ children, onLogout }) => (
  <div className="flex h-screen bg-gray-50">
    {/* Sidebar for medium screens and up */}
    <div className="hidden md:flex">
      <Sidebar onLogout={onLogout} />
    </div>

    {/* Main content */}
    <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
    </main>

    {/* Bottom Nav for small screens */}
    <BottomNavBar />
  </div>
);

export default MainLayout;
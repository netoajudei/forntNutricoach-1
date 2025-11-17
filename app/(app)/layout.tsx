// Este é um Client Component porque precisa gerenciar o estado do logout.
// Em uma app real, isso seria gerenciado por um Provider de sessão.
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HomeIcon, FlameIcon, DumbbellIcon, LineChartIcon, UserIcon, LogOutIcon } from '@/components';
import { isImpersonating, stopImpersonation } from '@/lib/impersonation';

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { path: "/dieta", label: "Dieta", icon: FlameIcon },
  { path: "/treino", label: "Treino", icon: DumbbellIcon },
  { path: "/progresso", label: "Progresso", icon: LineChartIcon },
  { path: "/perfil", label: "Perfil", icon: UserIcon },
];

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const pathname = usePathname();
    const router = useRouter();
    const showBackToPro = typeof window !== 'undefined' ? isImpersonating() : false;
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="h-20 flex items-center justify-center px-4 border-b border-gray-200">
                <h1 className="text-3xl font-extrabold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
                        ZapNutri
                    </span>
                </h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {showBackToPro && (
                    <button
                        onClick={() => {
                            stopImpersonation();
                            router.push('/profissional/alunos');
                            router.refresh();
                        }}
                        className="w-full text-left flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    >
                        ← Voltar ao painel do profissional
                    </button>
                )}
                {navItems.map((item) => {
                    const isActive = pathname?.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                            isActive
                                ? 'bg-green-50 text-green-600'
                                : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                            }`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </Link>
                    )
                })}
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
}

const BottomNavBar: React.FC = () => {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex md:hidden items-center justify-around z-10">
            {navItems.map((item) => {
                 const isActive = pathname?.startsWith(item.path);
                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex flex-col items-center justify-center text-xs w-full h-full transition-colors ${
                        isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                        }`}
                    >
                        <item.icon className="h-6 w-6 mb-1" />
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar onLogout={handleLogout} />
      </div>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
      </main>

      <BottomNavBar />
    </div>
  );
}
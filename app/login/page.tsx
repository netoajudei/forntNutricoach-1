"use client";

import React from 'react';
import { Link, useRouter } from '../../routing';
import { Card, Button } from '../../components';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            {children}
        </Card>
    </div>
);

export default function LoginPage() {
    const router = useRouter();

    const handleLoginClick = () => {
        // Em um app real, você validaria as credenciais aqui.
        // Para este mock, apenas navegamos para o dashboard.
        router.push('/dashboard'); 
    };
    
    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-900">Bem-vindo(a)!</h2>
            <p className="text-center text-gray-500 mb-6">Entre na sua conta para continuar.</p>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" placeholder="seu@email.com" defaultValue="alex.silva@email.com" className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                    <label className="text-sm font-medium">Senha</label>
                    <input type="password" placeholder="********" defaultValue="123456" className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                </div>
            </div>
            <Button className="w-full mt-6" onClick={handleLoginClick}>Entrar</Button>
            <p className="text-center text-sm text-gray-500 mt-4">
                Não tem uma conta? <Link href="/register" className="font-medium text-green-600 hover:underline">Cadastre-se</Link>
            </p>
        </AuthLayout>
    );
};
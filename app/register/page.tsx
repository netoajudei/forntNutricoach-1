import React from 'react';
import { Link } from '../../routing';
import { Card, Button } from '../../components';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            {children}
        </Card>
    </div>
);

export default function RegisterPage() {
    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-900">Crie sua Conta</h2>
            <p className="text-center text-gray-500 mb-6">É rápido e fácil para começar.</p>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm font-medium">Nome Completo</label>
                    <input type="text" placeholder="Seu Nome" className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" placeholder="seu@email.com" className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                    <label className="text-sm font-medium">Senha</label>
                    <input type="password" placeholder="Crie uma senha forte" className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                </div>
            </div>
            <Link href="/onboarding">
                <Button className="w-full mt-6">Criar Conta e Continuar</Button>
            </Link>
            <p className="text-center text-sm text-gray-500 mt-4">
                Já tem uma conta? <Link href="/login" className="font-medium text-green-600 hover:underline">Entre</Link>
            </p>
        </AuthLayout>
    );
};
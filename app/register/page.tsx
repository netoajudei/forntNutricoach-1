"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components';
import RegisterForm from '@/components/auth/RegisterForm';

export const dynamic = "force-dynamic";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            {children}
        </Card>
    </div>
);

export default function RegisterPage() {
    const router = useRouter();

    const handleSuccess = async (userId: string) => {
        // Redireciona para onboarding após registro
        router.push('/onboarding');
        router.refresh();
    };

    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-900">Crie sua Conta</h2>
            <p className="text-center text-gray-500 mb-6">É rápido e fácil para começar.</p>

            <RegisterForm onSuccess={handleSuccess} />

            <p className="text-center text-sm text-gray-500 mt-4">
                Já tem uma conta? <Link href="/login" className="font-medium text-green-600 hover:underline">Entre</Link>
            </p>
        </AuthLayout>
    );
};
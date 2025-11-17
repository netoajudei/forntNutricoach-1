"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, Button } from '@/components';

export const dynamic = "force-dynamic";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            {children}
        </Card>
    </div>
);

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = React.useRef<ReturnType<typeof createClient> | null>(null);
    React.useEffect(() => {
        // Inicializa apenas no cliente para evitar erro no build/prerender
        supabaseRef.current = createClient();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!supabaseRef.current) {
                setError('Cliente não inicializado. Tente novamente.');
                setLoading(false);
                return;
            }
            const { data, error: signInError } = await supabaseRef.current.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Busca papel na tabela 'alunos' (regra oficial do projeto)
                try {
                    const { data: aluno, error: alunoErr } = await supabaseRef.current
                      .from('alunos')
                      .select('id, nome_completo, email, role')
                      .eq('auth_user_id', data.user.id)
                      .maybeSingle();
                    // Se houver erro ou não existir, segue para dashboard como aluno
                    if (alunoErr) {
                        router.replace('/dashboard');
                        router.refresh();
                        return;
                    }
                    const role = (aluno?.role || '').toString().toLowerCase().trim();
                    const isProfessional = role && role !== 'aluno';
                    if (isProfessional) {
                        router.replace('/profissional/alunos');
                    } else {
                        router.replace('/dashboard');
                    }
                    router.refresh();
                } catch {
                    router.replace('/dashboard');
                    router.refresh();
                }
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
            setLoading(false);
        }
    };
    
    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-900">Bem-vindo(a)!</h2>
            <p className="text-center text-gray-500 mb-6">Entre na sua conta para continuar.</p>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Senha</label>
                    <input 
                        type="password" 
                        placeholder="********" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    />
                </div>
                <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={loading}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
                Não tem uma conta? <Link href="/register" className="font-medium text-green-600 hover:underline">Cadastre-se</Link>
            </p>
        </AuthLayout>
    );
};
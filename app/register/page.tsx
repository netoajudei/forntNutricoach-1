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

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = React.useRef<ReturnType<typeof createClient> | null>(null);
    React.useEffect(() => {
        // Inicializa apenas no cliente para evitar falha no build/prerender
        supabaseRef.current = createClient();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            if (!supabaseRef.current) {
                setError('Cliente não inicializado. Tente novamente.');
                setLoading(false);
                return;
            }
            const { data, error: signUpError } = await supabaseRef.current.auth.signUp({
                email,
                password,
                options: {
                    data: {},
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Verificar se o aluno já existe
                const { data: alunoExistente } = await supabaseRef.current
                    .from('alunos')
                    .select('id')
                    .eq('auth_user_id', data.user.id)
                    .maybeSingle();

                let alunoError = null;

                if (alunoExistente) {
                    // Se já existe, atualiza os dados
                    const { error } = await supabaseRef.current
                        .from('alunos')
                        .update({
                            email: email,
                        })
                        .eq('auth_user_id', data.user.id);
                    alunoError = error;
                } else {
                    // Se não existe, cria novo registro
                    const { error } = await supabaseRef.current
                        .from('alunos')
                        .insert({
                            auth_user_id: data.user.id,
                            email: email,
                            whatsapp: '', // Campo obrigatório, será atualizado no onboarding se necessário
                        });
                    alunoError = error;
                }

                if (alunoError) {
                    // Se o erro não for de duplicata, mostra mensagem
                    if (alunoError.code !== '23505') {
                        console.error('Erro ao criar/atualizar registro do aluno:', alunoError);
                        setError(`Erro ao criar conta: ${alunoError.message}`);
                        setLoading(false);
                        return;
                    }
                    // Se for duplicata, apenas continua (registro já existe)
                }

                // Redireciona para onboarding após registro
                router.push('/onboarding');
                router.refresh();
            }
        } catch (err) {
            setError('Erro ao criar conta. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-900">Crie sua Conta</h2>
            <p className="text-center text-gray-500 mb-6">É rápido e fácil para começar.</p>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
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
                        placeholder="Crie uma senha forte" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Confirmar Senha</label>
                    <input 
                        type="password" 
                        placeholder="Repita a senha" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    />
                </div>
                <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={loading}
                >
                    {loading ? 'Criando conta...' : 'Criar Conta e Continuar'}
                </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
                Já tem uma conta? <Link href="/login" className="font-medium text-green-600 hover:underline">Entre</Link>
            </p>
        </AuthLayout>
    );
};
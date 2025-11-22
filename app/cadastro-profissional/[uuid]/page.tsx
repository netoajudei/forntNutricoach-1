"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components';
import RegisterForm from '@/components/auth/RegisterForm';
import { submitSimplifiedOnboarding, linkStudentToProfessional } from '@/lib/services/onboarding.service';

interface Professional {
    id: string;
    nome_completo: string;
    avatar_url?: string;
}

export default function ProfessionalInvitePage() {
    const router = useRouter();
    const params = useParams();
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfessional = async () => {
            const uuid = params?.uuid as string;
            if (!uuid) {
                router.replace('/register');
                return;
            }

            const supabase = createClient();

            // Fetch from 'alunos' table as per user instruction (it stores professionals too)
            const { data, error } = await supabase
                .from('alunos')
                .select('id, nome_completo, avatar_url')
                .eq('id', uuid)
                .maybeSingle();

            if (error || !data) {
                console.error('Professional not found:', error);
                // Fallback: try fetching from 'usuarios' or 'profiles' if 'profissionais' fails?
                // For now, redirect to register if not found.
                router.replace('/register');
                return;
            }

            setProfessional(data);
            setLoading(false);
        };

        fetchProfessional();
    }, [params, router]);

    const handleSuccess = async (userId: string) => {
        if (!professional) return;

        try {
            // Link immediately using the specific RPC
            const result = await linkStudentToProfessional(userId, professional.id);

            if (result.success) {
                // Store ID in session for context in Step 2
                sessionStorage.setItem('professional_invite_id', professional.id);

                // Redirect to Old Onboarding Flow
                router.push('/onboarding');
            } else {
                console.error('Error linking:', result.error);
                alert('Erro ao vincular com profissional. Mas seu cadastro foi criado.');
                router.push('/onboarding');
            }
        } catch (err) {
            console.error('Unexpected error linking:', err);
            router.push('/onboarding');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!professional) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    {professional.avatar_url ? (
                        <img
                            src={professional.avatar_url}
                            alt={professional.nome_completo}
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-emerald-100"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                            {professional.nome_completo.charAt(0)}
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Seja bem-vindo(a) ao ZapNutri!
                    </h2>
                    <p className="text-gray-600">
                        Você foi convidado por <span className="font-semibold text-emerald-700">{professional.nome_completo}</span> para iniciar sua transformação.
                    </p>
                </div>

                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mb-6">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-4 uppercase tracking-wider text-center">
                        Crie sua conta para começar
                    </h3>
                    <RegisterForm onSuccess={handleSuccess} submitText="Criar Conta e Vincular" />
                </div>
            </Card>
        </div>
    );
}

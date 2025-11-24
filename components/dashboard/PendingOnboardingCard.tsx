"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Skeleton } from "@/components";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { useAlunoId } from "@/lib/aluno";

type OnboardingData = {
    onboarding_status: string | null;
    whatsapp: string | null;
    nutricionista_id: string | null;
    personal_id: string | null;
    instrucoes_nutri: string | null;
    instrucoes_personal: string | null;
    dieta_atual_texto: string | null;
    treino_atual_texto: string | null;
};

export const PendingOnboardingCard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<OnboardingData | null>(null);
    const supabase = createClient();
    const { alunoId, loading: idLoading } = useAlunoId();

    useEffect(() => {
        const fetchData = async () => {
            console.log('[PendingOnboardingCard] fetchData called', { idLoading, alunoId });
            if (idLoading) return;
            if (!alunoId) {
                console.log('[PendingOnboardingCard] No alunoId, stopping');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // 1. Fetch onboarding_pendente
                const { data: onboarding, error: onboardingError } = await supabase
                    .from("onboarding_pendente")
                    .select("status, tem_dieta_atual, dieta_atual_texto, tem_treino_atual, treino_atual_texto, whatsapp_notificacao, profissional_responsavel_id")
                    .eq("aluno_id", alunoId)
                    .maybeSingle();

                if (onboardingError) {
                    console.error("Error fetching onboarding:", onboardingError);
                    setLoading(false);
                    return;
                }

                if (!onboarding) {
                    console.log('[PendingOnboardingCard] No onboarding data found');
                    setLoading(false);
                    return;
                }

                // 2. Fetch instructions in parallel
                const [nutriRes, personalRes] = await Promise.all([
                    supabase
                        .from("instrucoes_nutricionista")
                        .select("instrucoes_texto")
                        .eq("aluno_id", alunoId)
                        .maybeSingle(),
                    supabase
                        .from("instrucoes_personal")
                        .select("instrucoes_texto")
                        .eq("aluno_id", alunoId)
                        .maybeSingle(),
                ]);

                setData({
                    onboarding_status: onboarding.status,
                    whatsapp: onboarding.whatsapp_notificacao,
                    nutricionista_id: onboarding.profissional_responsavel_id || (nutriRes.data ? "linked" : null),
                    personal_id: onboarding.profissional_responsavel_id || (personalRes.data ? "linked" : null),
                    instrucoes_nutri: nutriRes.data?.instrucoes_texto || null,
                    instrucoes_personal: personalRes.data?.instrucoes_texto || null,
                    dieta_atual_texto: onboarding.dieta_atual_texto || null,
                    treino_atual_texto: onboarding.treino_atual_texto || null,
                });

            } catch (error) {
                console.error("Error fetching onboarding data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [supabase, alunoId, idLoading]);

    if (loading || idLoading) {
        return <Skeleton className="h-48 w-full mt-8" />;
    }

    if (!data) return null;

    // Only show if there is a status (implies onboarding started/exists)
    if (!data.onboarding_status) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'concluido': return 'bg-green-100 text-green-800';
            case 'aguardando_analise': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'concluido': return 'Concluído';
            case 'aguardando_analise': return 'Aguardando Análise';
            default: return status;
        }
    };

    return (
        <div className="mt-8">
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-green-900">Status do Acompanhamento</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.onboarding_status)}`}>
                        {getStatusLabel(data.onboarding_status)}
                    </span>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="block text-gray-500 mb-1">WhatsApp Cadastrado</span>
                            <span className="font-medium text-gray-900">{data.whatsapp || "Não informado"}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="block text-gray-500 mb-1">Profissionais</span>
                            <div className="flex gap-4">
                                <span className={`font-medium ${data.nutricionista_id ? 'text-green-600' : 'text-gray-400'}`}>
                                    {data.nutricionista_id ? '✓ Nutricionista' : '✗ Nutricionista'}
                                </span>
                                <span className={`font-medium ${data.personal_id ? 'text-green-600' : 'text-gray-400'}`}>
                                    {data.personal_id ? '✓ Personal' : '✗ Personal'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nutritionist Instructions */}
                    {data.instrucoes_nutri && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                🍎 Instruções do Nutricionista
                            </h3>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <MarkdownRenderer content={data.instrucoes_nutri} />
                            </div>
                        </div>
                    )}

                    {/* Personal Trainer Instructions */}
                    {data.instrucoes_personal && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                💪 Instruções do Personal
                            </h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <MarkdownRenderer content={data.instrucoes_personal} />
                            </div>
                        </div>
                    )}

                    {/* Dieta Atual */}
                    {data.dieta_atual_texto && (
                        <div className="border-t pt-4 flex items-center justify-between">
                            <h3 className="font-semibold text-green-800 mb-3">
                                📋 Dieta Atual
                            </h3>
                            <button
                                className="px-3 py-1 bg-blue-600 text-white rounded"
                                onClick={() => navigator.clipboard.writeText(data.dieta_atual_texto!)}
                            >
                                Copiar
                            </button>
                        </div>
                    )}

                    {/* Treino Atual */}
                    {data.treino_atual_texto && (
                        <div className="border-t pt-4 flex items-center justify-between">
                            <h3 className="font-semibold text-green-800 mb-3">
                                🏋️‍♂️ Treino Atual
                            </h3>
                            <button
                                className="px-3 py-1 bg-blue-600 text-white rounded"
                                onClick={() => navigator.clipboard.writeText(data.treino_atual_texto!)}
                            >
                                Copiar
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

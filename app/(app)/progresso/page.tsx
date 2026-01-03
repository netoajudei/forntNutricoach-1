"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { progressService } from '@/lib/services';
import type { ProgressSummary } from '@/lib/types';
import { Card, Skeleton, ChevronRightIcon, Dialog, Button } from '@/components';

function useQuery<T>(queryFn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        queryFn().then(res => {
            if (isMounted) {
                setData(res);
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [queryFn]);
    return { data, isLoading };
}

const SummaryCard: React.FC<{ title: string; children: React.ReactNode; linkTo?: string; onOpen?: () => void }> = ({ title, children, linkTo, onOpen }) => (
    <Link href={linkTo || '#'} className="group" onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(); } }}>
        <Card className="h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-green-900 mb-2">{title}</h3>
                    {children}
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
        </Card>
    </Link>
);


import { useAlunoId } from '@/lib/aluno';

export default function ProgressoPage() {
    const { alunoId } = useAlunoId();

    const { data: summary, isLoading } = useQuery(
        () => alunoId ? progressService.getDashboardSummary(alunoId) : Promise.resolve(null)
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Dashboard</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Seu Progresso</h1>
                    <p className="text-lg text-gray-500 mt-1">Visualize sua evolução e conquistas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-36 w-full rounded-2xl" />
                            <Skeleton className="h-36 w-full rounded-2xl" />
                            <Skeleton className="h-36 w-full rounded-2xl" />
                            <Skeleton className="h-36 w-full rounded-2xl" />
                        </>
                    ) : summary ? (
                        <>
                            <SummaryCard title="Medidas Corporais" linkTo="/progresso/metricas">
                                <p className="text-3xl font-extrabold text-green-800">{summary.weight.current} kg</p>
                                <p className={`text-sm font-semibold ${summary.weight.change < 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {summary.weight.change.toFixed(1)} kg desde o início
                                </p>
                            </SummaryCard>
                            <SummaryCard title="Aderência à Dieta" linkTo="/progresso/dieta">
                                <p className="text-3xl font-extrabold text-green-800">{summary.diet.adherence}%</p>
                                <p className="text-sm text-gray-600">de aderência média</p>
                            </SummaryCard>
                            <SummaryCard title="Performance no Treino" linkTo="/progresso/treino">
                                <p className="text-3xl font-extrabold text-green-800">{summary.training.completed}
                                    <span className="text-lg text-gray-500">/{summary.training.total}</span>
                                </p>
                                <p className="text-sm text-gray-600">treinos realizados</p>
                            </SummaryCard>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
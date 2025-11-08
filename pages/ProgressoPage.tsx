

import React from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../services';
import type { ProgressSummary } from '../types';
import { Card, Skeleton } from '../components';
import { useQuery } from '../hooks';

const SummaryCard: React.FC<{ title: string; children: React.ReactNode; linkTo?: string; className?: string }> = ({ title, children, linkTo, className }) => {
    const content = (
         <Card className={`h-full ${className}`}>
            <h3 className="font-semibold text-gray-500 text-sm mb-2">{title}</h3>
            {children}
        </Card>
    );

    return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};


export const ProgressoPage: React.FC = () => {
    const { data: summary, isLoading } = useQuery(progressService.getProgressSummary);

    const renderSkeletons = () => (
        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                 <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Seu Progresso</h1>
                    <p className="text-lg text-gray-500 mt-1">Visualize sua jornada e conquistas.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading || !summary ? renderSkeletons() : (
                        <>
                            <SummaryCard title="Peso Corporal">
                                <p className="text-3xl font-bold">{summary.weight.current} kg</p>
                                <p className={`text-sm font-medium ${summary.weight.change < 0 ? 'text-green-500' : 'text-red-500'}`}>{summary.weight.change.toFixed(1)} kg total</p>
                            </SummaryCard>
                            <SummaryCard title="Adesão ao Treino">
                                <p className="text-3xl font-bold">{((summary.training.completed / summary.training.total) * 100).toFixed(0)}%</p>
                                <p className="text-sm text-gray-500">{summary.training.completed} de {summary.training.total} treinos</p>
                            </SummaryCard>
                             <SummaryCard title="Adesão à Dieta" linkTo="/dieta">
                                <p className="text-3xl font-bold">{summary.diet.adherence}%</p>
                                <p className="text-sm text-gray-500">Média semanal</p>
                            </SummaryCard>
                             <SummaryCard title="Progresso da Meta" linkTo="/perfil">
                                <p className="text-3xl font-bold">{summary.goal.progress}%</p>
                                <p className="text-sm text-gray-500">Rumo ao objetivo</p>
                            </SummaryCard>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

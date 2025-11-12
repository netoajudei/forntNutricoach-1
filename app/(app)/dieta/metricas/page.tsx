"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { dietService } from '@/lib/services';
import type { WeeklyMacroSummary, MonthlyMacroSummary, AnnualMacroSummary, DietMetricsSummary } from '@/lib/types';
import { Card, Skeleton, Tabs } from '@/components';

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

const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

const SummaryCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <Card className="text-center">
        <h3 className="text-gray-500 font-semibold">{title}</h3>
        <p className="text-3xl font-extrabold text-green-800 mt-1">{value}</p>
    </Card>
);

export default function DietaMetricasPage() {
    const { data: summary, isLoading: summaryLoading } = useQuery(dietService.getDietMetricsSummary);
    const { data: weekly, isLoading: weeklyLoading } = useQuery(dietService.getWeeklyMacroSummary);
    const { data: monthly, isLoading: monthlyLoading } = useQuery(dietService.getMonthlyMacroSummary);
    const { data: annually, isLoading: annuallyLoading } = useQuery(dietService.getAnnualMacroSummary);
    const [activeTab, setActiveTab] = useState('Semanal');

    const isLoading = summaryLoading || weeklyLoading || monthlyLoading || annuallyLoading;

    const renderChart = () => {
        let data: any[] = [];
        if (activeTab === 'Semanal') data = weekly || [];
        if (activeTab === 'Mensal') data = monthly || [];
        if (activeTab === 'Anual') data = annually || [];

        return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={Object.keys(data[0] || {})[0]} />
                    <YAxis yAxisId="left" orientation="left" stroke="#10B981" label={{ value: 'Calorias (kcal)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" label={{ value: 'Macronutrientes (g)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="calories" fill="#10B981" name="Calorias" />
                    <Bar yAxisId="right" dataKey="protein" fill="#3B82F6" name="Proteínas" />
                    <Bar yAxisId="right" dataKey="carbs" fill="#F59E0B" name="Carboidratos" />
                    <Bar yAxisId="right" dataKey="fats" fill="#EF4444" name="Gorduras" />
                </BarChart>
            </ResponsiveContainer>
        )
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Progresso</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas da Dieta</h1>
                    <p className="text-lg text-gray-500 mt-1">Análise detalhada da sua aderência e consumo.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     {isLoading ? <>
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                     </> : summary ? <>
                        <SummaryCard title="Aderência Média" value={`${summary.averageAdherence}%`} />
                        <SummaryCard title="Dias no Plano" value={`${summary.daysOnPlan}`} />
                     </> : null}
                </div>

                <Card>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Consumo de Macronutrientes</h2>
                    <Tabs tabs={['Semanal', 'Mensal', 'Anual']} activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="mt-6">
                        {isLoading ? <Skeleton className="w-full h-[400px]"/> : renderChart()}
                    </div>
                </Card>
            </div>
        </div>
    );
}
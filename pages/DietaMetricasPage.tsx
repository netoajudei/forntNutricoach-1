

import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'https://aistudiocdn.com/recharts@^2.12.7';
import { dietService } from '../services';
import type { DietMetricsSummary, WeeklyMacroSummary, MonthlyMacroSummary, AnnualMacroSummary } from '../types';
import { Card, Skeleton } from '../components';
import { useQuery } from '../hooks';

type Period = 'semanal' | 'mensal' | 'anual';

const MetricCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <Card>
        <h3 className="font-semibold text-gray-500 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-green-900">{value}<span className="text-lg ml-1">{unit}</span></p>
    </Card>
);

const MacroBarChart: React.FC<{ data: any[]; dataKeyX: string; title: string; }> = ({ data, dataKeyX, title }) => (
    <Card>
        <h2 className="text-xl font-bold text-green-900 mb-4">{title}</h2>
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={dataKeyX} tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                    <Bar dataKey="calories" name="Calorias" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="protein" name="Proteínas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="carbs" name="Carbos" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fats" name="Gorduras" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </Card>
);


export const DietaMetricasPage: React.FC = () => {
    const [period, setPeriod] = useState<Period>('semanal');

    const { data: summary, isLoading: isLoadingSummary } = useQuery(dietService.getDietMetricsSummary);
    const { data: weeklyData, isLoading: isLoadingWeekly } = useQuery(dietService.getWeeklyMacroSummary);
    const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery(dietService.getMonthlyMacroSummary);
    const { data: annualData, isLoading: isLoadingAnnual } = useQuery(dietService.getAnnualMacroSummary);
    
    const isLoading = isLoadingWeekly || isLoadingMonthly || isLoadingAnnual;

    const chartConfig = {
        semanal: { data: weeklyData, dataKeyX: 'day', title: 'Resumo da Semana 4' },
        mensal: { data: monthlyData, dataKeyX: 'week', title: 'Resumo Mensal' },
        anual: { data: annualData, dataKeyX: 'month', title: 'Resumo Anual' },
    };

    const currentChart = chartConfig[period];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas de Dieta</h1>
                    <p className="text-lg text-gray-500 mt-1">Analise a fundo sua aderência e consumo de macronutrientes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {isLoadingSummary || !summary ? (
                        <>
                            <Skeleton className="h-24 w-full rounded-2xl" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </>
                    ) : (
                        <>
                            <MetricCard title="Aderência Média" value={summary.averageAdherence.toString()} unit="%" />
                            <MetricCard title="Dias no Plano" value={summary.daysOnPlan.toString()} unit="dias" />
                        </>
                    )}
                </div>

                <div className="mb-6">
                    <div className="flex space-x-2 bg-white p-1.5 rounded-xl shadow-sm max-w-xs">
                        {(['semanal', 'mensal', 'anual'] as Period[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`w-full px-3 py-2 text-sm font-semibold rounded-lg transition-colors capitalize ${period === p ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <Skeleton className="h-96 w-full rounded-2xl" />
                ) : (
                    currentChart.data && (
                        <MacroBarChart 
                            data={currentChart.data} 
                            dataKeyX={currentChart.dataKeyX}
                            title={currentChart.title} 
                        />
                    )
                )}
            </div>
        </div>
    );
};

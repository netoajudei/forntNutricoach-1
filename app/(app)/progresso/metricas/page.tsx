"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { progressService } from '@/lib/services';
import type { BodyMetricsHistoryEntry, BodyMetricsSummary } from '@/lib/types';
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

const SummaryCard: React.FC<{ title: string; value: string; change?: string; changeColor?: string }> = ({ title, value, change, changeColor = 'text-green-500' }) => (
    <Card className="text-center">
        <h3 className="text-gray-500 font-semibold">{title}</h3>
        <p className="text-3xl font-extrabold text-green-800 mt-1">{value}</p>
        {change && <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>}
    </Card>
);

const MetricsTable: React.FC<{ data: BodyMetricsHistoryEntry[] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3">Peso</th>
                    <th scope="col" className="px-6 py-3">% Gordura</th>
                    <th scope="col" className="px-6 py-3">Cintura</th>
                    <th scope="col" className="px-6 py-3">Quadril</th>
                    <th scope="col" className="px-6 py-3">Peito</th>
                </tr>
            </thead>
            <tbody>
                {data.map((entry) => (
                    <tr key={entry.date} className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entry.date}</th>
                        <td className="px-6 py-4">{entry.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4">{entry.fatPercentage.toFixed(1)}%</td>
                        <td className="px-6 py-4">{entry.waist.toFixed(1)} cm</td>
                        <td className="px-6 py-4">{entry.hips.toFixed(1)} cm</td>
                        <td className="px-6 py-4">{entry.chest.toFixed(1)} cm</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function ProgressoMetricasPage() {
    const { data: history, isLoading: historyLoading } = useQuery(progressService.getBodyMetricsHistory);
    const { data: summary, isLoading: summaryLoading } = useQuery(progressService.getBodyMetricsSummary);
    
    const isLoading = historyLoading || summaryLoading;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Progresso</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas Corporais</h1>
                    <p className="text-lg text-gray-500 mt-1">Sua jornada de evolução em detalhes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {isLoading ? <>
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </> : summary ? <>
                       <SummaryCard title="Peso Atual" value={`${summary.currentWeight.toFixed(1)} kg`} change={`${summary.totalWeightChange.toFixed(1)} kg total`} />
                       <SummaryCard title="% de Gordura" value={`${summary.fatPercentage.toFixed(1)}%`} />
                       <SummaryCard title="Próxima Aferição" value="01/08" />
                    </> : null}
                </div>

                <Card className="mb-8">
                    <h2 className="text-xl font-bold text-green-900 mb-4">Evolução do Peso e % de Gordura</h2>
                     {isLoading ? <Skeleton className="w-full h-[400px]"/> : history ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" domain={['dataMin - 2', 'dataMax + 2']} label={{ value: '% Gordura', angle: 90, position: 'insideRight' }}/>
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#10B981" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="fatPercentage" name="% Gordura" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : null}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Histórico de Medidas</h2>
                    {isLoading ? <Skeleton className="w-full h-[200px]"/> : history ? (
                        <MetricsTable data={history} />
                    ): null}
                </Card>
            </div>
        </div>
    );
}
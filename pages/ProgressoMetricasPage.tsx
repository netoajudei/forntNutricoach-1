

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'https://aistudiocdn.com/recharts@^2.12.7';
import { progressService, userService } from '../services';
import type { BodyMetricsHistoryEntry, BodyMetricsSummary, UserProfile } from '../types';
import { Card, Skeleton, Progress } from '../components';
import { useQuery } from '../hooks';

const MetricCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <Card>
        <h3 className="font-semibold text-gray-500 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-green-900">{value}<span className="text-lg ml-1">{unit}</span></p>
    </Card>
);

const GoalProgressBar: React.FC<{ profile: UserProfile, summary: BodyMetricsSummary }> = ({ profile, summary }) => {
    const { initialWeight, goalWeight } = profile;
    const { currentWeight } = summary;
    
    const totalToLose = initialWeight - goalWeight;
    const alreadyLost = initialWeight - currentWeight;
    const progress = totalToLose > 0 ? Math.min(Math.max((alreadyLost / totalToLose) * 100, 0), 100) : 0;

    return (
        <Card>
            <h2 className="text-xl font-bold text-green-900 mb-3">Progresso da Meta de Peso</h2>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-700">{initialWeight}kg</span>
                <span className="text-sm font-bold text-green-600">{progress.toFixed(1)}%</span>
                <span className="text-sm font-medium text-gray-700">{goalWeight}kg</span>
            </div>
            <Progress value={progress} />
             <p className="text-center text-sm text-gray-500 mt-2">Você já perdeu {alreadyLost.toFixed(1)}kg de {totalToLose.toFixed(1)}kg</p>
        </Card>
    );
};

const MetricsLineChart: React.FC<{ 
    data: any[]; 
    lines: { key: string; name: string; color: string; yAxisId?: string }[]; 
    title: string;
    yAxisConfigs?: { id: string; unit: string, orientation: 'left' | 'right' }[];
}> = ({ data, lines, title, yAxisConfigs }) => (
    <Card>
        <h2 className="text-xl font-bold text-green-900 mb-4">{title}</h2>
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    
                    {yAxisConfigs ? yAxisConfigs.map(config => (
                         <YAxis 
                            key={config.id}
                            yAxisId={config.id} 
                            orientation={config.orientation} 
                            tick={{ fontSize: 12 }} 
                            stroke="#6b7280" 
                            unit={config.unit} 
                        />
                    )) : <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" unit="cm" />}

                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.75rem',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                    {lines.map(line => (
                        <Line key={line.key} yAxisId={line.yAxisId || 0} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </Card>
);

const HistoryTable: React.FC<{ data: BodyMetricsHistoryEntry[] }> = ({ data }) => (
    <Card>
        <h2 className="text-xl font-bold text-green-900 mb-4">Histórico Completo</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3">Data</th>
                        <th scope="col" className="px-4 py-3">Peso</th>
                        <th scope="col" className="px-4 py-3">Gordura</th>
                        <th scope="col" className="px-4 py-3">Peito</th>
                        <th scope="col" className="px-4 py-3">Cintura</th>
                        <th scope="col" className="px-4 py-3">Braço D.</th>
                        <th scope="col" className="px-4 py-3">Coxa D.</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry, index) => (
                        <tr key={index} className="bg-white border-b">
                            <td className="px-4 py-4 font-medium text-gray-900">{entry.date}</td>
                            <td className="px-4 py-4">{entry.weight.toFixed(1)}kg</td>
                            <td className="px-4 py-4">{entry.fatPercentage.toFixed(1)}%</td>
                            <td className="px-4 py-4">{entry.chest.toFixed(1)}cm</td>
                            <td className="px-4 py-4">{entry.waist.toFixed(1)}cm</td>
                            <td className="px-4 py-4">{entry.rightArm.toFixed(1)}cm</td>
                            <td className="px-4 py-4">{entry.rightThigh.toFixed(1)}cm</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

export const ProgressoMetricasPage: React.FC = () => {
    const { data: history, isLoading: isLoadingHistory } = useQuery(progressService.getBodyMetricsHistory);
    const { data: summary, isLoading: isLoadingSummary } = useQuery(progressService.getBodyMetricsSummary);
    const { data: profile, isLoading: isLoadingProfile } = useQuery(userService.getProfile);

    const isLoading = isLoadingHistory || isLoadingSummary || isLoadingProfile;

    if (isLoading || !history || !summary || !profile) {
        return (
             <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas Corporais</h1>
                    <p className="text-lg text-gray-500 mt-1">Sua evolução em detalhes.</p>
                </div>

                <GoalProgressBar profile={profile} summary={summary} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard title="Peso Atual" value={summary.currentWeight.toFixed(1)} unit="kg" />
                    <MetricCard title="% de Gordura" value={summary.fatPercentage.toFixed(1)} unit="%" />
                    <MetricCard title="Balanço Total" value={summary.totalWeightChange.toFixed(1)} unit="kg" />
                </div>

                <MetricsLineChart 
                    title="Peso vs. % Gordura"
                    data={history}
                    yAxisConfigs={[
                        {id: 'left', unit: 'kg', orientation: 'left'},
                        {id: 'right', unit: '%', orientation: 'right'},
                    ]}
                    lines={[
                        {key: 'weight', name: 'Peso', color: '#3B82F6', yAxisId: 'left'},
                        {key: 'fatPercentage', name: '% Gordura', color: '#10B981', yAxisId: 'right'},
                    ]}
                />

                <MetricsLineChart 
                    title="Medidas de Membros (cm)"
                    data={history}
                    lines={[
                        {key: 'rightThigh', name: 'Coxa Direita', color: '#F59E0B', yAxisId: '0'},
                        {key: 'leftThigh', name: 'Coxa Esquerda', color: '#F97316', yAxisId: '0'},
                        {key: 'rightArm', name: 'Braço Direito', color: '#8B5CF6', yAxisId: '0'},
                        {key: 'leftArm', name: 'Braço Esquerdo', color: '#EC4899', yAxisId: '0'},
                    ]}
                />
                 <MetricsLineChart 
                    title="Medidas de Tronco (cm)"
                    data={history}
                    lines={[
                        {key: 'chest', name: 'Peito', color: '#EF4444', yAxisId: '0'},
                        {key: 'waist', name: 'Cintura', color: '#14B8A6', yAxisId: '0'},
                        {key: 'hips', name: 'Quadril', color: '#6366F1', yAxisId: '0'},
                    ]}
                />
                
                <HistoryTable data={history} />
            </div>
        </div>
    );
};

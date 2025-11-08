
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { progressService, workoutService, userService } from '../services';
import type { ProgressSummary, WeightHistoryEntry, WorkoutAnalytics, UserProfile } from '../types';
import { Card, Skeleton, Tabs, Button } from '../components';
import { useQuery } from '../hooks';

// Add type declaration for Recharts on the window object to resolve TypeScript error.
declare global {
  interface Window { Recharts: any; }
}
const { ResponsiveContainer, LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar } = window.Recharts || {};

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
                            <SummaryCard title="Peso Corporal" linkTo="/progresso/peso">
                                <p className="text-3xl font-bold">{summary.weight.current} kg</p>
                                <p className={`text-sm font-medium ${summary.weight.change < 0 ? 'text-green-500' : 'text-red-500'}`}>{summary.weight.change.toFixed(1)} kg total</p>
                            </SummaryCard>
                            <SummaryCard title="Adesão ao Treino" linkTo="/progresso/treino">
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

export const ProgressoPesoPage: React.FC = () => {
    const { data: history, isLoading: isLoadingHistory } = useQuery(progressService.getWeightHistory);
    const { data: summary, isLoading: isLoadingSummary } = useQuery(progressService.getProgressSummary);
    const { data: user, isLoading: isLoadingUser } = useQuery(userService.getProfile);
    
    const isLoading = isLoadingHistory || isLoadingSummary || isLoadingUser;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/progresso" className="text-sm text-green-600 hover:underline mb-2 inline-block">&larr; Voltar para Progresso</Link>
                <h1 className="text-3xl font-bold tracking-tight mt-1 mb-6">Análise de Peso</h1>
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Evolução do Peso Corporal</h2>
                    <div className="h-80">
                    {isLoading || !history ? <Skeleton className="h-full w-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                <XAxis dataKey="date" />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {isLoading || !summary || !user ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />) : (
                       <>
                        <SummaryCard title="Peso Atual">
                            <p className="text-2xl font-bold">{summary.weight.current} kg</p>
                        </SummaryCard>
                        <SummaryCard title="Peso Inicial">
                            <p className="text-2xl font-bold">{user.initialWeight} kg</p>
                        </SummaryCard>
                        <SummaryCard title="Alteração Total">
                             <p className={`text-2xl font-bold ${summary.weight.change < 0 ? 'text-green-500' : 'text-red-500'}`}>{summary.weight.change.toFixed(1)} kg</p>
                        </SummaryCard>
                       </>
                    )}
                </div>

                <Card className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Histórico Completo</h2>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Peso (kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading || !history ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="bg-white border-b">
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-24"/></td>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-16"/></td>
                                        </tr>
                                    ))
                                ) : (
                                    history.map((entry) => (
                                        <tr key={entry.date} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entry.date}</td>
                                            <td className="px-6 py-4">{entry.weight.toFixed(1)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export const ProgressoTreinoPage: React.FC = () => {
    const { data: analytics, isLoading } = useQuery(workoutService.getWorkoutAnalytics);
    const [activeTab, setActiveTab] = useState('Frequência');
    
    const renderChart = () => {
        if (isLoading || !analytics) return <Skeleton className="h-80 w-full" />;
        
        let data, dataKey, name;
        switch(activeTab) {
            case 'Cargas': data = analytics.loads; dataKey="exercise"; name="Carga (kg)"; break;
            case 'Volume': data = analytics.volume; dataKey="month"; name="Volume (kg)"; break;
            case 'Frequência':
            default: data = analytics.frequency; dataKey="month"; name="Treinos"; break;
        }

        return (
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey={dataKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name={name} fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/progresso" className="text-sm text-green-600 hover:underline mb-2 inline-block">&larr; Voltar para Progresso</Link>
                <h1 className="text-3xl font-bold tracking-tight mt-1 mb-6">Análise de Treino</h1>
                <Card>
                    <Tabs tabs={['Frequência', 'Cargas', 'Volume']} activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="mt-6">
                        {renderChart()}
                    </div>
                </Card>
            </div>
        </div>
    );
};



import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar 
} from 'recharts';
import { progressService, workoutService, dietService } from '../services';
import type { ProgressSummary, WeeklyWorkoutDay, WeightHistoryEntry, WeeklyMacroSummary } from '../types';
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

const WeeklySummaryChart: React.FC<{ data: WeeklyMacroSummary[] }> = ({ data }) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-900">Resumo da Semana</h2>
                <Link to="/dieta/metricas" className="text-sm font-medium text-green-600 hover:underline cursor-pointer">
                    ver todas as metricas de dieta
                </Link>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6b7280" />
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
};

// New Component for Training Progress
const TrainingProgressChart: React.FC<{ program: WeeklyWorkoutDay[] }> = ({ program }) => {
    const totalWorkouts = program.filter(day => !day.isRestDay).length;
    const completedWorkouts = program.filter(day => day.isCompleted && !day.isRestDay).length;
    const percentage = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
    
    // Data for the radial bar chart.
    const chartData = [{ name: 'completed', value: percentage }];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-900">Treinos da Semana</h2>
                 <Link to="/treino/metricas" className="text-sm font-medium text-green-600 hover:underline cursor-pointer">
                    ver metricas de treino
                </Link>
            </div>
            <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                        innerRadius="70%" 
                        outerRadius="85%" 
                        data={chartData} 
                        startAngle={90} 
                        endAngle={-270}
                        barSize={20}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            background
                            dataKey='value'
                            cornerRadius={10}
                            fill="#10B981"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-5xl font-extrabold text-green-900">{percentage}%</span>
                     <p className="text-gray-500 mt-1">{completedWorkouts} de {totalWorkouts} treinos</p>
                </div>
            </div>
        </Card>
    );
};

// New Component for Weight History
const WeightHistoryChart: React.FC<{ history: WeightHistoryEntry[] }> = ({ history }) => {
    return (
        <Card>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-900">Evolução de Peso</h2>
                <Link to="/progresso/metricas" className="text-sm font-medium text-green-600 hover:underline cursor-pointer">
                    ver metricas e progresso
                </Link>
            </div>
            <div className="w-full h-80">
                 <ResponsiveContainer>
                    <LineChart data={history} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} stroke="#6b7280" unit="kg" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export const ProgressoPage: React.FC = () => {
    const { data: summary, isLoading: isLoadingSummary } = useQuery(progressService.getProgressSummary);
    const { data: program, isLoading: isLoadingProgram } = useQuery(workoutService.getWeeklyProgram);
    const { data: history, isLoading: isLoadingHistory } = useQuery(progressService.getWeightHistory);
    const { data: weeklySummary, isLoading: isLoadingWeeklySummary } = useQuery(dietService.getWeeklyMacroSummary);

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
                    {isLoadingSummary || !summary ? renderSkeletons() : (
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

                 {/* Charts Section */}
                <div className="mt-8 space-y-6">
                    {isLoadingWeeklySummary || !weeklySummary ? (
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    ) : (
                        <WeeklySummaryChart data={weeklySummary} />
                    )}

                    {isLoadingProgram || !program ? (
                        <Skeleton className="h-80 w-full rounded-2xl" />
                    ) : (
                        <TrainingProgressChart program={program} />
                    )}

                    {isLoadingHistory || !history ? (
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    ) : (
                        <WeightHistoryChart history={history} />
                    )}
                </div>
            </div>
        </div>
    );
};
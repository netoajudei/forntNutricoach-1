

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'https://aistudiocdn.com/recharts@^2.12.7';
import { workoutService } from '../services';
import type { WorkoutMetricsSummary, WeeklyWorkoutDay, Exercise, ExerciseLoadHistory, WeeklyCompletionHistory, WorkoutAnalytics } from '../types';
import { Card, Skeleton, Button, Dialog } from '../components';
import { useQuery } from '../hooks';

const MetricCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <Card>
        <h3 className="font-semibold text-gray-500 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-green-900">{value}<span className="text-lg ml-1">{unit}</span></p>
    </Card>
);

const BackButton: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="md:hidden mb-4">
             <Button variant="ghost" onClick={() => navigate(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="m15 18-6-6 6-6"/></svg>
                Voltar
            </Button>
        </div>
    );
};

const ExerciseDetail: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
        <h4 className="font-bold text-green-900">{exercise.name}</h4>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-1">
            <span><strong>Séries:</strong> {exercise.sets}</span>
            <span><strong>Reps:</strong> {exercise.reps}</span>
            {exercise.load && <span><strong>Carga:</strong> {exercise.load}</span>}
            <span><strong>Descanso:</strong> {exercise.rest}</span>
        </div>
        {exercise.observation && (
            <p className="text-xs text-green-800 bg-green-50 p-2 rounded-lg mt-2">
                {exercise.observation}
            </p>
        )}
    </div>
);

const LoadProgressionChart: React.FC<{ data: ExerciseLoadHistory; title: string }> = ({ data, title }) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    // Merge history of all exercises into a single array for Recharts
    const chartData = data.exercises[0].history.map((_, index) => {
        const entry: { [key: string]: string | number } = { date: data.exercises[0].history[index].date };
        data.exercises.forEach(ex => {
            entry[ex.name] = ex.history[index]?.load || 0;
        });
        return entry;
    });

    return (
        <Card>
            <h3 className="text-xl font-bold text-green-900 mb-4">{title}</h3>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" unit="kg" />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
                        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                        {data.exercises.map((ex, index) => (
                            <Line key={ex.name} type="monotone" dataKey={ex.name} stroke={colors[index % colors.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const HistoryTable: React.FC<{ data: WeeklyCompletionHistory[] }> = ({ data }) => (
    <Card>
        <h2 className="text-xl font-bold text-green-900 mb-4">Histórico Semanal</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3">Semana</th>
                        {data[0]?.days.map(d => <th key={d.day} scope="col" className="px-4 py-3 text-center">{d.day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry) => (
                        <tr key={entry.week} className="bg-white border-b">
                            <td className="px-4 py-4 font-medium text-gray-900">{entry.week}</td>
                            {entry.days.map(d => (
                                <td key={d.day} className="px-4 py-4 text-center">
                                    <div className={`w-6 h-6 rounded-full mx-auto ${d.completed ? 'bg-green-500' : 'bg-red-200'}`} title={d.completed ? 'Realizado' : 'Não realizado'}></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);


export const TreinoMetricasPage: React.FC = () => {
    const { data: summary, isLoading: isLoadingSummary } = useQuery(workoutService.getWorkoutMetricsSummary);
    const { data: program, isLoading: isLoadingProgram } = useQuery(workoutService.getWeeklyProgram);
    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery(workoutService.getWorkoutAnalytics);
    const { data: loadHistory, isLoading: isLoadingLoadHistory } = useQuery(workoutService.getExerciseLoadHistory);
    const { data: completionHistory, isLoading: isLoadingCompletionHistory } = useQuery(workoutService.getWeeklyCompletionHistory);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<WeeklyWorkoutDay | null>(null);

    const handleDayClick = (day: WeeklyWorkoutDay) => {
        if (!day.isRestDay) {
            setSelectedDay(day);
            setIsModalOpen(true);
        }
    };

    const isLoading = isLoadingSummary || isLoadingProgram || isLoadingAnalytics || isLoadingLoadHistory || isLoadingCompletionHistory;

    if (isLoading || !summary || !program || !analytics || !loadHistory || !completionHistory) {
         return (
             <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <Skeleton className="h-10 w-32 md:hidden" />
                <Skeleton className="h-12 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <BackButton />
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas de Treino</h1>
                    <p className="text-lg text-gray-500 mt-1">Sua performance e evolução de cargas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard title="Treinos Realizados (Mês)" value={summary.workoutsThisMonth.toString()} unit={`de ${summary.totalWorkoutsInMonth}`} />
                    <MetricCard title="Aderência (Mês)" value={summary.adherence.toString()} unit="%" />
                </div>

                <Card>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Programa da Semana</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {program.map(day => (
                            <div key={day.day} onClick={() => handleDayClick(day)} className={`p-4 border rounded-xl text-center cursor-pointer transition-all ${day.isRestDay ? 'bg-gray-50' : 'hover:border-green-500 hover:bg-green-50'}`}>
                                <p className="font-bold">{day.day.substring(0,3)}</p>
                                <p className={`text-sm font-semibold ${day.isRestDay ? 'text-gray-500' : 'text-green-600'}`}>{day.name}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                
                <Card>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Frequência Mensal</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                             <BarChart data={analytics.frequency} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
                                <Bar dataKey="value" name="Treinos" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {loadHistory.map(history => (
                    <LoadProgressionChart key={history.workoutType} data={history} title={`Progressão de Carga - Treino ${history.workoutType}`} />
                ))}

                <HistoryTable data={completionHistory} />

            </div>
             <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Treino de ${selectedDay?.day} - ${selectedDay?.name}`}>
                {selectedDay?.exercises?.map((ex, index) => <ExerciseDetail key={index} exercise={ex} />)}
            </Dialog>
        </div>
    );
};

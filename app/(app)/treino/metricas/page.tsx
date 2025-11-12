"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { workoutService } from '@/lib/services';
import type { WorkoutMetricsSummary, ExerciseLoadHistory, WeeklyCompletionHistory, WeeklyWorkoutDay } from '@/lib/types';
import { Card, Skeleton, Button, Dialog } from '@/components';

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

const SummaryCard: React.FC<{ title: string; value: React.ReactNode; }> = ({ title, value }) => (
    <Card className="text-center">
        <h3 className="text-gray-500 font-semibold">{title}</h3>
        <p className="text-3xl font-extrabold text-green-800 mt-1">{value}</p>
    </Card>
);

const WeeklyScheduleGrid: React.FC<{ program: WeeklyWorkoutDay[], onDayClick: (day: WeeklyWorkoutDay) => void }> = ({ program, onDayClick }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {program.map(day => (
            <div key={day.day} onClick={() => !day.isRestDay && onDayClick(day)} className={`p-4 rounded-lg text-center border-2 transition-all ${day.isRestDay ? 'bg-gray-100' : 'cursor-pointer bg-white hover:border-green-500 hover:shadow-lg'}`}>
                <p className="font-bold">{day.day.substring(0,3)}</p>
                <p className="text-sm text-gray-500">{day.name}</p>
                <div className={`mt-2 w-4 h-4 rounded-full mx-auto ${day.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
        ))}
    </div>
)


const CompletionHistoryTable: React.FC<{ history: WeeklyCompletionHistory[] }> = ({ history }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Semana</th>
                    {history[0]?.days.map(d => <th key={d.day} scope="col" className="px-2 py-3 text-center">{d.day.substring(0,3)}</th>)}
                </tr>
            </thead>
            <tbody>
                {history.map((week) => (
                    <tr key={week.week} className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{week.week}</th>
                        {week.days.map((day, index) => (
                            <td key={index} className="px-2 py-4 text-center">
                                <span className={`w-5 h-5 inline-block rounded-full ${day.completed ? 'bg-green-500' : 'bg-red-200'}`}></span>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export default function TreinoMetricasPage() {
    const { data: summary, isLoading: sLoading } = useQuery(workoutService.getWorkoutMetricsSummary);
    const { data: loadHistory, isLoading: lhLoading } = useQuery(workoutService.getExerciseLoadHistory);
    const { data: completion, isLoading: cLoading } = useQuery(workoutService.getWeeklyCompletionHistory);
    const { data: program, isLoading: pLoading } = useQuery(workoutService.getWeeklyProgram);
    const { data: analytics, isLoading: aLoading } = useQuery(workoutService.getWorkoutAnalytics);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<WeeklyWorkoutDay | null>(null);

    const isLoading = sLoading || lhLoading || cLoading || pLoading || aLoading;
    
    const handleDayClick = (day: WeeklyWorkoutDay) => {
        setSelectedDay(day);
        setIsModalOpen(true);
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Progresso</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas de Treino</h1>
                    <p className="text-lg text-gray-500 mt-1">Sua performance e evolução de cargas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {isLoading ? <>
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </> : summary ? <>
                        <SummaryCard title="Treinos no Mês" value={<>{summary.workoutsThisMonth} <span className="text-lg text-gray-500">/{summary.totalWorkoutsInMonth}</span></>} />
                        <SummaryCard title="Aderência" value={`${summary.adherence}%`} />
                    </> : null}
                </div>
                
                <Card className="mb-8">
                     <h2 className="text-xl font-bold text-green-900 mb-4">Programa da Semana</h2>
                    {isLoading ? <Skeleton className="h-24 w-full" /> : program ? <WeeklyScheduleGrid program={program} onDayClick={handleDayClick}/> : null }
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <h2 className="text-xl font-bold text-green-900 mb-4">Frequência Mensal</h2>
                        {isLoading ? <Skeleton className="h-80 w-full" /> : analytics ? (
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.frequency}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Treinos" fill="#10B981" />
                                </BarChart>
                            </ResponsiveContainer>
                        ): null}
                    </Card>
                     <Card>
                        <h2 className="text-xl font-bold text-green-900 mb-4">Histórico Semanal</h2>
                        {isLoading ? <Skeleton className="h-80 w-full" /> : completion ? <CompletionHistoryTable history={completion} /> : null}
                    </Card>
                </div>

                <Card>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Progressão de Carga (Últimas 4 Semanas)</h2>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {isLoading ? <> <Skeleton className="h-80 w-full" /> <Skeleton className="h-80 w-full" /> <Skeleton className="h-80 w-full" /> </> : 
                        loadHistory?.map(workout => (
                            <div key={workout.workoutType}>
                                <h3 className="font-bold text-center text-lg mb-2">Treino {workout.workoutType}</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} />
                                        <YAxis dataKey="load" domain={['dataMin - 5', 'dataMax + 5']}/>
                                        <Tooltip />
                                        <Legend />
                                        {workout.exercises.map((ex, i) => (
                                            <Line key={ex.name} data={ex.history} type="monotone" dataKey="load" name={ex.name} stroke={`hsl(${i * 100}, 70%, 50%)`} strokeWidth={2}/>
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                </Card>

                {selectedDay && 
                    <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Treino de ${selectedDay.day}`}>
                        {selectedDay.exercises?.map(ex => (
                            <div key={ex.name} className="py-2 border-b last:border-0">
                                <p className="font-bold">{ex.name}</p>
                                <p className="text-sm text-gray-600">{ex.sets}x {ex.reps} - {ex.load}</p>
                            </div>
                        ))}
                    </Dialog>
                }

             </div>
        </div>
    );
}
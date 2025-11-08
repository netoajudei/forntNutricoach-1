import React from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../services';
import type { TodaysWorkout, WeeklyWorkoutDay, Exercise } from '../types';
import { Card, Button, Skeleton, DumbbellIcon } from '../components';
import { useQuery } from '../hooks';

const ExerciseDetail: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <h4 className="font-semibold">{exercise.name}</h4>
        <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-300 mt-2">
            <span><strong>Séries:</strong> {exercise.sets}</span>
            <span><strong>Reps:</strong> {exercise.reps}</span>
            <span><strong>Descanso:</strong> {exercise.rest}</span>
        </div>
        {exercise.observation && (
            <p className="text-xs text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/50 p-2 rounded-md mt-2">
                {exercise.observation}
            </p>
        )}
    </div>
);

export const TreinoPage: React.FC = () => {
    const { data: workout, isLoading } = useQuery(workoutService.getTodaysWorkout);

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton className="w-full h-96" />;
        }

        if (workout?.isRestDay) {
            return (
                <Card className="text-center">
                    <DumbbellIcon className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                    <h2 className="text-2xl font-bold">Dia de Descanso</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Aproveite para se recuperar. A recuperação é parte do progresso!</p>
                </Card>
            );
        }
        
        if (workout) {
             return (
                <Card>
                    <h2 className="text-2xl font-bold mb-1">{workout.name}</h2>
                    <p className="text-brand-600 dark:text-brand-400 font-medium mb-6">{workout.focus}</p>
                    <div className="space-y-2">
                        {workout.exercises?.map((ex, index) => <ExerciseDetail key={index} exercise={ex} />)}
                    </div>
                </Card>
            );
        }

        return null; // Handle case where there is no workout data
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Treino do Dia</h1>
                     <Link to="/treino/programa-semanal">
                        <Button variant="secondary">Ver Programa Semanal</Button>
                    </Link>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};


export const ProgramaSemanalTreinoPage: React.FC = () => {
    const { data: program, isLoading } = useQuery(workoutService.getWeeklyProgram);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to="/treino" className="text-sm text-brand-600 hover:underline">&larr; Voltar para Treino do Dia</Link>
                    <h1 className="text-3xl font-bold tracking-tight mt-1">Programa Semanal</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                    ) : (
                        program?.map((day) => (
                            <Card key={day.day} className={day.name === 'Descanso' ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                                <h3 className="font-bold text-lg">{day.day}</h3>
                                {day.name === "Descanso" ? (
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">{day.focus}</p>
                                ) : (
                                    <>
                                        <p className="font-semibold text-brand-600 dark:text-brand-400 mt-1">{day.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{day.focus}</p>
                                    </>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
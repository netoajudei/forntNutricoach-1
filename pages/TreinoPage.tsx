import React, { useState } from 'react';
import { workoutService } from '../services';
import type { WeeklyWorkoutDay, Exercise } from '../types';
import { Card, Skeleton, ChevronRightIcon } from '../components';
import { useQuery } from '../hooks';

const ExerciseDetail: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
        <h4 className="font-bold text-green-900">{exercise.name}</h4>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-2">
            <span><strong>Séries:</strong> {exercise.sets}</span>
            <span><strong>Reps:</strong> {exercise.reps}</span>
            <span><strong>Descanso:</strong> {exercise.rest}</span>
        </div>
        {exercise.observation && (
            <p className="text-xs text-green-800 bg-green-50 p-2 rounded-lg mt-2">
                {exercise.observation}
            </p>
        )}
    </div>
);

const WorkoutDayCard: React.FC<{ day: WeeklyWorkoutDay; isOpen: boolean; onToggle: () => void }> = ({ day, isOpen, onToggle }) => {
    const isRestDay = day.isRestDay;

    return (
        <Card className={`!p-0 transition-all duration-300 ${isRestDay ? 'bg-gray-50' : ''}`}>
            <div className="flex items-center justify-between cursor-pointer p-6" onClick={!isRestDay ? onToggle : undefined}>
                <div className="flex items-center flex-1">
                     <label className="flex items-center space-x-3 cursor-pointer mr-4">
                        <input 
                            type="checkbox" 
                            checked={day.isCompleted} 
                            readOnly 
                            className="appearance-none h-6 w-6 rounded-md border-2 border-green-500 bg-white checked:bg-green-500 checked:border-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 checked:bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22white%22%3e%3cpath fill-rule=%22evenodd%22 d=%22M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z%22 clip-rule=%22evenodd%22 /%3e%3c/svg%3e')]"
                        />
                         <div className="text-left">
                            <p className="font-bold text-lg">{day.day}</p>
                            <p className={`text-sm ${isRestDay ? 'text-gray-500' : 'text-green-600 font-semibold'}`}>{day.name}</p>
                        </div>
                    </label>
                </div>
                {!isRestDay && (
                    <ChevronRightIcon className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                )}
            </div>
            
            {isOpen && !isRestDay && (
                <div className="px-6 pb-6 mt-4 border-t border-gray-100">
                     <p className="text-sm font-semibold text-gray-600 mb-2 pt-4">Foco: {day.focus}</p>
                    {day.exercises?.map((ex, index) => <ExerciseDetail key={index} exercise={ex} />)}
                </div>
            )}
        </Card>
    );
};

export const TreinoPage: React.FC = () => {
    const { data: program, isLoading } = useQuery(workoutService.getWeeklyProgram);
    const [openDay, setOpenDay] = useState<string | null>(null);

    const handleToggle = (day: string) => {
        setOpenDay(openDay === day ? null : day);
    };

    const renderSkeletons = () => (
        Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Seu Programa de Treino</h1>
                    <p className="text-lg text-gray-500 mt-1">Veja seus treinos da semana e marque-os como concluídos.</p>
                </div>
                <div className="space-y-4">
                    {isLoading ? renderSkeletons() : (
                        program?.map((day) => (
                           <WorkoutDayCard 
                                key={day.day} 
                                day={day} 
                                isOpen={openDay === day.day} 
                                onToggle={() => handleToggle(day.day)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
"use client";

import React, { useState, useEffect } from 'react';
import { workoutService } from '../../../services';
import type { WeeklyWorkoutDay, Exercise } from '../../../types';
import { Card, Button, Skeleton, Dialog } from '../../../components';

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

const WorkoutDayCard: React.FC<{ day: WeeklyWorkoutDay; onOpenModal: (day: WeeklyWorkoutDay) => void }> = ({ day, onOpenModal }) => (
    <Card className="!scale-100 hover:!scale-[1.02] flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-center">
                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${day.isRestDay ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {day.isRestDay ? 'Descanso' : day.focus}
                </span>
                 <span className={`text-xs font-semibold ${day.isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                    {day.isCompleted ? 'Concluído' : 'Pendente'}
                </span>
            </div>
            <h3 className="text-xl font-bold mt-3">{day.day}</h3>
            <p className="text-gray-600">{day.name}</p>
        </div>
        {!day.isRestDay && (
            <Button variant="secondary" className="w-full mt-4" onClick={() => onOpenModal(day)}>
                Ver Treino
            </Button>
        )}
    </Card>
);

const ExerciseDetail: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
        <p className="font-bold text-green-900">{exercise.name}</p>
        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <div><span className="font-semibold">Séries:</span> {exercise.sets}</div>
            <div><span className="font-semibold">Reps:</span> {exercise.reps}</div>
            <div><span className="font-semibold">Desc.:</span> {exercise.rest}</div>
            {exercise.load && <div><span className="font-semibold">Carga:</span> {exercise.load}</div>}
        </div>
        {exercise.observation && <p className="text-xs text-gray-500 mt-2 italic">Obs: {exercise.observation}</p>}
    </div>
);

export default function TreinoPage() {
    const { data: program, isLoading } = useQuery(workoutService.getWeeklyProgram);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<WeeklyWorkoutDay | null>(null);

    const handleOpenModal = (day: WeeklyWorkoutDay) => {
        setSelectedWorkout(day);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkout(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Seu Treino</h1>
                    <p className="text-lg text-gray-500 mt-1">Seu programa de treino semanal.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl"/>)
                    ) : (
                        program?.map(day => (
                            <WorkoutDayCard key={day.day} day={day} onOpenModal={handleOpenModal} />
                        ))
                    )}
                </div>

                {selectedWorkout && (
                    <Dialog 
                        isOpen={isModalOpen} 
                        onClose={handleCloseModal} 
                        title={`Treino de ${selectedWorkout.day} - ${selectedWorkout.name}`}
                        footer={<Button onClick={handleCloseModal}>Fechar</Button>}
                    >
                        {selectedWorkout.exercises?.map((exercise, index) => (
                            <ExerciseDetail key={index} exercise={exercise} />
                        ))}
                    </Dialog>
                )}
            </div>
        </div>
    );
}
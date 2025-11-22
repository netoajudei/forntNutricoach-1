"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Skeleton, Dialog } from '@/components';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAlunoId } from '@/lib/aluno';

type WorkoutProgram = {
  id: string;
  name: string;
  objective: string | null;
};

type WorkoutDay = {
  id: string;
  weekday: number; // 1..7 (Dom..Sáb)
  name: string;
};

type Exercise = {
  name: string;
  sets: number | null;
  reps: string | number | null;
  rest: string | number | null;
  load?: string | number | null;
  observation?: string | null;
};

const WorkoutDayCard: React.FC<{ day: WorkoutDay; onOpenModal: (day: WorkoutDay) => void }> = ({ day, onOpenModal }) => (
    <Card className="!scale-100 hover:!scale-[1.02] flex flex-col">
        <div className="flex-grow">
            <h3 className="text-2xl font-extrabold text-green-800 mt-1">{weekdayName(day.weekday)}</h3>
            <p className="text-base font-semibold text-black">{day.name}</p>
        </div>
        <Button variant="secondary" className="w-full mt-4" onClick={() => onOpenModal(day)}>
            Ver Treino
        </Button>
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

const weekdayName = (n: number) => {
  const names = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  if (n < 1 || n > 7) return 'Dia';
  return names[n-1];
};

export default function TreinoPage() {
    const supabase = createClient();
    const { alunoId } = useAlunoId();
    const [loading, setLoading] = useState(true);
    const [program, setProgram] = useState<WorkoutProgram | null>(null);
    const [workouts, setWorkouts] = useState<WorkoutDay[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isObjectiveOpen, setIsObjectiveOpen] = useState(false);
    const router = useRouter();

    // Coalesce helper for name/objective fields across schemas
    const pickText = (row: any, candidates: string[], fallback = '') => {
      for (const k of candidates) {
        const v = row?.[k];
        if (v && String(v).trim().length > 0) return String(v);
      }
      return fallback;
    };
    const pickNumber = (row: any, candidates: string[]): number | null => {
      for (const k of candidates) {
        const v = row?.[k];
        if (v != null && !Number.isNaN(Number(v))) return Number(v);
      }
      return null;
    };

    // Load current valid program and its workouts
    useEffect(() => {
      const run = async () => {
        if (!alunoId) return;
        setLoading(true);
        // 1) Latest valid program for this aluno
        const { data: programs, error: pErr } = await supabase
          .from('workout_programs')
          .select('*')
          .eq('aluno_id', alunoId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (pErr) {
          console.error('Erro carregando programa de treino:', pErr.message);
          setProgram(null);
          setWorkouts([]);
          setLoading(false);
          return;
        }
        const progRow = programs?.[0];
        if (!progRow) {
          setProgram(null);
          setWorkouts([]);
          setLoading(false);
          return;
        }
        const currentProgram: WorkoutProgram = {
          id: String(progRow.id),
          // Prefer Portuguese column names if exist
          name: pickText(progRow, ['nome','programa_nome','nome_programa','name','titulo','title'], 'Programa de Treino'),
          objective: pickText(progRow, ['objetivo','objetivo_treino','objective','goal'], '') || null,
        };
        setProgram(currentProgram);

        // 2) Fetch workouts for this program
        const { data: wRows, error: wErr } = await supabase
          .from('program_workouts')
          .select('*')
          .eq('program_id', currentProgram.id);
        if (wErr) {
          console.error('Erro carregando treinos do programa:', wErr.message);
          setWorkouts([]);
          setLoading(false);
          return;
        }
        const mapped: WorkoutDay[] = (wRows ?? [])
          .map((r: any) => ({
            id: String(r.id),
            // Preferir 'dia_da_semana' (segundo seu schema), depois 'dia_semana', depois 'weekday'
            weekday: Number(r.dia_da_semana ?? r.dia_semana ?? r.weekday ?? 0) || 0,
            // Preferir 'nome_treino', depois variações
            name: pickText(r, ['nome_treino','treino_nome','nome','name','titulo','title'], 'Treino'),
          }))
          .sort((a,b) => a.weekday - b.weekday);
        setWorkouts(mapped);
        setLoading(false);
      };
      run();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId]);

    const handleOpenModal = async (day: WorkoutDay) => {
      setSelectedWorkout(day);
      setIsModalOpen(true);
      // Load exercises for this workout
      try {
        const { data: xRows, error: xErr } = await supabase
          .from('workout_exercises')
          .select('*')
          .eq('workout_id', day.id)
          .eq('ativo', true)
          .order('ordem', { ascending: true });
        if (xErr) {
          console.error('Erro carregando exercícios:', xErr.message);
          setExercises([]);
          return;
        }
        const mapped: Exercise[] = (xRows ?? []).map((r: any) => ({
          name: pickText(r, ['nome_exercicio','nome','name','exercicio','exercise_name'], 'Exercício'),
          sets: pickNumber(r, ['series','sets']),
          reps: r.repeticoes ?? r.reps ?? null,
          rest: r.descanso_segundos ?? r.descanso_seg ?? r.rest ?? null,
          load: r.carga_kg ?? r.carga ?? r.load ?? null,
          observation: r.observacoes ?? r.observacao ?? r.obs ?? null,
        }));
        setExercises(mapped);
      } catch (e: any) {
        console.error('Erro inesperado exercícios:', e?.message || e);
        setExercises([]);
      }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkout(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-lg-green-900">Seu Treino</h1>
                        {program ? (
                          <div className="mt-1 space-y-2">
                            {/* Nome do Programa (verde, destaque) */}
                            <div className="text-2xl font-extrabold text-green-800">{program.name}</div>
                            {/* Objetivo fora da caixa, tamanho completo */}
                            <div className="text-black font-semibold">Objetivo:</div>
                            <div className="text-sm text-gray-800 whitespace-pre-wrap">
                              {program.objective || '—'}
                            </div>
                          </div>
                        ) : (
                          <p className="text-lg text-gray-500 mt-1">Nenhum programa de treino encontrado.</p>
                        )}
                    </div>
                    <div className="shrink-0">
                        <Button variant="secondary" onClick={() => router.push('/dashboard/workout-programs')}>
                          Programas de Treino
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl"/>)
                    ) : (
                        workouts.map(day => (
                            <WorkoutDayCard key={day.id} day={day} onOpenModal={handleOpenModal} />
                        ))
                    )}
                </div>

                {selectedWorkout && (
                    <Dialog 
                        isOpen={isModalOpen} 
                        onClose={handleCloseModal} 
                        title={`Treino de ${weekdayName(selectedWorkout.weekday)} - ${selectedWorkout.name}`}
                        footer={<Button onClick={handleCloseModal}>Fechar</Button>}
                        maxWidth="max-w-[96vw] sm:max-w-3xl"
                    >
                        {/* Responsivo: em mobile (>= ~360px), dar mais espaço ao header/footer; em desktop, usar 90% */}
                        <div className="w-full max-h-[85vh] sm:max-h-[90vh] p-3 flex flex-col">
                          <div className="h-[60vh] sm:h-[70vh] overflow-y-auto px-3 pt-3 pb-8">
                            {exercises.length === 0 ? (
                              <p className="text-sm text-gray-600">Sem exercícios cadastrados para este treino.</p>
                            ) : (
                              <div className="space-y-3">
                                {exercises.map((exercise, index) => (
                                    <ExerciseDetail key={index} exercise={exercise} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                    </Dialog>
                )}

                {null /* Popup de objetivo removido; objetivo exibido completo inline */}
            </div>
        </div>
    );
}
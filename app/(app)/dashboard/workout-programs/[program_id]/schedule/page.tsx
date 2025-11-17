"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Skeleton, Dialog } from "@/components";
import { createClient } from "@/lib/supabase/client";

type ProgramWorkout = {
  id: string;
  nome_treino: string;
  dia_da_semana: number;
};

const dayNames = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export default function SchedulePage() {
  const params = useParams<{ program_id: string }>();
  const router = useRouter();
  const programId = params?.program_id;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [programName, setProgramName] = useState<string>("");
  const [workouts, setWorkouts] = useState<ProgramWorkout[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ProgramWorkout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Array<{
    id: string; ordem: number | null; nome_exercicio: string; grupo_muscular: string | null;
    series: string | null; repeticoes: string | null; carga_kg: number | null; descanso_segundos: number | null; observacoes: string | null; ativo: boolean | null;
  }>>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);
  const [nomeTreino, setNomeTreino] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedByDay = useMemo(() => {
    const map = new Map<number, ProgramWorkout[]>();
    for (let i = 1; i <= 7; i++) map.set(i, []);
    workouts.forEach(w => {
      const arr = map.get(w.dia_da_semana) || [];
      arr.push(w);
      map.set(w.dia_da_semana, arr);
    });
    return map;
  }, [workouts]);

  const refresh = async () => {
    if (!programId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Nome do programa
      const { data: prog, error: pErr } = await supabase
        .from("workout_programs")
        .select("nome_programa")
        .eq("id", programId)
        .maybeSingle();
      if (pErr) console.error("Erro programa:", pErr.message);
      setProgramName(prog?.nome_programa || "Programa");

      // Treinos do programa
      const { data: rows, error: wErr } = await supabase
        .from("program_workouts")
        .select("id, nome_treino, dia_da_semana")
        .eq("program_id", programId)
        .order("dia_da_semana", { ascending: true });
      if (wErr) {
        setError(wErr.message || "Falha ao carregar treinos.");
        setWorkouts([]);
      } else {
        setWorkouts((rows || []) as ProgramWorkout[]);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erro inesperado ao carregar.");
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const openAddModal = (day: number) => {
    setSelectedDay(day);
    setNomeTreino("");
    setShowModal(true);
  };

  const openExercisesModal = async (w: ProgramWorkout) => {
    setSelectedWorkout(w);
    setShowExercisesModal(true);
    await fetchWorkoutExercises(w.id);
  };

  const fetchWorkoutExercises = async (workoutId: string) => {
    setLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from("workout_exercises")
        .select("id, ordem, nome_exercicio, grupo_muscular, series, repeticoes, carga_kg, descanso_segundos, observacoes, ativo")
        .eq("workout_id", workoutId)
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      if (error) {
        setWorkoutExercises([]);
      } else {
        setWorkoutExercises((data || []) as any);
      }
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleDeactivateExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from("workout_exercises")
        .update({ ativo: false })
        .eq("id", exerciseId);
      if (error) {
        alert(error.message || "Falha ao desativar exercício.");
        return;
      }
      if (selectedWorkout) {
        await fetchWorkoutExercises(selectedWorkout.id);
      }
      setConfirmDeactivateId(null);
    } catch (e: any) {
      alert(e?.message || "Erro inesperado ao desativar exercício.");
    }
  };

  const handleCreateWorkout = async () => {
    if (!programId || !selectedDay) return;
    const name = nomeTreino.trim();
    if (!name) {
      alert("Informe o nome do treino.");
      return;
    }
    setSaving(true);
    try {
      const { error: insErr, data } = await supabase
        .from("program_workouts")
        .insert({
          program_id: programId,
          nome_treino: name,
          dia_da_semana: selectedDay,
        })
        .select("id")
        .maybeSingle();
      if (insErr) {
        alert(insErr.message || "Falha ao criar o treino.");
        setSaving(false);
        return;
      }
      setShowModal(false);
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Erro inesperado ao criar treino.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-900">
              {programName} — Agenda Semanal
            </h1>
            <p className="text-sm text-gray-500">Defina os treinos por dia da semana.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/dashboard/workout-programs/new")}>
              Criar outro programa
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <p className="text-sm text-red-600">Erro: {error}</p>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 7 }, (_, idx) => {
              const day = idx + 1; // 1..7
              const list = groupedByDay.get(day) || [];
              return (
                <Card key={day}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-green-900">{dayNames[day - 1]}</h3>
                    <span className="text-xs text-gray-500">{list.length} treino(s)</span>
                  </div>
                  <div className="space-y-2">
                    {list.map(w => (
                      <button
                        key={w.id}
                        onClick={() => openExercisesModal(w)}
                        className="w-full text-left rounded-lg border p-3 hover:bg-green-50 transition"
                        title="Ver exercícios do treino"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-green-900">{w.nome_treino}</p>
                            <p className="text-xs text-gray-500">Treino do dia {dayNames[(w.dia_da_semana - 1)]}</p>
                          </div>
                          <span className="text-xs text-gray-500">Ver exercícios →</span>
                        </div>
                      </button>
                    ))}
                    <Button onClick={() => openAddModal(day)} className="w-full">+ Adicionar Treino</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Exercícios do treino (visual + botões) */}
      <Dialog
        isOpen={showExercisesModal}
        onClose={() => setShowExercisesModal(false)}
        title={selectedWorkout ? `Exercícios — ${dayNames[selectedWorkout.dia_da_semana - 1]} · ${selectedWorkout.nome_treino}` : "Exercícios"}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" onClick={() => setShowExercisesModal(false)}>Fechar</Button>
            {selectedWorkout && (
              <Button onClick={() => router.push(`/dashboard/workout-programs/${programId}/workouts/${selectedWorkout.id}/exercises`)}>
                + Adicionar Exercícios
              </Button>
            )}
          </div>
        }
      >
        {loadingExercises ? (
          <Skeleton className="h-24 w-full" />
        ) : workoutExercises.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhum exercício cadastrado para este treino.</p>
        ) : (
          <div className="space-y-2">
            {workoutExercises.map(ex => (
              <div key={ex.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    {ex.ordem ?? "-"} — {ex.nome_exercicio}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ex.grupo_muscular || "-"} • Séries: {ex.series || "-"} • Reps: {ex.repeticoes || "-"} • Carga: {ex.carga_kg ?? "-"}kg • Descanso: {ex.descanso_segundos ?? "-"}s
                  </p>
                  {ex.observacoes && <p className="text-xs text-gray-500 mt-1 italic">Obs: {ex.observacoes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {/* Ícone/placeholder para desativar (somente visual por enquanto) */}
                  <button
                    type="button"
                    title="Desativar exercício"
                    className="px-2 py-1 rounded-md border text-xs text-gray-600 hover:bg-gray-100"
                    onClick={() => setConfirmDeactivateId(ex.id)}
                  >
                    Desativar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
      {/* Confirmar desativação */}
      <Dialog
        isOpen={Boolean(confirmDeactivateId)}
        onClose={() => setConfirmDeactivateId(null)}
        title="Desativar exercício"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDeactivateId(null)}>Cancelar</Button>
            <Button onClick={() => confirmDeactivateId && handleDeactivateExercise(confirmDeactivateId)}>Desativar</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Tem certeza de que deseja desativar este exercício? Ele deixará de aparecer para o aluno.
        </p>
      </Dialog>

      {/* Modal para criar treino do dia */}
      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Novo Treino — ${selectedDay ? dayNames[selectedDay - 1] : ""}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateWorkout} disabled={saving}>{saving ? "Salvando..." : "Criar e continuar"}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="text-sm font-medium">Nome do Treino</label>
          <input
            type="text"
            placeholder='Ex: "Treino A - Superior"'
            value={nomeTreino}
            onChange={(e) => setNomeTreino(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
      </Dialog>
    </div>
  );
}




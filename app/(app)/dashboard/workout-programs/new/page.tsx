"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Skeleton } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { useAlunoId } from "@/lib/aluno";

export default function NewWorkoutProgramPage() {
  const router = useRouter();
  const { alunoId, loading: alunoLoading, error: alunoError } = useAlunoId();
  const [nomePrograma, setNomePrograma] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [freq, setFreq] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoId) {
      setError("Aluno não encontrado.");
      return;
    }
    if (!nomePrograma.trim()) {
      setError("Informe o nome do programa.");
      return;
    }
    if (!freq || Number(freq) < 1) {
      setError("Informe a frequência semanal (3 a 6).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dataInicio = `${yyyy}-${mm}-${dd}`;

      const { data, error: insErr } = await supabase
        .from("workout_programs")
        .insert({
          aluno_id: alunoId,
          nome_programa: nomePrograma.trim(),
          objetivo: objetivo.trim() || null,
          frequencia_semanal: Number(freq),
          is_active: true,
          version: 1,
          data_inicio: dataInicio,
        })
        .select("id")
        .maybeSingle();

      if (insErr) {
        setError(insErr.message || "Falha ao salvar o programa.");
        setSaving(false);
        return;
      }
      const programId = data?.id;
      if (!programId) {
        setError("Programa criado, mas não foi possível obter o ID.");
        setSaving(false);
        return;
      }
      router.push(`/dashboard/workout-programs/${programId}/schedule`);
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao salvar o programa.");
    } finally {
      setSaving(false);
    }
  };

  if (alunoLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-52 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (alunoError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <p className="text-sm text-red-600">Erro: {alunoError}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-900">
            Criar Novo Programa de Treino
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Defina os detalhes do programa e prossiga para montar a agenda semanal.
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium">Nome do Programa</label>
              <input
                type="text"
                placeholder='Ex: "Série de 8 Semanas - Hipertrofia"'
                value={nomePrograma}
                onChange={(e) => setNomePrograma(e.target.value)}
                required
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Objetivo</label>
              <textarea
                placeholder='Ex: "Acumular massa muscular focando em cargas pesadas progressivas"'
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                rows={4}
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequência Semanal</label>
              <input
                type="number"
                min={1}
                max={7}
                placeholder="Ex: 4"
                value={freq}
                onChange={(e) => setFreq(e.target.value ? Number(e.target.value) : "")}
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Recomendado: 3 a 6 treinos por semana</p>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={saving} className="min-w-[180px]">
                {saving ? "Salvando..." : "Salvar e Criar Treinos"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}



"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Skeleton } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { useAlunoId } from "@/lib/aluno";

type WorkoutProgram = {
  id: string;
  nome_programa: string | null;
  objetivo: string | null;
  frequencia_semanal: number | null;
  is_active: boolean | null;
  data_inicio: string | null;
};

export default function WorkoutProgramsListPage() {
  const router = useRouter();
  const supabase = createClient();
  const { alunoId, loading: alunoLoading, error: alunoError } = useAlunoId();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!alunoId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("workout_programs")
        .select("id, nome_programa, objetivo, frequencia_semanal, is_active, data_inicio")
        .eq("aluno_id", alunoId)
        .order("data_inicio", { ascending: false });
      if (err) {
        setError(err.message || "Falha ao carregar programas.");
        setPrograms([]);
      } else {
        setPrograms((data || []) as any);
      }
    } catch (e: any) {
      setError(e?.message || "Erro inesperado ao carregar programas.");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!alunoLoading && !alunoError) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoLoading, alunoError, alunoId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-900">
              Programas de Treino
            </h1>
            <p className="text-sm text-gray-500">Gerencie os programas de treino do aluno.</p>
          </div>
          <Button onClick={() => router.push("/dashboard/workout-programs/new")}>
            + Novo Programa
          </Button>
        </div>

        {alexa(alunoLoading, loading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-red-600">Erro: {error}</p>
          </Card>
        ) : programs.length === 0 ? (
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-green-900">Nenhum programa adicionado até agora.</h2>
                <p className="text-sm text-gray-600">Crie seu primeiro programa de treino para começar.</p>
              </div>
              <Button onClick={() => router.push("/dashboard/workout-programs/new")}>
                Criar novo programa
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900">{p.nome_programa || "Sem nome"}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                      {p.objetivo || "—"}
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <div><span className="font-semibold">Frequência:</span> {p.frequencia_semanal ?? "—"}x/sem</div>
                      <div><span className="font-semibold">Início:</span> {fmtDate(p.data_inicio)}</div>
                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        <span className={p.is_active ? "text-green-600 font-semibold" : "text-gray-500"}>
                          {p.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button onClick={() => router.push(`/dashboard/workout-programs/${p.id}/schedule`)} className="px-3 py-1.5 text-sm">
                      Abrir agenda
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(String(iso));
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(iso);
  }
}

function alexa(a: boolean, b: boolean) {
  return a || b;
}



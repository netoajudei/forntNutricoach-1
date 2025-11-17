"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Skeleton, Dialog } from "@/components";
import { createClient } from "@/lib/supabase/client";

export default function WorkoutExercisesPage() {
  const router = useRouter();
  const params = useParams<{ program_id: string; workout_id: string }>();
  const programId = params?.program_id;
  const workoutId = params?.workout_id;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState<string>("");
  const [workoutName, setWorkoutName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Array<{ id: number; nome_exercicio: string; grupo_muscular: string }>>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Added exercises (this workout)
  const [exercises, setExercises] = useState<Array<{
    id: string;
    ordem: number | null;
    nome_exercicio: string;
    grupo_muscular: string | null;
    series: string | null;
    repeticoes: string | null;
    carga_kg: number | null;
    descanso_segundos: number | null;
    observacoes: string | null;
    ativo: boolean | null;
  }>>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);

  // Modal adicionar exercício
  const [showAdd, setShowAdd] = useState(false);
  const [tmplSelected, setTmplSelected] = useState<{ id: number; nome_exercicio: string; grupo_muscular: string } | null>(null);
  const [series, setSeries] = useState("");
  const [reps, setReps] = useState("");
  const [carga, setCarga] = useState<number | "">("");
  const [descanso, setDescanso] = useState<number | "">(90);
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!programId || !workoutId) return;
      setLoading(true);
      setError(null);
      try {
        const [{ data: prog }, { data: w }] = await Promise.all([
          supabase.from("workout_programs").select("nome_programa").eq("id", programId).maybeSingle(),
          supabase.from("program_workouts").select("nome_treino").eq("id", workoutId).maybeSingle(),
        ]);
        setProgramName(prog?.nome_programa || "Programa");
        setWorkoutName(w?.nome_treino || "Treino");
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar informações.");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, workoutId]);

  const refreshTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const { data, error: tErr } = await supabase
        .from("exercicios_template")
        .select("id, nome_exercicio, grupo_muscular")
        .order("grupo_muscular", { ascending: true })
        .order("nome_exercicio", { ascending: true });
      if (tErr) {
        setTemplates([]);
      } else {
        setTemplates((data || []) as any);
        const unique = Array.from(new Set((data || []).map((x: any) => x.grupo_muscular).filter(Boolean)));
        setGroups(unique);
      }
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const refreshExercises = async () => {
    if (!workoutId) return;
    setIsLoadingExercises(true);
    try {
      const { data, error: eErr } = await supabase
        .from("workout_exercises")
        .select("id, ordem, nome_exercicio, grupo_muscular, series, repeticoes, carga_kg, descanso_segundos, observacoes, ativo")
        .eq("workout_id", workoutId)
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      if (eErr) setExercises([]);
      else setExercises((data || []) as any);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  useEffect(() => {
    refreshTemplates();
    refreshExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter(t => {
      const byGroup = groupFilter ? (t.grupo_muscular === groupFilter) : true;
      const byText = q ? (t.nome_exercicio.toLowerCase().includes(q)) : true;
      return byGroup && byText;
    });
  }, [templates, search, groupFilter]);

  const openAddExercise = (tmpl: { id: number; nome_exercicio: string; grupo_muscular: string }) => {
    setTmplSelected(tmpl);
    setSeries("");
    setReps("");
    setCarga("");
    setDescanso(90);
    setObservacoes("");
    setShowAdd(true);
  };

  const getNextOrdem = async (): Promise<number> => {
    const { data, error } = await supabase
      .from("workout_exercises")
      .select("ordem")
      .eq("workout_id", workoutId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data || data.ordem == null) return 1;
    return Number(data.ordem) + 1;
  };

  const handleSaveExercise = async () => {
    if (!workoutId || !tmplSelected) return;
    const nome = tmplSelected.nome_exercicio;
    const grupo = tmplSelected.grupo_muscular;
    setSaving(true);
    try {
      const ordem = await getNextOrdem();
      const payload: any = {
        workout_id: workoutId,
        exercicio_template_id: tmplSelected.id,
        nome_exercicio: nome,
        grupo_muscular: grupo,
        ordem,
        series: series || null,
        repeticoes: reps || null,
        carga_kg: carga === "" ? null : Number(carga),
        descanso_segundos: descanso === "" ? null : Number(descanso),
        observacoes: observacoes || null,
        ativo: true,
      };
      const { error: insErr } = await supabase.from("workout_exercises").insert(payload);
      if (insErr) {
        alert(insErr.message || "Falha ao salvar exercício.");
        setSaving(false);
        return;
      }
      setShowAdd(false);
      await refreshExercises();
    } catch (e: any) {
      alert(e?.message || "Erro inesperado ao salvar exercício.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from("workout_exercises")
        .update({ ativo: false })
        .eq("id", id);
      if (error) {
        alert(error.message || "Falha ao desativar exercício.");
        return;
      }
      await refreshExercises();
    } catch (e: any) {
      alert(e?.message || "Erro inesperado ao desativar exercício.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-900">
              {loading ? <Skeleton className="h-8 w-80" /> : `${programName} — ${workoutName}`}
            </h1>
            <p className="text-sm text-gray-500">Adicionar exercícios a este treino.</p>
          </div>
          <Button variant="secondary" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>

        {error && (
          <Card>
            <p className="text-sm text-red-600">Erro: {error}</p>
          </Card>
        )}

        {/* Busca e filtros */}
        <Card>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <input
                type="text"
                placeholder="Buscar exercício (ex: supino, agachamento)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-md px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${groupFilter === null ? "bg-green-500 text-white" : "bg-white border"}`}
                  onClick={() => setGroupFilter(null)}
                >
                  Todos
                </button>
                {groups.map((g) => (
                  <button
                    key={g}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${groupFilter === g ? "bg-green-500 text-white" : "bg-white border"}`}
                    onClick={() => setGroupFilter(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Lista de templates */}
            {isLoadingTemplates ? (
              <Skeleton className="h-24 w-full rounded-2xl" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTemplates.map((t) => (
                  <Card key={t.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-900">{t.nome_exercicio}</p>
                        <p className="text-xs text-gray-500">{t.grupo_muscular}</p>
                      </div>
                      <Button variant="secondary" onClick={() => openAddExercise(t)} className="px-3 py-1.5 text-sm">
                        + Adicionar
                      </Button>
                    </div>
                  </Card>
                ))}
                {filteredTemplates.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum exercício encontrado.</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Lista de exercícios adicionados */}
        <Card>
          <h2 className="text-lg font-bold text-green-900 mb-3">Exercícios do Treino</h2>
          {isLoadingExercises ? (
            <Skeleton className="h-24 w-full rounded-2xl" />
          ) : exercises.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum exercício adicionado ainda.</p>
          ) : (
            <div className="space-y-2">
              {exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      {ex.ordem ?? "-"} — {ex.nome_exercicio}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ex.grupo_muscular || "-"} • Séries: {ex.series || "-"} • Reps: {ex.repeticoes || "-"} • Carga:{" "}
                      {ex.carga_kg ?? "-"}kg • Descanso: {ex.descanso_segundos ?? "-"}s
                    </p>
                    {ex.observacoes && <p className="text-xs text-gray-500 mt-1 italic">Obs: {ex.observacoes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 rounded-md border text-xs text-gray-600 hover:bg-gray-100"
                      title="Desativar exercício"
                      onClick={() => handleDeactivateExercise(ex.id)}
                    >
                      Desativar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal Adicionar Exercício */}
      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title={`Adicionar Exercício${tmplSelected ? ` — ${tmplSelected.nome_exercicio}` : ""}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveExercise} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Exercício"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <input
                type="text"
                value={tmplSelected?.nome_exercicio || ""}
                readOnly
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Grupo Muscular</label>
              <input
                type="text"
                value={tmplSelected?.grupo_muscular || ""}
                readOnly
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Séries</label>
              <input
                type="text"
                placeholder='Ex: "4" ou "3-4"'
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Repetições</label>
              <input
                type="text"
                placeholder='Ex: "8-12" ou "15"'
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Carga Inicial (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 60"
                value={carga}
                onChange={(e) => setCarga(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descanso (segundos)</label>
              <input
                type="number"
                step="1"
                placeholder="Ex: 90"
                value={descanso}
                onChange={(e) => setDescanso(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Observações (opcional)</label>
            <textarea
              placeholder="Instruções adicionais do exercício..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}



"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAlunoId } from "@/lib/aluno";
import { getImpersonation, isImpersonating } from "@/lib/impersonation";

export default function PersonalTrainerInstructionsPage() {
  // Placeholder texto curto enquanto carrega
  const loadingPlaceholder = "Carregando instruções da IA...";
  const [aiInstructionsText, setAiInstructionsText] = useState<string>(loadingPlaceholder);

  const originalInstructionsPlaceholder =
    "instrucoes_personal.instrucoes_texto\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus volutpat justo id nisi dictum, a elementum arcu fermentum.";

  // State for editable personal instructions
  const [originalInstructionsText, setOriginalInstructionsText] = useState<string>("");
  const [personalInstructionsText, setPersonalInstructionsText] = useState<string>("");

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [showEditablePopup, setShowEditablePopup] = useState(false);
  const [showConfirmFetch, setShowConfirmFetch] = useState(false);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const alunoIdHook = useAlunoId();
  const router = useRouter();

  // Carrega dados do Supabase: instrucoes_personal do aluno logado
  const refreshFromSupabase = async () => {
    setLoadError(null);
    setIsInitialLoading(true);
    const supabase = createClient();
    try {
      // Usar aluno_id global em vez de user.id
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        setLoadError("Aluno não encontrado.");
        setAiInstructionsText("Não foi possível carregar as instruções da IA.");
        return;
      }

      // Consulta direta usando a coluna correta: aluno_id
      const { data, error: finalError } = await supabase
        .from("instrucoes_personal")
        .select("instrucoes_da_ia, instrucoes_texto")
        .eq("aluno_id", alunoId)
        .maybeSingle();

      if (finalError) {
        // Não lançar; registrar e mostrar mensagem amigável
        console.error("Supabase error:", JSON.stringify(finalError));
        setLoadError(finalError.message || "Erro ao carregar instruções.");
        setAiInstructionsText("Não foi possível carregar as instruções da IA.");
        return;
      }

      setAiInstructionsText(
        data?.instrucoes_da_ia ?? "Sem instruções geradas pela IA ainda."
      );
      const textoDb = data?.instrucoes_texto ?? "";
      setOriginalInstructionsText(textoDb);
      // Task 1: set initial value of second input to DB value (or empty if null)
      setPersonalInstructionsText(textoDb);
    } catch (err: any) {
      console.error("Unexpected error:", err?.message || err);
      setLoadError(err?.message ?? "Erro ao carregar instruções.");
      setAiInstructionsText("Não foi possível carregar as instruções da IA.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    // Aguarda ter alunoId disponível antes de buscar
    if (!alunoIdHook.loading) {
      refreshFromSupabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoIdHook.loading]);

  // Actions (stubs)
  const handleFetchAISuggestions = () => {
    console.log("Buscar sugestões da IA (stub)");
    alert("Buscar sugestões da IA (stub)");
  };

  const handleCopyAIContent = async () => {
    try {
      await navigator.clipboard.writeText(aiInstructionsText);
      console.log("Conteúdo da IA copiado (stub)");
      alert("Conteúdo da IA copiado!");
    } catch (err) {
      console.error(err);
      alert("Não foi possível copiar o conteúdo.");
    }
  };

  // Helpers
  const upsertPersonalInstructions = async (alunoId: string, text: string) => {
    const supabase = createClient();
    const { data: existing, error: fetchErr } = await supabase
      .from("instrucoes_personal")
      .select("id")
      .eq("aluno_id", alunoId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (existing) {
      const { error: updErr } = await supabase
        .from("instrucoes_personal")
        .update({ instrucoes_texto: text })
        .eq("id", (existing as any).id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("instrucoes_personal")
        .insert({ aluno_id: alunoId, instrucoes_texto: text });
      if (insErr) throw insErr;
    }
  };

  const handleCreateExercisePlan = async () => {
    // PT-BR flow per spec
    try {
      setIsCreatingPlan(true);
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        alert("Aluno não encontrado.");
        return;
      }
      const texto = personalInstructionsText.trim();
      // Action 1: Save to DB
      await upsertPersonalInstructions(alunoId, texto);
      // Action 2: Call custom function iniciar-plano-de-treino
      const supabase = createClient();
      const { error: fnError } = await supabase.functions.invoke("iniciar-plano-de-treino", {
        body: { aluno_id: alunoId, input_texto: texto },
      });
      if (fnError) {
        console.error("invoke iniciar-plano-de-treino error:", fnError);
        alert("Falha ao iniciar o plano de treino. Tente novamente.");
        return;
      }
      // Success feedback
      alert("Plano de treino iniciado com sucesso!");
      setShowConfirm(false);
    } catch (err: any) {
      console.error("create plan error:", err?.message || err);
      alert("Falha ao salvar ou iniciar o plano de treino.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleSavePersonalInstructions = async () => {
    try {
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        alert("Aluno não encontrado.");
        return;
      }
      const texto = personalInstructionsText.trim();
      await upsertPersonalInstructions(alunoId, texto);
      alert("Instruções salvas com sucesso!");
      setOriginalInstructionsText(texto);
    } catch (err: any) {
      console.error("save instructions error:", err?.message || err);
      alert("Falha ao salvar as instruções.");
    }
  };

  const actionsVisible = personalInstructionsText.trim().length > 0;

  const imp = typeof window !== "undefined" ? getImpersonation() : null;
  const isPro = typeof window !== "undefined" ? isImpersonating() : false;

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">Instruções do Personal Trainer</h1>
          {null /* Informação de tabela removida conforme solicitação */}
        </header>

        {/* Section 1: AI Instructions (read-only) - somente para profissionais */}
        {isPro && (
          <section className="rounded-xl border border-gray-300 bg-gray-100 p-4 md:p-6 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">Instruções da IA</h2>
            <textarea
              className="w-full min-h-48 rounded-lg border border-gray-300 p-3 text-sm bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
              value={isInitialLoading ? loadingPlaceholder : aiInstructionsText}
              readOnly
              onClick={() => setShowAIPopup(true)}
              title="Clique para expandir"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmFetch(true)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-primary/10 disabled:opacity-60"
                disabled={isFetchingAI}
              >
                {isFetchingAI ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-ring border-t-transparent animate-spin" />
                    Buscando sugestões da IA...
                  </span>
                ) : (
                  "Buscar sugestões da IA"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Copia o conteúdo da IA para o campo de baixo
                  setPersonalInstructionsText(isInitialLoading ? "" : aiInstructionsText);
                  // Abre o popup editável para facilitar a edição
                  setShowEditablePopup(true);
                }}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-primary/10"
              >
                Copiar conteúdo da IA
              </button>
            </div>
          </section>
        )}

        {/* Section 2: Personal Trainer's Custom Instructions (editable) */}
        <section className="rounded-xl border border-gray-300 bg-gray-100 p-4 md:p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Instruções Personalizadas do Personal</h2>
          <textarea
            className="w-full min-h-64 rounded-lg border border-gray-300 p-3 text-sm bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
            value={personalInstructionsText}
            onChange={(e) => setPersonalInstructionsText(e.target.value)}
            onClick={() => setShowEditablePopup(true)}
            title="Clique para editar em tela cheia"
            placeholder="Instruções do nutricionista"
          />

          <div className="flex flex-wrap gap-3">
            {actionsVisible && (
              <>
                <button
                  type="button"
                  onClick={handleSavePersonalInstructions}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-primary/10"
                >
                  Salvar instruções do personal
                </button>
                {isPro && (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center justify-center rounded-md border bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                    disabled={isCreatingPlan}
                  >
                    {isCreatingPlan ? "Processando..." : "Criar Plano de Treino"}
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => router.push("/dashboard/workout-programs")}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-primary/10"
              title="Criar exercícios manualmente"
            >
              Criar exercício manualmente
            </button>
          </div>
        </section>
      </div>

      {/* Popup grande (90%) - leitura da IA */}
      {showAIPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAIPopup(false)} aria-hidden="true" />
          <div className="relative z-10 w-[90vw] h-[90vh] rounded-xl border border-border bg-background p-4 md:p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Instruções da IA (visualização)</h3>
              <button
                type="button"
                onClick={() => setShowAIPopup(false)}
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-primary/10"
              >
                Fechar
              </button>
            </div>
            <textarea
              className="flex-1 w-full rounded-lg border border-gray-300 p-3 text-sm bg-white text-black outline-none"
              value={aiInstructionsText}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Popup grande (90%) - edição do texto do personal */}
      {showEditablePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditablePopup(false)} aria-hidden="true" />
          <div className="relative z-10 w-[90vw] h-[90vh] rounded-xl border border-border bg-background p-4 md:p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Editar instruções do personal</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditablePopup(false)}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-primary/10"
                >
                  Fechar
                </button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full rounded-lg border border-gray-300 p-3 text-sm bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
              value={personalInstructionsText}
              onChange={(e) => setPersonalInstructionsText(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Confirmação antes de buscar IA (conforme solicitado) */}
      {showConfirmFetch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmFetch(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirmar ação</h3>
            <p className="text-sm opacity-80 mb-4">
              Deseja criar um plano de treinos para este aluno agora e buscar novas sugestões da IA?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmFetch(false)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-primary/10"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmFetch(false);
                  // Simula operação longa do "chat-personal"
                  setIsFetchingAI(true);
                  console.log("chat-personal: buscando instrucoes_personal.instrucoes_da_ia (stub)");
                  setTimeout(async () => {
                    // Após a operação longa, recarrega do banco
                    await refreshFromSupabase();
                    setIsFetchingAI(false);
                    alert("Sugestões da IA atualizadas.");
                  }, 2000);
                }}
                className="inline-flex items-center justify-center rounded-md border bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:brightness-110"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirmar ação</h3>
            <p className="text-sm opacity-80 mb-4">
              Você tem certeza que deseja criar este novo plano?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-primary/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateExercisePlan}
                className="inline-flex items-center justify-center rounded-md border bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                disabled={isCreatingPlan}
              >
                {isCreatingPlan ? "Processando..." : "Sim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

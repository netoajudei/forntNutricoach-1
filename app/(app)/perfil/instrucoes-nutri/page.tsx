"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAlunoId } from "@/lib/aluno";
import { getImpersonation, isImpersonating } from "@/lib/impersonation";

export default function NutritionistInstructionsPage() {
  // Estado inicial e placeholders
  const loadingPlaceholder = "Carregando instruções da IA...";
  const [aiInstructionsText, setAiInstructionsText] = useState<string>(loadingPlaceholder);
  const [originalInstructionsText, setOriginalInstructionsText] = useState<string>("");
  const [nutritionistInstructionsText, setNutritionistInstructionsText] = useState<string>("");

  // UI state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [showEditablePopup, setShowEditablePopup] = useState(false);
  const [showConfirmFetch, setShowConfirmFetch] = useState(false);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const alunoIdHook = useAlunoId();

  // Carregar dados do Supabase
  const refreshFromSupabase = async () => {
    setLoadError(null);
    setIsInitialLoading(true);
    const supabase = createClient();
    try {
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        setLoadError("Aluno não encontrado.");
        setAiInstructionsText("Não foi possível carregar as instruções da IA.");
        return;
      }
      const { data, error } = await supabase
        .from("instrucoes_nutricionista")
        .select("instrucoes_da_ia, instrucoes_texto")
        .eq("aluno_id", alunoId)
        .maybeSingle();
      if (error) {
        console.error("Supabase error:", JSON.stringify(error));
        setLoadError(error.message || "Erro ao carregar instruções.");
        setAiInstructionsText("Não foi possível carregar as instruções da IA.");
        return;
      }
      setAiInstructionsText(data?.instrucoes_da_ia ?? "Sem instruções geradas pela IA ainda.");
      const textoDb = data?.instrucoes_texto ?? "";
      setOriginalInstructionsText(textoDb);
      // Task 1: set initial value of second input to DB value (or empty if null)
      setNutritionistInstructionsText(textoDb);
    } catch (err: any) {
      console.error("Unexpected error:", err?.message || err);
      setLoadError(err?.message ?? "Erro ao carregar instruções.");
      setAiInstructionsText("Não foi possível carregar as instruções da IA.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!alunoIdHook.loading) {
      refreshFromSupabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoIdHook.loading]);

  // Helpers
  const upsertNutritionistInstructions = async (alunoId: string, text: string) => {
    const supabase = createClient();
    const { data: existing, error: fetchErr } = await supabase
      .from("instrucoes_nutricionista")
      .select("id")
      .eq("aluno_id", alunoId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (existing) {
      const { error: updErr } = await supabase
        .from("instrucoes_nutricionista")
        .update({ instrucoes_texto: text })
        .eq("id", (existing as any).id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("instrucoes_nutricionista")
        .insert({ aluno_id: alunoId, instrucoes_texto: text });
      if (insErr) throw insErr;
    }
  };

  const upsertAIInstructions = async (alunoId: string, aiText: string) => {
    const supabase = createClient();
    const { data: existing, error: fetchErr } = await supabase
      .from("instrucoes_nutricionista")
      .select("id")
      .eq("aluno_id", alunoId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (existing) {
      const { error: updErr } = await supabase
        .from("instrucoes_nutricionista")
        .update({ instrucoes_da_ia: aiText })
        .eq("id", (existing as any).id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("instrucoes_nutricionista")
        .insert({ aluno_id: alunoId, instrucoes_da_ia: aiText });
      if (insErr) throw insErr;
    }
  };

  const handleFetchAISuggestions = async () => {
    try {
      setIsFetchingAI(true);
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        alert("Aluno não encontrado.");
        setIsFetchingAI(false);
        return;
      }
      const supabase = createClient();
      // Chama a função do Edge/Function para gerar instruções da IA do nutricionista
      const { data, error } = await supabase.functions.invoke("chat-nutricionista", {
        body: {
          aluno_id: alunoId,
          mensagem_nutricionista:
            "POr favor crie o plano nutricional para esse aluno com base nas informacoes fornecidas por ele , priorize sempre informar o numero de calorias e macros diario e os de cada refeicao",
        },
      });
      if (error) {
        console.error("invoke chat-nutricionista error:", error);
        alert("Falha ao buscar sugestões da IA.");
        setIsFetchingAI(false);
        return;
      }
      // Tenta normalizar possíveis formatos de retorno
      const aiText: string =
        (typeof data === "string" && data) ||
        data?.text ||
        data?.instrucoes ||
        data?.instructions ||
        data?.ia_text ||
        "Sem instruções geradas pela IA.";

      // Salva no banco em instrucoes_da_ia
      await upsertAIInstructions(alunoId, aiText);
      // Atualiza UI
      setAiInstructionsText(aiText);
      alert("Sugestões da IA atualizadas.");
    } catch (err: any) {
      console.error("fetch AI suggestions error:", err?.message || err);
      alert("Falha ao buscar sugestões da IA.");
    } finally {
      setIsFetchingAI(false);
    }
  };

  const handleSaveNutritionistInstructions = async () => {
    try {
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        alert("Aluno não encontrado.");
        return;
      }
      const texto = nutritionistInstructionsText.trim();
      await upsertNutritionistInstructions(alunoId, texto);
      setOriginalInstructionsText(texto);
      alert("Instruções salvas com sucesso!");
    } catch (err: any) {
      console.error("save instructions error:", err?.message || err);
      alert("Falha ao salvar as instruções.");
    }
  };

  const handleCreateFoodPlan = async () => {
    try {
      setIsCreatingPlan(true);
      const { alunoId } = alunoIdHook;
      if (!alunoId) {
        alert("Aluno não encontrado.");
        return;
      }
      const texto = nutritionistInstructionsText.trim();
      // Step 1: Save to DB
      await upsertNutritionistInstructions(alunoId, texto);
      // Step 2: Invoke custom function criar-dieta-completa
      const supabase = createClient();
      const { error: fnError } = await supabase.functions.invoke("criar-dieta-completa", {
        body: { aluno_id: alunoId, mensagem_nutricionista: texto },
      });
      if (fnError) {
        console.error("invoke criar-dieta-completa error:", fnError);
        alert("Falha ao criar o plano alimentar. Tente novamente.");
        return;
      }
      alert("Plano alimentar criado com sucesso!");
      setShowConfirm(false);
    } catch (err: any) {
      console.error("create food plan error:", err?.message || err);
      alert("Falha ao salvar ou criar o plano alimentar.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const actionsVisible = nutritionistInstructionsText.trim().length > 0;
  const imp = typeof window !== "undefined" ? getImpersonation() : null;
  const isPro = typeof window !== "undefined" ? isImpersonating() : false;
  const isNutriPro = isPro && imp?.role === "nutricionista";

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">Instruções do Nutricionista</h1>
          {null /* Informação de tabela removida conforme solicitado */}
        </header>

        {/* Seção 1: IA (somente leitura, com popup grande) - visível só para nutricionistas (modo profissional) */}
        {isNutriPro && (
          <section className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">Instruções da IA</h2>
            <textarea
              className="w-full min-h-48 rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={isInitialLoading ? loadingPlaceholder : aiInstructionsText}
              readOnly
              onClick={() => setShowAIPopup(true)}
              title="Clique para expandir"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmFetch(true)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
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
                  setNutritionistInstructionsText(isInitialLoading ? "" : aiInstructionsText);
                  setShowEditablePopup(true);
                }}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Copiar conteúdo da IA
              </button>
            </div>
          </section>
        )}

        {/* Seção 2: Personalizadas do Nutri (editável, com popup grande) */}
        <section className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Instruções Personalizadas do Nutricionista</h2>
          <textarea
            className="w-full min-h-64 rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={nutritionistInstructionsText}
            onChange={(e) => setNutritionistInstructionsText(e.target.value)}
            onClick={() => setShowEditablePopup(true)}
            placeholder="Instruções do nutricionista"
            title="Clique para editar em tela cheia"
          />

          <div className="flex flex-wrap gap-3">
            {actionsVisible && (
              <>
                <button
                  type="button"
                  onClick={handleSaveNutritionistInstructions}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Salvar instruções do nutricionista
                </button>
                {isPro && (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center justify-center rounded-md border bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                    disabled={isCreatingPlan}
                  >
                    {isCreatingPlan ? "Processando..." : "Criar Plano Alimentar"}
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Popup grande (90%) - leitura IA */}
      {showAIPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAIPopup(false)} aria-hidden="true" />
          <div className="relative z-10 w-[90vw] h-[90vh] rounded-xl border border-border bg-background p-4 md:p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Instruções da IA (visualização)</h3>
              <button
                type="button"
                onClick={() => setShowAIPopup(false)}
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Fechar
              </button>
            </div>
            <textarea
              className="flex-1 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none"
              value={aiInstructionsText}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Popup grande (90%) - edição */}
      {showEditablePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditablePopup(false)} aria-hidden="true" />
          <div className="relative z-10 w-[90vw] h-[90vh] rounded-xl border border-border bg-background p-4 md:p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Editar instruções do nutricionista</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditablePopup(false)}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Fechar
                </button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={nutritionistInstructionsText}
              onChange={(e) => setNutritionistInstructionsText(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Confirmação antes de buscar IA */}
      {showConfirmFetch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmFetch(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirmar ação</h3>
            <p className="text-sm opacity-80 mb-4">
              Deseja criar um plano alimentar para este aluno agora e buscar novas sugestões da IA?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmFetch(false)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmFetch(false);
                  handleFetchAISuggestions();
                }}
                className="inline-flex items-center justify-center rounded-md border bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:brightness-110"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar criação plano alimentar */}
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
              Você tem certeza que deseja criar este novo plano alimentar?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateFoodPlan}
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



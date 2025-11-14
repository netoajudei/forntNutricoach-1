"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export const ALUNO_ID_CACHE_KEY = "aluno_id";

type GetAlunoIdOptions = {
  forceRefresh?: boolean;
};

export async function fetchAlunoId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: alunoRow, error: alunoError } = await supabase
    .from("alunos")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (alunoError) {
    console.error("Erro ao buscar aluno por auth_user_id:", alunoError);
    return null;
  }
  return alunoRow?.id ?? null;
}

export async function getAlunoIdCached(options: GetAlunoIdOptions = {}): Promise<string | null> {
  const { forceRefresh = false } = options;
  try {
    if (!forceRefresh) {
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(ALUNO_ID_CACHE_KEY) : null;
      if (cached) return cached;
    }
    const alunoId = await fetchAlunoId();
    if (alunoId && typeof window !== "undefined") {
      window.localStorage.setItem(ALUNO_ID_CACHE_KEY, alunoId);
    }
    return alunoId;
  } catch (err) {
    console.error("getAlunoIdCached error:", err);
    return null;
  }
}

export function useAlunoId() {
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    const id = await getAlunoIdCached({ forceRefresh: force });
    if (!id) {
      setError("Aluno não encontrado para este usuário.");
    }
    setAlunoId(id);
    setLoading(false);
  };

  useEffect(() => {
    refresh(false);
  }, []);

  return { alunoId, loading, error, refresh };
}




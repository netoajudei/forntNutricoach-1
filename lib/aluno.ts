"use client";

import { createClient } from "@/lib/supabase/client";
import { getImpersonation } from "./impersonation";
import { useEffect, useState } from "react";

export const ALUNO_ID_CACHE_KEY = "aluno_id_by_user"; // mapeia por auth_user_id e projeto

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
    // Se estiver em modo de impersonação, prioriza o aluno simulado
    if (typeof window !== "undefined") {
      const imp = getImpersonation();
      if (imp?.active && imp.student_linked_id /* backward compat */) {
        return imp.student_linked_id as any;
      }
      if (imp?.active && imp.student_aluno_id) {
        return imp.student_aluno_id;
      }
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const authUserId = user?.id || "anon";
    const project = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_SUPABASE_URL || "supabase") : "supabase";

    // Estrutura: { [project]: { [authUserId]: alunoId } }
    const readCache = (): Record<string, Record<string, string>> => {
      if (typeof window === "undefined") return {};
      try {
        const raw = window.localStorage.getItem(ALUNO_ID_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    };
    const writeCache = (obj: Record<string, Record<string, string>>) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(ALUNO_ID_CACHE_KEY, JSON.stringify(obj));
    };

    const cache = readCache();
    const byProject = cache[project] || {};

    if (!forceRefresh && byProject[authUserId]) {
      return byProject[authUserId];
    }

    const alunoId = await fetchAlunoId();

    // Atualiza cache
    if (alunoId) {
      cache[project] = { ...byProject, [authUserId]: alunoId };
    } else {
      // Se não encontrou, remove eventual resíduo
      if (byProject[authUserId]) {
        delete byProject[authUserId];
        cache[project] = byProject;
      }
    }
    writeCache(cache);
    return alunoId ?? null;
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

  // Se a sessão mudar, invalida cache e refaz
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // força atualização quando troca usuário/sessão
      refresh(true);
    });
    return () => {
      sub.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { alunoId, loading, error, refresh };
}




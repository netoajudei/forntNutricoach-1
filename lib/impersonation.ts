"use client";

export type ImpersonationState = {
  active: boolean;
  professional_user_id: string;
  student_aluno_id: string;
  student_linked_id?: string; // backward compat
  role: "nutricionista" | "personal";
  started_at: string;
};

const KEY = "impersonation";

export function getImpersonation(): ImpersonationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ImpersonationState) : null;
  } catch {
    return null;
  }
}

export function startImpersonation(opts: { professional_user_id: string; student_aluno_id: string; role: "nutricionista" | "personal" }) {
  if (typeof window === "undefined") return;
  const state: ImpersonationState = {
    active: true,
    professional_user_id: opts.professional_user_id,
    student_aluno_id: opts.student_aluno_id,
    role: opts.role,
    started_at: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function stopImpersonation() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function isImpersonating(): boolean {
  const s = getImpersonation();
  return Boolean(s?.active && s?.student_aluno_id);
}



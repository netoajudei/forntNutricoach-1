"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Skeleton } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { startImpersonation } from "@/lib/impersonation";
import AlertDialog from "@/components/ui/AlertDialog";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  nome_completo: string | null;
  email: string | null;
  whatsapp?: string | null;
  created_at?: string | null;
  onboarding_status?: string | null;
};

export default function ProfessionalStudentsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [professionalRole, setProfessionalRole] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load students and professional id
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Sessão inválida. Faça login novamente.");
          setLoading(false);
          return;
        }
        // Get professional record (alunos table) to obtain its id
        const { data: profAluno, error: profErr } = await supabase
          .from("alunos")
          .select("id, role")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        if (profErr || !profAluno?.id) {
          setError("Não foi possível identificar o profissional.");
          setLoading(false);
          return;
        }
        setProfessionalId(profAluno.id);
        setProfessionalRole(profAluno.role);

        // Fetch students view
        const { data: vwRows, error: vwErr } = await supabase
          .from("vw_alunos_por_profissional")
          .select("*")
          .eq("profissional_id", profAluno.id);
        if (vwErr) {
          setError(vwErr.message || "Falha ao buscar alunos do profissional.");
          setStudents([]);
        } else {
          // ... mapping logic ...
          const mapped: Student[] = (vwRows || [])
            .map((r: any) => {
              const id = String(r.aluno_id ?? r.id ?? "");
              const nome =
                r.aluno_nome ??
                r.nome_aluno ??
                r.nome_completo ??
                r.nome ??
                r.full_name ??
                null;
              const email = r.aluno_email ?? r.email_aluno ?? r.email ?? null;
              const whatsapp = r.aluno_whatsapp ?? r.whatsapp ?? r.telefone ?? r.phone ?? null;
              const created_at =
                r.aluno_cadastrado_em ??
                r.vinculo_inicio ??
                r.created_at ??
                r.vinculo_created_at ??
                r.aluno_created_at ??
                null;
              const onboarding_status = r.onboarding_status ?? null;
              return { id, nome_completo: nome, email, whatsapp, created_at, onboarding_status };
            })
            .filter((s) => !!s.id)
            .sort((a, b) => {
              const aPending = a.onboarding_status === "aguardando_analise";
              const bPending = b.onboarding_status === "aguardando_analise";
              if (aPending && !bPending) return -1;
              if (!aPending && bPending) return 1;
              return (a.nome_completo || "").localeCompare(b.nome_completo || "", "pt-BR");
            });

          // Client-side search filter
          const q = query.trim().toLowerCase();
          let filtered = mapped;
          if (q) {
            filtered = filtered.filter((s) => {
              const fields = [
                s.nome_completo?.toString().toLowerCase() || "",
                s.email?.toString().toLowerCase() || "",
                s.whatsapp?.toString().toLowerCase() || "",
              ];
              return fields.some((f) => f.includes(q));
            });
          }
          if (showPendingOnly) {
            filtered = filtered.filter((s) => s.onboarding_status === "aguardando_analise");
          }
          setStudents(filtered);
        }
      } catch (e: any) {
        setError(e?.message || "Erro inesperado ao carregar alunos.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showPendingOnly]);

  const handleImpersonate = async (student: Student) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão inválida.");
        return;
      }
      startImpersonation({
        professional_user_id: user.id,
        student_aluno_id: student.id,
        role: (professionalRole || "nutricionista") as "nutricionista" | "personal",
      });
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Erro ao iniciar modo profissional.");
    }
  };

  const handleOpenInstructions = async (student: Student) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão inválida.");
        return;
      }
      const role = professionalRole || "nutricionista";
      startImpersonation({
        professional_user_id: user.id,
        student_aluno_id: student.id,
        role: role as "nutricionista" | "personal",
      });

      // Redirect based on role
      if (role === "personal") {
        router.push("/perfil/instrucoes-personal");
      } else {
        router.push("/perfil/instrucoes-nutri");
      }
    } catch (e: any) {
      setError(e?.message || "Erro ao iniciar modo profissional.");
    }
  };

  const handleFinalize = async (student: Student) => {
    if (!professionalId) {
      setErrorMsg('Profissional não identificado.');
      setErrorOpen(true);
      return;
    }
    try {
      const { data, error } = await supabase.rpc('finalizar_onboarding_aluno', {
        p_entrada_id: student.id,
        p_profissional_id: professionalId,
      });
      if (error) {
        setErrorMsg(error.message || 'Erro ao finalizar onboarding.');
        setErrorOpen(true);
      } else if (data?.success) {
        setSuccessOpen(true);
      } else {
        setErrorMsg(data?.message || 'Erro ao finalizar onboarding.');
        setErrorOpen(true);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erro inesperado.');
      setErrorOpen(true);
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-10 w-1/2" />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      );
    }
    if (error) {
      return <div className="text-red-600 text-sm">{error}</div>;
    }
    if (!students.length) {
      return <div className="text-sm text-gray-600">Nenhum aluno encontrado.</div>;
    }
    return (
      <div className="space-y-3">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border p-4 bg-white hover:shadow-sm transition-shadow">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-green-900">{s.nome_completo || "Aluno"}</div>
                {s.onboarding_status === "aguardando_analise" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Aguardando Instruções
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {s.email || "Sem e-mail"} {s.whatsapp ? `· ${s.whatsapp}` : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleImpersonate(s)} className="px-3 py-2 text-sm">
                Entrar como aluno
              </Button>
              <Button
                onClick={() => handleOpenInstructions(s)}
                variant="secondary"
                className="px-3 py-2 text-sm border border-green-600 text-green-600 hover:bg-green-50"
              >
                Instruções
              </Button>
              {s.onboarding_status === "aguardando_analise" && (
                <Button onClick={() => handleFinalize(s)} variant="secondary" className="px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100">
                  Finalizar cadastro
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }, [loading, error, students, handleImpersonate, handleFinalize]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-900">Alunos do Profissional</h1>
            <p className="text-sm text-gray-500">Selecione um aluno para entrar no modo profissional.</p>
          </div>
        </div>
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, email ou telefone"
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => setShowPendingOnly(!showPendingOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${showPendingOnly ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {showPendingOnly ? 'Mostrando Pendentes' : 'Filtrar Pendentes'}
              </button>
            </div>
            {content}
          </div>
        </Card>
      </div>

      {/* Success Modal */}
      <AlertDialog
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Cadastro finalizado"
        message="Cadastro concluído. O aluno foi finalizado com sucesso."
      />

      {/* Error Modal */}
      <AlertDialog
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Erro"
        message={errorMsg}
      />
    </div>
  );
}

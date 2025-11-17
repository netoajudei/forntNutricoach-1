"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Skeleton } from "@/components";
import { createClient } from "@/lib/supabase/client";
import { startImpersonation } from "@/lib/impersonation";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  nome_completo: string | null;
  email: string | null;
  whatsapp?: string | null;
  created_at?: string | null;
};

export default function ProfessionalStudentsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Sessão inválida. Faça login novamente.");
          setLoading(false);
          return;
        }
        // Obter o id do registro em 'alunos' do profissional logado
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
        // Buscar diretamente da view vw_alunos_por_profissional
        const { data: vwRows, error: vwErr } = await supabase
          .from("vw_alunos_por_profissional")
          .select("*")
          .eq("profissional_id", profAluno.id);
        if (vwErr) {
          setError(vwErr.message || "Falha ao buscar alunos do profissional.");
          setStudents([]);
        } else {
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
              return { id, nome_completo: nome, email, whatsapp, created_at };
            })
            .filter((s) => !!s.id)
            .sort((a, b) => (a.nome_completo || "").localeCompare(b.nome_completo || "", "pt-BR"));
          // Filtro de busca no cliente (evita erro se coluna não existir na view)
          const q = query.trim().toLowerCase();
          const filtered = q
            ? mapped.filter((s) => {
                const fields = [
                  s.nome_completo?.toString().toLowerCase() || "",
                  s.email?.toString().toLowerCase() || "",
                  s.whatsapp?.toString().toLowerCase() || "",
                ];
                return fields.some((f) => f.includes(q));
              })
            : mapped;
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
  }, [query]);

  const handleImpersonate = async (student: Student) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão inválida.");
        return;
      }
      startImpersonation({
        professional_user_id: user.id,
        student_aluno_id: student.id,
        role: "nutricionista",
      });
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Erro ao iniciar modo profissional.");
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
      return <div className="text-sm text-gray-600">Nenhum aluno vinculado até o momento.</div>;
    }
    return (
      <div className="space-y-3">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="text-sm font-semibold text-green-900">{s.nome_completo || "Aluno"}</div>
              <div className="text-xs text-gray-600">
                {s.email || "Sem e-mail"} {s.whatsapp ? `· ${s.whatsapp}` : ""}
              </div>
            </div>
            <Button onClick={() => handleImpersonate(s)} className="px-3 py-2 text-sm">
              Entrar como aluno
            </Button>
          </div>
        ))}
      </div>
    );
  }, [loading, error, students]);

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
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, email ou telefone"
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            {content}
          </div>
        </Card>
      </div>
    </div>
  );
}



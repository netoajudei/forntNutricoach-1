"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Skeleton } from "@/components";

type Prof = {
  id: string;
  nome_completo: string | null;
  email: string | null;
  whatsapp?: string | null;
  role?: string | null;
};

export default function ProfessionalProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prof, setProf] = useState<Prof | null>(null);

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
        const { data, error: aErr } = await supabase
          .from("alunos")
          .select("id, nome_completo, email, whatsapp, role")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        if (aErr) {
          setError(aErr.message || "Falha ao carregar perfil.");
          setProf(null);
        } else {
          setProf((data || null) as Prof | null);
        }
      } catch (e: any) {
        setError(e?.message || "Erro inesperado ao carregar perfil.");
        setProf(null);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-900">Perfil do Profissional</h1>
        <Card>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/5" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Nome</div>
                  <div className="text-sm font-semibold text-green-900">{prof?.nome_completo || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">E-mail</div>
                  <div className="text-sm font-semibold text-green-900">{prof?.email || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">WhatsApp</div>
                  <div className="text-sm font-semibold text-green-900">{prof?.whatsapp || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Papel</div>
                  <div className="text-sm font-semibold text-green-900">{prof?.role || "-"}</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}



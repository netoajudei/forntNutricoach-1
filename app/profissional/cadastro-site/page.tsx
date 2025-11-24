"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { linkStudentIdToProfessional } from "@/lib/services/onboarding.service";
import { Card, Button, Skeleton } from "@/components";

type SiteStudent = {
    id: string;
    nome_completo: string | null;
    whatsapp: string | null;
    email: string | null;
    created_at: string | null;
    onboarding_status: string | null;
    tem_dieta_atual: boolean;
    tem_treino_atual: boolean;
    dieta_atual_texto: string | null;
    treino_atual_texto: string | null;
    observacoes_profissional_nutri: string | null;
    observacoes_profissional_personal: string | null;
    whatsapp_aluno: string | null;
};

export default function SiteRegistrationPage() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<SiteStudent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [linkingId, setLinkingId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("vw_alunos_sem_profissional")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (err: any) {
            console.error("Error fetching students:", err);
            setError(err.message || "Erro ao buscar alunos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleLinkStudent = async (studentId: string) => {
        try {
            setLinkingId(studentId);

            // 1. Get current professional ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");

            const { data: prof, error: profErr } = await supabase
                .from("alunos")
                .select("id")
                .eq("auth_user_id", user.id)
                .single();

            if (profErr || !prof) throw new Error("Perfil profissional não encontrado.");

            // 2. Link student
            const result = await linkStudentIdToProfessional(studentId, prof.id);

            if (!result.success) {
                throw new Error(result.error || "Erro ao vincular aluno.");
            }

            alert("Aluno vinculado com sucesso!");
            // Refresh list
            fetchStudents();

        } catch (err: any) {
            console.error("Error linking student:", err);
            alert(err.message || "Erro ao vincular aluno.");
        } finally {
            setLinkingId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-red-600">Erro: {error}</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Cadastro do Site</h1>
                <p className="text-gray-500">Alunos sem profissional vinculado.</p>
            </header>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Nenhum aluno encontrado.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{student.nome_completo || "Sem nome"}</div>
                                            <div className="text-xs text-gray-500">Cadastrado em: {new Date(student.created_at!).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.email}</div>
                                            <div className="text-sm text-gray-500">{student.whatsapp || student.whatsapp_aluno || "Sem WhatsApp"}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.onboarding_status === 'concluido' ? 'bg-green-100 text-green-800' :
                                                    student.onboarding_status === 'aguardando_analise' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {student.onboarding_status || "Pendente"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 max-w-xs truncate">
                                                {student.tem_dieta_atual && <span className="mr-2 text-blue-600">Tem Dieta</span>}
                                                {student.tem_treino_atual && <span className="text-purple-600">Tem Treino</span>}
                                            </div>
                                            {(student.dieta_atual_texto || student.treino_atual_texto) && (
                                                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                                    {student.dieta_atual_texto?.substring(0, 30)}...
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                onClick={() => handleLinkStudent(student.id)}
                                                disabled={linkingId === student.id}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {linkingId === student.id ? "Vinculando..." : "Vincular"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

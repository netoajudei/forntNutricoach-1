"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/services';
import type { UserProfile, OnboardingData } from '@/lib/types';
import { Card, Button, Skeleton, Dialog } from '@/components';
import { useAlunoId } from '@/lib/aluno';
import { createClient } from '@/lib/supabase/client';

function useQuery<T>(queryFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    queryFn().then(res => {
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [queryFn]);
  return { data, isLoading };
}

const getInitials = (fullName: string): string => {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AvatarOrInitials: React.FC<{ name: string; avatarUrl?: string }> = ({ name, avatarUrl }) => {
  if (avatarUrl) {
    return <img className="h-24 w-24 rounded-full object-cover" src={avatarUrl} alt={name} />;
  }
  const initials = getInitials(name);
  return (
    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
      {initials}
    </div>
  );
};

const ProfileField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-green-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card>
        <h3 className="text-xl font-bold text-green-900 mb-4">{title}</h3>
        {children}
    </Card>
);

const InfoDetail: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    const formattedValue = Array.isArray(value) ? (value.length > 0 ? value.join(', ') : 'Nenhum') : (value || 'Não informado');
    const formattedLabel = label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return (
        <div className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
            <dt className="text-gray-500">{formattedLabel}</dt>
            <dd className="text-green-900 font-medium text-right max-w-[60%] truncate">{formattedValue}</dd>
        </div>
    );
};

export default function PerfilPage() {
    const router = useRouter();
    const supabase = createClient();
    const { alunoId, loading: alunoLoading } = useAlunoId();
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    };
    const { data: user, isLoading: userLoading } = useQuery(userService.getProfile);
    const { data: onboardingData, isLoading: onboardingLoading } = useQuery(userService.getOnboardingData);
    const { data: notes, isLoading: notesLoading } = useQuery(userService.getProfileNotes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nutriText, setNutriText] = useState('');
    const [personalText, setPersonalText] = useState('');
    const [saving, setSaving] = useState(false);
    const [dietDefined, setDietDefined] = useState<boolean | null>(null);
    const [trainingDefined, setTrainingDefined] = useState<boolean | null>(null);
    const [goals, setGoals] = useState<any[] | null>(null);
    const [goalsLoading, setGoalsLoading] = useState<boolean>(true);

    useEffect(() => {
      if (notes) {
        setNutriText(notes.nutricionista || '');
        setPersonalText(notes.personal || '');
      }
    }, [notes]);

    const isLoading = userLoading || onboardingLoading || notesLoading;

    // Icons (inline SVG)
    const SuccessIcon = () => (
      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
    const WarningIcon = () => (
      <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.592c.75 1.336-.213 2.999-1.742 2.999H3.481c-1.53 0-2.492-1.663-1.743-2.999L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z" clipRule="evenodd" />
      </svg>
    );

    // Fetch status from instrucoes tables
    useEffect(() => {
      const run = async () => {
        if (!alunoId || alunoLoading) return;
        try {
          const { data: nutri, error: e1 } = await supabase
            .from('instrucoes_nutricionista')
            .select('instrucoes_texto')
            .eq('aluno_id', alunoId)
            .maybeSingle();
          if (e1) {
            console.error('Erro status nutricionista:', e1);
            setDietDefined(false);
          } else {
            const v = (nutri?.instrucoes_texto ?? '').trim();
            setDietDefined(v.length > 0);
          }
          const { data: pers, error: e2 } = await supabase
            .from('instrucoes_personal')
            .select('instrucoes_texto')
            .eq('aluno_id', alunoId)
            .maybeSingle();
          if (e2) {
            console.error('Erro status personal:', e2);
            setTrainingDefined(false);
          } else {
            const v2 = (pers?.instrucoes_texto ?? '').trim();
            setTrainingDefined(v2.length > 0);
          }
        } catch (err) {
          console.error('Erro ao buscar status de instruções:', err);
          setDietDefined(false);
          setTrainingDefined(false);
        }
      };
      run();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId, alunoLoading]);

    // Buscar Metas (goals) do aluno e organizar por colunas
    useEffect(() => {
      const run = async () => {
        if (!alunoId || alunoLoading) return;
        setGoalsLoading(true);
        try {
          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('aluno_id', alunoId)
            .order('data_inicio', { ascending: false });
          if (error) {
            console.error('Erro ao buscar metas:', error);
            setGoals([]);
          } else {
            setGoals(data ?? []);
          }
        } catch (e) {
          console.error('Erro inesperado metas:', e);
          setGoals([]);
        } finally {
          setGoalsLoading(false);
        }
      };
      run();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId, alunoLoading]);

    // Removido: edição via modal do Nutricionista. Agora a edição acontece em uma página dedicada.
    // Removido: edição via modal do Personal Trainer. Agora a edição acontece em uma página dedicada.

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Seu Perfil</h1>
                    <p className="text-lg text-gray-500 mt-1">Suas informações, anamnese e configurações.</p>
                </div>

                {isLoading ? (
                    <>
                        <Card>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full mt-4" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-60 w-full" />
                            <Skeleton className="h-60 w-full" />
                        </div>
                    </>
                ) : user && onboardingData ? (
                    <>
                        <Card>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 mb-6">
                                <div className="mb-4 sm:mb-0">
                                    <AvatarOrInitials name={user.name} avatarUrl={user.avatarUrl} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-green-900">{user.name}</h2>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="md:hidden mb-4">
                                <Button variant="secondary" className="w-full" onClick={handleLogout}>
                                    Sair da conta
                                </Button>
                            </div>
                            <dl className="divide-y divide-gray-200">
                                <ProfileField label="Idade" value={user.age} />
                                <ProfileField label="Altura" value={`${user.height} cm`} />
                                <ProfileField label="Peso Inicial" value={`${user.initialWeight} kg`} />
                            </dl>

                            <div className="mt-6 text-right">
                                <Button onClick={() => setIsModalOpen(true)}>Editar Perfil</Button>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <InfoCard title="Metas do Aluno">
                                {goalsLoading ? (
                                  <Skeleton className="h-28 w-full" />
                                ) : (goals && goals.length > 0) ? (
                                  <div className="space-y-4">
                                    {goals.map((g, idx) => {
                                      const fmtDate = (iso?: string) => {
                                        if (!iso) return '—';
                                        try {
                                          const d = new Date(String(iso).slice(0,10) + 'T00:00:00');
                                          const dd = String(d.getDate()).padStart(2,'0');
                                          const mm = String(d.getMonth()+1).padStart(2,'0');
                                          const yyyy = d.getFullYear();
                                          return `${dd}/${mm}/${yyyy}`;
                                        } catch {
                                          return String(iso);
                                        }
                                      };
                                      const rows: Array<{ label: string; value: string }> = [
                                        { label: 'Nome da Meta', value: g?.nome_meta || '—' },
                                        { label: 'Métrica Primária', value: g?.metrica_primaria || '—' },
                                        { label: 'Valor Inicial', value: g?.valor_inicial != null ? `${g.valor_inicial} ${g?.unidade || ''}`.trim() : '—' },
                                        { label: 'Valor Meta', value: g?.valor_meta != null ? `${g.valor_meta} ${g?.unidade || ''}`.trim() : '—' },
                                        { label: 'Unidade', value: g?.unidade || '—' },
                                        { label: 'Status', value: g?.status || '—' },
                                        { label: 'Início', value: fmtDate(g?.data_inicio) },
                                        { label: 'Motivação', value: g?.motivacao_principal || '—' },
                                        { label: 'Cíclica', value: g?.is_cyclical ? 'Sim' : 'Não' },
                                      ];
                                      return (
                                        <div key={g.id ?? idx} className="rounded-xl border border-gray-100 p-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                            {rows.map((r, i) => (
                                              <div key={i} className="flex justify-between text-sm py-1">
                                                <span className="text-gray-500">{r.label}</span>
                                                <span className="text-green-900 font-medium text-right">{r.value}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">Nenhuma meta cadastrada.</p>
                                )}
                            </InfoCard>
                            <InfoCard title="Anotações do Nutricionista">
                                <div className="flex justify-between items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    {dietDefined ? <SuccessIcon /> : <WarningIcon />}
                                    <span className={`text-sm font-medium ${dietDefined ? 'text-green-700' : 'text-yellow-700'}`}>
                                      {dietDefined ? 'Dieta Definida' : 'Dieta Indefinida'}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => router.push('/perfil/instrucoes-nutri')}
                                    className="shrink-0"
                                  >
                                    Nutritionist Instructions
                                  </Button>
                                </div>
                            </InfoCard>
                            <InfoCard title="Anotações do Personal Trainer">
                                <div className="flex justify-between items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    {trainingDefined ? <SuccessIcon /> : <WarningIcon />}
                                    <span className={`text-sm font-medium ${trainingDefined ? 'text-green-700' : 'text-yellow-700'}`}>
                                      {trainingDefined ? 'Treino Definido' : 'Treino Indefinido'}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => router.push('/perfil/instrucoes-personal')}
                                    className="shrink-0"
                                  >
                                    Personal Trainer Instructions
                                  </Button>
                                </div>
                            </InfoCard>
                             <InfoCard title="Saúde e Lesões">
                                <dl>
                                    {Object.entries({ ...onboardingData.saude, ...onboardingData.lesoes }).map(([key, value]) => <InfoDetail key={key} label={key} value={value} />)}
                                </dl>
                            </InfoCard>
                             <InfoCard title="Objetivo">
                                <dl>
                                    {Object.entries(onboardingData.objetivo).map(([key, value]) => <InfoDetail key={key} label={key} value={value} />)}
                                </dl>
                            </InfoCard>
                             <InfoCard title="Rotina">
                                <dl>
                                    {Object.entries(onboardingData.rotina).map(([key, value]) => <InfoDetail key={key} label={key} value={value} />)}
                                </dl>
                            </InfoCard>
                             <InfoCard title="Preferências Alimentares">
                                <dl>
                                    {Object.entries(onboardingData.preferenciasAlimentares).map(([key, value]) => <InfoDetail key={key} label={key} value={value} />)}
                                </dl>
                            </InfoCard>
                             <InfoCard title="Preferências de Treino">
                                <dl>
                                    {Object.entries(onboardingData.preferenciasTreino).map(([key, value]) => <InfoDetail key={key} label={key} value={value} />)}
                                </dl>
                            </InfoCard>
                        </div>
                    </>
                ) : null}

                <Dialog 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title="Editar Perfil"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={() => setIsModalOpen(false)}>Salvar Alterações</Button>
                        </>
                    }
                >
                    <p>Esta é uma funcionalidade de demonstração. Em uma aplicação real, aqui estaria um formulário para editar os dados do perfil.</p>
                </Dialog>

                {null /* Modal do Nutricionista removido em favor da nova página dedicada */}

                {null /* Modal do Personal removido em favor da nova página dedicada */}
            </div>
        </div>
    );
}
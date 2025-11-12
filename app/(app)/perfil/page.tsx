"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/services';
import type { UserProfile, OnboardingData } from '@/lib/types';
import { Card, Button, Skeleton, Dialog } from '@/components';
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
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    };
    const { data: user, isLoading: userLoading } = useQuery(userService.getProfile);
    const { data: onboardingData, isLoading: onboardingLoading } = useQuery(userService.getOnboardingData);
    const { data: notes, isLoading: notesLoading } = useQuery(userService.getProfileNotes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNutriOpen, setIsNutriOpen] = useState(false);
    const [isPersonalOpen, setIsPersonalOpen] = useState(false);
    const [nutriText, setNutriText] = useState('');
    const [personalText, setPersonalText] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (notes) {
        setNutriText(notes.nutricionista || '');
        setPersonalText(notes.personal || '');
      }
    }, [notes]);

    const isLoading = userLoading || onboardingLoading || notesLoading;

    const saveNutri = async () => {
      try {
        setSaving(true);
        await userService.updateProfileNotes({ nutricionista: nutriText });
        setIsNutriOpen(false);
      } finally {
        setSaving(false);
      }
    };
    const savePersonal = async () => {
      try {
        setSaving(true);
        await userService.updateProfileNotes({ personal: personalText });
        setIsPersonalOpen(false);
      } finally {
        setSaving(false);
      }
    };

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
                                <ProfileField label="Meta de Peso" value={`${user.goalWeight} kg`} />
                                <ProfileField label="Objetivo Principal" value={user.objective} />
                            </dl>

                            <div className="mt-6 text-right">
                                <Button onClick={() => setIsModalOpen(true)}>Editar Perfil</Button>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <InfoCard title="Anotações do Nutricionista">
                                <div className="flex justify-between items-start">
                                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{nutriText || 'Sem anotações.'}</p>
                                  <button
                                    type="button"
                                    onClick={() => setIsNutriOpen(true)}
                                    className="ml-4 p-2 text-gray-500 hover:text-green-600"
                                    aria-label="Editar anotações do nutricionista"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-9.9 9.9A2 2 0 015.1 17.9L2 18l.1-3.1a2 2 0 01.586-1.414l9.9-9.9z" />
                                    </svg>
                                  </button>
                                </div>
                            </InfoCard>
                            <InfoCard title="Anotações do Personal Trainer">
                                <div className="flex justify-between items-start">
                                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{personalText || 'Sem anotações.'}</p>
                                  <button
                                    type="button"
                                    onClick={() => setIsPersonalOpen(true)}
                                    className="ml-4 p-2 text-gray-500 hover:text-green-600"
                                    aria-label="Editar anotações do personal"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-9.9 9.9A2 2 0 015.1 17.9L2 18l.1-3.1a2 2 0 01.586-1.414l9.9-9.9z" />
                                    </svg>
                                  </button>
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
                             <InfoCard title="Medidas Iniciais">
                                <dl>
                                    {Object.entries(onboardingData.medidasCorporais).map(([key, value]) => <InfoDetail key={key} label={key} value={value} />)}
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

                <Dialog
                  isOpen={isNutriOpen}
                  onClose={() => setIsNutriOpen(false)}
                  title="Anotações do Nutricionista"
                  footer={
                    <>
                      <Button variant="secondary" onClick={() => setIsNutriOpen(false)}>Cancelar</Button>
                      <Button onClick={saveNutri} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                    </>
                  }
                >
                  <textarea
                    className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    rows={10}
                    placeholder="Escreva observações, preferências e instruções..."
                    value={nutriText}
                    onChange={(e) => setNutriText(e.target.value)}
                  />
                </Dialog>

                <Dialog
                  isOpen={isPersonalOpen}
                  onClose={() => setIsPersonalOpen(false)}
                  title="Anotações do Personal Trainer"
                  footer={
                    <>
                      <Button variant="secondary" onClick={() => setIsPersonalOpen(false)}>Cancelar</Button>
                      <Button onClick={savePersonal} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                    </>
                  }
                >
                  <textarea
                    className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    rows={10}
                    placeholder="Escreva observações, preferências e instruções..."
                    value={personalText}
                    onChange={(e) => setPersonalText(e.target.value)}
                  />
                </Dialog>
            </div>
        </div>
    );
}
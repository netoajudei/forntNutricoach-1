"use client";

import React, { useState, useEffect } from 'react';
import { userService } from '../../../services';
import type { UserProfile, OnboardingData } from '../../../types';
import { Card, Button, Skeleton, Dialog } from '../../../components';

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
    const { data: user, isLoading: userLoading } = useQuery(userService.getProfile);
    const { data: onboardingData, isLoading: onboardingLoading } = useQuery(userService.getOnboardingData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isLoading = userLoading || onboardingLoading;

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
                                <img className="h-24 w-24 rounded-full object-cover mb-4 sm:mb-0" src={user.avatarUrl} alt={user.name} />
                                <div>
                                    <h2 className="text-2xl font-bold text-green-900">{user.name}</h2>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
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
                                <p className="text-gray-600 text-sm">
                                    Foco em aumentar a ingestão de fibras e manter a hidratação. Acompanhar a digestão na primeira semana com a nova dieta. Cliente relata não gostar de jiló e fígado.
                                </p>
                            </InfoCard>
                            <InfoCard title="Anotações do Personal Trainer">
                                <p className="text-gray-600 text-sm">
                                    Atenção à execução do agachamento livre para proteger a lombar. Cliente reportou leve desconforto no ombro direito, então fortalecer manguito rotador com exercícios específicos.
                                </p>
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
            </div>
        </div>
    );
}
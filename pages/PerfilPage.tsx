
import React, { useState } from 'react';
import { userService } from '../services';
import type { OnboardingData } from '../types';
import { Card, Button, Skeleton, Dialog, ChevronRightIcon } from '../components';
import { useQuery } from '../hooks';

// Reusable Accordion Item
const AccordionItem: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; onEdit: () => void; children: React.ReactNode; }> = ({ title, isOpen, onToggle, onEdit, children }) => (
  <Card className="!p-0 overflow-hidden">
    <div className="flex items-center justify-between cursor-pointer p-6" onClick={onToggle}>
      <h2 className="text-lg font-bold text-green-900">{title}</h2>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }}>Editar</Button>
        <ChevronRightIcon className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </div>
    </div>
    {isOpen && (
      <div className="px-6 pb-6 border-t border-gray-100">
        {children}
      </div>
    )}
  </Card>
);

// Display component for key-value pairs
const InfoGrid: React.FC<{ data: Record<string, any> }> = ({ data }) => {
    const formatLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const formatValue = (value: any) => {
        if (Array.isArray(value)) return value.join(', ') || 'N/A';
        return value || 'N/A';
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <p className="text-sm text-gray-500">{formatLabel(key)}</p>
                    <p className="font-semibold text-green-900">{formatValue(value)}</p>
                </div>
            ))}
        </div>
    );
};


const PerfilPage: React.FC = () => {
    const { data: userData, isLoading } = useQuery(userService.getOnboardingData);
    const { data: profile, isLoading: isLoadingProfile } = useQuery(userService.getProfile);
    const [openAccordion, setOpenAccordion] = useState<string | null>('dadosBasicos');
    const [editingSection, setEditingSection] = useState<string | null>(null);

    const handleToggle = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    if (isLoading || isLoadingProfile) {
        return <div className="p-4 sm:p-6 lg:p-8"><Skeleton className="h-screen w-full" /></div>;
    }

    if (!userData || !profile) return null;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left mb-8">
                    <img src={profile.avatarUrl} alt={profile.name} className="h-28 w-28 rounded-full mb-4 sm:mb-0 sm:mr-6 ring-4 ring-offset-4 ring-offset-gray-50 ring-green-500" />
                    <div>
                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                        <p className="text-gray-500">{profile.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <AccordionItem
                        title="Dados Básicos"
                        isOpen={openAccordion === 'dadosBasicos'}
                        onToggle={() => handleToggle('dadosBasicos')}
                        onEdit={() => setEditingSection('dadosBasicos')}
                    >
                        <InfoGrid data={userData.dadosBasicos} />
                    </AccordionItem>

                    <AccordionItem
                        title="Medidas Corporais"
                        isOpen={openAccordion === 'medidas'}
                        onToggle={() => handleToggle('medidas')}
                        onEdit={() => setEditingSection('medidas')}
                    >
                        <InfoGrid data={userData.medidasCorporais} />
                    </AccordionItem>
                    
                    <AccordionItem
                        title="Objetivo"
                        isOpen={openAccordion === 'objetivo'}
                        onToggle={() => handleToggle('objetivo')}
                        onEdit={() => setEditingSection('objetivo')}
                    >
                        <InfoGrid data={userData.objetivo} />
                    </AccordionItem>

                    <AccordionItem
                        title="Saúde e Lesões"
                        isOpen={openAccordion === 'saude'}
                        onToggle={() => handleToggle('saude')}
                        onEdit={() => setEditingSection('saude')}
                    >
                        <InfoGrid data={{ ...userData.saude, ...userData.lesoes }} />
                    </AccordionItem>
                    
                     <AccordionItem
                        title="Rotina"
                        isOpen={openAccordion === 'rotina'}
                        onToggle={() => handleToggle('rotina')}
                        onEdit={() => setEditingSection('rotina')}
                    >
                        <InfoGrid data={userData.rotina} />
                    </AccordionItem>

                     <AccordionItem
                        title="Preferências Alimentares"
                        isOpen={openAccordion === 'alimentares'}
                        onToggle={() => handleToggle('alimentares')}
                        onEdit={() => setEditingSection('alimentares')}
                    >
                        <InfoGrid data={userData.preferenciasAlimentares} />
                    </AccordionItem>
                    
                     <AccordionItem
                        title="Preferências de Treino"
                        isOpen={openAccordion === 'treino'}
                        onToggle={() => handleToggle('treino')}
                        onEdit={() => setEditingSection('treino')}
                    >
                        <InfoGrid data={userData.preferenciasTreino} />
                    </AccordionItem>
                </div>
            </div>

            {/* DIALOGS for editing would be placed here. For brevity, only showing one example */}
            <Dialog
                isOpen={editingSection === 'dadosBasicos'}
                onClose={() => setEditingSection(null)}
                title="Editar Dados Básicos"
                footer={<><Button variant="secondary" onClick={() => setEditingSection(null)}>Cancelar</Button><Button variant="primary" onClick={() => setEditingSection(null)}>Salvar</Button></>}
            >
                <form className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nome Completo</label>
                        <input type="text" defaultValue={userData.dadosBasicos.nomeCompleto} className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
                    </div>
                     <div>
                        <label className="text-sm font-medium">Data de Nascimento</label>
                        <input type="date" defaultValue={userData.dadosBasicos.dataNascimento} className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
                    </div>
                </form>
            </Dialog>
             {/* Other dialogs for other sections would follow a similar pattern */}
        </div>
    );
};

export default PerfilPage;
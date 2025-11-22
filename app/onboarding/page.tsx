"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components';
import type { OnboardingData, MedidasCorporais } from '@/lib/types';
import { salvarOnboarding } from '@/lib/services/onboarding.service';
import { createClient } from '@/lib/supabase/client';

const TOTAL_STEPS = 9;

const initialOnboardingData: OnboardingData = {
    dadosBasicos: { nomeCompleto: '', dataNascimento: '', sexo: '' },
    saude: { condicoesMedicas: '', medicacoes: '', alergias: '' },
    lesoes: { lesoesLimitacoes: '' },
    rotina: { profissao: '', horarioAcordar: '', horarioDormir: '' },
    preferenciasAlimentares: { restricoes: [], alimentosNaoGosta: '', alimentosDisponiveis: '', disposicaoCozinhar: '', orcamento: '' },
    preferenciasTreino: { local: '', equipamentos: [], experiencia: '', diasPreferenciais: [], horariosPreferenciais: [] },
    objetivo: { meta: '', prazo: '', motivacao: '' },
    medidasCorporais: { data: '', peso: '', altura: '', pescoco: '', peito: '', cintura: '', quadril: '', bracoDireito: '', bracoEsquerdo: '', coxaDireita: '', coxaEsquerda: '', panturrilhaDireita: '', panturrilhaEsquerda: '', gordura: '', notas: '' },
};

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex justify-center space-x-1 sm:space-x-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div key={index} className={`h-2 rounded-full transition-colors w-full ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
        ))}
    </div>
);

const FormSection: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div>
        <h2 className="text-2xl font-bold mb-2 text-center text-green-900">{title}</h2>
        <p className="text-center text-gray-500 mb-8">{subtitle}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <input {...props} className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
    </div>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <textarea {...props} rows={3} className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, children, ...props }) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <select {...props} className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none">
            {children}
        </select>
    </div>
);

const MultiSelectButtons: React.FC<{ options: string[]; selected: string[]; onChange: (selected: string[]) => void; }> = ({ options, selected, onChange }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(option => {
            const isSelected = selected.includes(option);
            return (
                <button
                    key={option}
                    type="button"
                    onClick={() => {
                        const newSelection = isSelected ? selected.filter(item => item !== option) : [...selected, option];
                        onChange(newSelection);
                    }}
                    className={`p-3 text-sm border rounded-lg transition-colors ${isSelected ? 'bg-green-500 text-white border-green-500' : 'bg-white hover:bg-gray-100 border-gray-200'}`}
                >
                    {option}
                </button>
            );
        })}
    </div>
);

const StepNavigation: React.FC<{ onNext: () => void; onBack: () => void; currentStep: number; isNextDisabled?: boolean }> = ({ onNext, onBack, currentStep, isNextDisabled = false }) => (
    <div className="flex justify-between items-center mt-8">
        {currentStep > 1 ? (
            <Button variant="secondary" onClick={onBack}>Voltar</Button>
        ) : <div />}
        <Button variant="primary" onClick={onNext} disabled={isNextDisabled}>
            {currentStep === TOTAL_STEPS ? 'Confirmar e Finalizar' : 'Próximo'}
        </Button>
    </div>
);

// --- Step Components ---

const DadosBasicosStep: React.FC<{ data: OnboardingData['dadosBasicos']; updateData: (field: keyof OnboardingData['dadosBasicos'], value: string) => void }> = ({ data, updateData }) => (
    <FormSection title="Dados Básicos" subtitle="Para começar, vamos precisar de algumas informações sobre você.">
        <FormInput label="Nome Completo" type="text" value={data.nomeCompleto} onChange={e => updateData('nomeCompleto', e.target.value)} />
        <FormInput label="Data de Nascimento" type="date" value={data.dataNascimento} onChange={e => updateData('dataNascimento', e.target.value)} />
        <FormSelect label="Sexo" value={data.sexo} onChange={e => updateData('sexo', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
        </FormSelect>
    </FormSection>
);

const SaudeStep: React.FC<{ data: OnboardingData['saude']; updateData: (field: keyof OnboardingData['saude'], value: string) => void }> = ({ data, updateData }) => (
    <FormSection title="Sua Saúde" subtitle="Informações importantes para um plano seguro e eficaz.">
        <FormTextarea label="Condições médicas pré-existentes (Ex: diabetes, hipertensão)" value={data.condicoesMedicas} onChange={e => updateData('condicoesMedicas', e.target.value)} />
        <FormTextarea label="Medicações em uso" value={data.medicacoes} onChange={e => updateData('medicacoes', e.target.value)} />
        <FormTextarea label="Alergias (alimentares ou outras)" value={data.alergias} onChange={e => updateData('alergias', e.target.value)} />
    </FormSection>
);

const LesoesStep: React.FC<{ data: OnboardingData['lesoes']; updateData: (field: keyof OnboardingData['lesoes'], value: string) => void }> = ({ data, updateData }) => (
    <FormSection title="Lesões e Limitações" subtitle="Isso nos ajuda a adaptar seu treino para evitar desconforto.">
        <FormTextarea label="Descreva lesões ou limitações físicas (Ex: tendinite no joelho)" value={data.lesoesLimitacoes} onChange={e => updateData('lesoesLimitacoes', e.target.value)} />
    </FormSection>
);

const RotinaStep: React.FC<{ data: OnboardingData['rotina']; updateData: (field: keyof OnboardingData['rotina'], value: string) => void }> = ({ data, updateData }) => (
    <FormSection title="Sua Rotina" subtitle="Como é o seu dia a dia?">
        <FormInput label="Profissão" type="text" value={data.profissao} onChange={e => updateData('profissao', e.target.value)} />
        <FormInput label="Horário que acorda" type="time" value={data.horarioAcordar} onChange={e => updateData('horarioAcordar', e.target.value)} />
        <FormInput label="Horário que dorme" type="time" value={data.horarioDormir} onChange={e => updateData('horarioDormir', e.target.value)} />
    </FormSection>
);

const PreferenciasAlimentaresStep: React.FC<{ data: OnboardingData['preferenciasAlimentares']; updateData: (field: keyof OnboardingData['preferenciasAlimentares'], value: any) => void }> = ({ data, updateData }) => {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Array<{ categoria: string; items: Array<{ id: string; nome: string }> }>>([]);
    const [likes, setLikes] = useState<string[]>([]);
    const [dislikes, setDislikes] = useState<string[]>([]);
    const [activeCatIdx, setActiveCatIdx] = useState(0);

    // Converter array de restrições para string para exibição no input
    const restricoesTexto = Array.isArray(data.restricoes) ? data.restricoes.join(', ') : '';

    const handleRestricoesChange = (texto: string) => {
        // Converter string para array (separar por vírgula)
        const array = texto.split(',').map(item => item.trim()).filter(item => item.length > 0);
        updateData('restricoes', array);
    };

    // Inicializar likes/dislikes a partir dos textareas existentes
    useEffect(() => {
        const toArray = (txt: string): string[] =>
            (txt || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
        setLikes(toArray(data.alimentosDisponiveis));
        setDislikes(toArray(data.alimentosNaoGosta));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Buscar categorias e itens do Supabase via RPC get_food_items_template
    useEffect(() => {
        const run = async () => {
            try {
                const { data, error } = await supabase.rpc('get_food_items_template');
                if (error) {
                    console.error('Erro ao carregar categorias de alimentos (RPC):', error.message);
                    setCategories([]);
                } else {
                    // Esperado: [{ categoria: string, items: [{ id, nome }, ...] }, ...]
                    const normalized: Array<{ categoria: string; items: Array<{ id: string; nome: string }> }> =
                        Array.isArray(data)
                            ? data.map((r: any) => ({
                                categoria: String(r.categoria ?? 'Categoria'),
                                items: Array.isArray(r.items)
                                    ? r.items.map((it: any) => ({ id: String(it.id), nome: String(it.nome) }))
                                    : [],
                            }))
                            : [];
                    setCategories(normalized);
                }
            } catch (e: any) {
                console.error('Erro inesperado ao carregar categorias:', e?.message || e);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sincronizar textareas quando likes/dislikes mudarem (simula digitação)
    useEffect(() => {
        updateData('alimentosDisponiveis', likes.join(', '));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [likes]);
    useEffect(() => {
        updateData('alimentosNaoGosta', dislikes.join(', '));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dislikes]);

    const toggleLike = (item: string) => {
        item = item.trim();
        if (!item) return;
        // Se já está em dislikes, remove
        if (dislikes.includes(item)) {
            setDislikes(dislikes.filter(i => i !== item));
        }
        // Toggle no likes
        setLikes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };
    const toggleDislike = (item: string) => {
        item = item.trim();
        if (!item) return;
        if (likes.includes(item)) {
            setLikes(likes.filter(i => i !== item));
        }
        setDislikes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    // ItemRow com áreas clicáveis nas extremidades (esquerda = like, direita = dislike)
    const ItemRow: React.FC<{ name: string }> = ({ name }) => {
        const liked = likes.includes(name);
        const disliked = dislikes.includes(name);
        const neutral = !liked && !disliked;
        return (
            <div
                className={`inline-flex items-center rounded-full border overflow-hidden select-none
                    ${liked ? 'border-green-300 bg-green-50' : disliked ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
            >
                {/* Botão Like (esquerda) */}
                <button
                    type="button"
                    onClick={() => toggleLike(name)}
                    className={`px-2 py-1 flex items-center justify-center transition-colors`}
                    aria-label="Gostar"
                    title="Gostar (+)"
                >
                    <span className={`font-bold ${disliked ? 'text-gray-300' : 'text-green-700'} text-base leading-none`}>+</span>
                </button>
                {/* Nome central com clique esquerda/direita */}
                <button
                    type="button"
                    onClick={(e) => {
                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        if (clickX < rect.width / 2) toggleLike(name);
                        else toggleDislike(name);
                    }}
                    className={`px-3 py-1 text-left truncate text-xs ${neutral ? 'text-gray-800' : liked ? 'text-green-900' : 'text-red-900'}`}
                    title={name}
                >
                    {name}
                </button>
                {/* Botão Dislike (direita) */}
                <button
                    type="button"
                    onClick={() => toggleDislike(name)}
                    className={`px-2 py-1 flex items-center justify-center transition-colors`}
                    aria-label="Não gostar"
                    title="Não gostar (−)"
                >
                    <span className={`font-bold ${liked ? 'text-gray-300' : 'text-red-700'} text-base leading-none`}>−</span>
                </button>
            </div>
        );
    };

    return (
        <FormSection title="Preferências Alimentares" subtitle="Vamos montar uma dieta que você goste.">
            {/* Inputs no topo: disposição e orçamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect label="Disposição para cozinhar" value={data.disposicaoCozinhar} onChange={e => updateData('disposicaoCozinhar', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                </FormSelect>
                <FormSelect label="Orçamento alimentar" value={data.orcamento} onChange={e => updateData('orcamento', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="economico">Econômico</option>
                    <option value="moderado">Moderado</option>
                    <option value="flexivel">Flexível</option>
                </FormSelect>
            </div>
            {/* Textareas logo abaixo */}
            <FormTextarea
                label="Restrições alimentares (digite separadas por vírgula, ex: Vegetariano, Sem Lactose, Alergia a amendoim)"
                value={restricoesTexto}
                onChange={e => handleRestricoesChange(e.target.value)}
                placeholder="Ex: Vegetariano, Sem Lactose, Alergia a amendoim"
                rows={2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextarea
                    label="Alimentos que não gosto (vírgulas)"
                    value={data.alimentosNaoGosta}
                    onChange={e => updateData('alimentosNaoGosta', e.target.value)}
                    placeholder="Ex: Jiló, Fígado, Couve"
                    rows={2}
                />
                <FormTextarea
                    label="Alimentos disponíveis (vírgulas)"
                    value={data.alimentosDisponiveis}
                    onChange={e => updateData('alimentosDisponiveis', e.target.value)}
                    placeholder="Ex: Frango, Ovos, Arroz"
                    rows={2}
                />
            </div>
            {/* Tabs por categoria (grande), sem rolagem; container expande para caber todos os itens */}
            <div className="mt-6">
                {isLoading ? (
                    <div className="text-sm text-gray-500">Carregando categorias...</div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2 pb-2">
                            {categories.map((cat, idx) => (
                                <button
                                    key={cat.categoria}
                                    type="button"
                                    onClick={() => setActiveCatIdx(idx)}
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${activeCatIdx === idx ? 'bg-green-500 text-white shadow' : 'bg-white border border-gray-200 hover:bg-green-50'
                                        }`}
                                >
                                    {cat.categoria}
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-3">
                            <div className="flex flex-wrap gap-2">
                                {categories[activeCatIdx]?.items.slice(0, 200).map(item => (
                                    <ItemRow key={item.id} name={item.nome} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </FormSection>
    );
};

const PreferenciasTreinoStep: React.FC<{ data: OnboardingData['preferenciasTreino']; updateData: (field: keyof OnboardingData['preferenciasTreino'], value: any) => void }> = ({ data, updateData }) => (
    <FormSection title="Preferências de Treino" subtitle="Onde e como você prefere treinar?">
        <FormSelect label="Local de treino" value={data.local} onChange={e => updateData('local', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="academia">Academia</option>
            <option value="crossfit">Crossfit</option>
            <option value="casa">Casa</option>
            <option value="parque">Parque</option>
            <option value="misto">Misto</option>
        </FormSelect>
        <label className="text-sm font-medium">Equipamentos disponíveis</label>
        <MultiSelectButtons options={['Halteres', 'Barras', 'Elásticos', 'Kettlebell', 'Máquinas']} selected={data.equipamentos} onChange={v => updateData('equipamentos', v)} />
        <FormSelect label="Experiência com treino" value={data.experiencia} onChange={e => updateData('experiencia', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
        </FormSelect>
        <label className="text-sm font-medium">Dias preferenciais</label>
        <MultiSelectButtons options={['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']} selected={data.diasPreferenciais} onChange={v => updateData('diasPreferenciais', v)} />
        <label className="text-sm font-medium">Horários preferenciais</label>
        <MultiSelectButtons options={['Manhã', 'Tarde', 'Noite']} selected={data.horariosPreferenciais} onChange={v => updateData('horariosPreferenciais', v)} />
    </FormSection>
);

const ObjetivoStep: React.FC<{ data: OnboardingData['objetivo']; updateData: (field: keyof OnboardingData['objetivo'], value: string) => void }> = ({ data, updateData }) => (
    <FormSection title="Metas de Medidas Corporais" subtitle="Defina sua meta focada em medidas corporais.">
        <FormInput
            label="Nome da Meta"
            type="text"
            value={data.meta}
            onChange={e => updateData('meta', e.target.value)}
            placeholder="Ex: Perder 10kg, Ganhar massa muscular"
        />
        <FormInput
            label="Valor Inicial (kg)"
            type="number"
            step="0.1"
            value={data.prazo}
            onChange={e => updateData('prazo', e.target.value)}
            placeholder="Ex: 85.5"
        />
        <FormInput
            label="Valor Final/Meta (kg)"
            type="number"
            step="0.1"
            value={data.motivacao}
            onChange={e => updateData('motivacao', e.target.value)}
            placeholder="Ex: 75.0"
        />
    </FormSection>
);

const MedidasCorporaisStep: React.FC<{ data: MedidasCorporais; updateData: (field: keyof MedidasCorporais, value: string) => void }> = ({ data, updateData }) => (
    <FormSection title="Medidas Corporais" subtitle="Registre suas medidas para um acompanhamento preciso.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Data da Medição" type="date" value={data.data} onChange={e => updateData('data', e.target.value)} />
            <FormInput label="Peso (kg)" type="number" step="0.1" placeholder="Ex: 85.5" value={data.peso} onChange={e => updateData('peso', e.target.value)} />
            <FormInput label="Altura (cm)" type="number" placeholder="Ex: 175" value={data.altura} onChange={e => updateData('altura', e.target.value)} />
            <FormInput label="Pescoço (cm)" type="number" step="0.1" value={data.pescoco} onChange={e => updateData('pescoco', e.target.value)} />
            <FormInput label="Peito (cm)" type="number" step="0.1" value={data.peito} onChange={e => updateData('peito', e.target.value)} />
            <FormInput label="Cintura (cm)" type="number" step="0.1" value={data.cintura} onChange={e => updateData('cintura', e.target.value)} />
            <FormInput label="Quadril (cm)" type="number" step="0.1" value={data.quadril} onChange={e => updateData('quadril', e.target.value)} />
            <FormInput label="Braço Direito (cm)" type="number" step="0.1" value={data.bracoDireito} onChange={e => updateData('bracoDireito', e.target.value)} />
            <FormInput label="Braço Esquerdo (cm)" type="number" step="0.1" value={data.bracoEsquerdo} onChange={e => updateData('bracoEsquerdo', e.target.value)} />
            <FormInput label="Coxa Direita (cm)" type="number" step="0.1" value={data.coxaDireita} onChange={e => updateData('coxaDireita', e.target.value)} />
            <FormInput label="Coxa Esquerda (cm)" type="number" step="0.1" value={data.coxaEsquerda} onChange={e => updateData('coxaEsquerda', e.target.value)} />
            <FormInput label="Pant. Direita (cm)" type="number" step="0.1" value={data.panturrilhaDireita} onChange={e => updateData('panturrilhaDireita', e.target.value)} />
            <FormInput label="Pant. Esquerda (cm)" type="number" step="0.1" value={data.panturrilhaEsquerda} onChange={e => updateData('panturrilhaEsquerda', e.target.value)} />
            <FormInput label="Gordura Corporal (%)" type="number" step="0.1" placeholder="Opcional" value={data.gordura} onChange={e => updateData('gordura', e.target.value)} />
        </div>
        <FormTextarea label="Notas" placeholder="Alguma observação adicional?" value={data.notas} onChange={e => updateData('notas', e.target.value)} />
    </FormSection>
);

const ReviewStep: React.FC<{ data: OnboardingData }> = ({ data }) => {
    const renderList = (items: string[]) => items.length > 0 ? items.join(', ') : 'N/A';

    return (
        <FormSection title="Revisão das Informações" subtitle="Confira se todos os dados estão corretos antes de finalizar.">
            <div className="space-y-4 text-sm">
                {Object.entries(data).map(([sectionKey, sectionValue]) => (
                    <div key={sectionKey} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold capitalize mb-2 text-green-800">{sectionKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <div className="space-y-1">
                            {Object.entries(sectionValue).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                    <span className="font-medium text-right text-green-900">{Array.isArray(value) ? renderList(value as string[]) : ((value as any) || 'N/A')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </FormSection>
    );
};

const GerandoPlanoFinal: React.FC = () => (
    <div className="text-center py-10">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Finalizando seu cadastro...</h2>
        <p className="text-gray-500">Estamos preparando tudo para você.</p>
    </div>
);


export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(initialOnboardingData);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const router = useRouter();

    const handleUpdate = (section: keyof OnboardingData) => (field: any, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNext = async () => {
        if (step < TOTAL_STEPS) {
            setStep(s => s + 1);
        } else {
            setIsFinalizing(true);
            try {
                const result = await salvarOnboarding(data);
                if (result?.success) {
                    router.push('/dashboard');
                    router.refresh();
                } else {
                    throw new Error('Falha ao salvar dados');
                }
            } catch (error) {
                console.error('Erro ao salvar onboarding:', error);
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Erro desconhecido ao finalizar cadastro';
                alert(`Erro: ${errorMessage}`);
                setIsFinalizing(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: return <DadosBasicosStep data={data.dadosBasicos} updateData={handleUpdate('dadosBasicos')} />;
            case 2: return <SaudeStep data={data.saude} updateData={handleUpdate('saude')} />;
            case 3: return <LesoesStep data={data.lesoes} updateData={handleUpdate('lesoes')} />;
            case 4: return <RotinaStep data={data.rotina} updateData={handleUpdate('rotina')} />;
            case 5: return <PreferenciasAlimentaresStep data={data.preferenciasAlimentares} updateData={handleUpdate('preferenciasAlimentares')} />;
            case 6: return <PreferenciasTreinoStep data={data.preferenciasTreino} updateData={handleUpdate('preferenciasTreino')} />;
            case 7: return <ObjetivoStep data={data.objetivo} updateData={handleUpdate('objetivo')} />;
            case 8: return <MedidasCorporaisStep data={data.medidasCorporais} updateData={handleUpdate('medidasCorporais')} />;
            case 9: return <ReviewStep data={data} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                {isFinalizing ? (
                    <GerandoPlanoFinal />
                ) : (
                    <>
                        <ProgressBar currentStep={step} />
                        {renderStepContent()}
                        <StepNavigation onNext={handleNext} onBack={handleBack} currentStep={step} />
                    </>
                )}
            </Card>
        </div>
    );
};
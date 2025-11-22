"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, Button } from '@/components';
import AlertDialog from '@/components/ui/AlertDialog';
import { CheckCircle, User, Activity, Utensils } from 'lucide-react';
import { submitSimplifiedOnboarding } from '@/lib/services/onboarding.service';

export default function OnboardingStep2Page() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [professionalId, setProfessionalId] = useState<string | null>(null);

    // Split WhatsApp State
    const [ddd, setDdd] = useState('');
    const [phone, setPhone] = useState('');

    // Scenario B States
    const [hasNutritionist, setHasNutritionist] = useState(false);
    const [hasTrainer, setHasTrainer] = useState(false);
    const [currentDiet, setCurrentDiet] = useState('');
    const [currentWorkout, setCurrentWorkout] = useState('');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '' });

    const showError = (title: string, message: string) => {
        setDialogContent({ title, message });
        setDialogOpen(true);
    };

    useEffect(() => {
        // Check for professional ID in session storage
        const storedId = sessionStorage.getItem('professional_invite_id');
        if (storedId) {
            setProfessionalId(storedId);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        const cleanDdd = ddd.replace(/\D/g, '');
        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanDdd.length !== 2) {
            showError('DDD Inválido', 'O DDD deve conter exatamente 2 dígitos.');
            return;
        }

        if (cleanPhone.length < 8 || cleanPhone.length > 9) {
            showError('Número Inválido', 'O número deve conter 8 ou 9 dígitos.');
            return;
        }

        // Formatting Logic: 55 + DDD + 8 digits
        let finalPhone = cleanPhone;
        if (cleanPhone.length === 9) {
            finalPhone = cleanPhone.substring(1); // Remove first digit
        }
        const formattedWhatsapp = `55${cleanDdd}${finalPhone}`;

        if (!professionalId) {
            if (hasNutritionist && !currentDiet.trim()) {
                showError('Nutricionista', 'Você marcou que tem Nutricionista. Por favor, descreva sua dieta atual ou desmarque a opção se quiser um plano novo.');
                return;
            }
            if (hasTrainer && !currentWorkout.trim()) {
                showError('Personal Trainer', 'Você marcou que tem Personal. Por favor, descreva seu treino atual ou desmarque a opção se quiser um plano novo.');
                return;
            }
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Usuário não autenticado');

            const payload = {
                p_aluno_id: user.id,
                p_profissional_id: professionalId, // null if organic
                p_whatsapp: formattedWhatsapp,
                p_tem_dieta_atual: professionalId ? false : hasNutritionist,
                p_dieta_atual_texto: professionalId ? "" : currentDiet,
                p_tem_treino_atual: professionalId ? false : hasTrainer,
                p_treino_atual_texto: professionalId ? "" : currentWorkout
            };

            const result = await submitSimplifiedOnboarding(payload);

            if (result.success) {
                // Clear session storage
                sessionStorage.removeItem('professional_invite_id');
                router.push('/dashboard');
            } else {
                // Show specific error message from service
                showError('Erro ao Salvar', result.error || 'Erro ao salvar dados');
            }

        } catch (error: any) {
            console.error('Erro no onboarding:', error);
            showError('Erro', error.message || 'Erro ao processar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Scenario A: Linked to Professional
    if (professionalId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <AlertDialog
                    isOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    title={dialogContent.title}
                    message={dialogContent.message}
                />
                <Card className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vamos finalizar seu cadastro</h2>
                        <p className="text-gray-600">
                            Seus dados já estão vinculados ao seu profissional. Em breve você receberá seu plano.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    required
                                    placeholder="DDD"
                                    maxLength={2}
                                    value={ddd}
                                    onChange={(e) => setDdd(e.target.value.replace(/\D/g, ''))}
                                    className="w-20 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-center"
                                />
                                <input
                                    type="tel"
                                    required
                                    placeholder="99999-9999"
                                    maxLength={9}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Informe o DDD e o número (8 ou 9 dígitos).</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Finalizando...' : 'Finalizar e Avisar Profissional'}
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    // Scenario B: Organic
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <AlertDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={dialogContent.title}
                message={dialogContent.message}
            />
            <Card className="w-full max-w-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Conte um pouco sobre você</h2>
                    <p className="text-gray-600">
                        Para personalizarmos sua experiência, precisamos de alguns detalhes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                required
                                placeholder="DDD"
                                maxLength={2}
                                value={ddd}
                                onChange={(e) => setDdd(e.target.value.replace(/\D/g, ''))}
                                className="w-20 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-center"
                            />
                            <input
                                type="tel"
                                required
                                placeholder="99999-9999"
                                maxLength={9}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Informe o DDD e o número (8 ou 9 dígitos).</p>
                    </div>

                    {/* Nutritionist Toggle */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Utensils size={20} className="text-emerald-600" />
                                </div>
                                <span className="font-medium text-gray-900">Você já tem Nutricionista?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={hasNutritionist}
                                    onChange={(e) => setHasNutritionist(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {hasNutritionist && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descreva sua dieta atual</label>
                                <textarea
                                    rows={3}
                                    value={currentDiet}
                                    onChange={(e) => setCurrentDiet(e.target.value)}
                                    placeholder="Ex: Faço jejum intermitente, como 3x ao dia..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Trainer Toggle */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Activity size={20} className="text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900">Você já tem Personal Trainer?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={hasTrainer}
                                    onChange={(e) => setHasTrainer(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {hasTrainer && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descreva seu treino atual</label>
                                <textarea
                                    rows={3}
                                    value={currentWorkout}
                                    onChange={(e) => setCurrentWorkout(e.target.value)}
                                    placeholder="Ex: Treino ABC, 5x na semana..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}

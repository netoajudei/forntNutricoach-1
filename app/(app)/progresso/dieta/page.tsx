"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ReferenceLine, LabelList
} from 'recharts';
import { dietService } from '@/lib/services';
import { useAlunoId } from '@/lib/aluno';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const CustomizedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-50">
                <p className="font-bold text-gray-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-600">
                            {entry.name}: <span className="font-bold text-gray-900">{entry.value}{entry.name.includes('Calorias') ? 'kcal' : 'g'}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ProgressoDietaPage() {
    const { alunoId } = useAlunoId();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    });

    // Data mínima: setembro de 2025
    const minDate = new Date('2025-09-01');
    const selectedDate = new Date(selectedMonth);
    const isMinMonth = selectedDate.getFullYear() === minDate.getFullYear() && selectedDate.getMonth() === minDate.getMonth();

    // Buscar dados das 3 views
    const { data: dailyData, isLoading: loadingDaily } = useQuery({
        queryKey: ['diet-daily-30d', alunoId],
        queryFn: () => dietService.getDailyMetrics30Days(alunoId!),
        enabled: !!alunoId,
    });

    const { data: weeklyData, isLoading: loadingWeekly } = useQuery({
        queryKey: ['diet-weekly', alunoId, selectedMonth],
        queryFn: () => dietService.getWeeklyMetricsForMonth(alunoId!, selectedMonth),
        enabled: !!alunoId,
    });

    const { data: monthlyData, isLoading: loadingMonthly } = useQuery({
        queryKey: ['diet-monthly', alunoId],
        queryFn: () => dietService.getMonthlyMetrics(alunoId!),
        enabled: !!alunoId,
    });

    const { data: weekly7Data, isLoading: loadingWeekly7 } = useQuery({
        queryKey: ['diet-daily-7d', alunoId],
        queryFn: () => dietService.getDailyMetrics7Days(alunoId!),
        enabled: !!alunoId,
    });

    // Usar a meta do primeiro registro (está em todos os registros do mês)
    const metasSemana = (weeklyData?.[0] || {}) as any;
    const metas = (weekly7Data?.[0] || {}) as any;

    // Estado para controlar quais barras estão visíveis
    const [visibleBars, setVisibleBars] = useState({
        protein: true,
        carbs: true,
        fats: true,
        calories: true,
    });

    const handleLegendClick = (dataKey: string) => {
        setVisibleBars(prev => {
            const newState = {
                ...prev,
                [dataKey]: !prev[dataKey as keyof typeof prev],
            };
            return newState;
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Progresso</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas de Dieta</h1>
                    <p className="text-lg text-gray-500 mt-1">Acompanhe a aderência e evolução da sua alimentação.</p>
                </div>

                <div className="space-y-8">

                    {/* SEÇÃO 0: ÚLTIMOS 7 DIAS COM METAS */}
                    <Card>
                        <div className="mb-6">
                            <h3 className="font-bold text-xl text-green-900">Última Semana (7 Dias)</h3>
                            <p className="text-sm text-gray-500">Com linhas de meta</p>
                        </div>
                        {loadingWeekly7 ? (
                            <div className="h-[450px] flex items-center justify-center text-gray-500">Carregando...</div>
                        ) : (
                            <div className="h-[450px] w-full overflow-x-auto">
                                <div style={{ minWidth: `${Math.max(600, (weekly7Data?.length || 0) * 80)}px`, height: '400px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weekly7Data || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                                            <YAxis yAxisId="macros" label={{ value: 'Macros (g)', angle: -90, position: 'insideLeft' }} domain={[0, (dataMax: number) => {
                                                const values = [];
                                                if (visibleBars.protein) values.push(metas?.meta_proteina || 0);
                                                if (visibleBars.carbs) values.push(metas?.meta_carbs || 0);
                                                const maxMeta = Math.max(...values, 0);
                                                return Math.max(dataMax, maxMeta) * 1.1;
                                            }]} />
                                            <YAxis yAxisId="calories" orientation="right" label={{ value: 'Calorias (kcal)', angle: 90, position: 'insideRight' }} domain={[0, (dataMax: number) => {
                                                const maxMeta = visibleBars.calories ? (metas?.meta_calorias || 0) : 0;
                                                return Math.max(dataMax, maxMeta) * 1.1;
                                            }]} />
                                            <Tooltip content={<CustomizedTooltip />} cursor={{ fill: '#f9fafb' }} />

                                            {/* Linhas de Meta (tracejadas) */}
                                            {metas.meta_proteina && <ReferenceLine yAxisId="macros" y={metas.meta_proteina} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} opacity={0.6} label={{ value: `Meta P: ${metas.meta_proteina}g`, position: 'top', fill: '#EF4444', fontSize: 10 }} />}
                                            {metas.meta_carbs && <ReferenceLine yAxisId="macros" y={metas.meta_carbs} stroke="#10B981" strokeDasharray="3 3" strokeWidth={2} opacity={0.6} label={{ value: `Meta C: ${metas.meta_carbs}g`, position: 'top', fill: '#10B981', fontSize: 10 }} />}
                                            {metas.meta_calorias && <ReferenceLine yAxisId="calories" y={metas.meta_calorias} stroke="#3B82F6" strokeDasharray="3 3" strokeWidth={2} opacity={0.6} label={{ value: `Meta Cal: ${metas.meta_calorias}kcal`, position: 'top', fill: '#3B82F6', fontSize: 10 }} />}

                                            {visibleBars.protein && <Bar yAxisId="macros" dataKey="protein" name="Proteína" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />}
                                            {visibleBars.carbs && <Bar yAxisId="macros" dataKey="carbs" name="Carboidratos" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />}
                                            {visibleBars.fats && <Bar yAxisId="macros" dataKey="fats" name="Gorduras" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={20} />}
                                            {visibleBars.calories && <Bar yAxisId="calories" dataKey="calories" name="Calorias" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legenda Customizada Clicável */}
                                <div className="flex justify-center gap-6 mt-4">
                                    {[
                                        { key: 'protein', label: 'Proteína', color: '#EF4444' },
                                        { key: 'carbs', label: 'Carboidratos', color: '#10B981' },
                                        { key: 'fats', label: 'Gorduras', color: '#FACC15' },
                                        { key: 'calories', label: 'Calorias', color: '#3B82F6' },
                                    ].map(item => {
                                        const isVisible = visibleBars[item.key as keyof typeof visibleBars];
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => handleLegendClick(item.key)}
                                                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                                                style={{ opacity: isVisible ? 1 : 0.4 }}
                                            >
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span style={{ textDecoration: isVisible ? 'none' : 'line-through' }} className="text-sm">
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* SEÇÃO 1: ÚLTIMOS 30 DIAS */}
                    <Card>
                        <div className="mb-6">
                            <h3 className="font-bold text-xl text-green-900">Últimos 30 Dias</h3>
                            <p className="text-sm text-gray-500">Visão diária corrida (dados reais)</p>
                        </div>
                        {loadingDaily ? (
                            <div className="h-[400px] flex items-center justify-center text-gray-500">Carregando...</div>
                        ) : (
                            <div className="h-[450px] w-full overflow-x-auto">
                                <div style={{ minWidth: `${Math.max(600, (dailyData?.length || 0) * 50)}px`, height: '400px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                                            <YAxis yAxisId="macros" label={{ value: 'Macros (g)', angle: -90, position: 'insideLeft' }} />
                                            <YAxis yAxisId="calories" orientation="right" label={{ value: 'Calorias (kcal)', angle: 90, position: 'insideRight' }} />
                                            <Tooltip content={<CustomizedTooltip />} cursor={{ fill: '#f9fafb' }} />

                                            {visibleBars.protein && <Bar yAxisId="macros" dataKey="protein" name="Proteína" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={15} />}
                                            {visibleBars.carbs && <Bar yAxisId="macros" dataKey="carbs" name="Carboidratos" fill="#10B981" radius={[4, 4, 0, 0]} barSize={15} />}
                                            {visibleBars.fats && <Bar yAxisId="macros" dataKey="fats" name="Gorduras" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={15} />}
                                            {visibleBars.calories && <Bar yAxisId="calories" dataKey="calories" name="Calorias" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={15} />}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legenda Customizada Clicável */}
                                <div className="flex justify-center gap-6 mt-4">
                                    {[
                                        { key: 'protein', label: 'Proteína', color: '#EF4444' },
                                        { key: 'carbs', label: 'Carboidratos', color: '#10B981' },
                                        { key: 'fats', label: 'Gorduras', color: '#FACC15' },
                                        { key: 'calories', label: 'Calorias', color: '#3B82F6' },
                                    ].map(item => {
                                        const isVisible = visibleBars[item.key as keyof typeof visibleBars];
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => handleLegendClick(item.key)}
                                                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                                                style={{ opacity: isVisible ? 1 : 0.4 }}
                                            >
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span style={{ textDecoration: isVisible ? 'none' : 'line-through' }} className="text-sm">
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* SEÇÃO 2: VISÃO SEMANAL DO MÊS */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-xl text-green-900">Visão Semanal do Mês</h3>
                                <p className="text-sm text-gray-500">Totais acumulados por semana</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" onClick={() => {
                                    const [ano, mes] = selectedMonth.split('-').map(Number);
                                    const novaData = new Date(ano, mes - 2, 1); // mes-2 porque: -1 para converter de 1-based para 0-based, -1 para retroceder
                                    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}-01`;
                                    console.log('← Retroceder:', selectedMonth, '→', novoMes);
                                    setSelectedMonth(novoMes);
                                }} disabled={isMinMonth}>
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </Button>
                                <span className="font-bold text-gray-700">{new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                                <Button variant="secondary" onClick={() => {
                                    const [ano, mes] = selectedMonth.split('-').map(Number);
                                    const novaData = new Date(ano, mes, 1); // mes já está 0-based após -1 implícito, +1 para avançar = mes
                                    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}-01`;
                                    console.log('→ Avançar:', selectedMonth, '→', novoMes);
                                    setSelectedMonth(novoMes);
                                }}>
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {loadingWeekly ? (
                            <div className="h-[450px] flex items-center justify-center text-gray-500">Carregando...</div>
                        ) : (
                            <div className="h-[450px] w-full">
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="week" axisLine={false} tickLine={false} />
                                            <YAxis
                                                yAxisId="macros"
                                                label={{ value: 'Macros (g)', angle: -90, position: 'insideLeft' }}
                                                domain={[0, (dataMax: number) => {
                                                    const values = [];
                                                    if (visibleBars.protein) values.push(metasSemana?.meta_proteina || 0);
                                                    if (visibleBars.carbs) values.push(metasSemana?.meta_carbs || 0);
                                                    const maxMeta = Math.max(...values, 0);
                                                    return Math.max(dataMax, maxMeta) * 1.1;
                                                }]}
                                            />
                                            <YAxis
                                                yAxisId="calories"
                                                orientation="right"
                                                label={{ value: 'Calorias (kcal)', angle: 90, position: 'insideRight' }}
                                                domain={[0, (dataMax: number) => {
                                                    const maxMeta = visibleBars.calories ? (metasSemana?.meta_calorias || 0) : 0;
                                                    return Math.max(dataMax, maxMeta) * 1.1;
                                                }]}
                                            />
                                            <Tooltip content={<CustomizedTooltip />} cursor={{ fill: '#f9fafb' }} />

                                            {/* Linhas de Meta Semanal (tracejadas) */}
                                            {metasSemana?.meta_proteina && <ReferenceLine yAxisId="macros" y={metasSemana.meta_proteina} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} opacity={0.6} label={{ value: `Meta P: ${metasSemana.meta_proteina}g`, position: 'top', fill: '#EF4444', fontSize: 10 }} />}
                                            {metasSemana?.meta_carbs && <ReferenceLine yAxisId="macros" y={metasSemana.meta_carbs} stroke="#10B981" strokeDasharray="3 3" strokeWidth={2} opacity={0.6} label={{ value: `Meta C: ${metasSemana.meta_carbs}g`, position: 'top', fill: '#10B981', fontSize: 10 }} />}
                                            {metasSemana?.meta_calorias && <ReferenceLine yAxisId="calories" y={metasSemana.meta_calorias} stroke="#3B82F6" strokeDasharray="3 3" strokeWidth={2} opacity={0.6} label={{ value: `Meta Cal: ${metasSemana.meta_calorias}kcal`, position: 'top', fill: '#3B82F6', fontSize: 10 }} />}

                                            {visibleBars.protein && <Bar yAxisId="macros" dataKey="protein" name="Proteína" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />}
                                            {visibleBars.carbs && <Bar yAxisId="macros" dataKey="carbs" name="Carboidratos" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />}
                                            {visibleBars.fats && <Bar yAxisId="macros" dataKey="fats" name="Gorduras" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={30} />}
                                            {visibleBars.calories && <Bar yAxisId="calories" dataKey="calories" name="Calorias" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legenda Customizada Clicável */}
                                <div className="flex justify-center gap-6 mt-4">
                                    {[
                                        { key: 'protein', label: 'Proteína', color: '#EF4444' },
                                        { key: 'carbs', label: 'Carboidratos', color: '#10B981' },
                                        { key: 'fats', label: 'Gorduras', color: '#FACC15' },
                                        { key: 'calories', label: 'Calorias', color: '#3B82F6' },
                                    ].map(item => {
                                        const isVisible = visibleBars[item.key as keyof typeof visibleBars];
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => handleLegendClick(item.key)}
                                                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                                                style={{ opacity: isVisible ? 1 : 0.4 }}
                                            >
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span style={{ textDecoration: isVisible ? 'none' : 'line-through' }} className="text-sm">
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* SEÇÃO 3: RESUMO MENSAL (TODOS OS MESES) */}
                    <Card>
                        <h3 className="font-bold text-xl text-green-900 mb-6">Histórico Mensal Completo</h3>
                        {loadingMonthly ? (
                            <div className="h-[350px] flex items-center justify-center text-gray-500">Carregando...</div>
                        ) : (
                            <div className="h-[400px] w-full overflow-x-auto">
                                <div style={{ minWidth: `${Math.max(600, (monthlyData?.length || 0) * 120)}px`, height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData || []} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="macros" label={{ value: 'Macros (g)', angle: -90, position: 'insideLeft' }} domain={[0, (dataMax: number) => {
                                                const values = [];
                                                if (visibleBars.protein) values.push(metas?.meta_proteina || 0);
                                                if (visibleBars.carbs) values.push(metas?.meta_carbs || 0);
                                                const maxMeta = Math.max(...values, 0);
                                                return Math.max(dataMax, maxMeta) * 1.1;
                                            }]} />
                                            <YAxis yAxisId="calories" orientation="right" label={{ value: 'Calorias (kcal)', angle: 90, position: 'insideRight' }} domain={[0, (dataMax: number) => {
                                                const maxMeta = visibleBars.calories ? (metas?.meta_calorias || 0) : 0;
                                                return Math.max(dataMax, maxMeta) * 1.1;
                                            }]} />
                                            <Tooltip content={<CustomizedTooltip />} cursor={{ fill: '#f9fafb' }} />

                                            {visibleBars.protein && (
                                                <Bar yAxisId="macros" dataKey="protein" name="Proteína" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20}>
                                                    <LabelList dataKey="percentual_proteina" position="top" formatter={(value: number) => `${value.toFixed(0)}%`} style={{ fontSize: 10, fill: '#EF4444', fontWeight: 'bold' }} />
                                                </Bar>
                                            )}
                                            {visibleBars.carbs && (
                                                <Bar yAxisId="macros" dataKey="carbs" name="Carboidratos" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20}>
                                                    <LabelList dataKey="percentual_carbs" position="top" formatter={(value: number) => `${value.toFixed(0)}%`} style={{ fontSize: 10, fill: '#10B981', fontWeight: 'bold' }} />
                                                </Bar>
                                            )}
                                            {visibleBars.fats && <Bar yAxisId="macros" dataKey="fats" name="Gorduras" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={20} />}
                                            {visibleBars.calories && (
                                                <Bar yAxisId="calories" dataKey="calories" name="Calorias" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20}>
                                                    <LabelList dataKey="percentual_calorias" position="top" formatter={(value: number) => `${value.toFixed(0)}%`} style={{ fontSize: 10, fill: '#3B82F6', fontWeight: 'bold' }} />
                                                </Bar>
                                            )}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legenda Customizada Clicável */}
                                <div className="flex justify-center gap-6 mt-4">
                                    {[
                                        { key: 'protein', label: 'Proteína', color: '#EF4444' },
                                        { key: 'carbs', label: 'Carboidratos', color: '#10B981' },
                                        { key: 'fats', label: 'Gorduras', color: '#FACC15' },
                                        { key: 'calories', label: 'Calorias', color: '#3B82F6' },
                                    ].map(item => {
                                        const isVisible = visibleBars[item.key as keyof typeof visibleBars];
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => handleLegendClick(item.key)}
                                                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                                                style={{ opacity: isVisible ? 1 : 0.4 }}
                                            >
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span style={{ textDecoration: isVisible ? 'none' : 'line-through' }} className="text-sm">
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                </div>
            </div>
        </div>
    );
}

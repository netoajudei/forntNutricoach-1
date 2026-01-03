"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { workoutService } from '@/lib/services';
import { useAlunoId } from '@/lib/aluno';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const CustomizedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <p className="font-bold text-gray-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-600">
                            {entry.name}: <span className="font-bold text-gray-900">{entry.value.toLocaleString()} kg</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Componente interno para cada gráfico de treino
const WorkoutHistoryChart = ({ workoutName, data }: { workoutName: string, data: any[] }) => {
    const [visibleExercises, setVisibleExercises] = useState<Record<string, boolean>>({});

    // Processar dados para o formato do gráfico
    const processedData = React.useMemo(() => {
        const groupedByDate: Record<string, any> = {};

        data.forEach(item => {
            const date = new Date(item.data_treino).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!groupedByDate[date]) {
                groupedByDate[date] = { date };
            }
            // Usar carga_kg e fallback
            const load = typeof item.carga_kg === 'number' ? item.carga_kg : parseFloat(item.carga_kg || '0');
            const exerciseName = item.nome_exercicio || item.exercicio || 'Exercício';

            groupedByDate[date][exerciseName] = load;
        });

        return Object.values(groupedByDate);
    }, [data]);

    // Extrair lista de exercícios únicos para a legenda e cores
    const exercises = React.useMemo(() => {
        const set = new Set<string>();
        data.forEach(item => {
            set.add(item.nome_exercicio || item.exercicio || 'Exercício');
        });
        return Array.from(set);
    }, [data]);

    // Inicializar visibilidade
    useEffect(() => {
        if (exercises.length > 0 && Object.keys(visibleExercises).length === 0) {
            const initial: Record<string, boolean> = {};
            exercises.forEach(e => initial[e] = true);
            setVisibleExercises(initial);
        }
    }, [exercises]);

    const toggleExercise = (exercise: string) => {
        setVisibleExercises(prev => ({ ...prev, [exercise]: !prev[exercise] }));
    };

    return (
        <div className="w-full">
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} label={{ value: 'Carga (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomizedTooltip />} />
                        {exercises.map((exercise, index) => (
                            visibleExercises[exercise] && (
                                <Line
                                    key={exercise}
                                    type="monotone"
                                    dataKey={exercise}
                                    name={exercise}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            )
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-4 max-h-40 overflow-y-auto px-2 pb-2">
                {exercises.map((exercise, index) => (
                    <button
                        key={exercise}
                        onClick={() => toggleExercise(exercise)}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all"
                        style={{
                            backgroundColor: visibleExercises[exercise] ? `${COLORS[index % COLORS.length]}20` : '#F3F4F6',
                            color: visibleExercises[exercise] ? COLORS[index % COLORS.length] : '#9CA3AF',
                            textDecoration: visibleExercises[exercise] ? 'none' : 'line-through'
                        }}
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: visibleExercises[exercise] ? COLORS[index % COLORS.length] : '#9CA3AF' }}
                        />
                        {exercise}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Componente para Gráfico de Pizza (Frequência Semanal)
const WeeklyFrequencyChart = ({ clientAlunoId }: { clientAlunoId: string }) => {
    const { data: weeklyData } = useQuery({
        queryKey: ['weeklyFrequency', clientAlunoId],
        queryFn: () => workoutService.getTrainingFrequency(clientAlunoId),
        enabled: !!clientAlunoId
    });

    const currentWeek = React.useMemo(() => {
        if (!weeklyData || weeklyData.length === 0) return null;
        return weeklyData[0]; // Pega a semana mais recente
    }, [weeklyData]);

    const chartData = React.useMemo(() => {
        if (!currentWeek) return [];
        const executed = parseInt(currentWeek.treinos_executados || '0');
        const planned = parseInt(currentWeek.total_treinos_programa || '0');
        const remaining = Math.max(0, planned - executed);

        return [
            { name: 'Executado', value: executed, color: '#10B981' },
            { name: 'Restante', value: remaining, color: '#E5E7EB' }
        ];
    }, [currentWeek]);

    if (!currentWeek) return <div className="text-gray-500 text-center py-10">Sem dados para esta semana.</div>;

    return (
        <div className="flex flex-col items-center">
            <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                {/* Texto Centralizado */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800">{currentWeek.percentual_aderencia}%</span>
                    <span className="text-xs text-gray-500">Concluído</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className="text-gray-600">
                    <span className="font-bold text-green-600">{currentWeek.treinos_executados}</span> de <span className="font-bold text-gray-800">{currentWeek.total_treinos_programa}</span> treinos realizados
                </p>
                <p className="text-xs text-gray-400 mt-1">Semana: {new Date(currentWeek.semana_inicio).toLocaleDateString('pt-BR')} a {new Date(currentWeek.semana_fim).toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
    );
};

// Componente para Gráfico de Barras (Histórico 4 Semanas)
const HistoryFrequencyChart = ({ clientAlunoId }: { clientAlunoId: string }) => {
    const { data: weeklyData } = useQuery({
        queryKey: ['weeklyFrequency', clientAlunoId],
        queryFn: () => workoutService.getTrainingFrequency(clientAlunoId),
        enabled: !!clientAlunoId
    });

    const last4Weeks = React.useMemo(() => {
        if (!weeklyData) return [];
        // Pegar as 4 últimas semanas (já vem ordenado decrescente, então slice 0,4 e depois reverse para mostrar cronológico)
        return weeklyData.slice(0, 4).reverse().map((item: any) => ({
            name: new Date(item.semana_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            executado: parseInt(item.treinos_executados || '0'),
            meta: parseInt(item.total_treinos_programa || '0'),
            fullDate: `Semana de ${new Date(item.semana_inicio).toLocaleDateString('pt-BR')}`
        }));
    }, [weeklyData]);

    if (!last4Weeks.length) return <div className="text-gray-500 text-center py-10">Buscando histórico...</div>;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last4Weeks} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6' }}
                        cursor={{ fill: '#f3f4f6' }}
                    />
                    <Legend />
                    <Bar dataKey="executado" name="Realizados" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="meta" name="Meta" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function ProgressoTreinoPage() {
    const { alunoId } = useAlunoId();
    const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({});

    // 1. Gráfico de Evolução por Grupo Muscular
    const { data: muscleEvolution, isLoading: loadingMuscle } = useQuery({
        queryKey: ['muscleEvolution', alunoId],
        queryFn: () => workoutService.getMuscleGroupEvolution(alunoId!),
        enabled: !!alunoId,
    });

    // Processar dados para o gráfico de linhas (Grupo Muscular)
    // view: aluno_id, data_inicio_semana, dados_musculos (JSON)
    const processedMuscleData = React.useMemo(() => {
        if (!muscleEvolution) return [];

        const data: any[] = [];
        const groups = new Set<string>();

        muscleEvolution.forEach((item: any) => {
            const date = new Date(item.data_inicio_semana).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            // O item contém um campo JSON 'dados_musculos' com { 'Peito': 100, 'Costas': 200 }
            if (item.dados_musculos) {
                const row: any = { date };

                Object.entries(item.dados_musculos).forEach(([groupName, load]) => {
                    row[groupName] = load;
                    groups.add(groupName);
                });

                data.push(row);
            }
        });

        // Inicializar visibilidade de todos os grupos como true
        if (Object.keys(visibleGroups).length === 0 && groups.size > 0) {
            const initialVisibility: Record<string, boolean> = {};
            groups.forEach(g => initialVisibility[g] = true);
            setVisibleGroups(initialVisibility);
        }

        return data;
    }, [muscleEvolution]);

    const muscleGroups = React.useMemo(() => {
        if (!muscleEvolution) return [];
        const groups = new Set<string>();
        muscleEvolution.forEach((item: any) => {
            if (item.dados_musculos) {
                Object.keys(item.dados_musculos).forEach(g => groups.add(g));
            }
        });
        return Array.from(groups);
    }, [muscleEvolution]);


    // 2. Histórico por Treino
    const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

    const { data: fullHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['fullWorkoutHistory', alunoId],
        queryFn: () => workoutService.getFullWorkoutHistory(alunoId!),
        enabled: !!alunoId,
    });

    const workoutsData = React.useMemo(() => {
        if (!fullHistory) return {};
        const groups: Record<string, any[]> = {};
        fullHistory.forEach((item: any) => {
            const name = item.nome_treino || 'Treino Sem Nome';
            if (!groups[name]) groups[name] = [];
            groups[name].push(item);
        });
        return groups;
    }, [fullHistory]);

    const workoutNames = Object.keys(workoutsData).sort();

    // Não precisamos mais gerenciar visibilidade de múltiplos exercícios pois estamos filtrando por um único ID
    // Mas o gráfico espera um formato array de objetos com keys. 
    // Vamos simplificar: o gráfico mostrará uma única linha para o exercício selecionado.



    const toggleGroup = (group: string) => {
        setVisibleGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Progresso</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas de Treino</h1>
                    <p className="text-lg text-gray-500 mt-1">Acompanhe sua evolução de carga e desempenho.</p>
                </div>

                <div className="space-y-8">
                    {/* SEÇÃO 0: FREQUÊNCIA DE TREINOS (Novos Gráficos) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <h3 className="font-bold text-xl text-green-900 mb-6">Frequência Semanal Atual</h3>
                            <WeeklyFrequencyChart clientAlunoId={alunoId!} />
                        </Card>
                        <Card>
                            <h3 className="font-bold text-xl text-green-900 mb-6">Histórico de Frequência (Últimas Semanas)</h3>
                            <HistoryFrequencyChart clientAlunoId={alunoId!} />
                        </Card>
                    </div>

                    {/* SEÇÃO 1: EVOLUÇÃO POR GRUPO MUSCULAR */}
                    <Card>
                        <h3 className="font-bold text-xl text-green-900 mb-6">Evolução de Carga por Grupo Muscular</h3>
                        {loadingMuscle ? (
                            <div className="h-[400px] flex items-center justify-center text-gray-500">Carregando...</div>
                        ) : (
                            <div>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={processedMuscleData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                label={{ value: 'Carga (kg)', angle: -90, position: 'insideLeft' }}
                                            // Domain dinâmico baseados nos visíveis
                                            />
                                            <Tooltip content={<CustomizedTooltip />} />
                                            {muscleGroups.map((group, index) => (
                                                visibleGroups[group as string] && (
                                                    <Line
                                                        key={group as string}
                                                        type="monotone"
                                                        dataKey={group as string}
                                                        name={group as string}
                                                        stroke={COLORS[index % COLORS.length]}
                                                        strokeWidth={3}
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                )
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {muscleGroups.map((group, index) => (
                                        <button
                                            key={group as string}
                                            onClick={() => toggleGroup(group as string)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all"
                                            style={{
                                                backgroundColor: visibleGroups[group as string] ? `${COLORS[index % COLORS.length]}20` : '#F3F4F6',
                                                color: visibleGroups[group as string] ? COLORS[index % COLORS.length] : '#9CA3AF',
                                                textDecoration: visibleGroups[group as string] ? 'none' : 'line-through'
                                            }}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: visibleGroups[group as string] ? COLORS[index % COLORS.length] : '#9CA3AF' }}
                                            />
                                            {group as string}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* SEÇÃO 2: HISTÓRICO POR TREINO */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl text-green-900">Histórico por Treino</h3>
                        {loadingHistory ? (
                            <Card><div className="p-8 text-center text-gray-500">Carregando histórico...</div></Card>
                        ) : workoutNames.length === 0 ? (
                            <Card><div className="p-8 text-center text-gray-500">Nenhum treino registrado.</div></Card>
                        ) : (
                            workoutNames.map(name => (
                                <div key={name} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                    <button
                                        onClick={() => setExpandedWorkout(expandedWorkout === name ? null : name)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="font-bold text-lg text-gray-800">{name}</span>
                                        <span className="text-gray-500">{expandedWorkout === name ? '▲' : '▼'}</span>
                                    </button>

                                    {expandedWorkout === name && (
                                        <div className="p-4 border-t border-gray-200">
                                            <WorkoutHistoryChart workoutName={name} data={workoutsData[name]} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

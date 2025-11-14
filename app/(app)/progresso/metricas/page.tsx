"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Skeleton } from '@/components';
import { createClient } from '@/lib/supabase/client';
import { useAlunoId } from '@/lib/aluno';

type RpcMetricRow = {
  data?: string | null;
  data_registro?: string | null;
  peso?: number | string | null;
  peso_inicial?: number | string | null;
  delta_peso_total?: number | string | null;
  gordura?: number | string | null;
  cintura?: number | string | null;
  quadril?: number | string | null;
  peito?: number | string | null;
  circunferencia_cintura_cm?: number | string | null;
  circunferencia_quadril_cm?: number | string | null;
  circunferencia_peito_cm?: number | string | null;
  coxa_direita?: number | string | null;
  coxa_esquerda?: number | string | null;
  panturrilha_direita?: number | string | null;
  panturrilha_esquerda?: number | string | null;
  braco_direito?: number | string | null;
  braco_esquerdo?: number | string | null;
};

type HistoryPoint = {
  date: string; // dd/MM
  weight: number;
  fatPercentage: number;
  waist: number;
  hips: number;
  chest: number;
  thighRight: number;
  thighLeft: number;
  calfRight: number;
  calfLeft: number;
  armRight: number;
  armLeft: number;
  initialWeight?: number;
  totalWeightDelta?: number;
};

const SummaryCard: React.FC<{ title: string; value: string; change?: string; changeColor?: string }> = ({ title, value, change, changeColor = 'text-green-500' }) => (
    <Card className="text-center">
        <h3 className="text-gray-500 font-semibold">{title}</h3>
        <p className="text-3xl font-extrabold text-green-800 mt-1">{value}</p>
        {change && <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>}
    </Card>
);

const MetricsTable: React.FC<{ data: HistoryPoint[] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3">Peso</th>
                    <th scope="col" className="px-6 py-3">Peso Inicial</th>
                    <th scope="col" className="px-6 py-3">Δ Peso Total</th>
                    <th scope="col" className="px-6 py-3">% Gordura</th>
                    <th scope="col" className="px-6 py-3">Cintura</th>
                    <th scope="col" className="px-6 py-3">Quadril</th>
                    <th scope="col" className="px-6 py-3">Peito</th>
                    <th scope="col" className="px-6 py-3">Coxa Dir.</th>
                    <th scope="col" className="px-6 py-3">Coxa Esq.</th>
                    <th scope="col" className="px-6 py-3">Panturr. Dir.</th>
                    <th scope="col" className="px-6 py-3">Panturr. Esq.</th>
                    <th scope="col" className="px-6 py-3">Braço Dir.</th>
                    <th scope="col" className="px-6 py-3">Braço Esq.</th>
                </tr>
            </thead>
            <tbody>
                {data.map((entry) => (
                    <tr key={entry.date} className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entry.date}</th>
                        <td className="px-6 py-4">{Number.isFinite(entry.weight) ? `${entry.weight.toFixed(1)} kg` : '—'}</td>
                        <td className="px-6 py-4">{entry.initialWeight != null ? `${entry.initialWeight.toFixed(1)} kg` : '—'}</td>
                        <td className="px-6 py-4">{entry.totalWeightDelta != null ? `${entry.totalWeightDelta.toFixed(1)} kg` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.fatPercentage) ? `${entry.fatPercentage.toFixed(1)}%` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.waist) ? `${entry.waist.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.hips) ? `${entry.hips.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.chest) ? `${entry.chest.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.thighRight) ? `${entry.thighRight.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.thighLeft) ? `${entry.thighLeft.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.calfRight) ? `${entry.calfRight.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.calfLeft) ? `${entry.calfLeft.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.armRight) ? `${entry.armRight.toFixed(1)} cm` : '—'}</td>
                        <td className="px-6 py-4">{Number.isFinite(entry.armLeft) ? `${entry.armLeft.toFixed(1)} cm` : '—'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function ProgressoMetricasPage() {
    const supabase = createClient();
    const { alunoId } = useAlunoId();
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState<HistoryPoint[] | null>(null);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);
    const [lastDeltaWeight, setLastDeltaWeight] = useState<number | null>(null);
    const [fatPercentage, setFatPercentage] = useState<number | null>(null);
    const [nextAssessment, setNextAssessment] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            if (!alunoId) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_aluno_chart_data', { p_aluno_id: alunoId });
                if (error) {
                    console.error('Erro ao buscar dados da RPC:', error);
                    setIsLoading(false);
                    return;
                }
                const rows: RpcMetricRow[] = Array.isArray(data) ? data : [];
                // sort by date ascending
                rows.sort((a, b) => {
                    const aIso = String((a.data ?? a.data_registro) ?? '').slice(0,10);
                    const bIso = String((b.data ?? b.data_registro) ?? '').slice(0,10);
                    const ta = aIso ? new Date(aIso + 'T00:00:00').getTime() : 0;
                    const tb = bIso ? new Date(bIso + 'T00:00:00').getTime() : 0;
                    return ta - tb;
                });
                const toNum = (v: any): number => {
                    const n = Number(v);
                    return Number.isFinite(n) ? n : 0;
                };
                const fmtDDMM = (iso: string) => {
                    try {
                        const d = new Date(iso + 'T00:00:00');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        return `${dd}/${mm}`;
                    } catch {
                        const [y, m, d] = String(iso).split('-');
                        return `${d}/${m}`;
                    }
                };
                const hist: HistoryPoint[] = rows.map(r => {
                    const iso = String((r.data ?? r.data_registro) ?? '').slice(0,10);
                    const weight = toNum(r.peso);
                    const fat = toNum(r.gordura);
                    const waist = toNum(r.cintura ?? r.circunferencia_cintura_cm);
                    const hips = toNum(r.quadril ?? r.circunferencia_quadril_cm);
                    const chest = toNum(r.peito ?? r.circunferencia_peito_cm);
                    const thighRight = toNum(r.coxa_direita);
                    const thighLeft = toNum(r.coxa_esquerda);
                    const calfRight = toNum(r.panturrilha_direita);
                    const calfLeft = toNum(r.panturrilha_esquerda);
                    const armRight = toNum(r.braco_direito);
                    const armLeft = toNum(r.braco_esquerdo);
                    const initialWeight = r.peso_inicial != null ? toNum(r.peso_inicial) : undefined;
                    const totalWeightDelta = r.delta_peso_total != null ? toNum(r.delta_peso_total) : undefined;
                    return {
                        date: iso ? fmtDDMM(iso) : '—',
                        weight,
                        fatPercentage: fat,
                        waist,
                        hips,
                        chest,
                        thighRight,
                        thighLeft,
                        calfRight,
                        calfLeft,
                        armRight,
                        armLeft,
                        initialWeight,
                        totalWeightDelta,
                    };
                });
                setHistory(hist);
                // last record
                const last = rows[rows.length - 1];
                const prev = rows[rows.length - 2];
                const lastWeight = last ? toNum(last.peso) : null;
                const prevWeight = prev ? toNum(prev.peso) : null;
                setCurrentWeight(lastWeight);
                setFatPercentage(last ? toNum(last.gordura) : null);
                const deltaProvided = last && last.delta_peso_total != null ? toNum(last.delta_peso_total) : null;
                const deltaComputed = lastWeight != null && prevWeight != null ? (lastWeight - prevWeight) : null;
                setLastDeltaWeight(deltaProvided ?? deltaComputed);
                // next assessment = last date + 15 days
                const lastIso = String((last?.data ?? last?.data_registro) ?? '').slice(0,10);
                if (lastIso) {
                    const d = new Date(lastIso + 'T00:00:00');
                    d.setDate(d.getDate() + 15);
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    setNextAssessment(`${dd}/${mm}`);
                } else {
                    setNextAssessment(null);
                }
            } catch (e) {
                console.error('Erro inesperado:', e);
            } finally {
                setIsLoading(false);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href="/progresso" className="text-green-600 hover:underline text-sm mb-2 inline-block">&larr; Voltar para Progresso</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Métricas Corporais</h1>
                    <p className="text-lg text-gray-500 mt-1">Sua jornada de evolução em detalhes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {isLoading ? <>
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </> : (
                        <>
                          <SummaryCard
                            title="Peso Atual"
                            value={currentWeight != null ? `${currentWeight.toFixed(1)} kg` : '—'}
                            change={lastDeltaWeight != null ? `${lastDeltaWeight >= 0 ? '+' : ''}${lastDeltaWeight.toFixed(1)} kg vs última` : undefined}
                            changeColor={lastDeltaWeight != null ? (lastDeltaWeight <= 0 ? 'text-green-600' : 'text-red-600') : 'text-green-500'}
                          />
                          <SummaryCard
                            title="% de Gordura"
                            value={fatPercentage != null ? `${fatPercentage.toFixed(1)}%` : '—'}
                          />
                          <SummaryCard
                            title="Próxima Aferição"
                            value={nextAssessment ?? '—'}
                          />
                        </>
                    )}
                </div>

                <Card className="mb-8">
                    <h2 className="text-xl font-bold text-green-900 mb-4">Evolução do Peso e % de Gordura</h2>
                     {isLoading ? <Skeleton className="w-full h-[400px]"/> : history ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" domain={['dataMin - 2', 'dataMax + 2']} label={{ value: '% Gordura', angle: 90, position: 'insideRight' }}/>
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#10B981" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="fatPercentage" name="% Gordura" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : null}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-green-900 mb-4">Histórico de Medidas</h2>
                    {isLoading ? <Skeleton className="w-full h-[200px]"/> : history ? (
                        <MetricsTable data={history} />
                    ): null}
                </Card>
            </div>
        </div>
    );
}
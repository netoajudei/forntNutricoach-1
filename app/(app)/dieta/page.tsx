"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Skeleton, Progress, Tabs } from '@/components';
import { createClient } from '@/lib/supabase/client';
import { useAlunoId } from '@/lib/aluno';

// useQuery hook re-implementado localmente para componentes de cliente
function useQuery<T>(queryFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    queryFn().then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, [queryFn]);
  return { data, isLoading };
}


const MacroProgress: React.FC<{ label: string; consumed: number; goal: number; unit: string; barClassName?: string }> =
  ({ label, consumed, goal, unit, barClassName }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-500">{consumed.toFixed(0)}{unit} / {goal.toFixed(0)}{unit}</span>
    </div>
      <Progress value={(consumed / (goal || 1)) * 100} barClassName={barClassName} />
  </div>
);

const DailySummaryCard: React.FC = () => {
    const supabase = createClient();
    const { alunoId } = useAlunoId();
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<{
        calories: { consumed: number; goal: number };
        protein: { consumed: number; goal: number };
        carbs: { consumed: number; goal: number };
        fats: { consumed: number; goal: number };
        date: string;
    } | null>(null);

    const todayStr = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    // small helper to coalesce numeric fields with different naming conventions
    const pickNumber = (obj: any, candidates: string[], fallback = 0) => {
        for (const key of candidates) {
            const v = obj?.[key];
            if (v != null && !Number.isNaN(Number(v))) return Number(v);
        }
        return fallback;
    };

    useEffect(() => {
        const run = async () => {
            if (!alunoId) return;
            setIsLoading(true);
            // Query the view vw_nutricao_hoje_por_aluno (já consolidada para "hoje" por aluno)
            const { data, error } = await supabase
                .from('vw_nutricao_hoje_por_aluno')
                .select('*')
                .eq('aluno_id', alunoId)
                .maybeSingle();

            if (error) {
                console.error('Erro vw_nutricao_hoje_por_aluno:', error);
                setSummary(null);
            } else if (data) {
                const rowToday = data;
                // Consumed totals now include the exact columns from the provided JSON:
                // total_calorias_consumidas, total_proteina_consumida, total_carboidrato_consumido, total_gordura_consumida
                const caloriesConsumed = pickNumber(rowToday, [
                    'total_calorias_consumidas',
                    'total_calorias',
                    'totalCalories',
                    'kcal_total',
                    'calorias_total',
                    'kcal',
                    'energy_kcal',
                ]);
                const caloriesGoal     = pickNumber(rowToday, ['meta_calorias','calories_goal','kcal_meta']);
                const proteinConsumed  = pickNumber(rowToday, [
                    'total_proteina_consumida',
                    'total_proteina',
                    'totalProtein',
                    'proteina_total',
                    'protein',
                    'proteina',
                ]);
                const proteinGoal      = pickNumber(rowToday, ['meta_proteina','protein_goal','proteina_meta']);
                const carbsConsumed    = pickNumber(rowToday, [
                    'total_carboidrato_consumido',
                    'total_carboidratos',
                    'totalCarbs',
                    'carboidratos_total',
                    'carbs',
                    'carboidratos',
                ]);
                const carbsGoal        = pickNumber(rowToday, ['meta_carboidratos','carbs_goal','carboidratos_meta']);
                const fatsConsumed     = pickNumber(rowToday, [
                    'total_gordura_consumida',
                    'total_gorduras',
                    'totalFats',
                    'gorduras_total',
                    'fats',
                    'gorduras',
                    'lipidios',
                ]);
                const fatsGoal         = pickNumber(rowToday, ['meta_gorduras','fats_goal','gorduras_meta']);
                setSummary({
                    calories: { consumed: caloriesConsumed, goal: caloriesGoal },
                    protein:  { consumed: proteinConsumed,  goal: proteinGoal },
                    carbs:    { consumed: carbsConsumed,    goal: carbsGoal },
                    fats:     { consumed: fatsConsumed,     goal: fatsGoal },
                    date: todayStr,
                });
            } else {
                setSummary(null);
            }
            setIsLoading(false);
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId, todayStr]);

    if (isLoading) {
        return (
            <Card>
                <Skeleton className="h-6 w-1/3 mb-6"/>
                <div className="space-y-5">
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                </div>
            </Card>
        );
    }
    
    if (!summary) return null;
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-green-900 mb-4">Resumo do Dia</h2>
            <div className="space-y-5">
                <MacroProgress
                  label="Calorias"
                  consumed={summary.calories.consumed}
                  goal={summary.calories.goal}
                  unit="kcal"
                  barClassName="bg-gradient-to-r from-blue-500 to-blue-700"
                />
                <MacroProgress
                  label="Proteínas"
                  consumed={summary.protein.consumed}
                  goal={summary.protein.goal}
                  unit="g"
                  barClassName="bg-gradient-to-r from-red-500 to-red-600"
                />
                <MacroProgress
                  label="Carboidratos"
                  consumed={summary.carbs.consumed}
                  goal={summary.carbs.goal}
                  unit="g"
                  barClassName="bg-gradient-to-r from-green-500 to-green-600"
                />
                <MacroProgress
                  label="Gorduras"
                  consumed={summary.fats.consumed}
                  goal={summary.fats.goal}
                  unit="g"
                  barClassName="bg-gradient-to-r from-yellow-400 to-yellow-500"
                />
            </div>
        </Card>
    );
};

const MealCard: React.FC<{ meal: {
    id: string;
    descricao: string;
    timeLabel: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    details?: string | null;
} }> = ({ meal }) => (
    <Card className="!scale-100 hover:!scale-[1.02]">
        <div className="flex justify-between items-start mb-4">
            <div>
                <span className="font-extrabold text-xl text-green-800">Total de Calorias</span>
            </div>
            <div className="text-right">
                <p className="font-extrabold text-xl text-green-800">{meal.calories} kcal</p>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4">
            <div>
                <p className="text-xs font-medium text-gray-500">Proteína</p>
                <p className="font-bold text-green-900">{meal.protein}g</p>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">Carbs</p>
                <p className="font-bold text-green-900">{meal.carbs}g</p>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">Gordura</p>
                <p className="font-bold text-green-900">{meal.fats}g</p>
            </div>
        </div>
        
        <div className="border-t border-gray-100 mt-4 pt-4">
             <p className="text-xs font-medium text-gray-500">{meal.descricao}</p>
        </div>
    </Card>
);

const DailyDietView: React.FC = () => {
    const supabase = createClient();
    const { alunoId } = useAlunoId();
    const [isLoading, setIsLoading] = useState(true);
    const [meals, setMeals] = useState<Array<{
        id: string; descricao: string; timeLabel: string;
        calories: number; protein: number; carbs: number; fats: number; details?: string | null;
    }>>([]);

    const todayStr = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    useEffect(() => {
        const run = async () => {
            if (!alunoId) return;
            setIsLoading(true);
            // 1) Tentar filtrar diretamente por data_registro = hoje
            let rows: any[] = [];
            const { data: regRows, error: regErr } = await supabase
              .from('daily_consumption_history')
              .select('*')
              .eq('aluno_id', alunoId)
              .eq('data_registro', todayStr);
            if (regErr) {
              console.error('Erro refeicoes de hoje (data_registro):', regErr.message);
            }
            if (regRows && regRows.length > 0) {
              rows = regRows;
            } else {
              // 2) Fallback: usar created_at no range do dia
              const start = `${todayStr}T00:00:00`;
              const nextDay = (() => {
                  const d = new Date(todayStr + 'T00:00:00');
                  d.setDate(d.getDate() + 1);
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.getDate()).padStart(2, '0');
                  return `${yyyy}-${mm}-${dd}T00:00:00`;
              })();
              const { data: ctRows, error: ctErr } = await supabase
                .from('daily_consumption_history')
                .select('*')
                .eq('aluno_id', alunoId)
                .gte('created_at', start)
                .lt('created_at', nextDay);
              if (ctErr) {
                console.error('Erro refeicoes de hoje (created_at range):', ctErr.message);
              }
              rows = ctRows ?? [];
            }
            const mealsToday = rows.sort((a,b) => {
                const ta = a?.consumo_at ? new Date(a.consumo_at).getTime() : (a?.created_at ? new Date(a.created_at).getTime() : 0);
                const tb = b?.consumo_at ? new Date(b.consumo_at).getTime() : (b?.created_at ? new Date(b.created_at).getTime() : 0);
                return ta - tb;
            });
            const toTimeLabel = (r: any) => {
                if (r?.hora_consumo) return String(r.hora_consumo);
                if (r?.consumo_at) return new Date(r.consumo_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                if (r?.created_at) return new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return '';
            };
            setMeals(mealsToday.map(r => ({
                id: String(r.id),
                descricao: (r.analise_qualitativa && String(r.analise_qualitativa).trim()) ? String(r.analise_qualitativa) : 'Refeição',
                timeLabel: toTimeLabel(r),
                calories: Number(r.consumo_calorias ?? 0),
                protein: Number(r.consumo_proteina ?? 0),
                carbs: Number(r.consumo_carboidrato ?? 0),
                fats: Number(r.consumo_gordura ?? 0),
                details: null,
            })));
            setIsLoading(false);
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId, todayStr]);
     return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-1">
                <DailySummaryCard/>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-green-900">Refeições de Hoje</h2>
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl"/>)
                ) : (
                    meals?.map(meal => <MealCard key={meal.id} meal={meal} />)
                )}
            </div>
        </div>
    )
}

const DietHistoryView: React.FC = () => {
    const supabase = createClient();
    const { alunoId } = useAlunoId();
    const [isLoading, setIsLoading] = useState(true);
    const [dates, setDates] = useState<string[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [mealsForDay, setMealsForDay] = useState<Array<{
        id: string; descricao: string; timeLabel: string;
        calories: number; protein: number; carbs: number; fats: number; details?: string | null;
    }>>([]);
    const [summaryForDay, setSummaryForDay] = useState<{
        calories: { consumed: number; goal: number };
        protein: { consumed: number; goal: number };
        carbs: { consumed: number; goal: number };
        fats: { consumed: number; goal: number };
    } | null>(null);

    const pickDateStr = (row: any) => {
        const cands = ['data','dt','dia','date','data_ref','ref_date'];
        for (const k of cands) {
            const v = row?.[k];
            if (v) {
                const s = String(v).slice(0,10);
                if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
            }
        }
        return null;
    };
    const fmtDDMM = (iso: string) => {
        try {
            const d = new Date(iso + 'T00:00:00');
            const dd = String(d.getDate()).padStart(2,'0');
            const mm = String(d.getMonth()+1).padStart(2,'0');
            return `${dd}/${mm}`;
        } catch {
            const [y,m,d] = iso.split('-');
            return `${d}/${m}`;
        }
    };

    useEffect(() => {
        const run = async () => {
            if (!alunoId) return;
            setIsLoading(true);
            // 1) Fetch last 6 records from view for tabs (excluindo hoje)
            const { data: resumo, error } = await supabase
                .from('vw_nutricao_resumo_diario')
                .select('*')
                .eq('aluno_id', alunoId)
                .order('data_registro', { ascending: false })
                .limit(6);
            if (error) {
                console.error('Erro datas histórico (view):', error.message);
                setDates([]);
                setMealsForDay([]);
                setIsLoading(false);
                return;
            }
            const sumRows = resumo ?? [];
            const getISO = (r: any) => String(r.data_registro ?? r.data ?? '').slice(0,10);
            const todayISO = new Date().toISOString().slice(0,10);
            const uniq = Array.from(new Set(sumRows.map(getISO).filter(d => !!d && d !== todayISO)));
            setDates(uniq);
            setActiveIdx(0);
            // Build summary for first tab
            const pickNumber = (obj: any, candidates: string[], fallback = 0) => {
                for (const key of candidates) {
                    const v = obj?.[key];
                    if (v != null && !Number.isNaN(Number(v))) return Number(v);
                }
                return fallback;
            };
            // 2) Load meals for the first date
            if (uniq.length > 0) {
                const target = uniq[0];
                const r = sumRows.find(x => getISO(x) === target);
                if (r) {
                  setSummaryForDay({
                    calories: { consumed: pickNumber(r, ['total_calorias_consumidas','total_calorias','kcal','energy_kcal','calorias_total']), goal: pickNumber(r, ['meta_calorias','kcal_meta','calories_goal']) },
                    protein:  { consumed: pickNumber(r, ['total_proteina_consumida','total_proteina','proteina_total','protein']), goal: pickNumber(r, ['meta_proteina','protein_goal','proteina_meta']) },
                    carbs:    { consumed: pickNumber(r, ['total_carboidrato_consumido','total_carboidratos','carboidratos_total','carbs']), goal: pickNumber(r, ['meta_carboidratos','carbs_goal','carboidratos_meta']) },
                    fats:     { consumed: pickNumber(r, ['total_gordura_consumida','total_gorduras','gorduras_total','fats','lipidios']), goal: pickNumber(r, ['meta_gorduras','fats_goal','gorduras_meta']) },
                  });
                } else {
                  setSummaryForDay(null);
                }
                const { data: mealsRaw, error: mealsErr } = await supabase
                    .from('daily_consumption_history')
                    .select('*')
                    .eq('aluno_id', alunoId);
                if (mealsErr) {
                    console.error('Erro meals histórico:', mealsErr.message);
                    setMealsForDay([]);
                    setIsLoading(false);
                    return;
                }
                const sameDate = (r: any) => {
                    const cands = ['data_registro','data_consumo','data','dia'];
                    for (const k of cands) {
                        const v = r?.[k];
                        if (v && String(v).slice(0,10) === target) return true;
                    }
                    if (r?.consumo_at && String(r.consumo_at).slice(0,10) === target) return true;
                    if (r?.created_at && String(r.created_at).slice(0,10) === target) return true;
                    return false;
                };
                // reuse top-level pickNumber (avoid shadowing)
                const pickText = (obj: any, candidates: string[], fallback = 'Refeição') => {
                    for (const key of candidates) {
                        const v = obj?.[key];
                        if (v && String(v).trim().length > 0) return String(v);
                    }
                    return fallback;
                };
                const toTimeLabel = (r: any) => {
                    if (r?.hora_consumo) return String(r.hora_consumo);
                    if (r?.consumo_at) return new Date(r.consumo_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    if (r?.created_at) return new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    return '';
                };
                const mealRows = (mealsRaw ?? []).filter(sameDate).sort((a,b)=>{
                    const ta = a?.consumo_at ? new Date(a.consumo_at).getTime() : (a?.created_at ? new Date(a.created_at).getTime() : 0);
                    const tb = b?.consumo_at ? new Date(b.consumo_at).getTime() : (b?.created_at ? new Date(b.created_at).getTime() : 0);
                    return ta - tb;
                });
                setMealsForDay(mealRows.map(r => ({
                    id: String(r.id),
                    descricao: pickText(r, ['descricao','descricao_item','alimento','nome','observacao'], 'Refeição'),
                    timeLabel: toTimeLabel(r),
                    calories: Number(r.consumo_calorias ?? 0),
                    protein: Number(r.consumo_proteina ?? 0),
                    carbs: Number(r.consumo_carboidrato ?? 0),
                    fats: Number(r.consumo_gordura ?? 0),
                    details: null,
                })));
            } else {
                setMealsForDay([]);
                setSummaryForDay(null);
            }
            setIsLoading(false);
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId]);

    const loadMealsByDate = async (dateISO: string) => {
        // Atualiza o resumo (gráfico) da aba selecionada consultando a view por data
        try {
            const { data: sumRow } = await supabase
                .from('vw_nutricao_resumo_diario')
                .select('*')
                .eq('aluno_id', alunoId)
                .eq('data_registro', dateISO)
                .maybeSingle();
            if (sumRow) {
                const pickNum = (row: any, candidates: string[], fallback = 0) => {
                    for (const key of candidates) {
                        const v = row?.[key];
                        if (v != null && !Number.isNaN(Number(v))) return Number(v);
                    }
                    return fallback;
                };
                setSummaryForDay({
                    calories: { consumed: pickNum(sumRow, ['total_calorias_consumidas','total_calorias','kcal','energy_kcal','calorias_total']), goal: pickNum(sumRow, ['meta_calorias','kcal_meta','calories_goal']) },
                    protein:  { consumed: pickNum(sumRow, ['total_proteina_consumida','total_proteina','proteina_total','protein']), goal: pickNum(sumRow, ['meta_proteina','protein_goal','proteina_meta']) },
                    carbs:    { consumed: pickNum(sumRow, ['total_carboidrato_consumido','total_carboidratos','carboidratos_total','carbs']), goal: pickNum(sumRow, ['meta_carboidratos','carbs_goal','carboidratos_meta']) },
                    fats:     { consumed: pickNum(sumRow, ['total_gordura_consumida','total_gorduras','gorduras_total','fats','lipidios']), goal: pickNum(sumRow, ['meta_gorduras','fats_goal','gorduras_meta']) },
                });
            } else {
                setSummaryForDay(null);
            }
        } catch {
            // Ignorar erros silenciosamente para não travar a UI
        }
        const start = `${dateISO}T00:00:00`;
        const nextDay = (() => {
            const d = new Date(dateISO + 'T00:00:00');
            d.setDate(d.getDate() + 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T00:00:00`;
        })();
        const { data: mealsRaw, error } = await supabase
            .from('daily_consumption_history')
            .select('*')
            .eq('aluno_id', alunoId)
            .or([
                `data_registro.eq.${dateISO}`,
                `and(created_at.gte.${start},created_at.lt.${nextDay})`,
            ].join(','));
        if (error) {
            console.error('Erro meals por dia:', error.message);
            setMealsForDay([]);
            return;
        }
        const pickNumber = (obj: any, candidates: string[], fallback = 0) => {
            for (const key of candidates) {
                const v = obj?.[key];
                if (v != null && !Number.isNaN(Number(v))) return Number(v);
            }
            return fallback;
        };
        const pickText = (obj: any, candidates: string[], fallback = 'Refeição') => {
            for (const key of candidates) {
                const v = obj?.[key];
                if (v && String(v).trim().length > 0) return String(v);
            }
            return fallback;
        };
        const toTimeLabel = (r: any) => {
            if (r?.hora_consumo) return String(r.hora_consumo);
            if (r?.consumo_at) return new Date(r.consumo_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (r?.created_at) return new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return '';
        };
        const rows = (mealsRaw ?? []).sort((a,b)=>{
            const ta = a?.consumo_at ? new Date(a.consumo_at).getTime() : (a?.created_at ? new Date(a.created_at).getTime() : 0);
            const tb = b?.consumo_at ? new Date(b.consumo_at).getTime() : (b?.created_at ? new Date(b.created_at).getTime() : 0);
            return ta - tb;
        });
        setMealsForDay(rows.map(r => ({
            id: String(r.id),
            descricao: pickText(r, ['descricao','descricao_item','alimento','nome','observacao'], 'Refeição'),
            timeLabel: toTimeLabel(r),
            calories: Number(r.consumo_calorias ?? 0),
            protein: Number(r.consumo_proteina ?? 0),
            carbs: Number(r.consumo_carboidrato ?? 0),
            fats: Number(r.consumo_gordura ?? 0),
            details: null,
        })));
    };
    
    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">Histórico de Dieta</h2>
            {isLoading ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
            ) : dates.length === 0 ? (
                <Card><p className="p-4 text-gray-600 text-sm">Sem registros nos últimos dias.</p></Card>
            ) : (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {dates.map((d, idx) => (
                            <button
                                key={d}
                                onClick={async () => { setActiveIdx(idx); await loadMealsByDate(d); }}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${activeIdx === idx ? 'bg-green-500 text-white shadow' : 'bg-white hover:bg-green-50'}`}
                            >
                                {fmtDDMM(d)}
                        </button>
                    ))}
                    </div>
                    {summaryForDay && (
                        <Card>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <MacroProgress label="Calorias" consumed={summaryForDay.calories.consumed} goal={summaryForDay.calories.goal} unit="kcal" barClassName="bg-gradient-to-r from-blue-500 to-blue-700" />
                                <MacroProgress label="Proteínas" consumed={summaryForDay.protein.consumed} goal={summaryForDay.protein.goal} unit="g" barClassName="bg-gradient-to-r from-red-500 to-red-600" />
                                <MacroProgress label="Carboidratos" consumed={summaryForDay.carbs.consumed} goal={summaryForDay.carbs.goal} unit="g" barClassName="bg-gradient-to-r from-green-500 to-green-600" />
                                <MacroProgress label="Gorduras" consumed={summaryForDay.fats.consumed} goal={summaryForDay.fats.goal} unit="g" barClassName="bg-gradient-to-r from-yellow-400 to-yellow-500" />
                            </div>
                        </Card>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {mealsForDay.map(meal => <MealCard key={meal.id} meal={meal} />)}
                    </div>
                </>
            )}
        </div>
    );
};


export default function DietaPage() {
    const [activeTab, setActiveTab] = useState('Hoje');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Sua Dieta</h1>
                    <p className="text-lg text-gray-500 mt-1">Acompanhe seu plano alimentar diário e histórico.</p>
                </div>
                
                <Tabs tabs={['Hoje', 'Histórico de Dieta']} activeTab={activeTab} onTabChange={setActiveTab} />
                
                {activeTab === 'Hoje' ? <DailyDietView /> : <DietHistoryView />}
            </div>
        </div>
    );
};

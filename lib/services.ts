import {
  mockUser, mockDailyDietSummary, mockDailyMeals, mockWeeklyDietPlan,
  mockWeeklyWorkoutProgram, mockWeightHistory,
  mockProgressSummary, mockWorkoutAnalytics,
  mockOnboardingData, mockWeeklyMacroSummary, mockMonthlyMacroSummary, mockAnnualMacroSummary, mockDietMetricsSummary, mockBodyMetricsHistory, mockBodyMetricsSummary,
  mockWorkoutMetricsSummary, mockExerciseLoadHistory, mockWeeklyCompletionHistory
} from './mocks';
import type {
  UserProfile, DailyDietSummary, Meal, WeeklyDietDay,
  WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics, OnboardingData, WeeklyMacroSummary, MonthlyMacroSummary, AnnualMacroSummary, DietMetricsSummary, BodyMetricsHistoryEntry, BodyMetricsSummary,
  WorkoutMetricsSummary, ExerciseLoadHistory, WeeklyCompletionHistory
} from './types';
import { createClient } from '@/lib/supabase/client';

const API_DELAY = 800; // Simulate network latency in milliseconds

const simulateApiCall = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, API_DELAY);
  });
};

export const userService = {
  getProfile: async (targetAlunoId?: string | null): Promise<UserProfile> => {
    const supabase = createClient();
    let alunoRow;

    if (targetAlunoId) {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, email, nome_completo, role')
        .eq('id', targetAlunoId)
        .maybeSingle();
      if (error) throw new Error(`Erro ao buscar aluno por ID: ${error.message}`);
      alunoRow = data;
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado.');
      }

      // Buscar id do aluno
      const { data, error: alunoError } = await supabase
        .from('alunos')
        .select('id, email, nome_completo, role')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (alunoError) {
        throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
      }
      alunoRow = data;
    }

    if (!alunoRow) {
      throw new Error('Aluno não encontrado.');
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('vw_perfil_completo_aluno')
      .select('*')
      .eq('aluno_id', alunoRow.id)
      .maybeSingle();
    if (perfilError) {
      throw new Error(`Erro ao buscar perfil: ${perfilError.message}`);
    }

    const userEmail =
      alunoRow?.email ??
      '';

    const profile: UserProfile = {
      name: (perfil as any)?.nome_completo ?? alunoRow?.nome_completo ?? '',
      email: userEmail,
      avatarUrl: '', // sem foto -> usar avatar por iniciais no componente
      age: Math.round(Number((perfil as any)?.idade ?? 0)),
      height: Number((perfil as any)?.altura_cm ?? 0),
      initialWeight: Number((perfil as any)?.peso_inicial_meta ?? 0),
      goalWeight: Number((perfil as any)?.meta_de_peso ?? 0),
      objective: (perfil as any)?.objetivo_principal ?? '',
    };
    return profile;
  },

  getOnboardingData: async (targetAlunoId?: string | null): Promise<OnboardingData> => {
    const supabase = createClient();
    let alunoRow;

    if (targetAlunoId) {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome_completo, role')
        .eq('id', targetAlunoId)
        .maybeSingle();
      if (error) throw new Error(`Erro ao buscar aluno por ID: ${error.message}`);
      alunoRow = data;
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado.');
      }

      const { data, error: alunoError } = await supabase
        .from('alunos')
        .select('id, nome_completo, role')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (alunoError) {
        throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
      }
      alunoRow = data;
    }

    if (!alunoRow) {
      throw new Error('Aluno não encontrado.');
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('vw_perfil_completo_aluno')
      .select('*')
      .eq('aluno_id', alunoRow.id)
      .maybeSingle();
    if (perfilError) {
      throw new Error(`Erro ao buscar perfil: ${perfilError.message}`);
    }
    const p = (perfil as any) ?? {};

    const toStr = (v: any) => (v == null ? '' : String(v));
    const toArray = (v: any): string[] => Array.isArray(v) ? v : [];
    const timeToHHMM = (t: any) => {
      if (!t) return '';
      const s = String(t);
      // handle formats like "12:30:00" or "12:30"
      const [hh, mm] = s.split(':');
      if (!hh || !mm) return '';
      return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
    };
    const medsToString = (v: any): string => {
      if (!v) return '';
      try {
        // If it's a JSON string, parse first
        const parsed = typeof v === 'string' ? JSON.parse(v) : v;
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
        if (parsed && typeof parsed === 'object') {
          // common shape we saved: { medicacoes: [...] }
          if (Array.isArray(parsed.medicacoes)) {
            return parsed.medicacoes.join(', ');
          }
          // otherwise attempt to gather string values
          const vals = Object.values(parsed).flat();
          if (Array.isArray(vals)) {
            return vals.join(', ');
          }
        }
      } catch {
        // fall through
      }
      return String(v);
    };

    const onboarding: OnboardingData = {
      dadosBasicos: {
        nomeCompleto: toStr(p.nome_completo) || toStr(alunoRow.nome_completo),
        dataNascimento: '', // não presente na view
        sexo: '', // não presente na view
      },
      saude: {
        condicoesMedicas: toArray(p.condicoes_medicas).join(', '),
        medicacoes: medsToString(p.medicacoes_em_uso),
        alergias: toArray(p.alergias).join(', '),
      },
      lesoes: {
        lesoesLimitacoes: p.lesoes_limitacoes
          ? (typeof p.lesoes_limitacoes === 'object' && p.lesoes_limitacoes?.descricao
            ? String(p.lesoes_limitacoes.descricao)
            : JSON.stringify(p.lesoes_limitacoes))
          : '',
      },
      rotina: {
        profissao: toStr(p.profissao),
        horarioAcordar: timeToHHMM(p.horario_acordar),
        horarioDormir: timeToHHMM(p.horario_dormir),
      },
      preferenciasAlimentares: {
        restricoes: toArray(p.restricoes_alimentares),
        alimentosNaoGosta: toArray(p.alimentos_nao_gosta).join(', '),
        alimentosDisponiveis: toArray(p.alimentos_favoritos).join(', '),
        disposicaoCozinhar: toStr(p.disposicao_cozinhar),
        orcamento: toStr(p.orcamento_alimentar),
      },
      preferenciasTreino: {
        local: toStr(p.local_treino),
        equipamentos: toArray(p.equipamentos_disponiveis),
        experiencia: toStr(p.experiencia_treino),
        diasPreferenciais: toArray(p.dias_preferenciais_treino),
        horariosPreferenciais: toArray(p.horarios_preferenciais_treino),
      },
      objetivo: {
        meta: toStr(p.tipo_meta),
        prazo: toStr(p.prazo_meta), // data -> string
        motivacao: toStr(p.motivacao_meta),
      },
      medidasCorporais: {
        data: toStr(p.data_medidas_iniciais),
        peso: toStr(p.peso_medidas_iniciais),
        altura: toStr(p.altura_medidas_iniciais),
        pescoco: toStr(p.pescoco_inicial),
        peito: toStr(p.peito_inicial),
        cintura: toStr(p.cintura_inicial),
        quadril: toStr(p.quadril_inicial),
        bracoDireito: toStr(p.braco_dir_inicial),
        bracoEsquerdo: toStr(p.braco_esq_inicial),
        coxaDireita: toStr(p.coxa_dir_inicial),
        coxaEsquerda: toStr(p.coxa_esq_inicial),
        panturrilhaDireita: toStr(p.panturrilha_dir_inicial),
        panturrilhaEsquerda: toStr(p.panturrilha_esq_inicial),
        gordura: toStr(p.gordura_inicial),
        notas: toStr(p.notas_medidas_iniciais),
      },
    };
    return onboarding;
  },

  getProfileNotes: async (targetAlunoId?: string | null): Promise<{ nutricionista: string; personal: string }> => {
    const supabase = createClient();
    let alunoRow;

    if (targetAlunoId) {
      const { data, error } = await supabase
        .from('alunos')
        .select('id')
        .eq('id', targetAlunoId)
        .maybeSingle();
      if (error) throw new Error(`Erro ao buscar aluno por ID: ${error.message}`);
      alunoRow = data;
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado.');
      }
      const { data, error: alunoError } = await supabase
        .from('alunos')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (alunoError) {
        throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
      }
      alunoRow = data;
    }

    if (!alunoRow) {
      throw new Error('Aluno não encontrado.');
    }
    const { data: perfil, error: perfilError } = await supabase
      .from('vw_perfil_completo_aluno')
      .select('anotacoes_nutricionista, anotacoes_personal')
      .eq('aluno_id', alunoRow.id)
      .maybeSingle();
    if (perfilError) {
      throw new Error(`Erro ao buscar anotações: ${perfilError.message}`);
    }
    return {
      nutricionista: (perfil as any)?.anotacoes_nutricionista ?? '',
      personal: (perfil as any)?.anotacoes_personal ?? '',
    };
  },

  updateProfileNotes: async (payload: { nutricionista?: string; personal?: string }, targetAlunoId?: string | null): Promise<void> => {
    const supabase = createClient();
    let alunoRow;

    if (targetAlunoId) {
      const { data, error } = await supabase
        .from('alunos')
        .select('id')
        .eq('id', targetAlunoId)
        .maybeSingle();
      if (error) throw new Error(`Erro ao buscar aluno por ID: ${error.message

        }`);
      alunoRow = data;
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado.');
      }
      const { data, error: alunoError } = await supabase
        .from('alunos')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (alunoError) {
        throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
      }
      alunoRow = data;
    }

    if (!alunoRow) {
      throw new Error('Aluno não encontrado.');
    }

    // Tabela alvo para instruções (conforme types): dynamic_prompts
    // Campos: instrucoes_nutricionista_text, instrucoes_personal_text
    const { data: existing, error: fetchDynError } = await supabase
      .from('dynamic_prompts')
      .select('id')
      .eq('aluno_id', alunoRow.id)
      .maybeSingle();
    if (fetchDynError) {
      throw new Error(`Erro ao buscar instruções atuais: ${fetchDynError.message}`);
    }

    if (existing) {
      const { error: updErr } = await supabase
        .from('dynamic_prompts')
        .update({
          instrucoes_nutricionista_text: payload.nutricionista ?? null,
          instrucoes_personal_text: payload.personal ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (updErr) {
        throw new Error(`Erro ao atualizar instruções: ${updErr.message}`);
      }
    } else {
      const { error: insErr } = await supabase
        .from('dynamic_prompts')
        .insert({
          aluno_id: alunoRow.id,
          instrucoes_nutricionista_text: payload.nutricionista ?? null,
          instrucoes_personal_text: payload.personal ?? null,
        });
      if (insErr) {
        throw new Error(`Erro ao criar instruções: ${insErr.message}`);
      }
    }
  },
};

export const dietService = {
  getDailySummary: (): Promise<DailyDietSummary> => simulateApiCall(mockDailyDietSummary),
  getDailyMeals: (): Promise<Meal[]> => simulateApiCall(mockDailyMeals),
  getWeeklyPlan: (): Promise<WeeklyDietDay[]> => simulateApiCall(mockWeeklyDietPlan),
  getWeeklyMacroSummary: (): Promise<WeeklyMacroSummary[]> => simulateApiCall(mockWeeklyMacroSummary),
  getMonthlyMacroSummary: (): Promise<MonthlyMacroSummary[]> => simulateApiCall(mockMonthlyMacroSummary),
  getAnnualMacroSummary: (): Promise<AnnualMacroSummary[]> => simulateApiCall(mockAnnualMacroSummary),
  getDietMetricsSummary: (): Promise<DietMetricsSummary> => simulateApiCall(mockDietMetricsSummary),

  // Novos métodos para dados reais das views materializadas
  async getDailyMetrics7Days(alunoId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('vw_nutricao_resumo_diario')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_registro', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Erro ao buscar dados dos últimos 7 dias:', error);
      throw error;
    }

    console.log('Dados dos últimos 7 dias recebidos:', data);

    // Retornar os dados no formato esperado pelo gráfico, invertendo a ordem para ficar cronológico
    const resultado = (data || []).reverse().map((dia: any) => ({
      date: new Date(dia.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      calories: dia.total_calorias_consumidas || 0,
      protein: dia.total_proteina_consumida || 0,
      carbs: dia.total_carboidrato_consumido || 0,
      fats: dia.total_gordura_consumida || 0,
      meta_calorias: dia.meta_calorias ? parseInt(dia.meta_calorias) : null,
      meta_proteina: dia.meta_proteina ? parseInt(dia.meta_proteina) : null,
      meta_carbs: dia.meta_carboidratos ? parseInt(dia.meta_carboidratos) : null,
    }));

    console.log('Dados dos últimos 7 dias formatados:', resultado);
    return resultado;
  },

  async getDailyMetrics30Days(alunoId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('vw_nutricao_resumo_diario')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_registro', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Erro ao buscar dados diários:', error);
      throw error;
    }

    console.log('Dados diários recebidos:', data);

    // Retornar os dados no formato esperado pelo gráfico, invertendo a ordem para ficar cronológico
    const resultado = (data || []).reverse().map((dia: any) => ({
      date: new Date(dia.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      calories: dia.total_calorias_consumidas || 0,
      protein: dia.total_proteina_consumida || 0,
      carbs: dia.total_carboidrato_consumido || 0,
      fats: dia.total_gordura_consumida || 0,
      meta_calorias: dia.meta_calorias ? parseInt(dia.meta_calorias) : null,
      meta_proteina: dia.meta_proteina ? parseInt(dia.meta_proteina) : null,
      meta_carbs: dia.meta_carboidratos ? parseInt(dia.meta_carboidratos) : null,
    }));

    console.log('Dados formatados para o gráfico:', resultado);
    return resultado;
  },

  async getWeeklyMetricsForMonth(alunoId: string, mesInicio: string) {
    const supabase = createClient();

    // Calcular o primeiro e último dia do mês
    const mesDate = new Date(mesInicio);
    const mesAno = mesDate.getFullYear();
    const mesNum = mesDate.getMonth() + 1;
    const primeiroDia = `${mesAno}-${String(mesNum).padStart(2, '0')}-01`;
    const ultimoDia = new Date(mesAno, mesNum, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('vw_nutricao_resumo_semanal')
      .select('*')
      .eq('aluno_id', alunoId)
      .gte('semana_inicio', primeiroDia)
      .lte('semana_inicio', ultimoDia)
      .order('semana_inicio', { ascending: true });

    if (error) throw error;

    return (data || []).map((semana: any) => {
      const inicio = new Date(semana.semana_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const fim = new Date(semana.semana_fim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      return {
        week: `${inicio} - ${fim}`,
        // Totais acumulados da semana
        calories: semana.total_calorias_consumidas || 0,
        protein: semana.total_proteina_consumida || 0,
        carbs: semana.total_carboidrato_consumido || 0,
        fats: semana.total_gordura_consumida || 0,
        // Metas da semana
        meta_calorias: semana.meta_calorias_semana ? parseInt(semana.meta_calorias_semana) : null,
        meta_proteina: semana.meta_proteina_semana ? parseInt(semana.meta_proteina_semana) : null,
        meta_carbs: semana.meta_carboidratos_semana ? parseInt(semana.meta_carboidratos_semana) : null,
      };
    });
  },

  async getMonthlyMetrics(alunoId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('vw_nutricao_resumo_mensal')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('mes_inicio', { ascending: false }); // Ordem decrescente (mais recente primeiro)

    if (error) throw error;

    console.log('Dados mensais recebidos (primeiro registro):', data?.[0]);

    const resultado = (data || []).map((mes: any) => ({
      month: new Date(mes.mes_inicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      calories: mes.total_calorias_consumidas || 0,
      protein: mes.total_proteina_consumida || 0,
      carbs: mes.total_carboidrato_consumido || 0,
      fats: mes.total_gordura_consumida || 0,
      // Percentuais (nomes corretos da view)
      percentual_calorias: mes.percentual_calorias || 0,
      percentual_proteina: mes.percentual_proteina || 0,
      percentual_carbs: mes.percentual_carboidratos || 0,
    }));

    console.log('Dados formatados (primeiro registro):', resultado?.[0]);
    return resultado;
  },
};

export const workoutService = {
  getWeeklyProgram: (): Promise<WeeklyWorkoutDay[]> => simulateApiCall(mockWeeklyWorkoutProgram),
  getWorkoutAnalytics: (): Promise<WorkoutAnalytics> => simulateApiCall(mockWorkoutAnalytics),
  getWorkoutMetricsSummary: (): Promise<WorkoutMetricsSummary> => simulateApiCall(mockWorkoutMetricsSummary),
  getExerciseLoadHistory: (): Promise<ExerciseLoadHistory[]> => simulateApiCall(mockExerciseLoadHistory),
  getWeeklyCompletionHistory: (): Promise<WeeklyCompletionHistory[]> => simulateApiCall(mockWeeklyCompletionHistory),

  // Novos métodos para dados reais de treino
  async getMuscleGroupEvolution(alunoId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('view_grafico_anual_musculos')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_inicio_semana', { ascending: true }); // Changed from data_treino

    if (error) {
      console.error('Erro ao buscar evolução por grupo muscular:', JSON.stringify(error, null, 2));
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    return data || [];
  },

  async getExerciseOptions(alunoId: string) {
    const supabase = createClient();
    // Buscar exercícios únicos realizados pelo aluno
    const { data, error } = await supabase
      .from('view_historico_completo_treino')
      // distinct simulado via JS no cliente pois distinct select as vezes é chato no supabase-js sem RPC
      .select('exercicio_id, nome_exercicio')
      .eq('aluno_id', alunoId);

    if (error) {
      console.error('Erro ao buscar opções de exercícios:', JSON.stringify(error, null, 2));
      return [];
    }

    // Filtrar únicos pelo ID
    const uniqueExercises = new Map();
    (data || []).forEach((item: any) => {
      // Preferir nome_exercicio se disponível
      const name = item.nome_exercicio || "Exercício sem nome";
      if (!uniqueExercises.has(item.exercicio_id)) {
        uniqueExercises.set(item.exercicio_id, { id: item.exercicio_id, name });
      }
    });

    return Array.from(uniqueExercises.values());
  },

  async getExercisePerformance(alunoId: string, exercicioId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('view_historico_completo_treino')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('exercicio_id', exercicioId)
      .order('data_treino', { ascending: true });

    if (error) {
      console.error('Erro ao buscar desempenho dos exercícios:', JSON.stringify(error, null, 2));
      throw error;
    }

    return data || [];
  },

  async getFullWorkoutHistory(alunoId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('view_historico_completo_treino')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_treino', { ascending: true });

    if (error) {
      console.error('Erro ao buscar histórico completo:', JSON.stringify(error, null, 2));
      throw error;
    }

    return data || [];
  },

  async getTrainingFrequency(alunoId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vw_treino_resumo_semanal')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('semana_inicio', { ascending: false }); // Do mais recente para o mais antigo

    if (error) {
      console.error('Erro ao buscar frequência semanal:', JSON.stringify(error, null, 2));
      throw error;
    }

    return data || [];
  },

  async getMonthlyTrainingFrequency(alunoId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vw_treino_resumo_mensal')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('mes_inicio', { ascending: false });

    if (error) {
      console.error('Erro ao buscar frequência mensal:', JSON.stringify(error, null, 2));
      throw error;
    }

    return data || [];
  }
};

export const progressService = {
  getWeightHistory: (): Promise<WeightHistoryEntry[]> => simulateApiCall(mockWeightHistory),
  getProgressSummary: (): Promise<ProgressSummary> => simulateApiCall(mockProgressSummary),
  getBodyMetricsHistory: (): Promise<BodyMetricsHistoryEntry[]> => simulateApiCall(mockBodyMetricsHistory),
  getBodyMetricsSummary: (): Promise<BodyMetricsSummary> => simulateApiCall(mockBodyMetricsSummary),

  async getDashboardSummary(alunoId: string): Promise<ProgressSummary> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vw_dashboard_home')
      .select('*')
      .eq('aluno_id', alunoId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar resumo do dashboard:', error);
      throw error;
    }

    // Default values if no data or nulls
    const stats = data || {};

    // Calculate diet adherence approx (calories consumed vs goal)
    // Note: This is an approximation. A real adherence metric might be more complex.
    const calConsumed = parseFloat(stats.media_calorias_hoje || '0');
    const calGoal = parseFloat(stats.meta_calorias || '1'); // prevent div by zero
    const dietAdherence = calGoal > 0 ? Math.round((calConsumed / calGoal) * 100) : 0;

    return {
      weight: {
        current: parseFloat(stats.peso_atual || '0'),
        change: parseFloat(stats.variacao_peso_semana || '0')
      },
      training: {
        completed: parseInt(stats.treinos_executados || '0'),
        total: parseInt(stats.meta_treinos || '0')
      },
      diet: {
        adherence: dietAdherence
      },
      goal: {
        progress: 0 // Not in view yet
      }
    };
  }
};
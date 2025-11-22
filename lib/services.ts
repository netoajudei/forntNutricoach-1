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
  getProfile: async (): Promise<UserProfile> => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado.');
    }

    // Buscar id do aluno
    const { data: alunoRow, error: alunoError } = await supabase
      .from('alunos')
      .select('id, email, nome_completo, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (alunoError) {
      throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
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
      user.email ??
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

  getOnboardingData: async (): Promise<OnboardingData> => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado.');
    }

    const { data: alunoRow, error: alunoError } = await supabase
      .from('alunos')
      .select('id, nome_completo, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (alunoError) {
      throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
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

  getProfileNotes: async (): Promise<{ nutricionista: string; personal: string }> => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado.');
    }
    const { data: alunoRow, error: alunoError } = await supabase
      .from('alunos')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (alunoError) {
      throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
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

  updateProfileNotes: async (payload: { nutricionista?: string; personal?: string }): Promise<void> => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado.');
    }
    const { data: alunoRow, error: alunoError } = await supabase
      .from('alunos')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (alunoError) {
      throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
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
};

export const workoutService = {
  getWeeklyProgram: (): Promise<WeeklyWorkoutDay[]> => simulateApiCall(mockWeeklyWorkoutProgram),
  getWorkoutAnalytics: (): Promise<WorkoutAnalytics> => simulateApiCall(mockWorkoutAnalytics),
  getWorkoutMetricsSummary: (): Promise<WorkoutMetricsSummary> => simulateApiCall(mockWorkoutMetricsSummary),
  getExerciseLoadHistory: (): Promise<ExerciseLoadHistory[]> => simulateApiCall(mockExerciseLoadHistory),
  getWeeklyCompletionHistory: (): Promise<WeeklyCompletionHistory[]> => simulateApiCall(mockWeeklyCompletionHistory),
};

export const progressService = {
  getWeightHistory: (): Promise<WeightHistoryEntry[]> => simulateApiCall(mockWeightHistory),
  getProgressSummary: (): Promise<ProgressSummary> => simulateApiCall(mockProgressSummary),
  getBodyMetricsHistory: (): Promise<BodyMetricsHistoryEntry[]> => simulateApiCall(mockBodyMetricsHistory),
  getBodyMetricsSummary: (): Promise<BodyMetricsSummary> => simulateApiCall(mockBodyMetricsSummary),
};
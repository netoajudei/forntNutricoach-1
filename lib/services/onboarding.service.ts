import { createClient } from '@/lib/supabase/client';
import { OnboardingData } from '@/lib/types';

const sanitizeToArray = (value?: string): string[] =>
  (value ?? '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const toNullableString = (value?: string): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const toNullableNumber = (value?: string): number | null => {
  const parsed = value ? parseFloat(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

export const salvarOnboarding = async (data: OnboardingData) => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Usuário não autenticado.');
  }

  // Buscar o aluno usando auth_user_id e obter o id do registro
  const { data: aluno, error: alunoError } = await supabase
    .from('alunos')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (alunoError) {
    console.error('Erro ao buscar aluno:', alunoError);
    throw new Error(`Erro ao buscar aluno: ${alunoError.message}`);
  }

  if (!aluno || !aluno.id) {
    throw new Error('Aluno não encontrado. Por favor, complete o registro primeiro.');
  }

  // Usar o id do registro do aluno, não o auth_user_id
  const alunoId = aluno.id;

  // ============================================
  // 1. SALVAR SAÚDE E ROTINA
  // ============================================
  const condicoesMedicas = sanitizeToArray(data.saude.condicoesMedicas);
  const medicacoesEmUso = sanitizeToArray(data.saude.medicacoes);
  const alergias = sanitizeToArray(data.saude.alergias);

  // medicacoes_em_uso é Json, não array
  const medicacoesJson = medicacoesEmUso.length > 0
    ? { medicacoes: medicacoesEmUso }
    : null;

  const { error: saudeError } = await supabase
    .from('saude_e_rotina')
    .upsert(
      {
        aluno_id: alunoId,
        condicoes_medicas: condicoesMedicas.length > 0 ? condicoesMedicas : null,
        medicacoes_em_uso: medicacoesJson,
        alergias: alergias.length > 0 ? alergias : null,
        lesoes_limitacoes: data.lesoes.lesoesLimitacoes
          ? { descricao: data.lesoes.lesoesLimitacoes }
          : null,
        profissao: toNullableString(data.rotina.profissao),
        horario_acordar: toNullableString(data.rotina.horarioAcordar),
        horario_dormir: toNullableString(data.rotina.horarioDormir),
        sexo: toNullableString(data.dadosBasicos.sexo),
        data_nascimento: toNullableString(data.dadosBasicos.dataNascimento),
        altura_cm: toNullableNumber(data.medidasCorporais.altura),
      },
      { onConflict: 'aluno_id' },
    );

  if (saudeError) {
    throw new Error(`Erro ao salvar saúde e rotina: ${saudeError.message}`);
  }

  // ============================================
  // 2. SALVAR PREFERÊNCIAS ALIMENTARES
  // ============================================
  const alimentosNaoGosta = sanitizeToArray(
    data.preferenciasAlimentares.alimentosNaoGosta,
  );
  const alimentosFavoritos = sanitizeToArray(
    data.preferenciasAlimentares.alimentosFavoritos,
  );

  const { error: prefAlimentaresError } = await supabase
    .from('preferencias_alimentares')
    .upsert(
      {
        aluno_id: alunoId,
        restricoes_alimentares:
          data.preferenciasAlimentares.restricoes.length > 0
            ? data.preferenciasAlimentares.restricoes
            : null,
        alimentos_nao_gosta:
          alimentosNaoGosta.length > 0 ? alimentosNaoGosta : null,
        alimentos_favoritos:
          alimentosFavoritos.length > 0 ? alimentosFavoritos : null,
        disposicao_cozinhar: toNullableString(
          data.preferenciasAlimentares.disposicaoCozinhar,
        ),
        orcamento_alimentar: toNullableString(
          data.preferenciasAlimentares.orcamento,
        ),
      },
      { onConflict: 'aluno_id' },
    );

  if (prefAlimentaresError) {
    throw new Error(
      `Erro ao salvar preferências alimentares: ${prefAlimentaresError.message}`,
    );
  }

  // ============================================
  // 3. SALVAR PREFERÊNCIAS DE TREINO
  // ============================================
  // IMPORTANTE: dias_preferenciais_treino é string[], não number[]
  const { error: prefTreinoError } = await supabase
    .from('preferencias_treino')
    .upsert(
      {
        aluno_id: alunoId,
        local_treino: toNullableString(data.preferenciasTreino.local),
        equipamentos_disponiveis:
          data.preferenciasTreino.equipamentos.length > 0
            ? data.preferenciasTreino.equipamentos
            : null,
        experiencia_treino: toNullableString(
          data.preferenciasTreino.experiencia,
        ),
        dias_preferenciais_treino:
          data.preferenciasTreino.diasPreferenciais.length > 0
            ? data.preferenciasTreino.diasPreferenciais
            : null,
        horarios_preferenciais_treino:
          data.preferenciasTreino.horariosPreferenciais.length > 0
            ? data.preferenciasTreino.horariosPreferenciais
            : null,
      },
      { onConflict: 'aluno_id' },
    );

  if (prefTreinoError) {
    throw new Error(
      `Erro ao salvar preferências de treino: ${prefTreinoError.message}`,
    );
  }

  // ============================================
  // 4. SALVAR GOAL (META)
  // ============================================
  if (data.objetivo?.meta) {
    const valorInicial =
      toNullableNumber(data.objetivo.prazo) ||
      toNullableNumber(data.medidasCorporais.peso);
    const valorMeta = toNullableNumber(data.objetivo.motivacao);

    const { error: goalError } = await supabase.from('goals').insert({
      aluno_id: alunoId,
      metrica_primaria: 'peso_kg', // Campo obrigatório
      nome_meta: toNullableString(data.objetivo.meta),
      valor_inicial: valorInicial,
      valor_meta: valorMeta,
      motivacao_principal: toNullableString(data.objetivo.meta),
      data_inicio: new Date().toISOString().split('T')[0], // Campo obrigatório
      status: 'ativo', // Campo obrigatório
      is_cyclical: false,
      unidade: 'kg',
    });

    if (goalError && goalError.code !== '23505') {
      throw new Error(`Erro ao salvar objetivo: ${goalError.message}`);
    }
  }

  // ============================================
  // 5. SALVAR BODY_METRICS (MEDIDAS CORPORAIS)
  // ============================================
  const pesoAtual = toNullableNumber(data.medidasCorporais.peso);
  const alturaAtual = toNullableNumber(data.medidasCorporais.altura);
  const dataMedicao = toNullableString(data.medidasCorporais.data);

  // peso_kg e altura_cm são obrigatórios
  if (pesoAtual && alturaAtual) {
    const medidasJson: Record<string, number | null> = {
      pescoco: toNullableNumber(data.medidasCorporais.pescoco),
      braco_dir: toNullableNumber(data.medidasCorporais.bracoDireito),
      braco_esq: toNullableNumber(data.medidasCorporais.bracoEsquerdo),
      coxa_dir: toNullableNumber(data.medidasCorporais.coxaDireita),
      coxa_esq: toNullableNumber(data.medidasCorporais.coxaEsquerda),
      panturrilha_dir: toNullableNumber(
        data.medidasCorporais.panturrilhaDireita,
      ),
      panturrilha_esq: toNullableNumber(
        data.medidasCorporais.panturrilhaEsquerda,
      ),
    };

    // Remove valores null do JSON
    const medidasJsonLimpo = Object.fromEntries(
      Object.entries(medidasJson).filter(([_, v]) => v !== null),
    );

    const { error: metricsError } = await supabase.from('body_metrics').insert({
      aluno_id: alunoId,
      peso_kg: pesoAtual, // Obrigatório
      altura_cm: alturaAtual, // Obrigatório
      data_medicao: dataMedicao
        ? dataMedicao
        : new Date().toISOString().split('T')[0], // Obrigatório
      circunferencia_cintura_cm: toNullableNumber(
        data.medidasCorporais.cintura,
      ),
      circunferencia_quadril_cm: toNullableNumber(
        data.medidasCorporais.quadril,
      ),
      circunferencia_peito_cm: toNullableNumber(data.medidasCorporais.peito),
      circunferencia_pescoco_cm: toNullableNumber(
        data.medidasCorporais.pescoco,
      ),
      percentual_gordura: toNullableNumber(data.medidasCorporais.gordura),
      medidas_json: Object.keys(medidasJsonLimpo).length > 0 ? medidasJsonLimpo : null,
      notas: toNullableString(data.medidasCorporais.notas),
    });

    if (metricsError && metricsError.code !== '23505') {
      throw new Error(
        `Erro ao salvar métricas corporais: ${metricsError.message}`,
      );
    }
  }

  // ============================================
  // 6. MARCAR ONBOARDING COMO COMPLETO
  // ============================================
  const { error: updateError } = await supabase
    .from('alunos')
    .update({ is_onboarding_complete: true })
    .eq('id', alunoId);

  if (updateError) {
    throw new Error(`Erro ao finalizar onboarding: ${updateError.message}`);
  }

  return { success: true };
};

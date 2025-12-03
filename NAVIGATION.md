# Estratégia de Navegação e Impersonation

Este documento descreve os dois modos principais de navegação do sistema NutriCoach, detalhando como o sistema diferencia o acesso de alunos e profissionais.

## 1. Modo Aluno (Navegação Padrão)

Este é o modo de acesso direto, utilizado pelo usuário final (o aluno) quando faz login no sistema.

*   **Quem usa:** O aluno.
*   **Mecanismo:**
    *   O sistema identifica o usuário logado através do `auth_user_id` do Supabase Auth.
    *   O hook `useAlunoId` (em `lib/aluno.ts`) busca o registro na tabela `alunos` correspondente a este usuário.
    *   Todas as requisições de dados (perfil, dieta, treino) utilizam este ID de aluno.
*   **Experiência:**
    *   Visualização de dados pessoais.
    *   Acesso de leitura a instruções e planos.
    *   Sem acesso a ferramentas de edição ou painéis administrativos.

## 2. Modo Profissional (Impersonation / "Entrar como Aluno")

Este modo permite que Nutricionistas e Personal Trainers visualizem e editem os dados de um aluno específico, como se estivessem "vestindo a camisa" daquele aluno.

*   **Quem usa:** Nutricionistas e Personal Trainers.
*   **Mecanismo Técnico:**
    1.  **Ativação:** O profissional clica no botão "Entrar como aluno" na lista de alunos (`/profissional/alunos`).
    2.  **Persistência:** O sistema salva um estado de *impersonation* no `localStorage` do navegador.
        *   Isso indica: "O usuário autenticado é X (Profissional), mas o contexto de visualização é do Aluno Y".
    3.  **Resolução de ID:** O hook `useAlunoId` detecta este estado ativo no `localStorage`.
        *   Ele ignora o ID do usuário logado e retorna o ID do aluno alvo (Aluno Y).
    4.  **Serviços:** As funções de serviço (`userService`) recebem este ID de aluno (via parâmetro `targetAlunoId`) e buscam os dados correspondentes ao aluno, não ao profissional.
*   **Experiência:**
    *   **Visão do Aluno:** O profissional vê exatamente o que o aluno vê (perfil, dieta, treino).
    *   **Privilégios Elevados:** Em páginas específicas (como "Instruções do Nutricionista" ou "Instruções do Personal"), o sistema verifica se o usuário real é um profissional (via `isImpersonating` ou role check). Se sim, libera:
        *   Botões de edição.
        *   Ferramentas de IA.
        *   Opções de criação de planos.

## Resumo Técnico

| Componente | Modo Aluno | Modo Profissional (Impersonation) |
| :--- | :--- | :--- |
| **Autenticação** | Login direto | Login como Profissional |
| **`useAlunoId`** | Retorna ID do usuário logado | Retorna ID do aluno alvo (do `localStorage`) |
| **`userService`** | Busca dados do usuário logado | Busca dados do `targetAlunoId` fornecido |
| **Interface** | Somente Leitura | Leitura + Edição (onde aplicável) |

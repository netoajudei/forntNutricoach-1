# Configuração de Autenticação

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Você pode encontrar essas informações no dashboard do Supabase:
1. Vá para Settings > API
2. Copie a URL do projeto
3. Copie a chave `anon` `public`

## Como Funciona

### Estrutura de Autenticação

- **Cliente Browser**: `lib/supabase/client.ts` - Para uso em componentes client-side
- **Cliente Server**: `lib/supabase/server.ts` - Para uso em Server Components e Server Actions
- **Middleware**: `middleware.ts` - Protege rotas automaticamente

### Fluxo de Autenticação

1. **Registro**: Usuário cria conta em `/register` → redireciona para `/onboarding`
2. **Login**: Usuário faz login em `/login` → redireciona para `/dashboard`
3. **Proteção de Rotas**: Middleware verifica autenticação e redireciona não autenticados para `/login`
4. **Logout**: Botão "Sair" no layout faz signOut e redireciona para `/login`

### Rotas Protegidas

Todas as rotas dentro de `app/(app)/` são protegidas automaticamente pelo middleware.

Rotas públicas:
- `/login`
- `/register`
- `/onboarding`
- `/` (redireciona para `/login`)

### Próximos Passos

Após configurar as variáveis de ambiente:
1. Reinicie o servidor de desenvolvimento (`npm run dev`)
2. Teste o registro de um novo usuário
3. Teste o login
4. Verifique se as rotas protegidas funcionam corretamente




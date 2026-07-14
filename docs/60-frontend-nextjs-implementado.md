# LevelFit - Frontend Next.js Implementado

## Visao geral

O frontend do LevelFit foi implementado como uma aplicacao Next.js com App Router, React, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons e Recharts.

A rota `/` abre diretamente o dashboard real do produto. Não existe landing page no fluxo principal.

## Stack

- Next.js 16.
- React 19.
- TypeScript 5.9.
- Tailwind CSS 4.
- Framer Motion.
- Lucide Icons.
- Recharts.
- Prisma instalado no mesmo projeto para a futura integracao backend.

## Rotas implementadas

| Rota | Tela |
|---|---|
| `/` | Dashboard diário |
| `/missions` | Missões do dia |
| `/workouts` | Treino do dia e alternativas |
| `/workouts/session` | Sessão de treino interativa |
| `/nutrition` | Checklist e registros alimentares |
| `/hydration` | Meta e registros de água |
| `/progress` | Gráficos, medidas e fotos privadas |
| `/achievements` | Conquistas e badges |
| `/profile` | Perfil e objetivos |
| `/settings` | Configurações gerais |
| `/settings/security` | Sessoes e segurança da conta |
| `/settings/notifications` | Preferências e horário silencioso |
| `/notifications` | Central de notificações |
| `/login` | Login |
| `/register` | Cadastro |
| `/onboarding` | Onboarding em três etapas |

## Componentes principais

- `AppShell`: sidebar desktop, header e bottom navigation mobile.
- `Dashboard`: XP, streak, missões, treino, água, nutrição e grafico.
- `PageHeader`: titulo, contexto, busca e notificações.
- `ProgressRing`: indicador circular acessivel.
- `MissionsPage`: conclusao e modo leve.
- `WorkoutSessionPage`: cronometro e progresso por exercicio.
- `NutritionPage`: checklist e registro de refeição.
- `HydrationPage`: quick add e histórico.
- `ProgressPage`: Recharts e dados privados.
- `NotificationPreferencesPage`: toggles, timezone e quiet hours.
- `LoginPage`, `RegisterPage` e `OnboardingPage`.

## Dados mockados

Os dados ficam em `lib/mock-data.ts` e representam:

- Usuário, nível, XP e streak.
- Missões diárias.
- Exercícios e treino.
- Checklist alimentar.
- Atividade semanal e progresso.
- Conquistas e notificações.

Para integrar a API, substituir os imports de mocks por hooks de consulta. Os contratos esperados estão em `docs/40-backend-api-seguranca.md`.

## Design tokens

Os tokens estão em `app/globals.css`:

- Fundo: `#080B0F`.
- Superficie: `#10161D`.
- Superficie elevada: `#151D26`.
- Texto: `#F4F7FA`.
- Primária: `#B7FF2A`.
- Água: `#22D3EE`.
- Treino: `#FF6B3D`.
- Alimentação: `#38D979`.
- Conquistas: `#FACC15`.
- Recuperação: `#A78BFA`.

## Estados e interacoes

- Loading global com skeleton.
- Erro recuperavel.
- Pagina 404.
- Toast de missão e hidratação.
- Conclusao de missões.
- Quick add de água.
- Checklist alimentar.
- Cronometro de treino.
- Filtros de período.
- Toggles de notificação.
- Onboarding em etapas.

## Acessibilidade

- Navegacao semantica e `aria-current`.
- Skip link para o conteúdo.
- Foco visível.
- Alvos de toque com pelo menos 44 px.
- Labels nos campos e controles por icone.
- Suporte a `prefers-reduced-motion`.
- Contraste alto no tema escuro.
- Indicadores não dependem apenas de cor.

## Responsividade validada

- Desktop em 1270 px e 1430 px de largura util.
- Mobile em 380 px/390 px de largura util.
- Todas as rotas verificadas sem imagens quebradas.
- Overflows horizontais removidos.
- Sidebar desktop e bottom navigation mobile verificadas.
- Gráficos SVG verificados como não vazios.

## Estrutura principal

```txt
app/
  (app)/
    achievements/
    hydration/
    missions/
    notifications/
    nutrition/
    profile/
    progress/
    settings/
    workouts/
  (auth)/
    login/
    onboarding/
    register/
  error.tsx
  globals.css
  layout.tsx
  loading.tsx
  not-found.tsx
components/
  app-shell.tsx
  auth-pages.tsx
  dashboard.tsx
  feature-pages.tsx
  page-header.tsx
  progress-ring.tsx
lib/
  mock-data.ts
public/
  assets/
    pulse-companion.png
```

## Execucao

```bash
npm install
npm run dev
```

Validação:

```bash
npm run lint
npm run typecheck
npm run build
```

## Proximos passos técnicos

- Adicionar cliente HTTP tipado e TanStack Query.
- Trocar mocks pelos endpoints `/v1`.
- Implementar sessão real com access token em memória e refresh cookie seguro.
- Conectar upload assinado de fotos.
- Persistir preferências e eventos de gamificação.
- Adicionar testes de componentes e E2E.


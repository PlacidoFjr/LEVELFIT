# LevelFit

LevelFit e um web app fitness gamificado para treino, alimentacao, hidratacao, habitos saudaveis, XP, streaks, conquistas e evolucao corporal.

O produto deve motivar sem pressao toxica. Recaidas sao tratadas como parte natural do processo, sem incentivar dietas extremas, overtraining, automedicacao ou promessas irreais de resultado fisico.

## Documentos principais

- `docs/10-especificacao-produto.md`: estrategia de produto, publico, jornadas, MVP, gamificacao, retencao, monetizacao e roadmap.
- `docs/20-ui-ux-design-system.md`: identidade visual, telas, design system e recomendacoes para React/Next.js com Tailwind CSS.
- `docs/21-especificacao-de-telas-ui.md`: comportamento e composicao das telas principais do produto.
- `docs/30-banco-de-dados-postgresql.md`: modelo relacional, seguranca, migrations, retencao e indices.
- `docs/40-backend-api-seguranca.md`: backend, contratos REST, autenticacao, autorizacao, privacidade, deploy e observabilidade.
- `docs/50-notificacoes-jobs-retencao.md`: notificacoes internas, e-mails, filas, agendamentos, preferencias e Web Push futuro.
- `docs/60-frontend-nextjs-implementado.md`: rotas, componentes, mocks, tokens e validacao do frontend funcional.
- `docs/70-backend-nestjs-implementado.md`: API implementada, seguranca, endpoints, setup local e limites atuais do MVP.
- `docs/80-auditoria-seguranca.md`: controles verificados, testes de abuso e bloqueadores antes da producao.
- `prisma/schema.prisma`: schema inicial Prisma para PostgreSQL.
- `prisma.config.ts`: configuracao Prisma 7 para migrations e datasource.

## Stack recomendada para MVP

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
- Backend: NestJS com TypeScript, REST API, Prisma ORM, PostgreSQL.
- Jobs e notificacoes: BullMQ com Redis, workers separados e PostgreSQL como fonte de verdade dos agendamentos.
- E-mail: Resend no MVP; Postmark ou Amazon SES para escala.
- Storage: S3/R2/Supabase Storage para fotos de progresso, sempre com URLs assinadas.
- Observabilidade: Sentry, OpenTelemetry, logs estruturados e metricas de produto.

## Principios

- Saude antes de streak.
- Consistencia antes de perfeicao.
- Feedback positivo sem culpa.
- Privacidade como padrao.
- Gamificacao a servico do bem-estar, nao de compulsao.

## Executar o projeto

```bash
npm install
npm run infra:up
npm run db:migrate
npm run db:seed
npm run dev:api
```

Em outro terminal:

```bash
npm run dev
```

- App: `http://127.0.0.1:3000`
- API REST: `http://127.0.0.1:3001/v1`
- Swagger: `http://127.0.0.1:3001/docs`
- PostgreSQL: `localhost:5432`
- Redis LevelFit: `localhost:6380`

Copie `.env.example` para `.env` e troque todos os segredos antes de qualquer deploy. O arquivo `.env` local nao entra no Git.

## Validar

```bash
npm run lint
npm run typecheck
npm run build
npm run build:api
npm test -w @levelfit/api
```

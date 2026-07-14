# LevelFit

LevelFit é um web app fitness gamificado para treino, alimentação, hidratação, hábitos saudáveis, XP, streaks, conquistas e evolução corporal.

O produto deve motivar sem pressão tóxica. Recaídas são tratadas como parte natural do processo, sem incentivar dietas extremas, overtraining, automedicação ou promessas irreais de resultado físico.

## Documentos principais

- `docs/10-especificacao-produto.md`: estratégia de produto, público, jornadas, MVP, gamificação, retenção, monetização e roadmap.
- `docs/20-ui-ux-design-system.md`: identidade visual, telas, design system e recomendações para React/Next.js com Tailwind CSS.
- `docs/21-especificacao-de-telas-ui.md`: comportamento e composição das telas principais do produto.
- `docs/30-banco-de-dados-postgresql.md`: modelo relacional, segurança, migrations, retenção e índices.
- `docs/40-backend-api-seguranca.md`: backend, contratos REST, autenticação, autorização, privacidade, deploy e observabilidade.
- `docs/50-notificacoes-jobs-retencao.md`: notificações internas, e-mails, filas, agendamentos, preferências e Web Push futuro.
- `docs/60-frontend-nextjs-implementado.md`: rotas, componentes, mocks, tokens e validação do frontend funcional.
- `docs/70-backend-nestjs-implementado.md`: API implementada, segurança, endpoints, setup local e limites atuais do MVP.
- `docs/80-auditoria-seguranca.md`: controles verificados, testes de abuso e bloqueadores antes da produção.
- `prisma/schema.prisma`: schema inicial Prisma para PostgreSQL.
- `prisma.config.ts`: configuração Prisma 7 para migrations e datasource.

## Stack recomendada para MVP

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
- Backend: NestJS com TypeScript, REST API, Prisma ORM, PostgreSQL.
- Jobs e notificações: BullMQ com Redis, workers separados e PostgreSQL como fonte de verdade dos agendamentos.
- E-mail: Resend no MVP; Postmark ou Amazon SES para escala.
- Storage: S3/R2/Supabase Storage para fotos de progresso, sempre com URLs assinadas.
- Observabilidade: Sentry, OpenTelemetry, logs estruturados e métricas de produto.

## Princípios

- Saúde antes de streak.
- Consistência antes de perfeição.
- Feedback positivo sem culpa.
- Privacidade como padrão.
- Gamificação a serviço do bem-estar, não de compulsão.

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

Copie `.env.example` para `.env` e troque todos os segredos antes de qualquer deploy. O arquivo `.env` local não entra no Git.

## Validar

```bash
npm run lint
npm run typecheck
npm run build
npm run build:api
npm test -w @levelfit/api
```

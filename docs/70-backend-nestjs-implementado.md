# Backend NestJS implementado

## Decisao de API

O LevelFit usa uma API REST propria em NestJS e TypeScript. O frontend consome contratos sob `/v1`, sem acoplamento obrigatorio a Firebase ou Supabase. PostgreSQL e a fonte de verdade e Prisma 7 e a camada de acesso relacional.

Servicos externos entram por adapters: Resend para e-mail, S3/R2 para fotos privadas e Redis/BullMQ para filas. Nenhum desses provedores controla identidade ou dados centrais do produto.

## O que esta implementado

- Monorepo npm com frontend Next.js e `apps/api` em NestJS.
- PostgreSQL 17 e Redis 7 via Docker Compose.
- Migration inicial reproduzivel, incluindo extensao `citext`.
- Seed idempotente com treinos, exercicios, refeicoes, missoes, conquistas e templates.
- Cadastro, confirmacao de e-mail, login, logout local/global e recuperacao de senha.
- JWT de 10 minutos e refresh token opaco em cookie `HttpOnly` com rotacao, hash e deteccao de reuso.
- CSRF por double submit token no refresh, CORS com allowlist, Helmet, validacao estrita e rate limit.
- Perfil, consentimento para dados sensiveis, exportacao e exclusao de conta.
- Treinos, sessoes, alimentacao, hidratacao, missoes, XP, streaks e conquistas.
- Medidas corporais e metadados para upload futuro de fotos privadas.
- Central de notificacoes, preferencias e subscriptions push criptografadas.
- Health checks e Swagger.

## Endpoints

Base local: `http://127.0.0.1:3001/v1`.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `POST /auth/enable-2fa`
- `POST /auth/disable-2fa`

### Produto

- `GET|PATCH|DELETE /me`
- `GET /me/security-events`
- `POST /me/export-data`
- `GET|POST /workouts`
- `GET /workouts/today`
- `POST /workout-sessions`
- `PATCH /workout-sessions/:id`
- `GET /nutrition/goals`
- `GET /food-logs/today`
- `POST /food-logs`
- `GET /hydration/today`
- `POST /water-logs`
- `GET /missions/today`
- `PATCH /missions/:id/complete`
- `GET /xp`, `GET /streak`, `GET /achievements`
- `GET|POST /body-measurements`
- `POST /progress-photos`

### Notificacoes e operacao

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `GET|PATCH /notification-preferences`
- `POST /push/subscribe`
- `DELETE /push/unsubscribe`
- `POST /emails/test-preferences`
- `GET /health`, `GET /health/ready`

## Seguranca aplicada

- Argon2id com custo de memoria para senhas.
- Tokens de verificacao, reset e refresh armazenados somente como HMAC SHA-256.
- Endpoint e chaves Web Push cifrados com AES-256-GCM.
- IP e user agent reduzidos a hashes nos eventos de seguranca.
- Respostas de login e recuperacao evitam enumeracao de contas.
- Dados corporais exigem consentimento explicito.
- Ranking nasce desativado e depende de opt-in.
- Eventos de login, senha, sessoes, exportacao e exclusao ficam auditaveis.
- Fotos nao entram no banco; a API atual retorna apenas a intencao de upload futuro.

## Executar localmente

```bash
npm install
npm run infra:up
npm run db:migrate
npm run db:seed
npm run dev:api
```

O Redis do projeto usa a porta `6380` para evitar conflito com instalacoes locais em `6379`.

## Variaveis obrigatorias

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `TOKEN_HASH_SECRET`
- `WEB_ORIGIN`
- `API_PORT` e `API_HOST`
- `REDIS_URL`

Os segredos de exemplo servem apenas para desenvolvimento. Producao deve usar secret manager e valores aleatorios independentes.

## Proximas integracoes

- Cliente HTTP do frontend com renovacao de sessao.
- Resend e worker BullMQ para e-mails e lembretes.
- S3/R2 com upload assinado, leitura temporaria e remocao assicrona.
- MFA TOTP; os endpoints existem e retornam `501` ate o fluxo seguro ser concluido.
- Jobs de exportacao e exclusao com prazo LGPD.
- Sentry/OpenTelemetry e alertas de seguranca.
- Testes de contrato e E2E em banco isolado no CI.

## Validacao realizada

O smoke test local cobriu health check, cadastro, verificacao de e-mail, login, perfil, catalogo de treinos, missoes diarias, registro de agua, conclusao de missao, conclusao de treino, medida corporal, preferencias e consulta de XP. O fluxo encerrou com 90 XP creditados.

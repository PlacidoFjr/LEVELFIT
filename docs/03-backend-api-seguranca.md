# LevelFit - Parte Backend, API e Seguranca

## Papel solicitado

Atuar como arquiteto backend senior, especialista em Node.js, TypeScript, APIs seguras, autenticacao, autorizacao, OWASP, LGPD e seguranca de aplicacoes web.

## Contexto

O LevelFit e um app fitness gamificado com usuarios, treinos, alimentacao, hidratacao, XP, streaks, conquistas, notificacoes e dados sensiveis de saude.

## Stack sugerida

- Node.js.
- TypeScript.
- NestJS ou Next.js API routes.
- PostgreSQL.
- Prisma ORM ou Drizzle ORM.
- REST API.
- Redis opcional para filas, cache e rate limit.

## Entregaveis solicitados

1. Arquitetura geral.
2. Estrutura de pastas.
3. Modulos principais.
4. Estrategia de autenticacao.
5. Estrategia de autorizacao.
6. Seguranca de senhas.
7. Sessoes e tokens.
8. Refresh token rotation.
9. Verificacao de e-mail.
10. Recuperacao de senha.
11. MFA/2FA opcional.
12. Rate limiting.
13. Protecao contra brute force.
14. Protecao contra CSRF.
15. Protecao contra XSS.
16. Protecao contra SQL Injection.
17. Validacao e sanitizacao de entrada.
18. Logs de auditoria.
19. Monitoramento de seguranca.
20. Politica de CORS.
21. Tratamento de erros.
22. Observabilidade.
23. Testes.
24. Deploy.

## Requisitos minimos

- HTTPS obrigatorio.
- Senhas com hash Argon2id ou bcrypt com salt.
- Nunca armazenar senha em texto puro.
- JWT de curta duracao.
- Refresh token com rotacao.
- Refresh token armazenado com seguranca.
- Tokens sensiveis devem ser hasheados no banco.
- Logout global de dispositivos.
- Registro de dispositivos conectados.
- Alertas para login suspeito.
- Auditoria para alteracoes criticas na conta.
- Consentimento explicito para dados sensiveis.
- Exportacao e exclusao de dados do usuario.

## Endpoints principais

### Auth

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/verify-email
- POST /auth/enable-2fa
- POST /auth/disable-2fa

### Usuario

- GET /me
- PATCH /me
- DELETE /me
- GET /me/security-events
- POST /me/export-data

### Treino

- GET /workouts
- POST /workouts
- GET /workouts/today
- POST /workout-sessions
- PATCH /workout-sessions/:id

### Alimentacao

- GET /nutrition/goals
- POST /food-logs
- GET /food-logs/today

### Agua

- GET /hydration/today
- POST /water-logs

### Gamificacao

- GET /missions/today
- PATCH /missions/:id/complete
- GET /xp
- GET /streak
- GET /achievements

### Progresso

- POST /body-measurements
- GET /body-measurements
- POST /progress-photos

## Definicao exigida por endpoint

- Payload.
- Resposta.
- Validacao.
- Permissoes.
- Possiveis erros.
- Rate limit.
- Regras de seguranca.

## Entrega adicional

- Recomendacoes de implementacao segura para MVP.

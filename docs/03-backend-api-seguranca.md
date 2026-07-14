# LevelFit - Parte Backend, API e Segurança

## Papel solicitado

Atuar como arquiteto backend sênior, especialista em Node.js, TypeScript, APIs seguras, autenticação, autorização, OWASP, LGPD e segurança de aplicacoes web.

## Contexto

O LevelFit é um app fitness gamificado com usuários, treinos, alimentação, hidratação, XP, streaks, conquistas, notificações e dados sensíveis de saúde.

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
4. Estratégia de autenticação.
5. Estratégia de autorização.
6. Segurança de senhas.
7. Sessoes e tokens.
8. Refresh token rotation.
9. Verificação de e-mail.
10. Recuperação de senha.
11. MFA/2FA opcional.
12. Rate limiting.
13. Protecao contra brute force.
14. Protecao contra CSRF.
15. Protecao contra XSS.
16. Protecao contra SQL Injection.
17. Validação e sanitização de entrada.
18. Logs de auditoria.
19. Monitoramento de segurança.
20. Política de CORS.
21. Tratamento de erros.
22. Observabilidade.
23. Testes.
24. Deploy.

## Requisitos minimos

- HTTPS obrigatório.
- Senhas com hash Argon2id ou bcrypt com salt.
- Nunca armazenar senha em texto puro.
- JWT de curta duracao.
- Refresh token com rotação.
- Refresh token armazenado com segurança.
- Tokens sensíveis devem ser hasheados no banco.
- Logout global de dispositivos.
- Registro de dispositivos conectados.
- Alertas para login suspeito.
- Auditoria para alterações críticas na conta.
- Consentimento explicito para dados sensíveis.
- Exportação e exclusão de dados do usuário.

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

### Usuário

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

### Alimentação

- GET /nutrition/goals
- POST /food-logs
- GET /food-logs/today

### Água

- GET /hydration/today
- POST /water-logs

### Gamificação

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
- Validação.
- Permissoes.
- Possíveis erros.
- Rate limit.
- Regras de segurança.

## Entrega adicional

- Recomendações de implementação segura para MVP.

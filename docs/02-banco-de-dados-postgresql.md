# LevelFit - Parte Banco de Dados PostgreSQL

## Papel solicitado

Atuar como arquiteto de banco de dados sênior, especialista em PostgreSQL, modelagem relacional, segurança de dados e aplicacoes SaaS.

## Contexto

O LevelFit é um app fitness gamificado para treino, alimentação, hidratação, hábitos saudáveis, XP, streaks, conquistas, notificações e evolução corporal.

PostgreSQL deve ser usado como banco principal.

## Entregaveis solicitados

1. Visao geral da modelagem.
2. Entidades principais.
3. Relacionamentos.
4. Diagrama lógico textual.
5. Tabelas com campos, tipos, chaves e restrições.
6. Índices recomendados.
7. Estratégia de migrations.
8. Estratégia de seeds.
9. Estratégia de soft delete.
10. Estratégia de auditoria.
11. Estratégia de backup.
12. Estratégia de retenção de dados.
13. Cuidados com dados sensíveis.
14. Recomendações para Prisma ORM ou Drizzle ORM.

## Tabelas obrigatorias

- users
- user_profiles
- auth_accounts
- sessions
- refresh_tokens
- password_reset_tokens
- email_verification_tokens
- user_security_events
- workouts
- exercises
- workout_plans
- workout_sessions
- workout_session_exercises
- meals
- food_logs
- nutrition_goals
- water_logs
- hydration_goals
- daily_missions
- user_missions
- xp_events
- user_levels
- achievements
- user_achievements
- streaks
- body_measurements
- progress_photos
- notifications
- notification_preferences
- email_logs
- push_subscriptions
- scheduled_notifications
- notification_templates
- user_preferences
- subscriptions
- payments
- audit_logs

## Definicao exigida por tabela

- Nome da tabela.
- Objetivo.
- Campos.
- Tipo de cada campo.
- Chave primária.
- Chaves estrangeiras.
- Índices.
- Constraints.
- Campos created_at e updated_at.
- Soft delete quando fizer sentido.

## Regras de segurança e privacidade

- Dados de saúde devem ser tratados como sensíveis.
- Fotos de progresso devem ser armazenadas fora do banco, usando storage seguro, e o banco deve guardar apenas metadados e URL segura.
- Nunca armazenar senhas em texto puro.
- Tokens devem ser armazenados com hash quando necessário.
- Rankings devem ser opt-in.
- Logs devem evitar conteúdo sensível desnecessário.

## Entrega adicional

- Schema inicial em Prisma ou SQL.

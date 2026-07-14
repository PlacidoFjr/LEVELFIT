# LevelFit - Parte Banco de Dados PostgreSQL

## Papel solicitado

Atuar como arquiteto de banco de dados senior, especialista em PostgreSQL, modelagem relacional, seguranca de dados e aplicacoes SaaS.

## Contexto

O LevelFit e um app fitness gamificado para treino, alimentacao, hidratacao, habitos saudaveis, XP, streaks, conquistas, notificacoes e evolucao corporal.

PostgreSQL deve ser usado como banco principal.

## Entregaveis solicitados

1. Visao geral da modelagem.
2. Entidades principais.
3. Relacionamentos.
4. Diagrama logico textual.
5. Tabelas com campos, tipos, chaves e restricoes.
6. Indices recomendados.
7. Estrategia de migrations.
8. Estrategia de seeds.
9. Estrategia de soft delete.
10. Estrategia de auditoria.
11. Estrategia de backup.
12. Estrategia de retencao de dados.
13. Cuidados com dados sensiveis.
14. Recomendacoes para Prisma ORM ou Drizzle ORM.

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
- Chave primaria.
- Chaves estrangeiras.
- Indices.
- Constraints.
- Campos created_at e updated_at.
- Soft delete quando fizer sentido.

## Regras de seguranca e privacidade

- Dados de saude devem ser tratados como sensiveis.
- Fotos de progresso devem ser armazenadas fora do banco, usando storage seguro, e o banco deve guardar apenas metadados e URL segura.
- Nunca armazenar senhas em texto puro.
- Tokens devem ser armazenados com hash quando necessario.
- Rankings devem ser opt-in.
- Logs devem evitar conteudo sensivel desnecessario.

## Entrega adicional

- Schema inicial em Prisma ou SQL.

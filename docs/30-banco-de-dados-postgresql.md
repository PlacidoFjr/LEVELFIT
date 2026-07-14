# LevelFit - Banco de Dados PostgreSQL

## 1. Visao geral da modelagem

O banco do LevelFit deve sustentar cinco dominios principais:

- Identidade, autenticacao e seguranca.
- Perfil, preferencias e consentimento.
- Fitness, alimentacao, hidratacao e progresso corporal.
- Gamificacao, XP, streaks, missoes e conquistas.
- Notificacoes, pagamentos, auditoria e operacao.

PostgreSQL e recomendado como banco principal por oferecer consistencia transacional, bons indices, JSONB quando necessario, constraints fortes e extensoes uteis como `pgcrypto` para UUID.

Principios:

- Dados de saude sao sensiveis.
- Tokens sensiveis devem ser guardados como hash.
- Fotos ficam fora do banco, em storage seguro.
- Logs nao devem guardar conteudo sensivel desnecessario.
- Rankings e exposicao social devem ser opt-in.
- Toda tabela operacional relevante deve ter `created_at` e `updated_at`.
- Soft delete deve ser usado para dados de dominio que podem precisar de recuperacao ou auditoria.

## 2. Entidades principais

Identidade:

- `users`
- `user_profiles`
- `auth_accounts`
- `sessions`
- `refresh_tokens`
- `password_reset_tokens`
- `email_verification_tokens`
- `user_security_events`

Fitness e saude:

- `workouts`
- `exercises`
- `workout_plans`
- `workout_sessions`
- `workout_session_exercises`
- `meals`
- `food_logs`
- `nutrition_goals`
- `water_logs`
- `hydration_goals`
- `body_measurements`
- `progress_photos`

Gamificacao:

- `daily_missions`
- `user_missions`
- `xp_events`
- `user_levels`
- `achievements`
- `user_achievements`
- `streaks`

Notificacoes:

- `notifications`
- `notification_preferences`
- `email_logs`
- `push_subscriptions`
- `scheduled_notifications`
- `notification_templates`

Conta, monetizacao e auditoria:

- `user_preferences`
- `subscriptions`
- `payments`
- `audit_logs`

## 3. Relacionamentos

- Um `user` possui um `user_profile`, uma configuracao de preferencias e uma configuracao de notificacoes.
- Um `user` possui varias sessoes, refresh tokens, eventos de seguranca, missoes, registros de XP, conquistas, streaks, medidas e fotos.
- `workout_plans` agrupam `workouts`.
- `workouts` se relacionam com `exercises` por uma tabela de juncao no schema Prisma: `workout_exercises`.
- `workout_sessions` registram execucoes reais de treino por usuario.
- `workout_session_exercises` registram execucoes de exercicios dentro de uma sessao.
- `daily_missions` sao templates de missoes.
- `user_missions` sao instancias diarias atribuidadas ao usuario.
- `xp_events` devem ser idempotentes por evento de origem.
- `notifications`, `scheduled_notifications` e `email_logs` devem ser rastreaveis e respeitar preferencias.

## 4. Diagrama logico textual

```txt
users
  1--1 user_profiles
  1--1 user_preferences
  1--1 notification_preferences
  1--N auth_accounts
  1--N sessions
  1--N refresh_tokens
  1--N user_security_events
  1--N workout_sessions
  1--N food_logs
  1--N water_logs
  1--N user_missions
  1--N xp_events
  1--N user_achievements
  1--N streaks
  1--N body_measurements
  1--N progress_photos
  1--N notifications
  1--N subscriptions
  1--N payments
  1--N audit_logs

workout_plans
  1--N workouts

workouts
  N--N exercises via workout_exercises
  1--N workout_sessions

daily_missions
  1--N user_missions

achievements
  1--N user_achievements
```

## 5. Tabelas

### users

Objetivo: identidade principal da conta.

Campos:

- `id uuid pk`
- `email citext unique not null`
- `password_hash text null`
- `email_verified_at timestamptz null`
- `status user_status not null default active`
- `sensitive_data_consent_at timestamptz null`
- `terms_accepted_at timestamptz null`
- `marketing_opt_in boolean default false`
- `ranking_opt_in boolean default false`
- `last_login_at timestamptz null`
- `created_at timestamptz`
- `updated_at timestamptz`
- `deleted_at timestamptz null`

Indices:

- unique `email`
- `status`
- `deleted_at`

Constraints:

- `email` obrigatorio.
- `password_hash` nunca deve receber senha em texto puro.

### user_profiles

Objetivo: dados de perfil e contexto fitness.

Campos:

- `id uuid pk`
- `user_id uuid unique fk users`
- `display_name varchar(120)`
- `birth_date date null`
- `gender varchar(40) null`
- `height_cm numeric(5,2) null`
- `fitness_goal fitness_goal null`
- `activity_level activity_level null`
- `avatar_url text null`
- `timezone varchar(80) default UTC`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- unique `user_id`
- `fitness_goal`

Cuidados:

- Data de nascimento, altura e objetivo sao dados sensiveis contextuais.

### auth_accounts

Objetivo: contas de login por provedor.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `provider varchar(40)`
- `provider_account_id varchar(160)`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- unique `(provider, provider_account_id)`
- `user_id`

### sessions

Objetivo: sessoes e dispositivos conectados.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `device_name varchar(160) null`
- `ip_hash text null`
- `user_agent_hash text null`
- `last_seen_at timestamptz`
- `revoked_at timestamptz null`
- `created_at`, `updated_at`

Indices:

- `user_id`
- `(user_id, revoked_at)`

### refresh_tokens

Objetivo: refresh token rotation.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `session_id uuid fk sessions`
- `token_hash text unique`
- `family_id uuid`
- `expires_at timestamptz`
- `rotated_at timestamptz null`
- `revoked_at timestamptz null`
- `created_at`, `updated_at`

Indices:

- unique `token_hash`
- `(user_id, session_id)`
- `family_id`
- `expires_at`

### password_reset_tokens

Objetivo: recuperacao de senha.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `token_hash text unique`
- `expires_at timestamptz`
- `used_at timestamptz null`
- `created_at`, `updated_at`

### email_verification_tokens

Objetivo: verificacao de e-mail.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `token_hash text unique`
- `expires_at timestamptz`
- `used_at timestamptz null`
- `created_at`, `updated_at`

### user_security_events

Objetivo: trilha de eventos de seguranca.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `type security_event_type`
- `ip_hash text null`
- `user_agent_hash text null`
- `metadata jsonb default {}`
- `created_at timestamptz`

Indices:

- `(user_id, created_at desc)`
- `type`

### workouts

Objetivo: templates de treinos.

Campos:

- `id uuid pk`
- `plan_id uuid null fk workout_plans`
- `title varchar(160)`
- `description text null`
- `difficulty workout_difficulty`
- `estimated_minutes int`
- `category workout_category`
- `is_public boolean default false`
- `created_by_user_id uuid null fk users`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `difficulty`
- `category`
- `plan_id`

### exercises

Objetivo: biblioteca de exercicios.

Campos:

- `id uuid pk`
- `name varchar(160)`
- `muscle_group varchar(80)`
- `equipment varchar(80) null`
- `instructions text null`
- `safety_notes text null`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `name`
- `muscle_group`

### workout_plans

Objetivo: planos agrupadores de treinos.

Campos:

- `id uuid pk`
- `title varchar(160)`
- `description text null`
- `goal fitness_goal null`
- `level activity_level null`
- `created_at`, `updated_at`, `deleted_at`

### workout_sessions

Objetivo: execucao real de um treino pelo usuario.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `workout_id uuid fk workouts`
- `started_at timestamptz`
- `completed_at timestamptz null`
- `status session_status`
- `perceived_effort int null`
- `notes text null`
- `xp_awarded int default 0`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, started_at desc)`
- `status`

### workout_session_exercises

Objetivo: exercicios executados em uma sessao.

Campos:

- `id uuid pk`
- `session_id uuid fk workout_sessions`
- `exercise_id uuid fk exercises`
- `sets_completed int default 0`
- `reps_completed int null`
- `weight_kg numeric(6,2) null`
- `duration_seconds int null`
- `status session_exercise_status`
- `created_at`, `updated_at`

Indices:

- `session_id`
- `exercise_id`

### meals

Objetivo: categorias de refeicoes.

Campos:

- `id uuid pk`
- `name varchar(80)`
- `sort_order int`
- `created_at`, `updated_at`

Seeds:

- cafe da manha, almoco, lanche, jantar, ceia.

### food_logs

Objetivo: registros alimentares do usuario.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `meal_id uuid null fk meals`
- `logged_at timestamptz`
- `description text null`
- `has_protein boolean null`
- `has_fruit_or_vegetable boolean null`
- `avoided_skipping_meal boolean null`
- `mindful_choice boolean null`
- `calories int null`
- `protein_g numeric(6,2) null`
- `carbs_g numeric(6,2) null`
- `fat_g numeric(6,2) null`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, logged_at desc)`
- `meal_id`

Cuidados:

- Macros e calorias devem ser opcionais no MVP.

### nutrition_goals

Objetivo: metas alimentares.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `daily_calories int null`
- `protein_g numeric(6,2) null`
- `carbs_g numeric(6,2) null`
- `fat_g numeric(6,2) null`
- `checklist_goal_count int default 3`
- `starts_on date`
- `ends_on date null`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, starts_on desc)`

### water_logs

Objetivo: registros de agua.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `amount_ml int`
- `logged_at timestamptz`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, logged_at desc)`

Constraint:

- `amount_ml > 0`.

### hydration_goals

Objetivo: meta diaria de hidratacao.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `daily_goal_ml int`
- `starts_on date`
- `ends_on date null`
- `created_at`, `updated_at`, `deleted_at`

Constraint:

- `daily_goal_ml between 500 and 6000`.

### daily_missions

Objetivo: templates de missoes.

Campos:

- `id uuid pk`
- `key varchar(120) unique`
- `title varchar(160)`
- `description text`
- `type mission_type`
- `xp_reward int`
- `is_active boolean default true`
- `created_at`, `updated_at`, `deleted_at`

### user_missions

Objetivo: missoes atribuidas a um usuario em uma data.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `daily_mission_id uuid fk daily_missions`
- `mission_date date`
- `status mission_status`
- `completed_at timestamptz null`
- `expires_at timestamptz null`
- `xp_awarded int default 0`
- `source_ref_type varchar(60) null`
- `source_ref_id uuid null`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- unique `(user_id, daily_mission_id, mission_date)`
- `(user_id, mission_date)`
- `status`

### xp_events

Objetivo: ledger de XP.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `amount int`
- `reason xp_reason`
- `source_ref_type varchar(60) null`
- `source_ref_id uuid null`
- `idempotency_key varchar(180) unique`
- `created_at timestamptz`

Indices:

- `(user_id, created_at desc)`
- unique `idempotency_key`

Constraint:

- `amount > 0`.

### user_levels

Objetivo: snapshot de nivel do usuario.

Campos:

- `id uuid pk`
- `user_id uuid unique fk users`
- `level int default 1`
- `total_xp int default 0`
- `current_level_xp int default 0`
- `next_level_xp int default 100`
- `created_at`, `updated_at`

### achievements

Objetivo: catalogo de conquistas.

Campos:

- `id uuid pk`
- `key varchar(120) unique`
- `name varchar(160)`
- `description text`
- `category achievement_category`
- `rarity achievement_rarity`
- `xp_reward int default 0`
- `is_active boolean default true`
- `created_at`, `updated_at`, `deleted_at`

### user_achievements

Objetivo: conquistas desbloqueadas.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `achievement_id uuid fk achievements`
- `unlocked_at timestamptz`
- `created_at`, `updated_at`

Indices:

- unique `(user_id, achievement_id)`

### streaks

Objetivo: sequencias saudaveis por tipo.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `type streak_type`
- `current_count int default 0`
- `best_count int default 0`
- `last_counted_date date null`
- `shield_count int default 0`
- `status streak_status`
- `created_at`, `updated_at`

Indices:

- unique `(user_id, type)`

### body_measurements

Objetivo: medidas corporais historicas.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `measured_at timestamptz`
- `weight_kg numeric(6,2) null`
- `waist_cm numeric(6,2) null`
- `hip_cm numeric(6,2) null`
- `chest_cm numeric(6,2) null`
- `arm_cm numeric(6,2) null`
- `thigh_cm numeric(6,2) null`
- `notes text null`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, measured_at desc)`

Cuidados:

- Dado sensivel. Evitar expor em notificacoes e logs.

### progress_photos

Objetivo: metadados de fotos de progresso.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `storage_key text`
- `signed_url_expires_at timestamptz null`
- `pose varchar(60) null`
- `taken_at timestamptz`
- `content_type varchar(80)`
- `size_bytes int`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, taken_at desc)`

Cuidados:

- Banco nao guarda o arquivo nem URL publica permanente.

### notifications

Objetivo: notificacoes internas.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `type notification_type`
- `title varchar(160)`
- `body text`
- `action_url text null`
- `read_at timestamptz null`
- `metadata jsonb default {}`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, created_at desc)`
- `(user_id, read_at)`

### notification_preferences

Objetivo: preferencias de notificacao.

Campos:

- `id uuid pk`
- `user_id uuid unique fk users`
- `email_enabled boolean default true`
- `push_enabled boolean default false`
- `water_reminders_enabled boolean default true`
- `workout_reminders_enabled boolean default true`
- `nutrition_reminders_enabled boolean default true`
- `streak_reminders_enabled boolean default true`
- `weekly_summary_enabled boolean default true`
- `preferred_workout_time time null`
- `water_reminder_interval_minutes int default 120`
- `streak_risk_time time default 20:00`
- `quiet_hours_start time null`
- `quiet_hours_end time null`
- `silent_days int[] default []`
- `timezone varchar(80) default UTC`
- `created_at`, `updated_at`

### email_logs

Objetivo: rastrear envios de e-mail sem guardar conteudo sensivel.

Campos:

- `id uuid pk`
- `user_id uuid null fk users`
- `template_key varchar(120)`
- `provider varchar(60)`
- `provider_message_id varchar(180) null`
- `recipient_hash text`
- `status delivery_status`
- `error_code varchar(120) null`
- `sent_at timestamptz null`
- `created_at`, `updated_at`

Indices:

- `(user_id, created_at desc)`
- `provider_message_id`
- `status`

### push_subscriptions

Objetivo: endpoints Web Push futuros.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `endpoint_hash text unique`
- `endpoint_encrypted text`
- `p256dh_encrypted text`
- `auth_encrypted text`
- `user_agent_hash text null`
- `revoked_at timestamptz null`
- `created_at`, `updated_at`

### scheduled_notifications

Objetivo: agenda de notificacoes e e-mails.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `type notification_type`
- `channel notification_channel`
- `scheduled_for timestamptz`
- `status scheduled_status`
- `idempotency_key varchar(180) unique`
- `payload jsonb default {}`
- `sent_at timestamptz null`
- `cancelled_at timestamptz null`
- `created_at`, `updated_at`

Indices:

- `(status, scheduled_for)`
- `(user_id, scheduled_for desc)`

### notification_templates

Objetivo: templates versionados.

Campos:

- `id uuid pk`
- `key varchar(120)`
- `channel notification_channel`
- `subject varchar(180) null`
- `title varchar(160)`
- `body text`
- `version int default 1`
- `is_active boolean default true`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- unique `(key, channel, version)`

### user_preferences

Objetivo: preferencias gerais do usuario.

Campos:

- `id uuid pk`
- `user_id uuid unique fk users`
- `language varchar(10) default pt-BR`
- `unit_system unit_system default metric`
- `theme theme_preference default dark`
- `reduced_motion boolean default false`
- `created_at`, `updated_at`

### subscriptions

Objetivo: assinatura premium.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `provider payment_provider`
- `provider_subscription_id varchar(180) null`
- `status subscription_status`
- `plan_key varchar(80)`
- `current_period_start timestamptz null`
- `current_period_end timestamptz null`
- `cancel_at_period_end boolean default false`
- `created_at`, `updated_at`, `deleted_at`

Indices:

- `(user_id, status)`
- unique `(provider, provider_subscription_id)`

### payments

Objetivo: historico de pagamentos.

Campos:

- `id uuid pk`
- `user_id uuid fk users`
- `subscription_id uuid null fk subscriptions`
- `provider payment_provider`
- `provider_payment_id varchar(180) null`
- `amount_cents int`
- `currency char(3)`
- `status payment_status`
- `paid_at timestamptz null`
- `created_at`, `updated_at`

Indices:

- `(user_id, created_at desc)`
- unique `(provider, provider_payment_id)`

### audit_logs

Objetivo: auditoria de acoes sensiveis.

Campos:

- `id uuid pk`
- `actor_user_id uuid null fk users`
- `target_user_id uuid null fk users`
- `action varchar(120)`
- `entity_type varchar(120)`
- `entity_id uuid null`
- `ip_hash text null`
- `user_agent_hash text null`
- `metadata jsonb default {}`
- `created_at timestamptz`

Indices:

- `(target_user_id, created_at desc)`
- `(actor_user_id, created_at desc)`
- `action`

## 6. Indices recomendados

Priorizar:

- Busca por usuario + data em registros diarios.
- Unicidade de tokens hasheados.
- Idempotencia em XP e notificacoes agendadas.
- Sessoes ativas por usuario.
- Missoes do dia por usuario.
- Notificacoes nao lidas por usuario.

Indices criticos:

- `users.email`
- `refresh_tokens.token_hash`
- `password_reset_tokens.token_hash`
- `email_verification_tokens.token_hash`
- `user_missions(user_id, mission_date)`
- `xp_events(user_id, created_at)`
- `water_logs(user_id, logged_at)`
- `food_logs(user_id, logged_at)`
- `workout_sessions(user_id, started_at)`
- `notifications(user_id, read_at)`
- `scheduled_notifications(status, scheduled_for)`

## 7. Estrategia de migrations

Recomendacao para MVP:

- Usar Prisma Migrate.
- Toda alteracao de schema deve virar migration versionada.
- Nunca editar migration ja aplicada em ambiente compartilhado.
- Rodar migrations em CI antes do deploy.
- Separar migrations destrutivas em duas etapas:
  1. adicionar campo novo e migrar dados.
  2. remover campo antigo em release posterior.

Ambientes:

- `dev`: migrations frequentes.
- `staging`: simula producao.
- `prod`: migrations revisadas e com backup antes.

## 8. Estrategia de seeds

Seeds iniciais:

- Refeicoes padrao em `meals`.
- Exercicios basicos em `exercises`.
- Plano inicial de treino.
- Missoes diarias padrao.
- Conquistas basicas.
- Templates de notificacao.

Cuidados:

- Seeds devem ser idempotentes via `upsert`.
- Nunca seedar dados reais de usuarios.

## 9. Estrategia de soft delete

Usar `deleted_at` em:

- users
- user_profiles
- workouts
- exercises
- workout_plans
- workout_sessions
- food_logs
- nutrition_goals
- water_logs
- hydration_goals
- user_missions
- achievements
- body_measurements
- progress_photos
- notifications
- notification_templates
- subscriptions

Nao usar soft delete em:

- tokens efemeros.
- logs de auditoria.
- eventos de XP.
- eventos de seguranca.

## 10. Estrategia de auditoria

Auditar:

- Login suspeito.
- Alteracao de e-mail.
- Alteracao de senha.
- Ativacao/desativacao de 2FA.
- Exportacao de dados.
- Solicitacao de exclusao de conta.
- Revogacao global de sessoes.
- Alteracoes em consentimento.

Evitar:

- Gravar peso, medidas, fotos, alimentos detalhados ou conteudo privado em logs.

## 11. Estrategia de backup

MVP:

- Backup diario automatizado.
- Retencao minima de 30 dias.
- Teste mensal de restore.
- Criptografia em repouso.
- Controle de acesso minimo.

Escala:

- PITR, point-in-time recovery.
- Backup antes de migrations destrutivas.
- Replica de leitura se necessario.

## 12. Estrategia de retencao de dados

Regras iniciais:

- Tokens expirados: limpar apos 30 dias.
- Sessoes revogadas: reter por 180 dias para seguranca.
- Email logs: reter por 180 a 365 dias, sem conteudo sensivel.
- Audit logs: reter por 2 a 5 anos conforme necessidade juridica.
- Dados de saude: manter enquanto a conta existir ou ate exclusao solicitada.
- Conta excluida: anonimizar ou remover dados pessoais conforme LGPD.

## 13. Cuidados com dados sensiveis

- Usar HTTPS sempre.
- Criptografar storage de fotos.
- Usar URLs assinadas com expiracao curta.
- Hash para IP, user agent, tokens e destinatarios quando possivel.
- Controle de acesso por usuario em todos os recursos.
- Consentimento explicito antes de coletar dados corporais.
- Exportacao e exclusao de dados disponiveis ao usuario.
- Rankings apenas opt-in.

## 14. Prisma ou Drizzle

Recomendacao para MVP: Prisma ORM.

Motivos:

- Schema legivel.
- Migrations integradas.
- Boa produtividade com TypeScript.
- Tipagem forte para o backend.
- Ecossistema maduro com NestJS.

Drizzle e uma alternativa excelente se o time quiser mais controle SQL e queries mais explicitas, mas Prisma tende a acelerar o MVP.

Arquivos iniciais:

- `prisma/schema.prisma`
- `prisma.config.ts`

Observacao:

- Em Prisma 7, a URL do banco fica em `prisma.config.ts`, nao dentro do `schema.prisma`. O schema deste projeto ja segue esse formato.

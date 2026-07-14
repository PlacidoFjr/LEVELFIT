# LevelFit - Notificacoes, E-mail, Jobs e Retencao

## 1. Decisao recomendada para o MVP

O LevelFit deve comecar com duas camadas ativas:

1. Central de notificacoes interna para eventos de produto e progresso.
2. E-mail para mensagens transacionais, seguranca e lembretes de alto valor escolhidos pelo usuario.

Web Push entra em uma fase posterior, depois de medir a utilidade dos lembretes internos e por e-mail. O backend ja deve manter contratos e tabelas preparados para push, mas a permissao do navegador nao deve ser solicitada no onboarding inicial.

Stack recomendada:

- BullMQ com Redis para filas, atrasos, retries e workers.
- PostgreSQL como fonte de verdade de agendamentos e preferencias.
- Resend como primeiro provedor de e-mail, isolado por uma interface `EmailProvider`.
- React Email para templates versionados no codigo.
- Web Push Protocol com VAPID e Service Worker na fase PWA.
- Sentry, logs estruturados e metricas OpenTelemetry para operacao.

Principio central: notificacao e um apoio contextual, nao um mecanismo de culpa. O sistema deve preferir menos mensagens, mais relevantes, e deve aceitar pausa, recaida e retorno como partes normais da jornada.

## 2. Objetivos e principios

Objetivos:

- Ajudar o usuario a lembrar uma intencao que ele mesmo configurou.
- Tornar progresso e conquistas visiveis no momento certo.
- Reduzir abandono sem criar dependencia, ansiedade ou pressao.
- Proteger conta e comunicar eventos transacionais com confiabilidade.

Principios de produto:

- Utilidade antes de frequencia.
- Consentimento antes de alcance.
- Contexto atual antes de agenda antiga.
- Incentivo antes de urgencia artificial.
- Uma recaida gera acolhimento e uma proxima acao pequena, nunca punicao.
- Silencio e uma escolha valida do usuario.
- Dados de saude nao aparecem em superficies expostas do dispositivo.

## 3. Arquitetura em tres camadas

```mermaid
flowchart LR
    DOMAIN["Eventos do dominio"] --> OUTBOX[("Outbox PostgreSQL")]
    OUTBOX --> PUBLISHER["Outbox publisher"]
    PUBLISHER --> PLAN["Notification planner"]
    PLAN --> PREFS["Policy e preferencias"]
    PREFS --> SCHEDULED[("scheduled_notifications")]
    SCHEDULED --> QUEUES["BullMQ / Redis"]
    QUEUES --> INAPP["Worker in-app"]
    QUEUES --> EMAIL["Worker e-mail"]
    QUEUES --> PUSH["Worker Web Push futuro"]
    INAPP --> NOTIFS[("notifications")]
    EMAIL --> PROVIDER["Resend"]
    EMAIL --> LOGS[("email_logs")]
    PUSH --> BROWSER["Push services / browsers"]
    PROVIDER --> WEBHOOK["Webhook assinado"]
    WEBHOOK --> LOGS
```

Responsabilidades:

- Eventos de dominio dizem o que aconteceu, sem escolher canal.
- O planner decide se uma comunicacao deve existir e quando.
- A policy decide se o canal e permitido naquele momento.
- O worker revalida as condicoes imediatamente antes do envio.
- O provedor entrega; webhooks atualizam o resultado real.

## 4. Eventos de origem

Eventos internos recomendados:

- `user.registered`
- `user.email_verification_requested`
- `auth.password_reset_requested`
- `security.suspicious_login_detected`
- `workout.scheduled`
- `workout.completed`
- `water.goal_progressed`
- `water.goal_completed`
- `nutrition.checklist_progressed`
- `mission.assigned`
- `mission.completed`
- `streak.at_risk`
- `streak.saved`
- `achievement.unlocked`
- `user.inactive_detected`
- `summary.daily_ready`
- `summary.weekly_ready`

Cada evento deve ter `eventId`, `type`, `occurredAt`, `userId`, `aggregateId`, `version`, `correlationId` e payload minimo. Nenhum payload da fila deve conter peso, medida corporal, foto, token em texto puro ou descricao alimentar livre.

## 5. Matriz de comunicacao

| Tipo | In-app | E-mail MVP | Push futuro | Prioridade | Cancelar quando |
|---|---:|---:|---:|---|---|
| Confirmacao de conta | Opcional | Sim | Nao | Critica | E-mail confirmado ou token expirado. |
| Recuperacao de senha | Nao | Sim | Nao | Critica | Token usado, substituido ou expirado. |
| Alerta de seguranca | Sim | Sim | Opcional | Critica | Nao cancelar depois do evento confirmado. |
| Treino do dia | Sim | Opt-in | Opt-in | Normal | Treino concluido, pulado ou removido. |
| Agua incompleta | Sim | Nao no MVP | Opt-in | Baixa | Meta atingida, intervalo encerrado ou usuario pausou. |
| Alimentacao incompleta | Sim | Nao por padrao | Opt-in futuro | Baixa | Checklist concluido ou dia encerrado. |
| Missao pendente | Sim | Opt-in | Opt-in | Normal | Missao concluida, pulada, substituida ou expirada. |
| Streak em risco | Sim | Opt-in | Opt-in | Alta | Atividade elegivel concluida ou protecao aplicada. |
| Conquista desbloqueada | Sim | Opt-in | Opt-in | Normal | Deduplicar pelo desbloqueio; nao cancelar depois de criada. |
| Resumo diario | Sim | Nao por padrao | Nao | Baixa | Nao gerar se nao houve atividade e nao ha valor util. |
| Resumo semanal | Sim | Opt-in | Nao | Normal | Preferencia desligada antes do envio. |
| Reativacao | Sim quando voltar | Opt-in | Opt-in futuro | Baixa | Usuario voltou, opt-out ou limite de campanha atingido. |

Mensagens de conta e seguranca sao comunicacoes de servico e nao dependem do opt-in de lembretes. Ainda assim, devem ser estritamente transacionais. Mensagens de engajamento dependem de preferencia explicita e oferecem opt-out facil.

## 6. Preferencias do usuario

Campos e comportamento:

| Preferencia | Regra |
|---|---|
| `emailEnabled` | Controla mensagens de produto. Nao bloqueia verificacao, reset ou alerta critico de seguranca. |
| `pushEnabled` | So pode ser `true` quando existir assinatura ativa e permissao do navegador. |
| `waterRemindersEnabled` | Controla lembretes de agua in-app e push. |
| `workoutRemindersEnabled` | Controla treino in-app, e-mail e push. |
| `nutritionRemindersEnabled` | Controla checklist alimentar in-app e push futuro. |
| `streakRemindersEnabled` | Controla streak em risco em todos os canais de produto. |
| `weeklySummaryEnabled` | Controla resumo semanal in-app/e-mail. |
| `preferredWorkoutTime` | Horario local escolhido; padrao somente apos onboarding. |
| `waterReminderIntervalMinutes` | Valores permitidos: 60, 90, 120, 180 ou 240. |
| `streakRiskTime` | Horario local entre 17:00 e 22:30. |
| `silentDays` | Dias ISO 1-7 nos quais lembretes de produto nao sao enviados. |
| `quietHoursStart/End` | Janela local, inclusive quando cruza meia-noite. |
| `timezone` | Identificador IANA, por exemplo `America/Sao_Paulo`. |

Defaults recomendados:

- E-mail transacional ativo.
- Lembretes de treino e streak so sao ativados depois de escolha explicita no onboarding.
- Lembretes de agua e alimentacao desligados ate o usuario definir rotina.
- Push desligado.
- Resumo semanal ativado apenas com consentimento claro.
- Horario silencioso sugerido: 22:00 a 08:00, editavel.

O schema atual usa alguns defaults mais permissivos. Antes do lancamento, ajustar os defaults por migration ou garantir que o onboarding grave escolhas explicitas antes de agendar qualquer lembrete.

## 7. Horario silencioso e dias de pausa

Regras:

- Mensagens de produto nunca sao enviadas dentro do horario silencioso.
- Se o horario calculado cair no silencio, reagendar para o proximo horario permitido somente se a mensagem continuar util.
- Streak em risco nao deve ser empurrado para o dia seguinte; deve ser cancelado quando perder contexto.
- Dias silenciosos bloqueiam lembretes de treino, agua, alimentacao, missao, streak e reativacao.
- Conquistas e resumos podem esperar a proxima janela permitida.
- Recuperacao de senha, verificacao solicitada pelo usuario e alertas reais de seguranca sao enviados imediatamente.
- Mudancas de preferencias cancelam ou recalculam os agendamentos pendentes em ate um minuto.

Exemplo de janela que cruza meia-noite:

```txt
quietHoursStart = 22:00
quietHoursEnd   = 08:00
silencioso      = [22:00, 24:00) U [00:00, 08:00)
```

Nao existe categoria de "emergencia de saude" no LevelFit. O produto nao deve usar esse argumento para ultrapassar preferencias.

## 8. Timezone e horario de verao

- Armazenar instantes em UTC (`timestamptz`) e preferencias de horario como hora local mais timezone IANA.
- Nunca usar apenas offset fixo, pois ele nao representa mudancas de horario de verao.
- Converter horario local para UTC no momento de materializar o agendamento.
- Guardar `timezone` usado no calculo para permitir auditoria.
- Recalcular as proximas 48 horas quando o usuario mudar timezone.
- Detectar mudanca de timezone no cliente, mas pedir confirmacao antes de alterar a preferencia.
- Em horario local inexistente por transicao, usar o primeiro instante valido posterior.
- Em horario duplicado, escolher a primeira ocorrencia e usar idempotencia para impedir envio duplo.

O "dia" de missoes e streaks usa o timezone vigente do usuario no momento do evento. Alterar timezone nao deve reescrever retroativamente o historico.

## 9. Planejamento e agendamento

### Planner diario

Um job recorrente executa a cada 15 minutos e materializa notificacoes para usuarios cuja janela local entrou no horizonte de 24 a 48 horas. Ele nao envia mensagens; apenas grava `scheduled_notifications`.

Passos:

1. Buscar usuarios ativos por faixas de timezone.
2. Carregar preferencias e agenda do produto.
3. Avaliar elegibilidade e horario silencioso.
4. Criar registros com `idempotency_key` unica.
5. Publicar jobs atrasados no BullMQ depois do commit.

### Eventos em tempo real

Conquistas, alertas de seguranca, verificacao e reset sao criados a partir da outbox logo apos o evento de dominio. O planner escolhe canal e cria um agendamento imediato ou futuro.

### Reconciliacao

Um job a cada cinco minutos busca `scheduled_notifications` pendentes com `scheduled_for <= now()` que nao possuem job ativo conhecido. Ele republica de forma idempotente. Assim, Redis pode ser reconstruido a partir do PostgreSQL.

## 10. Filas e workers

Filas recomendadas:

- `notification-plan`: transforma eventos em agendamentos.
- `notification-in-app`: cria itens na central interna.
- `notification-email`: renderiza e envia e-mails.
- `notification-push`: reservado para PWA.
- `notification-webhook`: processa eventos de provedores.
- `notification-maintenance`: reconciliacao, expiracao e limpeza.
- `notification-dlq`: falhas que exigem analise.

Regras operacionais:

- API e workers sao processos separados.
- Jobs carregam IDs, nunca objetos completos de usuario.
- Cada worker busca os dados atuais no PostgreSQL.
- Concorrencia e limite sao configurados por fila.
- Jobs criticos de seguranca recebem prioridade maior que lembretes.
- Graceful shutdown termina o job atual e libera locks.
- Redis nao e fonte de verdade; perda da fila nao pode apagar a intencao registrada.

## 11. Pipeline de envio

Antes de enviar, todo worker executa um `preflight` atomico:

1. Bloqueia logicamente ou atualiza condicionalmente o agendamento pendente.
2. Confirma que usuario e conta continuam ativos.
3. Confirma canal, consentimento e preferencia atual.
4. Reavalia horario silencioso e dia de pausa.
5. Reavalia o estado do evento, por exemplo missao ainda pendente.
6. Confirma limites de frequencia e supressoes do provedor.
7. Reserva uma chave idempotente para o envio.
8. Renderiza template permitido com dados minimos.
9. Envia e registra o identificador do provedor.
10. Atualiza status e publica metrica sem conteudo sensivel.

Se a condicao nao existir mais, marcar como `cancelled`; se a preferencia bloquear, usar `cancelled` com `cancel_reason = preference_disabled` quando esse campo for adicionado. Cancelamento esperado nao e falha.

## 12. Retry, backoff e dead-letter

Politica recomendada:

| Canal/job | Tentativas | Backoff | Observacao |
|---|---:|---|---|
| In-app | 5 | Exponencial: 5s, 30s, 2m, 10m | Falhas tendem a ser internas. |
| E-mail transacional | 5 | Exponencial com jitter, ate 30m | Nao repetir erro permanente. |
| E-mail de produto | 3 | Exponencial com jitter, ate 2h | Cancelar se perder relevancia. |
| Push | 3 | 30s, 5m, 30m | `404/410` revoga assinatura sem retry. |
| Webhook | 8 | Exponencial com jitter, ate 24h | Idempotente pelo ID do evento. |

Classificacao:

- Retry: timeout, `429`, `5xx`, indisponibilidade de Redis/DB e falhas transitorias.
- Nao retry: endereco suprimido, payload invalido, `401/403` por configuracao, push `404/410` e template inativo.
- Respeitar `Retry-After` do provedor.
- Depois das tentativas, mover referencia para DLQ e alertar; nunca colocar corpo completo da mensagem na DLQ.

## 13. Idempotencia

Formato sugerido:

```txt
<type>:<channel>:<userId>:<businessDate>:<sourceId>:v<templateVersion>
```

Exemplos:

```txt
mission_pending:email:usr_123:2026-07-14:mission_456:v2
achievement_unlocked:in_app:usr_123:-:achievement_789:v1
weekly_summary:email:usr_123:2026-W29:-:v3
```

Regras:

- `scheduled_notifications.idempotency_key` e unica.
- Job ID do BullMQ deriva do ID do agendamento.
- Chave enviada ao provedor deriva do agendamento, quando o provedor suporta idempotencia.
- Webhook e deduplicado por `provider + provider_event_id`.
- Reprocessar um job concluido retorna sucesso sem novo envio.
- Alterar template nao deve reenviar eventos passados automaticamente.

Filas podem entregar mais de uma vez em cenarios de falha; por isso, idempotencia deve existir no banco e no provedor, nao apenas no Redis.

## 14. Cancelamento automatico

Eventos que cancelam agendamentos:

- `mission.completed` cancela `mission_pending` da mesma missao.
- `workout.completed/skipped/cancelled` cancela `workout_today` correspondente.
- `water.goal_completed` cancela lembretes de agua restantes no dia.
- `nutrition.checklist_completed` cancela lembretes alimentares do dia.
- `streak.saved` ou atividade elegivel cancela `streak_at_risk`.
- Preferencia desativada cancela todos os pendentes daquela categoria/canal.
- Conta suspensa/deletada cancela todos os envios de produto.
- Mudanca de timezone cancela e recria o horizonte futuro.

O cancelamento ocorre no PostgreSQL com update condicional `pending -> cancelled`. Remover o job atrasado do Redis e uma otimizacao; o preflight continua sendo a barreira final contra envio obsoleto.

## 15. Limites de frequencia

### Por usuario

Limites iniciais para mensagens de produto:

- No maximo 3 notificacoes externas por dia somando e-mail e push.
- No maximo 1 e-mail de produto por dia.
- No maximo 1 mensagem de streak por dia.
- No maximo 1 lembrete de missao por janela de 6 horas.
- Agua: no maximo 6 lembretes por dia e sempre dentro do intervalo escolhido.
- Reativacao: dias 3, 10 e 30; depois pausar por 60 dias.
- Conquistas multiplas em 10 minutos devem ser agrupadas.
- Resumos substituem lembretes de baixa prioridade quando coincidem na mesma janela.

Mensagens transacionais solicitadas pelo usuario e alertas de seguranca nao entram no cap de produto, mas possuem limites antifraude proprios.

### Por provedor

- Token bucket distribuido no Redis por provedor e canal.
- Limite configurado abaixo da cota contratada, com margem operacional de 20%.
- Concorrencia separada para transacional e produto.
- `429` reduz dinamicamente a taxa e respeita `Retry-After`.
- Circuit breaker abre em falhas persistentes para evitar tempestade de retries.
- Fila transacional nunca deve ser bloqueada por uma campanha de reativacao.

## 16. Uso das tabelas existentes

### `notifications`

Central interna. `metadata` deve conter apenas IDs de origem e dados de apresentacao nao sensiveis. `action_url` deve ser rota relativa allowlisted, nunca URL arbitraria.

### `notification_preferences`

Fonte de verdade das escolhas. Atualizacoes devem ser auditadas e disparar reconciliacao dos agendamentos.

### `email_logs`

Registro tecnico de tentativa e entrega. `recipient_hash` permite correlacao sem guardar o e-mail duplicado. O corpo renderizado nao deve ser persistido.

### `push_subscriptions`

Um registro por navegador/dispositivo. Endpoint e chaves ficam criptografados; hashes servem para deduplicacao. `revoked_at` registra opt-out, expiracao ou resposta `404/410`.

### `scheduled_notifications`

Fonte de verdade do envio futuro. O payload contem IDs e variaveis nao sensiveis. A mensagem final e renderizada somente no worker.

### `notification_templates`

Mantem chave, canal e versao. Templates publicados sao imutaveis; uma alteracao cria nova versao.

## 17. Ajustes recomendados no schema

Antes da implementacao completa, adicionar por migrations:

- `scheduled_notifications.template_key`, `template_version`, `source_type`, `source_id`, `cancel_reason`, `failure_code`, `attempt_count` e `expires_at`.
- `email_logs.scheduled_notification_id`, `delivered_at`, `bounced_at`, `complained_at` e `metadata` minima.
- `notifications.source_type`, `source_id` e unique parcial para deduplicacao.
- `push_subscriptions.device_name`, `expires_at` e `last_success_at`.
- `notification_preferences.achievement_emails_enabled`, `mission_emails_enabled`, `reactivation_emails_enabled` e `daily_summary_enabled` para controle granular.
- `notification_provider_events` com unique `(provider, provider_event_id)` para webhooks.
- `outbox_events` para publicacao transacional confiavel.

O campo `status` pode ganhar `processing` e `suppressed`, ou `suppressed` pode ser representado por cancelamento com motivo. A escolha deve ser unica em toda a aplicacao.

## 18. Templates de e-mail

Estrutura comum:

- Preheader curto.
- Logo LevelFit e titulo direto.
- Uma mensagem principal.
- Um CTA primario.
- Link alternativo em texto para fluxos transacionais.
- Preferencias/opt-out nas mensagens de produto.
- Rodape com motivo do recebimento e suporte.

Templates MVP:

| Chave | Assunto sugerido | CTA | Expiracao/contexto |
|---|---|---|---|
| `verify_email` | `Confirme seu e-mail no LevelFit` | Confirmar e-mail | Link de 24h. |
| `reset_password` | `Redefina sua senha do LevelFit` | Redefinir senha | Link de 30 min. |
| `security_alert` | `Novo acesso a sua conta LevelFit` | Revisar seguranca | Sem dados intimos. |
| `workout_reminder` | `Seu treino esta pronto quando voce estiver` | Ver treino | Cancelar se resolvido. |
| `streak_at_risk` | `Ainda da para manter seu ritmo hoje` | Ver opcao leve | Sem ameaca de perda. |
| `weekly_summary` | `Sua semana no LevelFit` | Ver progresso | Agregado, sem peso no assunto. |
| `achievement_unlocked` | `Voce desbloqueou uma nova conquista` | Ver conquista | Agrupar multiplas. |
| `reactivation` | `Vamos recomecar com um passo pequeno?` | Montar um dia leve | Sem culpa ou contagem de faltas. |
| `mission_pending` | `Uma missao curta ainda cabe no seu dia` | Ver missoes | Cancelar se concluida. |

Regras de copy:

- Nao usar "falhou", "perdeu tudo", "corra", "ultimo aviso" ou urgencia falsa.
- Nao prometer perda de peso, ganho muscular ou prazo de resultado.
- Nao recomendar medicamento, suplemento ou compensacao alimentar.
- Nao mencionar peso, medidas, calorias consumidas ou fotos no assunto/preheader.
- CTA de retorno deve levar a uma acao pequena e realista.

## 19. Notificacoes internas

Comportamento da central:

- Lista cronologica paginada, com nao lidas primeiro apenas por filtro escolhido.
- Badge mostra contagem limitada, por exemplo `9+`, sem animacao insistente.
- Itens relacionados podem ser agrupados por dia ou origem.
- Marcar como lida e uma acao de interface, nao um sinal de conclusao da missao.
- `actionUrl` leva para uma rota interna especifica e validada.
- Notificacoes expiradas podem desaparecer da caixa principal sem apagar o historico tecnico.
- Retencao sugerida: 90 dias visiveis; depois soft delete/arquivamento conforme politica de dados.

Mensagens internas podem ser mais contextuais que push, mas continuam sem expor detalhes sensiveis desnecessarios.

## 20. PWA e Web Push futuro

### Fluxo de opt-in

1. Mostrar uma explicacao contextual depois que o usuario configurar ao menos um lembrete.
2. O usuario toca em `Ativar notificacoes`.
3. Verificar suporte a Service Worker, Push API e estado da permissao.
4. Solicitar permissao somente dentro desse gesto.
5. Registrar Service Worker e criar `PushSubscription` com chave publica VAPID.
6. Enviar endpoint e chaves ao backend por rota autenticada e protegida contra CSRF.
7. Gravar assinatura criptografada por dispositivo.

Regras:

- Nao solicitar permissao na primeira visita.
- Se o usuario negar, explicar como alterar no navegador sem insistir repetidamente.
- Usar `ServiceWorkerRegistration.showNotification()` para compatibilidade mobile.
- Detectar recursos; o app continua funcional sem push.
- Cada navegador/dispositivo possui assinatura propria.
- VAPID private key fica no secret manager; a publica pode ir ao cliente.
- Push deve ter `tag` para substituir lembretes da mesma origem e evitar empilhamento.
- Clique abre apenas rota interna allowlisted.
- Payload: titulo generico, corpo curto, route key e IDs opacos. Nunca dados de saude.

Exemplos seguros:

- `Hora de um pouco de agua?`
- `Seu treino esta pronto quando voce estiver.`
- `Uma missao curta ainda cabe no seu dia.`
- `Voce desbloqueou uma conquista no LevelFit.`

## 21. APIs

Todas as rotas usam `/v1`, access token valido, ownership e o envelope de erros definido na arquitetura backend.

### `GET /v1/notifications`

- Query: `cursor?`, `limit?`, `unreadOnly?`, `type?`.
- Resposta: itens paginados e `unreadCount`.
- Validacao: limite de 1 a 100, cursor opaco e enum valido.
- Rate limit: 120/min por usuario.
- Seguranca: somente notificacoes do usuario, metadata filtrada e `Cache-Control: private, no-store`.

### `PATCH /v1/notifications/:id/read`

- Payload: vazio ou `read: true`.
- Resposta: `200` com `readAt`; repeticao retorna o mesmo estado.
- Validacao: UUID e ownership.
- Erros: `404 NOTIFICATION_NOT_FOUND`.
- Rate limit: 120/min por usuario.
- Seguranca: update por `id + user_id`; nao altera a entidade de origem.

### `PATCH /v1/notifications/read-all`

- Payload: `before?` em ISO 8601 para limitar o lote.
- Resposta: `200` com `updatedCount`.
- Validacao: data nao futura; maximo de retencao.
- Rate limit: 10/min por usuario.
- Seguranca: update em lote filtrado por usuario; operacao idempotente.

### `GET /v1/notification-preferences`

- Resposta: preferencias efetivas, timezone e capacidades (`pushSupported`, `activePushSubscriptions`).
- Validacao: auth.
- Rate limit: 60/min por usuario.
- Seguranca: nao devolver endpoint/chaves push; `no-store`.

### `PATCH /v1/notification-preferences`

- Payload: subconjunto allowlisted das preferencias, com `updatedAt` para concorrencia otimista.
- Resposta: preferencias atualizadas e `rescheduledCount`.
- Validacao: intervalos permitidos, horario valido, dias ISO unicos, timezone IANA e combinacoes coerentes.
- Erros: `409 VERSION_CONFLICT`, `422 PUSH_SUBSCRIPTION_REQUIRED`, `422 INVALID_QUIET_HOURS`.
- Rate limit: 30/min por usuario.
- Seguranca: auditoria, ownership e job idempotente de reconciliacao.

### `POST /v1/push/subscribe`

- Payload: `endpoint`, `expirationTime?`, `keys { p256dh, auth }`, `deviceName?`.
- Resposta: `201` com `subscriptionId` e estado; repeticao atualiza a assinatura existente.
- Validacao: HTTPS, hosts de push permitidos/validos, tamanhos estritos e chaves base64url.
- Erros: `409 ENDPOINT_OWNED_BY_ANOTHER_ACCOUNT`, `422 INVALID_PUSH_SUBSCRIPTION`, `501 FEATURE_NOT_ENABLED`.
- Rate limit: 10/h por usuario e IP.
- Seguranca: CSRF, criptografia de envelope, hash do endpoint, nunca logar payload.

### `DELETE /v1/push/unsubscribe`

- Payload: `subscriptionId` ou hash derivado do endpoint atual.
- Resposta: `204`, inclusive se ja revogada.
- Validacao: UUID e ownership.
- Rate limit: 20/h por usuario.
- Seguranca: marca `revokedAt`, cancela push pendente e mantem outros dispositivos intactos.

### `POST /v1/emails/test-preferences`

- Payload: `type: "workout_reminder" | "weekly_summary"`.
- Resposta: `202` com `testRequestId`.
- Validacao: somente templates seguros e endereco verificado.
- Erros: `409 EMAIL_NOT_VERIFIED`, `422 EMAIL_DISABLED`.
- Rate limit: 3/dia por usuario.
- Seguranca: nunca permite assunto, corpo, destinatario ou URL arbitrarios; marcado como teste e auditado.

## 22. Webhooks de e-mail

- Endpoint dedicado, por exemplo `POST /v1/webhooks/resend`.
- Verificar assinatura sobre o corpo bruto antes de parsear/processar.
- Deduplicar pelo ID do evento do provedor.
- Aceitar rapidamente e processar em fila.
- Mapear `sent`, `delivered`, `delivery_delayed`, `bounced`, `complained`, `failed` e `suppressed`.
- Bounce permanente e complaint adicionam o endereco a lista de supressao de produto.
- Nao confiar em `userId` vindo do webhook; correlacionar por `providerMessageId`.
- Rotacionar segredo do webhook e monitorar falhas de assinatura.

## 23. Seguranca e privacidade

- Consentimento granular e opt-out com efeito rapido.
- Dados de peso, medidas, fotos, condicoes intimas e texto alimentar nao entram em push, assunto, logs ou filas.
- Tokens de verificacao/reset sao temporarios, de uso unico e hasheados no banco.
- Links autenticados comuns levam ao app e exigem sessao; links sensiveis carregam token opaco curto.
- Endpoints e chaves de push sao credenciais e ficam criptografados em repouso.
- Segredos VAPID, API keys e webhook secrets ficam no secret manager.
- Logs guardam IDs, status, template, versao e codigos de erro, nao o corpo renderizado.
- Analytics usa tipo/canal e resultado, sem conteudo da mensagem.
- Exportacao LGPD inclui preferencias e historico relevante; exclusao revoga assinaturas e remove agendamentos.
- Acesso de suporte e restrito, auditado e nao exibe conteudo sensivel por padrao.

## 24. Metricas

Entrega:

- Agendadas, canceladas, suprimidas, enviadas, entregues e falhas por tipo/canal.
- Taxa de bounce, complaint e unsubscribe.
- Latencia entre `scheduledFor` e envio.
- Profundidade da fila, idade do job mais antigo, retries e DLQ.
- Assinaturas push ativas, expiradas e revogadas.

Produto:

- Open/click de e-mail como sinal auxiliar, respeitando privacidade e limitacoes de tracking.
- Retorno ao app em 1h/24h apos mensagem, com grupo de controle.
- Conclusao da acao sugerida, nao apenas clique.
- Retencao D7/D30 por preferencia e exposicao.
- Opt-out e desinstalacao/perda de permissao push.
- Numero medio de mensagens por usuario ativo.

Guardrails:

- Aumento de desativacao de lembretes.
- Aumento de complaint/spam.
- Queda de bem-estar reportado ou aumento de mensagens vistas como pressao.
- Frequencia acima do cap.
- Percentual de mensagens canceladas no preflight, que pode indicar planner desatualizado.

Nao otimizar somente abertura ou clique. A metrica principal e acao util incremental sem piorar opt-out, complaint ou percepcao de pressao.

## 25. Testes e operacao

Testes obrigatorios:

- Unitarios para quiet hours, dias silenciosos, timezone/DST, caps, elegibilidade e copy policy.
- Integracao para outbox, idempotencia, cancelamento e reconciliacao PostgreSQL/Redis.
- Contrato com o adapter de e-mail e verificacao de webhook assinado.
- E2E para concluir missao antes do envio e confirmar cancelamento.
- E2E para desativar preferencias e garantir que nenhum worker envie.
- Push futuro em Chrome/Edge/Firefox e Safari suportado, desktop e mobile instalavel.
- Testes de concorrencia para dois workers pegando o mesmo agendamento.
- Chaos test simples com Redis/provedor indisponivel.

Alertas operacionais:

- Fila transacional com job mais antigo acima de 2 minutos.
- Taxa de falha ou bounce acima do baseline.
- DLQ com qualquer alerta de seguranca.
- Webhook sem eventos por periodo inesperado.
- Volume acima de 150% da previsao por tipo.
- Muitos cancelamentos por condicao ja resolvida.

## 26. Roadmap de implementacao

### Fase 1 - Fundacao

- Outbox, planner, `scheduled_notifications`, BullMQ e workers.
- Interface de provider e Resend.
- Templates de verificacao, reset e seguranca.
- Central interna e APIs de leitura.
- Preferencias, quiet hours, timezone e auditoria.

### Fase 2 - Retencao responsavel

- Treino, streak, missao e resumo semanal por opt-in.
- Cancelamento automatico, caps e agrupamento.
- Webhooks, metricas e experimentos com grupo de controle.
- Reativacao limitada com copy acolhedora.

### Fase 3 - PWA e Web Push

- Manifest, Service Worker e instalacao.
- Opt-in contextual, VAPID e assinaturas por dispositivo.
- Worker push, expiracao/revogacao e testes por navegador.
- Rollout por feature flag e monitoramento de opt-out.

### Fase 4 - Otimizacao

- Melhor horario com base apenas em padroes agregados e consentidos.
- Priorizacao para evitar competicao entre mensagens.
- Preferencias mais granulares e digest inteligente.
- Segundo provedor de e-mail somente se disponibilidade/custo justificar.

## 27. Referencias de implementacao

- BullMQ: retries e backoff: https://docs.bullmq.io/guide/retrying-failing-jobs
- BullMQ: delayed jobs: https://docs.bullmq.io/guide/jobs/delayed
- BullMQ: job schedulers: https://docs.bullmq.io/guide/job-schedulers
- Resend: eventos de webhook: https://resend.com/docs/webhooks/event-types
- MDN: Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- MDN: Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API


# LevelFit - Parte Notificacoes, E-mail, Web Push e Retencao

## Papel solicitado

Atuar como arquiteto de sistemas, especialista em notificacoes, e-mail transacional, Web Push, PWA, filas, jobs, retencao de usuarios e privacidade.

## Contexto

O LevelFit sera inicialmente um web app fitness gamificado para treino, alimentacao, hidratacao, XP, streaks e missoes diarias.

## Sistema de notificacoes em tres camadas

1. Notificacoes internas no app.
2. E-mails.
3. Web Push Notifications para fase futura com PWA.

## Notificacoes internas

- Missoes pendentes.
- Treino do dia.
- Meta de agua incompleta.
- Checklist alimentar incompleto.
- Streak em risco.
- Conquistas desbloqueadas.
- Resumo diario.
- Resumo semanal.

## E-mails no MVP

- Confirmacao de conta.
- Recuperacao de senha.
- Alerta de seguranca.
- Lembrete diario de treino.
- Streak em risco.
- Resumo semanal.
- Conquista desbloqueada.
- Reativacao de usuario inativo.
- Missao pendente.

## Push notifications futuras

- Lembrete de agua.
- Treino no horario preferido.
- Streak em risco.
- Missoes pendentes.
- Recompensas e conquistas.
- Retorno ao app apos inatividade.

## Entregaveis solicitados

1. Estrategia de notificacoes para MVP.
2. Estrategia para PWA e push no futuro.
3. Preferencias de notificacao do usuario.
4. Regras de horario silencioso.
5. Estrategia de timezone.
6. Jobs e agendamento.
7. Filas e workers.
8. Retry com backoff.
9. Idempotencia.
10. Logs de envio.
11. Rate limit por usuario.
12. Rate limit por provedor.
13. Cancelamento automatico quando missao ja foi concluida.
14. Seguranca e privacidade.
15. Templates de e-mail.
16. Metricas de notificacao.

## Preferencias do usuario

- Ativar/desativar e-mail.
- Ativar/desativar push.
- Ativar/desativar lembrete de agua.
- Ativar/desativar lembrete de treino.
- Ativar/desativar lembrete de alimentacao.
- Ativar/desativar lembrete de streak.
- Ativar/desativar resumo semanal.
- Horario preferido de treino.
- Intervalo de lembrete de agua.
- Horario limite para streak em risco.
- Dias silenciosos.
- Horario de silencio.
- Timezone.

## Tabelas de banco

- notifications
- notification_preferences
- email_logs
- push_subscriptions
- scheduled_notifications
- notification_templates

## APIs

- GET /notifications
- PATCH /notifications/:id/read
- PATCH /notifications/read-all
- GET /notification-preferences
- PATCH /notification-preferences
- POST /push/subscribe
- DELETE /push/unsubscribe
- POST /emails/test-preferences

## Provedores recomendados

### E-mail

- Resend.
- SendGrid.
- Postmark.
- Amazon SES.

### Push

- Web Push API.
- Service Worker.
- VAPID keys.

### Jobs

- BullMQ com Redis.
- QStash.
- Trigger.dev.
- Inngest.

## Regras de privacidade

- Nao mostrar peso, medidas, fotos ou dados intimos em push.
- Nao colocar dados sensiveis no assunto do e-mail.
- Permitir opt-out facil.
- Respeitar consentimento.
- Respeitar horario silencioso.
- Links sensiveis devem usar tokens temporarios.
- Logs nao devem guardar conteudo sensivel desnecessario.

## Entrega adicional

- Arquitetura completa.
- Recomendacao da melhor abordagem para MVP.

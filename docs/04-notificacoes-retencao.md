# LevelFit - Parte Notificações, E-mail, Web Push e Retenção

## Papel solicitado

Atuar como arquiteto de sistemas, especialista em notificações, e-mail transacional, Web Push, PWA, filas, jobs, retenção de usuários e privacidade.

## Contexto

O LevelFit será inicialmente um web app fitness gamificado para treino, alimentação, hidratação, XP, streaks e missões diárias.

## Sistema de notificações em três camadas

1. Notificações internas no app.
2. E-mails.
3. Web Push Notifications para fase futura com PWA.

## Notificações internas

- Missões pendentes.
- Treino do dia.
- Meta de água incompleta.
- Checklist alimentar incompleto.
- Streak em risco.
- Conquistas desbloqueadas.
- Resumo diário.
- Resumo semanal.

## E-mails no MVP

- Confirmação de conta.
- Recuperação de senha.
- Alerta de segurança.
- Lembrete diário de treino.
- Streak em risco.
- Resumo semanal.
- Conquista desbloqueada.
- Reativação de usuário inativo.
- Missão pendente.

## Push notifications futuras

- Lembrete de água.
- Treino no horário preferido.
- Streak em risco.
- Missões pendentes.
- Recompensas e conquistas.
- Retorno ao app após inatividade.

## Entregaveis solicitados

1. Estratégia de notificações para MVP.
2. Estratégia para PWA e push no futuro.
3. Preferências de notificação do usuário.
4. Regras de horário silencioso.
5. Estratégia de timezone.
6. Jobs e agendamento.
7. Filas e workers.
8. Retry com backoff.
9. Idempotência.
10. Logs de envio.
11. Rate limit por usuário.
12. Rate limit por provedor.
13. Cancelamento automático quando missão já foi concluída.
14. Segurança e privacidade.
15. Templates de e-mail.
16. Métricas de notificação.

## Preferências do usuário

- Ativar/desativar e-mail.
- Ativar/desativar push.
- Ativar/desativar lembrete de água.
- Ativar/desativar lembrete de treino.
- Ativar/desativar lembrete de alimentação.
- Ativar/desativar lembrete de streak.
- Ativar/desativar resumo semanal.
- Horário preferido de treino.
- Intervalo de lembrete de água.
- Horário limite para streak em risco.
- Dias silenciosos.
- Horário de silencio.
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

- Não mostrar peso, medidas, fotos ou dados intimos em push.
- Não colocar dados sensíveis no assunto do e-mail.
- Permitir opt-out fácil.
- Respeitar consentimento.
- Respeitar horário silencioso.
- Links sensíveis devem usar tokens temporários.
- Logs não devem guardar conteúdo sensível desnecessário.

## Entrega adicional

- Arquitetura completa.
- Recomendação da melhor abordagem para MVP.

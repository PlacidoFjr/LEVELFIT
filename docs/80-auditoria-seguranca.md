# Auditoria de segurança

Data da revisao: 14 de julho de 2026.

## Resultado

O LevelFit possui uma base segura para desenvolvimento e testes do MVP, mas ainda não deve receber dados reais de saúde em produção. Nenhuma revisao interna substitui pentest independente, configuração segura da infraestrutura e monitoramento continuo.

## Controles verificados

- Senhas com Argon2id, 19 MiB, três iteracoes, salt automático e limite de entrada.
- JWT curto com validação de assinatura, expiracao, issuer, audience, usuário e sessão.
- Refresh token aleatório, hasheado, rotativo e com deteccao atomica de replay.
- Reutilizacao de refresh revoga toda a familia e a sessão.
- Refresh em cookie `HttpOnly`, `Secure` em produção, `SameSite=Strict`, prioridade alta e path restrito.
- CSRF por double-submit token no endpoint que usa cookie.
- Reset e verificação de e-mail com tokens hasheados, expiracao e invalidacao dos tokens anteriores.
- Logout local e global com revogação no servidor.
- Argon2 executado também na confirmação de exclusão da conta.
- Rate limit global e limites mais estritos para cadastro, login e recuperação.
- CORS por allowlist, Helmet, validação com whitelist e rejeicao de campos desconhecidos.
- Erros 5xx não retornam detalhes internos.
- Prisma parametriza consultas; não existem consultas SQL montadas com entrada do usuário.
- Autorização por propriedade verificada nos recursos com ID, reduzindo risco de IDOR.
- Não foram encontrados `eval`, HTML injetado, `localStorage` ou `sessionStorage` para credenciais.
- Push subscriptions cifradas com AES-256-GCM e impedidas de trocar de usuário.
- Tokens e contextos sensíveis reduzidos a HMAC SHA-256 no banco.
- Ranking desativado por padrão e dados corporais exigem consentimento.
- Fotos não são armazenadas no PostgreSQL.
- CSP, anti-framing, `nosniff`, política de referrer e permissions policy no frontend.
- Swagger desativado por padrão em produção.
- Configuração de produção rejeita HTTP, segredos repetidos e placeholders conhecidos.
- `.env`, builds e dependencias confirmados fora do Git.

## Testes de abuso executados

- Login antes da verificação: bloqueado com 403.
- Refresh sem CSRF: bloqueado com 403.
- Refresh valido: novo token emitido.
- Reuso do refresh anterior: bloqueado com 401.
- Access token da sessão após replay: bloqueado com 401.
- Reset com link anterior depois da troca de senha: bloqueado com 400.
- Acesso a recursos de outro usuário: filtros `userId` revisados no codigo.
- Health, cadastro, login, treino, missão, hidratação, progresso e XP: smoke test aprovado.

## Dependencias

Depois das atualizações de Vitest e Nest CLI:

- Altas: zero.
- Críticas: zero.
- Moderadas: cinco transitivas em Next/PostCSS e Prisma/Hono.

O registry não oferece correcao compatível para essas cinco no momento da revisao. O comando sugerido por ele faria downgrade principal de Next e Prisma; por isso não foi aplicado. CI falha automaticamente quando surgir vulnerabilidade alta ou crítica.

## Bloqueadores para produção

1. Integrar rate limit distribuido no Redis. O armazenamento atual e em memória e não protege várias instâncias em conjunto.
2. Implementar MFA TOTP. As rotas atuais estao autenticadas, mas retornam 501.
3. Implementar exportação e eliminação LGPD reais. Hoje os pedidos ficam registrados como fila lógica.
4. Criar histórico versionado de consentimento, finalidade, revogação e base legal.
5. Aplicar consentimento a todos os fluxos que tratem dados de saúde, não apenas progresso corporal.
6. Configurar criptografia e isolamento do PostgreSQL gerenciado, backup cifrado e teste de restauração.
7. Integrar S3/R2 privado com upload assinado, verificação de MIME real, antivírus e remoção.
8. Integrar provedor de e-mail e alertas de login suspeito sem dados sensíveis.
9. Configurar secret manager, rotação, HTTPS no edge e política correta de trusted proxy.
10. Adicionar observabilidade com redação de PII, alertas e plano de resposta a incidentes.
11. Trocar o rate limit apenas por IP por estratégia combinada de IP, conta e risco.
12. Executar SAST, DAST e pentest independente antes de armazenar dados reais.
13. Adotar CSP com nonce para remover `unsafe-inline` quando o frontend integrar autenticação real.

## Decisão de lançamento

- Desenvolvimento local e demonstração com dados fictícios: aprovado.
- Beta fechado com dados fictícios: aprovado.
- Beta com dados pessoais ou de saúde reais: bloqueado até concluir os itens de produção aplicáveis.

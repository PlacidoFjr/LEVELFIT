# Auditoria de seguranca

Data da revisao: 14 de julho de 2026.

## Resultado

O LevelFit possui uma base segura para desenvolvimento e testes do MVP, mas ainda nao deve receber dados reais de saude em producao. Nenhuma revisao interna substitui pentest independente, configuracao segura da infraestrutura e monitoramento continuo.

## Controles verificados

- Senhas com Argon2id, 19 MiB, tres iteracoes, salt automatico e limite de entrada.
- JWT curto com validacao de assinatura, expiracao, issuer, audience, usuario e sessao.
- Refresh token aleatorio, hasheado, rotativo e com deteccao atomica de replay.
- Reutilizacao de refresh revoga toda a familia e a sessao.
- Refresh em cookie `HttpOnly`, `Secure` em producao, `SameSite=Strict`, prioridade alta e path restrito.
- CSRF por double-submit token no endpoint que usa cookie.
- Reset e verificacao de e-mail com tokens hasheados, expiracao e invalidacao dos tokens anteriores.
- Logout local e global com revogacao no servidor.
- Argon2 executado tambem na confirmacao de exclusao da conta.
- Rate limit global e limites mais estritos para cadastro, login e recuperacao.
- CORS por allowlist, Helmet, validacao com whitelist e rejeicao de campos desconhecidos.
- Erros 5xx nao retornam detalhes internos.
- Prisma parametriza consultas; nao existem consultas SQL montadas com entrada do usuario.
- Autorizacao por propriedade verificada nos recursos com ID, reduzindo risco de IDOR.
- Nao foram encontrados `eval`, HTML injetado, `localStorage` ou `sessionStorage` para credenciais.
- Push subscriptions cifradas com AES-256-GCM e impedidas de trocar de usuario.
- Tokens e contextos sensiveis reduzidos a HMAC SHA-256 no banco.
- Ranking desativado por padrao e dados corporais exigem consentimento.
- Fotos nao sao armazenadas no PostgreSQL.
- CSP, anti-framing, `nosniff`, politica de referrer e permissions policy no frontend.
- Swagger desativado por padrao em producao.
- Configuracao de producao rejeita HTTP, segredos repetidos e placeholders conhecidos.
- `.env`, builds e dependencias confirmados fora do Git.

## Testes de abuso executados

- Login antes da verificacao: bloqueado com 403.
- Refresh sem CSRF: bloqueado com 403.
- Refresh valido: novo token emitido.
- Reuso do refresh anterior: bloqueado com 401.
- Access token da sessao apos replay: bloqueado com 401.
- Reset com link anterior depois da troca de senha: bloqueado com 400.
- Acesso a recursos de outro usuario: filtros `userId` revisados no codigo.
- Health, cadastro, login, treino, missao, hidratacao, progresso e XP: smoke test aprovado.

## Dependencias

Depois das atualizacoes de Vitest e Nest CLI:

- Altas: zero.
- Criticas: zero.
- Moderadas: cinco transitivas em Next/PostCSS e Prisma/Hono.

O registry nao oferece correcao compativel para essas cinco no momento da revisao. O comando sugerido por ele faria downgrade principal de Next e Prisma; por isso nao foi aplicado. CI falha automaticamente quando surgir vulnerabilidade alta ou critica.

## Bloqueadores para producao

1. Integrar rate limit distribuido no Redis. O armazenamento atual e em memoria e nao protege varias instancias em conjunto.
2. Implementar MFA TOTP. As rotas atuais estao autenticadas, mas retornam 501.
3. Implementar exportacao e eliminacao LGPD reais. Hoje os pedidos ficam registrados como fila logica.
4. Criar historico versionado de consentimento, finalidade, revogacao e base legal.
5. Aplicar consentimento a todos os fluxos que tratem dados de saude, nao apenas progresso corporal.
6. Configurar criptografia e isolamento do PostgreSQL gerenciado, backup cifrado e teste de restauracao.
7. Integrar S3/R2 privado com upload assinado, verificacao de MIME real, antivirus e remocao.
8. Integrar provedor de e-mail e alertas de login suspeito sem dados sensiveis.
9. Configurar secret manager, rotacao, HTTPS no edge e politica correta de trusted proxy.
10. Adicionar observabilidade com redacao de PII, alertas e plano de resposta a incidentes.
11. Trocar o rate limit apenas por IP por estrategia combinada de IP, conta e risco.
12. Executar SAST, DAST e pentest independente antes de armazenar dados reais.
13. Adotar CSP com nonce para remover `unsafe-inline` quando o frontend integrar autenticacao real.

## Decisao de lancamento

- Desenvolvimento local e demonstracao com dados ficticios: aprovado.
- Beta fechado com dados ficticios: aprovado.
- Beta com dados pessoais ou de saude reais: bloqueado ate concluir os itens de producao aplicaveis.

# Auditoria de Seguranca - LevelFit

Data: 2026-07-19  
Escopo local: `C:\Users\placi\Downloads\vision tech (1)\LevelFit`  
Tipo: analise estatica/passiva, sem ataque ativo, brute force, fuzzing agressivo, DoS ou teste destrutivo.

## Resumo executivo

O LevelFit ja tem uma base de seguranca melhor que a media para um produto em construcao: API NestJS com guards nos modulos principais, validacao global de DTOs, refresh token com rotacao, refresh token em cookie HttpOnly, secrets validados no boot, Swagger bloqueado em producao, CORS por origem configurada, CSP no Next.js e rotas Owner protegidas por `JwtAuthGuard + OwnerGuard`.

Mesmo assim, eu nao consideraria o produto pronto para abertura ampla de producao antes de corrigir os bloqueadores abaixo. O risco principal nao esta em um endpoint obvio aberto; esta em detalhes de producao: seed rodando no deploy, convites profissionais previsiveis, token de acesso persistido em `localStorage`, falta de MFA/step-up para Owner e dependencias com CVEs moderadas.

Conclusao: **pronto para piloto controlado com poucos usuarios, nao pronto para escala publica sem hardening.**

## Referencias usadas

- [OWASP Top 10 Web Application Security Risks 2025](https://owasp.org/Top10/2025/)
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [FIRST CVSS v4.0 Specification](https://www.first.org/cvss/v4.0/specification-document)
- [LGPD - Lei 13.709/2018, texto compilado no Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)

## Pontos positivos confirmados

1. Autenticacao protegida por Firebase/local JWT e sessao server-side.
   Evidencias:
   - `apps/api/src/modules/auth/jwt.strategy.ts`
   - `apps/api/src/modules/auth/auth.service.ts`
   - `apps/api/src/modules/auth/firebase-admin.service.ts`

2. Refresh token com rotacao, hash no banco e deteccao de reuso.
   Evidencias:
   - `apps/api/src/modules/auth/auth.service.ts:154`
   - `apps/api/src/modules/auth/auth.service.ts:157`
   - `apps/api/src/modules/auth/auth.service.ts:164`
   - `prisma/schema.prisma:345`
   - `prisma/schema.prisma:348`

3. Cookie de refresh e HttpOnly.
   Evidencia:
   - `apps/api/src/modules/auth/auth.controller.ts:11`

4. CSRF aplicado no refresh.
   Evidencias:
   - `apps/api/src/modules/auth/auth.controller.ts:12`
   - `apps/api/src/modules/auth/auth.controller.ts:14`
   - `apps/api/src/modules/auth/auth.controller.ts:57`

5. Modulos principais da API exigem JWT.
   Evidencias:
   - `apps/api/src/modules/missions/missions.controller.ts:8`
   - `apps/api/src/modules/nutrition/nutrition.controller.ts:9`
   - `apps/api/src/modules/hydration/hydration.controller.ts:9`
   - `apps/api/src/modules/workouts/workouts.controller.ts:9`
   - `apps/api/src/modules/progress/progress.controller.ts:9`
   - `apps/api/src/modules/notifications/notifications.controller.ts:9`
   - `apps/api/src/modules/professionals/professionals.controller.ts:9`
   - `apps/api/src/modules/users/users.controller.ts:9`

6. Owner/Gestao protegida no backend.
   Evidencia:
   - `apps/api/src/modules/admin/admin.controller.ts:9`

7. Dados do usuario usam filtro por dono em varios servicos.
   Evidencias:
   - `apps/api/src/modules/workouts/workouts.service.ts:57`
   - `apps/api/src/modules/nutrition/nutrition.service.ts:47`
   - `apps/api/src/modules/hydration/hydration.service.ts:15`
   - `apps/api/src/modules/progress/progress.service.ts:17`
   - `apps/api/src/modules/notifications/notifications.service.ts:32`
   - `apps/api/src/modules/professionals/professionals.service.ts:30`

8. Ranking e opt-in.
   Evidencias:
   - `prisma/schema.prisma:222`
   - `apps/api/src/modules/gamification/gamification.service.ts:151`

9. Headers de seguranca no frontend.
   Evidencias:
   - `next.config.ts:5`
   - `next.config.ts:21`
   - `next.config.ts:22`
   - `next.config.ts:25`
   - `next.config.ts:26`

10. Ambiente de producao bloqueia configuracoes perigosas.
    Evidencias:
    - `apps/api/src/config/environment.ts:34`
    - `apps/api/src/config/environment.ts:35`
    - `apps/api/src/config/environment.ts:46`

## Achados prioritarios

### [ALTO] Seed roda no deploy e inclui convites profissionais fixos

Status: vulnerabilidade confirmada / risco real de producao.

Evidencias:
- `render.yaml:10` executa `npm run db:deploy` durante o build.
- `package.json:19` aponta `db:deploy` para `scripts/deploy-db.mjs`.
- `scripts/deploy-db.mjs:35` informa que roda seed.
- `scripts/deploy-db.mjs:36` executa `npm run db:seed`.
- `prisma/seed.ts:254` contem o codigo fixo de Nutri Pro.
- `prisma/seed.ts:264` contem o codigo fixo de Run Pro.

Impacto:
- Qualquer codigo de convite fixo que chegue a producao pode ser usado por qualquer usuario autenticado.
- Como os codigos estao no repositorio, eles nao devem ser tratados como segredo.
- Seeds em producao tambem podem reativar dados, templates e convites que deveriam estar desativados.

Correcao recomendada:
- Separar seed de catalogo publico de seed operacional sensivel.
- Remover convites profissionais do seed de producao.
- Criar comando explicito, manual e protegido para popular catalogos: `db:seed:catalog`.
- Criar convites por endpoint Owner/Pro, com codigo aleatorio de alta entropia, expiracao e revogacao.
- Guardar hash do codigo de convite, nao o codigo puro, se o codigo funcionar como credencial.
- Rotacionar/desativar no banco os codigos que ja foram seedados.

### [ALTO] Access token e dados de usuario persistidos em localStorage

Status: vulnerabilidade confirmada / risco aumentado por XSS.

Evidencias:
- `lib/auth-client.ts:7` define `levelfit.accessToken`.
- `lib/auth-client.ts:8` define `levelfit.csrfToken`.
- `lib/auth-client.ts:9` define `levelfit.user`.
- `lib/auth-client.ts:126` le localStorage.
- `lib/auth-client.ts:135` grava localStorage.
- `lib/auth-client.ts:179` grava access token.
- `lib/auth-client.ts:160` grava o usuario.
- `lib/auth-client.ts:362` grava novo access token depois do refresh.

Impacto:
- Se houver XSS no frontend, o atacante pode roubar bearer token e acessar dados sensiveis ate expirar.
- Como o app lida com saude, progresso, alimentacao e conexoes profissionais, a severidade sobe.

Correcao recomendada:
- Guardar access token apenas em memoria.
- Manter refresh token em cookie HttpOnly, Secure e SameSite apropriado.
- Considerar modelo BFF/session cookie para chamadas da web.
- Se mantiver bearer token, reduzir TTL e reforcar CSP sem `unsafe-inline` quando viavel.
- Nunca persistir objetos de usuario com dados sensiveis em localStorage.

### [ALTO] Owner depende de email + variavel de ambiente, sem MFA/step-up

Status: risco potencial forte, confirmado pela implementacao.

Evidencias:
- `apps/api/src/common/access-profile.ts:29` le `OWNER_EMAILS`.
- `apps/api/src/modules/admin/owner.guard.ts` libera Owner por email ou papel no banco.
- `apps/api/src/modules/admin/admin.service.ts:36` lista roles vindas de env.
- `apps/api/src/modules/admin/admin.service.ts:216` informa que role vinda de env nao e revogada pela UI.
- `apps/api/src/modules/auth/auth.controller.ts:88` e `apps/api/src/modules/auth/auth.controller.ts:92` expõem endpoints de 2FA, mas o servico retorna nao implementado.

Impacto:
- Compromisso da conta/e-mail Owner implica acesso a gestao, usuarios, roles e metricas.
- Papel via env e util para bootstrap, mas ruim como controle permanente de acesso.

Correcao recomendada:
- Exigir MFA para Owner e para grant/revoke de roles.
- Implementar step-up para acoes criticas: conceder Owner, revogar Owner, exportar dados, ver eventos sensiveis.
- Migrar Owner permanente para tabela de roles com auditoria, mantendo `OWNER_EMAILS` apenas como bootstrap emergencial.
- Alertar por e-mail quando uma role Owner/Nutri/Run for concedida.

### [MEDIO] Convite profissional e permissao ainda sao credenciais simples

Status: vulnerabilidade confirmada no desenho atual.

Evidencias:
- `prisma/schema.prisma:972` guarda `ProfessionalInvite.code` como string unica.
- `apps/api/src/modules/professionals/professionals.service.ts:33` busca convite por codigo puro.
- `apps/api/src/modules/professionals/professionals.service.ts:70` aceita convite por codigo.
- `apps/api/src/modules/professionals/professionals.service.ts:84` cria conexao com permissoes escolhidas pelo usuario.
- `apps/api/src/modules/professionals/professionals.service.ts:42` audita tentativa invalida.

Impacto:
- Codigo roubado, chutado ou compartilhado conecta usuario a um profissional.
- Sem uso unico por destinatario, o mesmo codigo pode ser reutilizado por muitos usuarios.
- Falhas de preview podem gerar spam de audit log.

Correcao recomendada:
- Gerar convites com token opaco forte, expiracao curta e, idealmente, uso unico.
- Associar convite a profissional, escopo de permissao e limite de uso.
- Criar rate limit especifico para preview/accept.
- Guardar somente hash do codigo.
- Exigir confirmacao clara antes de ativar permissoes sensiveis como fotos e medidas.

### [MEDIO] Admin grant role nao usa DTO validado

Status: risco confirmado de robustez, nao exploracao direta confirmada.

Evidencia:
- `apps/api/src/modules/admin/admin.controller.ts:39` recebe `@Body() body: { email?: string; role?: ... }` sem classe DTO.

Impacto:
- A validacao global nao aplica decorators de classe nesse payload.
- O servico valida role e busca usuario por e-mail normalizado, entao o risco imediato e limitado.
- Ainda e melhor hardening para um endpoint critico.

Correcao recomendada:
- Criar `GrantRoleDto` com `@IsEmail`, `@IsIn`, `@MaxLength`.
- Criar `RevokeRoleDto`/param pipe UUID se quiser endurecer `:id`.
- Adicionar testes negativos para payload invalido.

### [MEDIO] Dependencias com vulnerabilidades moderadas

Status: confirmado por `npm audit`.

Resultado:
- `npm audit --audit-level=moderate`: falhou com 11 vulnerabilidades moderadas.
- `npm audit --omit=dev --audit-level=moderate`: falhou com as mesmas classes.

Pacotes reportados:
- `@hono/node-server` via `@prisma/dev`/`prisma`
- `postcss` via `next`
- `uuid` via `firebase-admin` / `@google-cloud/storage`

Impacto:
- Algumas afetam ferramenta de build/dev, mas `next` e `firebase-admin` entram no caminho de runtime/build.
- `npm audit fix --force` sugeriu alteracoes quebrando versoes, entao nao recomendo aplicar cegamente.

Correcao recomendada:
- Verificar releases corrigidas de `next`, `prisma` e `firebase-admin`.
- Atualizar de forma controlada e rodar `npm run verify`.
- Manter Dependabot ativo e revisar PRs de seguranca.

### [MEDIO] Areas Pro ainda possuem telas mockadas com aparencia funcional

Status: confirmado no frontend.

Evidencias:
- `components/pro-pages.tsx:385`
- `components/pro-pages.tsx:414`
- `components/pro-pages.tsx:415`
- `components/pro-pages.tsx:533`
- `components/pro-run-page.tsx:413`
- `components/pro-run-page.tsx:493`
- `components/pro-run-page.tsx:651`
- `lib/pro-mock-data.ts`
- `lib/pro-run-mock-data.ts`

Impacto:
- Em producao, botoes que parecem salvar/publicar podem apenas simular.
- Isso pode gerar erro operacional, expectativa falsa para profissional e risco de suporte.

Correcao recomendada:
- Em producao, esconder fluxos mockados atras de feature flag.
- Rotular claramente ambiente/piloto.
- Substituir acoes criticas mockadas por endpoints reais antes de vender como funcional.

### [BAIXO/MEDIO] `db:deploy` mistura migration e seed

Status: confirmado.

Evidencias:
- `scripts/deploy-db.mjs:17`
- `scripts/deploy-db.mjs:35`
- `scripts/deploy-db.mjs:36`

Impacto:
- Migrations devem ser previsiveis; seed pode ser destrutivo/logico.
- O seed atual usa `deleteMany` para exercicios de treino seedados e recria relacoes, o que e aceitavel para catalogo, mas arriscado se misturar com dados reais no futuro.

Correcao recomendada:
- `db:deploy`: somente `prisma migrate deploy`.
- `db:seed:catalog`: catalogo publico idempotente.
- `db:seed:dev`: dados de desenvolvimento, bloqueado quando `NODE_ENV=production`.

### [BAIXO/MEDIO] `trust proxy` pode nao refletir proxy real do Render

Status: risco potencial.

Evidencia:
- `apps/api/src/main.ts:20` usa `app.set("trust proxy", "loopback")`.

Impacto:
- IP usado em logs, hashes e rate limit pode ficar impreciso atras do proxy.
- Pode causar bloqueio injusto ou reduzir qualidade de deteccao de abuso.

Correcao recomendada:
- Confirmar arquitetura do Render e configurar `trust proxy` conforme documentacao do provedor.
- Testar `req.ip` em producao sem expor IP completo em logs.

### [BAIXO] CORP liberado como cross-origin

Status: risco potencial.

Evidencia:
- `apps/api/src/main.ts:22` usa `crossOriginResourcePolicy: { policy: "cross-origin" }`.

Impacto:
- Pode ser necessario para assets/integrações, mas e mais permissivo que o padrao.

Correcao recomendada:
- Revisar necessidade real.
- Preferir `same-site`/`same-origin` se a API nao servir recursos que precisam ser embutidos por outras origens.

### [BAIXO] CSP ainda usa `unsafe-inline`

Status: risco aceito/confirmado.

Evidencias:
- `next.config.ts:6`
- `next.config.ts:7`

Impacto:
- `unsafe-inline` reduz protecao da CSP contra XSS.
- Next/Tailwind podem exigir ajustes para remover isso sem quebrar estilos/scripts.

Correcao recomendada:
- Planejar CSP com nonce/hash.
- Remover `unsafe-inline` aos poucos, com testes visuais e e2e.

## Areas obrigatorias

### 1. Autenticacao e sessao

Estado: bom para piloto, precisa hardening para producao ampla.

Confirmado:
- Senhas locais usam Argon2id.
- Firebase ID token e verificado no backend.
- Refresh token e hasheado.
- Refresh token rotaciona.
- Logout revoga sessao/tokens.
- Recuperacao de senha via Firebase existe no frontend.
- E-mail precisa estar verificado para login Firebase.

Riscos:
- Access token em localStorage.
- MFA/2FA nao implementado.
- Owner sem step-up.
- `legacyRegisterUser`/`legacyLoginUser` ainda existem no client, embora o fluxo principal use Firebase.

### 2. Autorizacao e RBAC

Estado: parcialmente bom.

Confirmado:
- `/admin/*` protegido por JWT + OwnerGuard.
- Roles sao montadas por `OWNER_EMAILS`, `NUTRITIONIST_EMAILS`, `RUN_COACH_EMAILS` e tabela `user_role_assignments`.
- Rotas comuns usam JWT.

Riscos:
- Roles via env nao sao revogaveis pela UI.
- Nutri Pro e Run Pro ainda sao principalmente areas visuais/mockadas; quando virarem API real, precisarão guards especificos por papel e por carteira.

### 3. Profissionais conectados

Estado: funcional, mas convite precisa endurecer.

Confirmado:
- Usuario lista apenas conexoes dele.
- Aceite, permissao e revogacao auditam eventos.
- Permissoes sao filtradas por allowlist.

Riscos:
- Codigo puro e fixo em seed.
- Sem uso unico/expiracao obrigatoria no seed.
- Sem rate limit especifico por endpoint de convite.

### 4. Dados sensiveis

Estado: razoavel no backend, pendencias de produto.

Confirmado:
- Medidas/fotos exigem consentimento sensivel.
- Fotos guardam metadados/storage key, nao arquivo no banco.
- Logs de push criptografam endpoints.
- IP/user-agent sao hasheados.

Riscos:
- Exportacao/exclusao estao como solicitacao enfileirada, nao entrega final completa.
- Pro areas mockadas nao devem prometer acesso real a dados sensiveis ate RBAC por profissional existir.

### 5. API

Estado: boa fundacao.

Confirmado:
- ValidationPipe global com whitelist e forbidNonWhitelisted.
- Rate limit global ativo.
- CORS com `WEB_ORIGIN`.
- Swagger bloqueado em producao.
- Erros 500 sao genericos.

Riscos:
- Falta DTO no grant role.
- Falta throttle especifico para convites e auth sensivel por conta/e-mail.
- Profissionais ainda nao tem endpoints reais de carteira Nutri/Run com filtro por profissional.

### 6. Banco de dados e Prisma

Estado: schema maduro, seed precisa separar ambiente.

Confirmado:
- Bons indices em usuarios, sessoes, tokens, logs, alimento, XP e conexoes.
- Soft delete presente em entidades importantes.
- Idempotency key em XP.
- Ranking opt-in.

Riscos:
- Convite profissional guarda codigo puro.
- Seed de producao mistura catalogo com convite operacional.

### 7. Frontend

Estado: bom visualmente, mas precisa hardening e feature flags.

Confirmado:
- Headers de seguranca configurados no Next.
- Guards/redirects consomem `availableWorkspaces`.
- Tela de workspace existe.

Riscos:
- Token em localStorage.
- Areas Pro ainda tem mocks com CTAs funcionais.
- Alguns imports de `mock-data` permanecem em telas do usuario para fallback.

### 8. Deploy e configuracao

Estado: quase bom, com um bloqueador.

Confirmado:
- `render.yaml` usa `NODE_ENV=production`, Swagger false e env vars secretas sem sync.
- `WEB_ORIGIN` precisa HTTPS em producao.
- `.env` esta ignorado pelo Git, nao apareceu versionado.

Bloqueador:
- `db:deploy` ainda roda seed.

### 9. Supply chain

Estado: precisa atualizar dependencias moderadas.

Confirmado:
- `npm audit` falha com 11 moderadas.
- CI roda audit high, lint, typecheck, test e build.

Recomendado:
- Aumentar CI para `npm audit --audit-level=moderate` quando o backlog atual for resolvido.

### 10. Codigo gerado por IA / maturidade

Estado: bom para iteracao rapida, precisa limpar mocks antes de venda.

Confirmado:
- Muitos textos "Mock:" ainda existem nas areas Pro.
- Alguns fluxos simulam plano/agenda/publicacao.

Recomendado:
- Criar matriz "mock vs real" por tela.
- Feature flag para modulo Pro em piloto.
- Testes e2e de login, workspace, owner, nutri, run e usuario comum.

## Comandos executados

Passaram:

```bash
npm run typecheck
npm run typecheck -w @levelfit/api
npm run lint
npm test -w @levelfit/api
npm run build
npm run build:api
npx prisma validate
```

Resultado dos testes:

```text
Test Files  3 passed (3)
Tests       16 passed (16)
```

Falhou por vulnerabilidades moderadas:

```bash
npm audit --audit-level=moderate
npm audit --omit=dev --audit-level=moderate
```

## Plano de correcao recomendado

### Fase 1 - Antes de qualquer piloto externo

1. Remover convites profissionais do seed de producao.
2. Separar `db:deploy` de `db:seed`.
3. Rotacionar/desativar `LF-NUTRI-382` e `LF-TAF-284` no banco de producao.
4. Criar convites por API, aleatorios, expiraveis e auditados.
5. Adicionar DTO para `POST /admin/roles`.

### Fase 2 - Antes de vender para profissionais

1. Implementar endpoints reais para carteira Nutri e Run.
2. Adicionar guards por papel: Nutri Pro, Run Pro e Owner.
3. Implementar filtro por profissional em toda consulta de carteira.
4. Trocar acoes mockadas por API real ou esconder por feature flag.
5. Criar logs de auditoria para ver/alterar plano, permissao, convite e revogacao.

### Fase 3 - Antes de escalar publico

1. Tirar access token do localStorage.
2. Implementar MFA/step-up para Owner.
3. Resolver `npm audit` moderado sem `--force` cego.
4. Ajustar CSP para remover `unsafe-inline` quando viavel.
5. Criar testes e2e de acesso indevido:
   - usuario comum tentando `/pro/admin`;
   - Nutri tentando Run;
   - Run tentando Nutri;
   - usuario tentando alterar conexao de outro;
   - convite invalido/revogado/expirado.

## Veredito

O LevelFit esta tecnicamente encaminhado e tem boas decisoes de seguranca, principalmente no backend. Para um piloto pequeno e controlado, pode seguir com cautela depois de corrigir seed/convites. Para producao aberta, os pontos de maior prioridade sao:

1. Seed/convites fixos.
2. Token em localStorage.
3. Owner sem MFA/step-up.
4. Areas Pro mockadas aparentando persistencia real.
5. Dependencias moderadas no `npm audit`.


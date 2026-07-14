# LevelFit - Publicacao sem dominio proprio

Este guia assume que o repositorio ja esta limpo de segredos, que a CI esta verde e que o objetivo e publicar usando subdominios gratuitos dos provedores.

## Arquitetura recomendada

- Frontend: Vercel, por exemplo `https://levelfit.vercel.app`.
- API: Render, Railway ou Fly.io, por exemplo `https://levelfit-api.onrender.com`.
- Banco: Neon PostgreSQL ou Supabase PostgreSQL.
- Redis: opcional nesta fase. Pode entrar depois para filas, jobs e rate limit distribuido.
- E-mail: Resend depois que a tela de verificacao por e-mail estiver pronta para producao.

## Fase 1 - Banco de producao

1. Criar um projeto no Neon ou Supabase.
2. Criar um banco PostgreSQL chamado `levelfit`.
3. Copiar a connection string com SSL habilitado.
4. Salvar a URL como `DATABASE_URL` no provedor da API.
5. Rodar migrations com:

```bash
npm run db:migrate:deploy
```

Regras:

- Nao usar banco local em producao.
- Nao usar `sslmode=disable`.
- Ativar backup automatico no provedor.
- Nao publicar fotos de progresso enquanto storage seguro nao estiver configurado.

## Fase 2 - API

Variaveis obrigatorias da API:

```env
DATABASE_URL=postgresql://<db_user>:<db_password>@<db_host>:5432/levelfit?sslmode=require
API_HOST=0.0.0.0
API_PORT=3001
WEB_ORIGIN=https://<seu-front>.vercel.app
JWT_ACCESS_SECRET=<secret-real>
TOKEN_HASH_SECRET=<secret-real-diferente>
JWT_ISSUER=levelfit-api
JWT_AUDIENCE=levelfit-web
ACCESS_TOKEN_TTL_SECONDS=600
REFRESH_TOKEN_TTL_DAYS=30
SWAGGER_ENABLED=false
NODE_ENV=production
```

Comandos:

```bash
npm ci
npm run db:generate
npm run build:api
npm run db:migrate:deploy
npm run start -w @levelfit/api
```

Checklist:

- `/v1/health` responde em HTTPS.
- Swagger fica desligado em producao.
- CORS permite apenas o dominio do frontend.
- Cookies de refresh ficam `HttpOnly` e `Secure`.

## Fase 3 - Frontend

Variaveis obrigatorias do frontend:

```env
NEXT_PUBLIC_API_URL=https://<sua-api>/v1
```

Comandos:

```bash
npm ci
npm run build
```

Checklist:

- Cadastro cria usuario.
- Login redireciona para o dashboard.
- Dashboard carrega dados reais da API.
- Missoes, treino, agua, alimentacao, perfil, ranking, conquistas e configuracoes nao quebram.

## Fase 4 - E-mail real

Antes de abrir para usuarios reais, substituir o token de verificacao exibido em desenvolvimento por envio real.

Recomendacao:

- Provedor inicial: Resend.
- E-mails obrigatorios: verificacao de conta, recuperacao de senha e alerta de seguranca.
- Assuntos sem dados sensiveis.
- Links com token temporario.

## Fase 5 - Pronto para usuarios

Faltas antes de publicar como produto completo:

- Politica de privacidade.
- Termos de uso.
- Consentimento claro para dados sensiveis de saude.
- Pagina de exclusao/exportacao de dados.
- Backup do banco ativo.
- Monitoramento de erro com Sentry ou similar.
- Logs sem dados sensiveis.
- Storage seguro para fotos de progresso.
- Teste manual completo em mobile e desktop.

## Comando de validacao local

Antes de cada deploy:

```bash
npm run verify
```

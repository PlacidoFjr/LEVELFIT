# LevelFit - Pre-deploy seguro

## 1. Incidente GitGuardian

O alerta apontou para o commit inicial `60c1c12`, com senha genérica de desenvolvimento em arquivos versionados.

Antes de publicar:

1. Revogar qualquer segredo real que possa ter sido reutilizado.
2. Trocar senhas locais e de banco.
3. Remover segredos do estado atual do repositório.
4. Reescrever o histórico Git ou pedir remoção do segredo no GitGuardian/GitHub.
5. Fazer novo scan e marcar o incidente como resolvido somente quando não houver alerta.

## 2. Secrets necessários no GitHub

Cadastre em `Settings > Secrets and variables > Actions`:

- `CI_POSTGRES_PASSWORD`
- `CI_JWT_ACCESS_SECRET`
- `CI_TOKEN_HASH_SECRET`

Gere valores seguros com:

```bash
openssl rand -base64 32
```

No PowerShell, uma alternativa:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 3. Ambiente local

Copie `.env.local.example` para `.env` e preencha com valores locais.

O `docker-compose.yml` exige `POSTGRES_PASSWORD` no ambiente para evitar senha versionada.

PowerShell:

```powershell
$env:POSTGRES_PASSWORD="gere-uma-senha-local"
docker compose up -d postgres redis
```

## 4. Deploy sem domínio próprio

Pode usar subdomínios gratuitos:

- Frontend: Vercel, exemplo `https://levelfit.vercel.app`
- API: Render/Railway/Fly, exemplo `https://levelfit-api.onrender.com`
- Banco: Neon/Supabase/Railway PostgreSQL

Variáveis do frontend:

```env
NEXT_PUBLIC_API_URL=https://sua-api/v1
```

Variáveis da API:

```env
DATABASE_URL=<url-do-postgres>
REDIS_URL=<url-do-redis>
JWT_ACCESS_SECRET=<secret-real>
TOKEN_HASH_SECRET=<secret-real-diferente>
WEB_ORIGIN=https://seu-front.vercel.app
NODE_ENV=production
SWAGGER_ENABLED=false
```

## 5. Checklist antes de abrir para usuários

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run build:api`
- `npm test -w @levelfit/api`
- Cadastro/login funcionando em produção
- Cookies seguros com HTTPS
- Banco com backup automático
- Storage seguro configurado antes de liberar fotos
- Política de privacidade e termos publicados

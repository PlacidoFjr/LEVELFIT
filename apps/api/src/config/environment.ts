type Environment = Record<string, string | undefined>;

function required(env: Environment, key: string, minLength = 1) {
  const value = env[key];
  if (!value || value.length < minLength) throw new Error(`Variavel obrigatoria ausente ou invalida: ${key}`);
  return value;
}

export function validateEnvironment(env: Environment) {
  required(env, "DATABASE_URL");
  required(env, "JWT_ACCESS_SECRET", 32);
  required(env, "TOKEN_HASH_SECRET", 32);
  return {
    ...env,
    API_PORT: Number(env.API_PORT ?? 3001),
    WEB_ORIGIN: env.WEB_ORIGIN ?? "http://127.0.0.1:3000",
    JWT_ISSUER: env.JWT_ISSUER ?? "levelfit-api",
    JWT_AUDIENCE: env.JWT_AUDIENCE ?? "levelfit-web",
    ACCESS_TOKEN_TTL_SECONDS: Number(env.ACCESS_TOKEN_TTL_SECONDS ?? 600),
    REFRESH_TOKEN_TTL_DAYS: Number(env.REFRESH_TOKEN_TTL_DAYS ?? 30),
    NODE_ENV: env.NODE_ENV ?? "development",
  };
}

type Environment = Record<string, string | undefined>;

function required(env: Environment, key: string, minLength = 1) {
  const value = env[key];
  if (!value || value.length < minLength) throw new Error(`Variavel obrigatoria ausente ou invalida: ${key}`);
  return value;
}

function splitOrigins(value: string) {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return value === "true";
}

export function validateEnvironment(env: Environment) {
  const databaseUrl = required(env, "DATABASE_URL");
  const accessSecret = required(env, "JWT_ACCESS_SECRET", 32);
  const tokenSecret = required(env, "TOKEN_HASH_SECRET", 32);
  const nodeEnv = env.NODE_ENV ?? "development";
  const webOrigin = env.WEB_ORIGIN ?? "http://127.0.0.1:3000";
  const apiPort = Number(env.API_PORT ?? 3001);
  const swaggerEnabled = parseBoolean(env.SWAGGER_ENABLED, nodeEnv !== "production");

  if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) throw new Error("API_PORT invalida.");
  if (accessSecret === tokenSecret) throw new Error("JWT_ACCESS_SECRET e TOKEN_HASH_SECRET devem ser diferentes.");

  if (nodeEnv === "production") {
    if (/replace|development|change-before-deploy|example|placeholder|generate/i.test(`${accessSecret}:${tokenSecret}`)) {
      throw new Error("Segredos de desenvolvimento nao podem ser usados em producao.");
    }
    if (splitOrigins(webOrigin).some((origin) => !origin.startsWith("https://"))) {
      throw new Error("WEB_ORIGIN deve usar HTTPS em producao.");
    }
    if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
      throw new Error("DATABASE_URL invalida.");
    }
    if (/(@|\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/)/i.test(databaseUrl)) {
      throw new Error("DATABASE_URL de producao nao pode apontar para localhost.");
    }
    if (/sslmode=disable/i.test(databaseUrl)) {
      throw new Error("DATABASE_URL de producao nao pode desativar SSL.");
    }
    if (swaggerEnabled) throw new Error("SWAGGER_ENABLED deve ficar false em producao.");
  }

  return {
    ...env,
    API_PORT: apiPort,
    API_HOST: env.API_HOST ?? (nodeEnv === "production" ? "0.0.0.0" : "127.0.0.1"),
    WEB_ORIGIN: webOrigin,
    JWT_ISSUER: env.JWT_ISSUER ?? "levelfit-api",
    JWT_AUDIENCE: env.JWT_AUDIENCE ?? "levelfit-web",
    ACCESS_TOKEN_TTL_SECONDS: Number(env.ACCESS_TOKEN_TTL_SECONDS ?? 600),
    REFRESH_TOKEN_TTL_DAYS: Number(env.REFRESH_TOKEN_TTL_DAYS ?? 30),
    SWAGGER_ENABLED: swaggerEnabled,
    NODE_ENV: nodeEnv,
  };
}

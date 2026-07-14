import { describe, expect, it } from "vitest";
import { validateEnvironment } from "../src/config/environment";

const base = {
  DATABASE_URL: "postgresql://unit_user:unit_db_credential_32_chars@localhost:5432/levelfit",
  JWT_ACCESS_SECRET: "test-access-key-material-with-at-least-thirty-two-characters",
  TOKEN_HASH_SECRET: "test-token-key-material-with-at-least-thirty-two-characters",
};

describe("environment security validation", () => {
  it("accepts isolated development settings", () => {
    expect(validateEnvironment(base).API_PORT).toBe(3001);
  });

  it("rejects reuse of the same cryptographic secret", () => {
    expect(() => validateEnvironment({ ...base, TOKEN_HASH_SECRET: base.JWT_ACCESS_SECRET })).toThrow(/devem ser diferentes/);
  });

  it("rejects insecure production origins", () => {
    expect(() => validateEnvironment({ ...base, NODE_ENV: "production", WEB_ORIGIN: "http://levelfit.example" })).toThrow(/HTTPS/);
  });

  it("rejects production databases pointing to localhost", () => {
    expect(() => validateEnvironment({ ...base, NODE_ENV: "production", WEB_ORIGIN: "https://levelfit.example" })).toThrow(/localhost/);
  });

  it("disables Swagger by default in production", () => {
    expect(validateEnvironment({
      ...base,
      DATABASE_URL: "postgresql://unit_user:unit_db_credential_32_chars@db.example.com:5432/levelfit?sslmode=require",
      NODE_ENV: "production",
      WEB_ORIGIN: "https://levelfit.example",
    }).SWAGGER_ENABLED).toBe(false);
  });

  it("rejects Swagger explicitly enabled in production", () => {
    expect(() => validateEnvironment({
      ...base,
      DATABASE_URL: "postgresql://unit_user:unit_db_credential_32_chars@db.example.com:5432/levelfit?sslmode=require",
      NODE_ENV: "production",
      WEB_ORIGIN: "https://levelfit.example",
      SWAGGER_ENABLED: "true",
    })).toThrow(/SWAGGER_ENABLED/);
  });
});

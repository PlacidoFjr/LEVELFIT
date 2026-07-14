import { describe, expect, it } from "vitest";
import { validateEnvironment } from "../src/config/environment";

const base = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/levelfit",
  JWT_ACCESS_SECRET: "access-secret-with-at-least-thirty-two-characters",
  TOKEN_HASH_SECRET: "token-secret-with-at-least-thirty-two-characters",
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

  it("disables Swagger by default in production", () => {
    expect(validateEnvironment({ ...base, NODE_ENV: "production", WEB_ORIGIN: "https://levelfit.example" }).SWAGGER_ENABLED).toBe(false);
  });
});

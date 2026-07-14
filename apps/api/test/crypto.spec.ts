import { describe, expect, it } from "vitest";
import { encryptSecret, hashContext, hashToken, randomToken } from "../src/common/crypto";

describe("security crypto helpers", () => {
  const secret = "test-secret-with-more-than-thirty-two-characters";

  it("generates opaque tokens with enough entropy", () => {
    const first = randomToken();
    const second = randomToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
  });

  it("hashes sensitive values deterministically without exposing them", () => {
    const raw = "refresh-token-value";
    const digest = hashToken(raw, secret);
    expect(digest).toBe(hashToken(raw, secret));
    expect(digest).not.toContain(raw);
  });

  it("uses randomized authenticated encryption", () => {
    const raw = "https://push.example/subscription";
    const first = encryptSecret(raw, secret);
    const second = encryptSecret(raw, secret);
    expect(first).not.toBe(second);
    expect(first).not.toContain(raw);
  });

  it("does not retain raw request context", () => {
    expect(hashContext("127.0.0.1", secret)).not.toContain("127.0.0.1");
    expect(hashContext(undefined, secret)).toBeUndefined();
  });
});

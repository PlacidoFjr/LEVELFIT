import { describe, expect, it } from "vitest";
import { buildAccessProfile, isOwnerEmail } from "../src/common/access-profile";
import type { ConfigService } from "@nestjs/config";

function config(values: Record<string, string | undefined>) {
  return {
    get<T = string>(key: string) {
      return values[key] as T;
    },
  } as ConfigService;
}

describe("access profile", () => {
  it("keeps regular users in the personal app", () => {
    const access = buildAccessProfile(config({ NODE_ENV: "production" }), "user@example.com");

    expect(access.roles).toEqual(["USER"]);
    expect(access.defaultRoute).toBe("/");
    expect(access.availableWorkspaces.map((workspace) => workspace.type)).toEqual(["user"]);
  });

  it("routes owners to management and exposes product workspaces", () => {
    const access = buildAccessProfile(config({ NODE_ENV: "production", OWNER_EMAILS: "owner@example.com" }), "owner@example.com");

    expect(access.roles).toEqual(["USER", "OWNER"]);
    expect(access.defaultRoute).toBe("/pro/admin");
    expect(access.availableWorkspaces.map((workspace) => workspace.type)).toEqual(["user", "nutri", "run", "owner"]);
  });

  it("routes nutritionists to Nutri Pro", () => {
    const access = buildAccessProfile(config({ NODE_ENV: "production", NUTRITIONIST_EMAILS: "nutri@example.com" }), "nutri@example.com");

    expect(access.roles).toEqual(["USER", "NUTRITIONIST"]);
    expect(access.defaultRoute).toBe("/pro");
    expect(access.availableWorkspaces.map((workspace) => workspace.type)).toEqual(["user", "nutri"]);
  });

  it("routes run coaches to Run Pro", () => {
    const access = buildAccessProfile(config({ NODE_ENV: "production", RUN_COACH_EMAILS: "coach@example.com" }), "coach@example.com");

    expect(access.roles).toEqual(["USER", "RUN_COACH"]);
    expect(access.defaultRoute).toBe("/pro/run");
    expect(access.availableWorkspaces.map((workspace) => workspace.type)).toEqual(["user", "run"]);
  });

  it("allows local owner access when OWNER_EMAILS is not configured", () => {
    expect(isOwnerEmail(config({ NODE_ENV: "development" }), "local@example.com")).toBe(true);
  });
});

import type { ConfigService } from "@nestjs/config";

export type AccessRole = "USER" | "NUTRITIONIST" | "RUN_COACH" | "OWNER";
export type WorkspaceType = "user" | "nutri" | "run" | "owner";

export type AvailableWorkspace = {
  type: WorkspaceType;
  label: string;
  description: string;
  route: string;
};

export type AccessProfile = {
  roles: AccessRole[];
  defaultRoute: string;
  availableWorkspaces: AvailableWorkspace[];
};

export function splitEmails(value?: string) {
  return (value ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function hasEmail(config: ConfigService, key: string, email: string) {
  return splitEmails(config.get<string>(key)).includes(email.toLowerCase());
}

export function isOwnerEmail(config: ConfigService, email?: string | null) {
  if (!email) return false;
  const owners = splitEmails(config.get<string>("OWNER_EMAILS"));
  const isProduction = config.get<string>("NODE_ENV") === "production";
  if (!owners.length && !isProduction) return true;
  return owners.includes(email.toLowerCase());
}

export function buildAccessProfile(config: ConfigService, email: string, assignedRoles: AccessRole[] = []): AccessProfile {
  const roles = new Set<AccessRole>(["USER"]);
  const workspaces: AvailableWorkspace[] = [
    { type: "user", label: "LevelFit", description: "Area pessoal de habitos, treinos e progresso.", route: "/" },
  ];

  const owner = isOwnerEmail(config, email) || assignedRoles.includes("OWNER");
  const nutritionist = hasEmail(config, "NUTRITIONIST_EMAILS", email) || assignedRoles.includes("NUTRITIONIST");
  const runCoach = hasEmail(config, "RUN_COACH_EMAILS", email) || assignedRoles.includes("RUN_COACH");

  if (nutritionist || owner) {
    if (nutritionist) roles.add("NUTRITIONIST");
    workspaces.push({ type: "nutri", label: "Nutri Pro", description: "Clientes, planos alimentares e retornos.", route: "/pro" });
  }

  if (runCoach || owner) {
    if (runCoach) roles.add("RUN_COACH");
    workspaces.push({ type: "run", label: "Run Pro", description: "Atletas, treinos TAF e agenda do coach.", route: "/pro/run" });
  }

  if (owner) {
    roles.add("OWNER");
    workspaces.push({ type: "owner", label: "Gestao LevelFit", description: "Produtos, pilotos, metricas e operacao.", route: "/pro/admin" });
  }

  return {
    roles: Array.from(roles),
    defaultRoute: owner ? "/pro/admin" : nutritionist ? "/pro" : runCoach ? "/pro/run" : "/",
    availableWorkspaces: workspaces,
  };
}

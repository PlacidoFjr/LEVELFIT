const allowedProfessionalPermissions = new Set([
  "nutrition",
  "hydration",
  "body_checkins",
  "progress_photos",
  "workouts",
  "run_checkins",
  "notes",
]);

export function sanitizeProfessionalPermissions(permissions: string[] | undefined, fallback: string[]) {
  const source = permissions?.length ? permissions : fallback;
  return Array.from(new Set(source.map((item) => item.trim()).filter((item) => allowedProfessionalPermissions.has(item))));
}

export function defaultProfessionalPermissions(kind: "nutrition" | "run") {
  if (kind === "run") return ["workouts", "run_checkins", "notes"];
  return ["nutrition", "hydration", "body_checkins", "notes"];
}

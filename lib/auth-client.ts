"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/v1";
const ACCESS_TOKEN_KEY = "levelfit.accessToken";
const CSRF_TOKEN_KEY = "levelfit.csrfToken";
const USER_KEY = "levelfit.user";
const REQUEST_TIMEOUT_MS = 20000;

let memoryAccessToken: string | null = null;
let memoryCsrfToken: string | null = null;
let memoryUser: AuthUser | null = null;
let refreshPromise: Promise<boolean> | null = null;
let sessionPromise: Promise<AuthUser | null> | null = null;

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  level?: {
    level: number;
    totalXp: number;
    currentLevelXp: number;
    nextLevelXp: number;
  } | null;
  streaks?: Array<{
    type: string;
    currentCount: number;
    bestCount: number;
  }>;
};

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  csrfToken: string;
  user: AuthUser;
};

type RegisterResponse = {
  verificationRequired: boolean;
  devVerificationToken?: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
};

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: string[];

  constructor(message: string, code: string, status: number, fields?: string[]) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

function timeoutError() {
  return new ApiClientError("A API demorou para responder. Aguarde alguns segundos e tente novamente.", "REQUEST_TIMEOUT", 408);
}

function readStoredUser(): AuthUser | null {
  if (memoryUser) return memoryUser;
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Browsers can block storage in strict privacy modes. The in-memory copy keeps the current tab usable.
  }
}

function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures; memory is cleared separately.
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1] ?? null;
}

function saveUser(user: AuthUser) {
  memoryUser = user;
  writeStorage(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return memoryAccessToken ?? readStorage(ACCESS_TOKEN_KEY);
}

function saveSession(response: LoginResponse) {
  memoryAccessToken = response.accessToken;
  memoryCsrfToken = response.csrfToken;
  writeStorage(ACCESS_TOKEN_KEY, response.accessToken);
  writeStorage(CSRF_TOKEN_KEY, response.csrfToken);
  saveUser(response.user);
  window.dispatchEvent(new Event("levelfit:auth"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  memoryAccessToken = null;
  memoryCsrfToken = null;
  memoryUser = null;
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(CSRF_TOKEN_KEY);
  removeStorage(USER_KEY);
  window.dispatchEvent(new Event("levelfit:auth"));
}

async function readError(response: Response) {
  if (response.status === 429) {
    return new ApiClientError("Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.", "RATE_LIMITED", response.status);
  }

  try {
    const payload = await response.json() as { error?: { message?: string; code?: string; fields?: string[] } };
    return new ApiClientError(
      payload.error?.message ?? "Não foi possível concluir a solicitação.",
      payload.error?.code ?? "REQUEST_ERROR",
      response.status,
      payload.error?.fields,
    );
  } catch {
    return new ApiClientError("Não foi possível concluir a solicitação.", "REQUEST_ERROR", response.status);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: init.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw timeoutError();
    throw new ApiClientError("Não foi possível conectar à API agora. Tente novamente em instantes.", "NETWORK_ERROR", 0);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (response.status === 401 && retry && path !== "/auth/login" && path !== "/auth/refresh") {
    const refreshed = await refreshSession();
    if (refreshed) return apiRequest<T>(path, init, false);
  }

  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginUser(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, deviceName: "LevelFit Web" }),
  }, false);
  saveSession(response);
  return response.user;
}

export async function registerUser(input: { displayName: string; email: string; password: string; gender?: string }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const registration = await apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      displayName: input.displayName,
      gender: input.gender || undefined,
      termsAccepted: true,
      sensitiveDataConsent: true,
      timezone,
    }),
  }, false);

  if (registration.devVerificationToken) {
    await apiRequest<{ emailVerified: boolean }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token: registration.devVerificationToken }),
    }, false);
    return loginUser(input.email, input.password);
  }

  return null;
}

export async function refreshSession() {
  refreshPromise ??= refreshSessionOnce().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function refreshSessionOnce() {
  if (typeof window === "undefined") return false;
  const csrfToken = memoryCsrfToken ?? readStorage(CSRF_TOKEN_KEY) ?? readCookie("lf_csrf");
  if (!csrfToken) return false;

  try {
    const response = await apiRequest<Omit<LoginResponse, "user">>("/auth/refresh", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
    }, false);
    memoryAccessToken = response.accessToken;
    memoryCsrfToken = response.csrfToken;
    writeStorage(ACCESS_TOKEN_KEY, response.accessToken);
    writeStorage(CSRF_TOKEN_KEY, response.csrfToken);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export async function fetchMe() {
  return apiRequest<AuthUser & { profile?: { displayName?: string | null }; level?: AuthUser["level"]; streaks?: AuthUser["streaks"] }>("/me");
}

function toAuthUser(me: Awaited<ReturnType<typeof fetchMe>>): AuthUser {
  return {
    id: me.id,
    email: me.email,
    displayName: me.profile?.displayName ?? me.displayName,
    level: me.level ?? null,
    streaks: me.streaks ?? [],
  };
}

async function loadSessionUser() {
  sessionPromise ??= loadSessionUserOnce().finally(() => {
    sessionPromise = null;
  });
  return sessionPromise;
}

async function loadSessionUserOnce() {
  if (!getAccessToken()) await refreshSession();
  if (!getAccessToken()) return null;

  try {
    const me = await fetchMe();
    const nextUser = toAuthUser(me);
    saveUser(nextUser);
    return nextUser;
  } catch {
    clearSession();
    return null;
  }
}

export async function logoutUser() {
  try {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ allDevices: false }),
    }, false);
  } finally {
    clearSession();
  }
}

export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const nextUser = await loadSessionUser();
      if (active) {
        setUser(nextUser);
        setLoading(false);
      }
    }

    function sync() {
      setUser(readStoredUser());
    }

    void load();
    window.addEventListener("storage", sync);
    window.addEventListener("levelfit:auth", sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener("levelfit:auth", sync);
    };
  }, []);

  return { user, loading, authenticated: Boolean(user) };
}
